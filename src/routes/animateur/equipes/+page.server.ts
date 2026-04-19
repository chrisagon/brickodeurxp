import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllTeams, getTeamsByCreator, createTeam } from '$lib/server/db';

function requireAdminOrAnimateur(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'admin' && role !== 'animateur') error(403, 'Accès non autorisé.');
}

export const load: PageServerLoad = async ({ platform, locals }) => {
  requireAdminOrAnimateur(locals);

  const db = platform!.env.DB;
  const user = locals.session!.user;
  const isAdmin = user.role === 'admin';

  const teams = isAdmin
    ? await getAllTeams(db)
    : await getTeamsByCreator(db, user.id);

  return { teams, isAdmin };
};

export const actions: Actions = {
  createTeam: async ({ request, platform, locals }) => {
    requireAdminOrAnimateur(locals);

    const db = platform!.env.DB;
    const user = locals.session!.user;
    const data = await request.formData();

    const name = (data.get('name') as string | null)?.trim() ?? '';
    const description = (data.get('description') as string | null)?.trim() ?? '';

    if (!name) return fail(400, { error: 'Le nom de l\'équipe est requis.' });

    const team = await createTeam(db, name, description, user.id);
    redirect(303, `/animateur/equipes/${team.id}`);
  },
};
