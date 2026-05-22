import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllTeams, getTeamsByCreator, createTeam, archiveTeam } from '$lib/server/db';

function requireAdminOrAnimateur(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'admin' && role !== 'animateur') error(403, 'Accès non autorisé.');
}

export const load: PageServerLoad = async ({ platform, locals, url }) => {
  requireAdminOrAnimateur(locals);

  const db = platform!.env.DB;
  const user = locals.session!.user;
  const isAdmin = user.role === 'admin';

  // Filtre "active" pour n'afficher que les équipes actives
  const onlyActive = url.searchParams.get('active') !== 'false';

  const teams = isAdmin
    ? await getAllTeams(db, onlyActive)
    : await getTeamsByCreator(db, user.id, onlyActive);

  return { teams, isAdmin, onlyActive };
};

export const actions: Actions = {
  createTeam: async ({ request, platform, locals }) => {
    requireAdminOrAnimateur(locals);

    const db = platform!.env.DB;
    const user = locals.session!.user;
    const data = await request.formData();

    const name = (data.get('name') as string | null)?.trim() ?? '';
    const description = (data.get('description') as string | null)?.trim() ?? '';
    const startDate = data.get('start_date') as string | null;
    const endDate = data.get('end_date') as string | null;

    if (!name) return fail(400, { error: 'Le nom de l\'équipe est requis.' });

    const now = Math.floor(Date.now() / 1000);
    const start = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : now;
    const end = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : now + 365 * 24 * 3600;

    const team = await createTeam(db, name, description, user.id, start, end);
    redirect(303, `/animateur/equipes/${team.id}`);
  },

  archiveTeam: async ({ request, platform, locals }) => {
    requireAdminOrAnimateur(locals);

    const db = platform!.env.DB;
    const user = locals.session!.user;
    const data = await request.formData();

    const teamId = (data.get('team_id') as string | null) ?? '';
    const archive = data.get('archive') === 'true';

    // Vérifier que l'utilisateur peut gérer cette équipe
    const team = await db
      .prepare('SELECT created_by FROM teams WHERE id = ?')
      .bind(teamId)
      .first<{ created_by: string }>();

    if (!team) return fail(404, { error: 'Équipe non trouvée.' });
    if (team.created_by !== user.id && user.role !== 'admin') {
      return fail(403, { error: 'Accès non autorisé.' });
    }

    await archiveTeam(db, teamId, archive);

    return { success: true };
  },
};
