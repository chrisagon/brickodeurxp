import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProjectsByTeam, createProject, getAllTeams, getTeamById } from '$lib/server/db';

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

  try {
    // Pour les animateurs, récupérer leur équipe
    if (user.role === 'animateur') {
      const teamRow = await db
        .prepare('SELECT id FROM teams WHERE created_by = ? LIMIT 1')
        .bind(user.id)
        .first<{ id: string }>();

      if (!teamRow) {
        return { projects: [], teamId: '', isAdmin: false, noTeam: true };
      }

      const projects = await getProjectsByTeam(db, teamRow.id);
      return { projects, teamId: teamRow.id, isAdmin: false, noTeam: false };
    }

    // Pour les admins, afficher tous les projets
    if (user.role === 'admin') {
      const allTeams = await getAllTeams(db);
      const projects: any[] = [];

      for (const team of allTeams) {
        const teamProjects = await getProjectsByTeam(db, team.id);
        projects.push(...teamProjects);
      }

      return { projects, teamId: '', isAdmin: true, noTeam: false };
    }

    return { projects: [], teamId: '', isAdmin: false, noTeam: false };
  } catch (err) {
    console.error('Error loading projects:', err);
    error(500, 'Erreur lors du chargement des projets.');
  }
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
