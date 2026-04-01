import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSkillsByDomain, getAllDomains, createBadgeRequest, getBadgeRequestsByJeune } from '$lib/server/db';
import { uploadProof, getProofKey, getProofType } from '$lib/server/r2';

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
  const hasPending = existingRequests.some(
    (r) => r.skill_id === skillId && r.status === 'pending'
  );
  const hasApproved = existingRequests.some(
    (r) => r.skill_id === skillId && r.status === 'approved'
  );

  return { skill: foundSkill, hasPending, hasApproved };
};

export const actions: Actions = {
  default: async ({ request, params, locals, platform }) => {
    const formData = await request.formData();
    const file = formData.get('proof') as File | null;

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

    const db = platform!.env.DB;
    const jeuneId = locals.session!.user.id;
    const skillId = params.skill_id;

    const key = getProofKey(jeuneId, skillId, file.name);
    const proofType = getProofType(file);

    await uploadProof(platform!.env.R2, key, file);
    await createBadgeRequest(db, jeuneId, skillId, key, proofType);

    redirect(303, '/jeune/passeport');
  },
};
