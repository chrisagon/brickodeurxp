import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  getTeamById,
  getTeamMembers,
  getJeunesNotInTeam,
  updateTeam,
  addJeuneToTeam,
  removeJeuneFromTeam,
} from '$lib/server/db';

function requireAdminOrAnimateur(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'admin' && role !== 'animateur') error(403, 'Accès non autorisé.');
}

function canManage(locals: App.Locals, createdBy: string): boolean {
  const user = locals.session!.user;
  return user.role === 'admin' || user.id === createdBy;
}

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireAdminOrAnimateur(locals);

  const db = platform!.env.DB;
  const team = await getTeamById(db, params.id);
  if (!team) error(404, 'Équipe introuvable.');

  const [members, availableJeunes] = await Promise.all([
    getTeamMembers(db, team.id),
    getJeunesNotInTeam(db, team.id),
  ]);

  const manage = canManage(locals, team.created_by);

  return { team, members, availableJeunes, canManage: manage };
};

export const actions: Actions = {
  editTeam: async ({ params, request, platform, locals }) => {
    requireAdminOrAnimateur(locals);

    const db = platform!.env.DB;
    const team = await getTeamById(db, params.id);
    if (!team) error(404, 'Équipe introuvable.');
    if (!canManage(locals, team.created_by)) error(403, 'Non autorisé.');

    const data = await request.formData();
    const name = (data.get('name') as string | null)?.trim() ?? '';
    const description = (data.get('description') as string | null)?.trim() ?? '';

    if (!name) return fail(400, { editError: 'Le nom est requis.' });

    await updateTeam(db, team.id, name, description);
    return { success: true };
  },

  addMember: async ({ params, request, platform, locals }) => {
    requireAdminOrAnimateur(locals);

    const db = platform!.env.DB;
    const team = await getTeamById(db, params.id);
    if (!team) error(404, 'Équipe introuvable.');
    if (!canManage(locals, team.created_by)) error(403, 'Non autorisé.');

    const data = await request.formData();
    const jeuneId = (data.get('jeune_id') as string | null)?.trim() ?? '';
    if (!jeuneId) return fail(400, { addError: 'Sélectionnez un jeune.' });

    await addJeuneToTeam(db, team.id, jeuneId, locals.session!.user.id);
    return { success: true };
  },

  removeMember: async ({ params, request, platform, locals }) => {
    requireAdminOrAnimateur(locals);

    const db = platform!.env.DB;
    const team = await getTeamById(db, params.id);
    if (!team) error(404, 'Équipe introuvable.');
    if (!canManage(locals, team.created_by)) error(403, 'Non autorisé.');

    const data = await request.formData();
    const jeuneId = (data.get('jeune_id') as string | null)?.trim() ?? '';
    if (!jeuneId) return fail(400, { removeError: 'Jeune introuvable.' });

    await removeJeuneFromTeam(db, team.id, jeuneId);
    return { success: true };
  },
};
