import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getProjectById, getTeamsByJeune, updateProject, getAllTeams, getTeamsByCreator } from '$lib/server/db';

function requireAnimateur(locals: App.Locals) {
  if (locals.session?.user.role !== 'animateur' && locals.session?.user.role !== 'admin') {
    error(403, 'Accès non autorisé.');
  }
}

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireAnimateur(locals);

  const db = platform!.env.DB;
  const project = await getProjectById(db, params.project_id);

  if (!project) {
    error(404, 'Projet introuvable.');
  }

  // Vérifier que l'utilisateur a accès à ce projet
  if (locals.session!.user.role !== 'admin') {
    const teamMember = await db
      .prepare('SELECT 1 FROM team_members WHERE team_id = ? AND jeune_id = ?')
      .bind(project.team_id || '', locals.session!.user.id)
      .first();
    const projectCreator = await db
      .prepare('SELECT 1 FROM projects WHERE id = ? AND created_by = ?')
      .bind(params.project_id, locals.session!.user.id)
      .first();

    if (!teamMember && !projectCreator) {
      error(403, 'Accès non autorisé à ce projet.');
    }
  }

  // Récupérer les équipes actives accessibles par l'utilisateur
  let teams = [];
  if (locals.session!.user.role === 'admin') {
    // Admin: toutes les équipes actives
    teams = await getAllTeams(db, true);
  } else {
    // Animateur: seulement ses équipes actives
    teams = await getTeamsByCreator(db, locals.session!.user.id, true);
  }

  return { project, teams };
};

export const actions: Actions = {
  updateProject: async ({ request, params, platform, locals }) => {
    requireAnimateur(locals);

    const db = platform!.env.DB;
    const formData = await request.formData();
    const name = (formData.get('name') as string) || '';
    const description = (formData.get('description') as string) || '';
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const teamId = formData.get('team_id') as string | null;

    // Récupérer le projet existant
    const project = await getProjectById(db, params.project_id);
    if (!project) error(404, 'Projet introuvable.');

    // Vérifier que l'utilisateur a le droit de modifier
    if (locals.session!.user.role !== 'admin') {
      const teamMember = await db
        .prepare('SELECT 1 FROM team_members WHERE team_id = ? AND jeune_id = ?')
        .bind(project.team_id || '', locals.session!.user.id)
        .first();
      const projectCreator = await db
        .prepare('SELECT 1 FROM projects WHERE id = ? AND created_by = ?')
        .bind(params.project_id, locals.session!.user.id)
        .first();

      if (!teamMember && !projectCreator) {
        error(403, 'Accès non autorisé à ce projet.');
      }
    }

    // Convertir les dates en timestamps
    const startDate = startDateStr ? Math.floor(new Date(startDateStr).getTime() / 1000) : null;
    const endDate = endDateStr ? Math.floor(new Date(endDateStr).getTime() / 1000) : null;

    if (!startDateStr || !endDateStr) {
      return { error: 'Les dates de début et de fin sont requises.' };
    }

    if (!startDate || !endDate || startDate <= 0 || endDate <= 0) {
      return { error: 'Les dates doivent être valides.' };
    }

    try {
      await updateProject(db, params.project_id, name, description, startDate, endDate, teamId || null);
    } catch (err: any) {
      console.error('Error updating project:', err);
      return { error: `Échec de la mise à jour: ${err?.message || 'Erreur inconnue'}` };
    }

    redirect(303, `/animateur/projets/${params.project_id}`);
  },
};
