import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProjectsByTeam, createProject } from '$lib/server/db';

function requireAnimateur(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'animateur' && role !== 'admin') {
    error(403, 'Accès non autorisé.');
  }
}

export const load: PageServerLoad = async ({ platform, locals }) => {
  requireAnimateur(locals);

  const db = platform!.env.DB;
  const user = locals.session!.user;

  // Récupérer l'équipe de l'animateur
  const teamRow = await db
    .prepare('SELECT id FROM teams WHERE created_by = ? LIMIT 1')
    .bind(user.id)
    .first<{ id: string }>();

  const teamId = teamRow?.id ?? '';
  const isAdmin = user.role === 'admin';

  if (!teamId && !isAdmin) {
    error(404, 'Aucune équipe associée.');
  }

  const projects = await getProjectsByTeam(db, teamId);

  return { projects, teamId, isAdmin };
};

export const actions: Actions = {
  createProject: async ({ request, platform, locals }) => {
    requireAnimateur(locals);

    const db = platform!.env.DB;
    const user = locals.session!.user;

    const data = await request.formData();
    const name = (data.get('name') as string | null)?.trim() ?? '';
    const description = (data.get('description') as string | null)?.trim() ?? '';
    const startDateStr = data.get('startDate') as string | null;
    const endDateStr = data.get('endDate') as string | null;

    if (!name || !startDateStr || !endDateStr) {
      return { error: 'Veuillez remplir tous les champs obligatoires.' };
    }

    const startDate = Math.floor(new Date(startDateStr).getTime() / 1000);
    const endDate = Math.floor(new Date(endDateStr).getTime() / 1000);

    if (endDate <= startDate) {
      return { error: 'La date de fin doit être postérieure à la date de début.' };
    }

    // Récupérer l'équipe de l'animateur
    const teamRow = await db
      .prepare('SELECT id FROM teams WHERE created_by = ? LIMIT 1')
      .bind(user.id)
      .first<{ id: string }>();

    if (!teamRow) {
      return { error: 'Aucune équipe associée à votre compte.' };
    }

    try {
      await createProject(
        db,
        name,
        description,
        startDate,
        endDate,
        teamRow.id,
        user.id
      );
      redirect(303, '/animateur/projets');
    } catch (e) {
      return { error: 'Erreur lors de la création du projet.' };
    }
  }
};
