import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  getSkillsByDomain,
  getAllDomains,
  createBadgeRequest,
  getBadgeRequestsByJeune,
  getRequestById,
  updateBadgeRequestProof,
} from '$lib/server/db';
import { uploadProof, deleteProof, getProofKey, getProofType, getProjectKey } from '$lib/server/r2';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
  const db = platform!.env.DB;
  const skillId = params.skill_id;

  const domains = await getAllDomains(db);
  let foundSkill: { id: string; title: string; description: string; domain_name: string } | null = null;

  for (const domain of domains) {
    const skills = await getSkillsByDomain(db, domain.id);
    const skill = skills.find((s) => s.id === skillId);
    if (skill) {
      foundSkill = { id: skill.id, title: skill.title, description: skill.description, domain_name: domain.name };
      break;
    }
  }

  if (!foundSkill) throw error(404, 'Compétence introuvable');

  const jeuneId = locals.session!.user.id;
  const existingRequests = await getBadgeRequestsByJeune(db, jeuneId);
  const hasApproved = existingRequests.some(
    (r) => r.skill_id === skillId && r.status === 'approved'
  );

  // Demande modifiable par le jeune : en attente ou marquée « à compléter ».
  const editable = existingRequests.find(
    (r) => r.skill_id === skillId && (r.status === 'pending' || r.status === 'to_complete')
  );

  const editableRequest = editable
    ? {
        id: editable.id,
        status: editable.status,
        proof_url: editable.proof_url,
        proof_type: editable.proof_type,
        jeune_comment: editable.jeune_comment,
        project_url: editable.project_url,
        project_type: editable.project_type,
        reviewer_comment: editable.reviewer_comment,
      }
    : null;

  return { skill: foundSkill, hasApproved, editableRequest };
};

export const actions: Actions = {
  create: async ({ request, params, locals, platform }) => {
    const formData = await request.formData();
    const file = formData.get('proof') as File | null;
    const jeuneComment = (formData.get('comment') as string | null)?.trim() || null;
    const projectFile = formData.get('project') as File | null;

    if (!file || file.size === 0) {
      return fail(400, { error: 'Merci de sélectionner une photo ou vidéo.' });
    }

    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      return fail(400, { error: 'Le fichier est trop lourd (max 50 Mo).' });
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      return fail(400, { error: 'Seules les images et vidéos sont acceptées.' });
    }

    if (projectFile && projectFile.size > maxSize) {
      return fail(400, { error: 'Le fichier projet est trop lourd (max 50 Mo).' });
    }

    const db = platform!.env.DB;
    const jeuneId = locals.session!.user.id;
    const skillId = params.skill_id;

    const key = getProofKey(jeuneId, skillId, file.name);
    const proofType = getProofType(file);

    await uploadProof(platform!.env.R2, key, file);

    let projectKey: string | null = null;
    let projectType: string | null = null;
    if (projectFile && projectFile.size > 0) {
      projectKey = getProjectKey(jeuneId, skillId, projectFile.name);
      projectType = projectFile.type || 'application/octet-stream';
      await uploadProof(platform!.env.R2, projectKey, projectFile);
    }

    await createBadgeRequest(db, jeuneId, skillId, key, proofType, jeuneComment, projectKey, projectType);

    redirect(303, '/jeune/passeport');
  },

  update: async ({ request, locals, platform }) => {
    const db = platform!.env.DB;
    const r2 = platform!.env.R2;
    const jeuneId = locals.session!.user.id;

    const formData = await request.formData();
    const requestId = (formData.get('request_id') as string | null)?.trim() ?? '';
    const file = formData.get('proof') as File | null;
    const jeuneComment = (formData.get('comment') as string | null)?.trim() || null;
    const projectFile = formData.get('project') as File | null;
    const removeProject = formData.get('remove_project') === 'true';

    if (!requestId) return fail(400, { error: 'Demande introuvable.' });

    // Vérifier la propriété et le statut modifiable.
    const existing = await getRequestById(db, requestId);
    if (!existing || existing.jeune_id !== jeuneId) {
      return fail(404, { error: 'Demande introuvable.' });
    }
    if (existing.status !== 'pending' && existing.status !== 'to_complete') {
      return fail(400, { error: 'Cette demande ne peut plus être modifiée.' });
    }

    const maxSize = 50 * 1024 * 1024; // 50 Mo
    const newProofProvided = !!file && file.size > 0;

    if (newProofProvided) {
      if (file!.size > maxSize) {
        return fail(400, { error: 'Le fichier est trop lourd (max 50 Mo).' });
      }
      const isImage = file!.type.startsWith('image/');
      const isVideo = file!.type.startsWith('video/');
      if (!isImage && !isVideo) {
        return fail(400, { error: 'Seules les images et vidéos sont acceptées.' });
      }
    }

    if (projectFile && projectFile.size > maxSize) {
      return fail(400, { error: 'Le fichier projet est trop lourd (max 50 Mo).' });
    }

    // Preuve principale : remplacer si un nouveau fichier est fourni, sinon conserver.
    let proofKey = existing.proof_url;
    let proofType = existing.proof_type;
    if (newProofProvided) {
      proofKey = getProofKey(jeuneId, existing.skill_id, file!.name);
      proofType = getProofType(file!);
      await uploadProof(r2, proofKey, file!);
      if (existing.proof_url && existing.proof_url !== proofKey) {
        await deleteProof(r2, existing.proof_url);
      }
    }

    // Fichier projet : remplacer, supprimer ou conserver.
    let projectKey = existing.project_url;
    let projectType = existing.project_type;
    if (projectFile && projectFile.size > 0) {
      projectKey = getProjectKey(jeuneId, existing.skill_id, projectFile.name);
      projectType = projectFile.type || 'application/octet-stream';
      await uploadProof(r2, projectKey, projectFile);
      if (existing.project_url && existing.project_url !== projectKey) {
        await deleteProof(r2, existing.project_url);
      }
    } else if (removeProject) {
      if (existing.project_url) await deleteProof(r2, existing.project_url);
      projectKey = null;
      projectType = null;
    }

    await updateBadgeRequestProof(
      db,
      requestId,
      jeuneId,
      proofKey,
      proofType,
      jeuneComment,
      projectKey,
      projectType
    );

    redirect(303, '/jeune/passeport');
  },
};
