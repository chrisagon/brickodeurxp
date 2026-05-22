import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getTeamById, getTeamMembers, getAllJeunes, getJeunesNotInTeam, addTeamMember, removeTeamMember, updateTeam, deleteTeam, type TeamWithCount } from '$lib/server/db';

function requireAdmin(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'admin') error(403, 'Accès non autorisé.');
}

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireAdmin(locals);

  const db = platform!.env.DB;
  const team = await getTeamById(db, params.id);
  if (!team) error(404, 'Équipe introuvable.');

  const members = await getTeamMembers(db, team.id);
  const jeunes = await getAllJeunes(db);
  const jeunesNotInTeam = await getJeunesNotInTeam(db, team.id);

  return { team, members, jeunes: jeunes ?? [], jeunesNotInTeam: jeunesNotInTeam ?? [] };
};

export const actions: Actions = {
  editTeam: async ({ request, params, platform, locals }) => {
    requireAdmin(locals);

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name || name.trim().length < 2) {
      return { editError: 'Le nom doit contenir au moins 2 caractères' };
    }

    const db = platform!.env.DB;
    try {
      await updateTeam(db, params.id, name, description);
      return { success: true };
    } catch (err) {
      return { editError: 'Échec de la modification de l\'équipe' };
    }
  },
  addMember: async ({ request, params, platform, locals }) => {
    requireAdmin(locals);

    const formData = await request.formData();
    const jeuneId = formData.get('jeune_id') as string;

    if (!jeuneId) {
      return { addError: 'Veuillez choisir un jeune' };
    }

    const db = platform!.env.DB;
    try {
      await addTeamMember(db, params.id, jeuneId, locals.session!.user.id);
      return { success: true };
    } catch (err) {
      return { addError: 'Échec de l\'ajout du jeune à l\'équipe' };
    }
  },
  removeMember: async ({ request, params, platform, locals }) => {
    requireAdmin(locals);

    const formData = await request.formData();
    const jeuneId = formData.get('jeune_id') as string;

    if (!jeuneId) {
      return { removeError: 'Identifiant du jeune invalide' };
    }

    const db = platform!.env.DB;
    try {
      await removeTeamMember(db, params.id, jeuneId);
      return { success: true };
    } catch (err) {
      return { removeError: 'Échec du retrait du jeune de l\'équipe' };
    }
  },
  deleteTeam: async ({ request, params, platform, locals }) => {
    requireAdmin(locals);

    const db = platform!.env.DB;
    try {
      await deleteTeam(db, params.id);
      throw redirect(303, '/admin/equipes');
    } catch (err) {
      return { deleteError: 'Échec de la suppression de l\'équipe' };
    }
  },
};
