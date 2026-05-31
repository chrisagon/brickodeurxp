import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getTaskById, updateTask, getTaskAssignmentsByTask, addJeuneToTask, getProjectById, getTeamByJeune } from '$lib/server/db';

function requireJeune(locals: App.Locals) {
  if (locals.session?.user.role !== 'jeune') {
    error(403, 'Accès non autorisé.');
  }
}

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireJeune(locals);

  const db = platform!.env.DB;
  const task = await getTaskById(db, params.task_id);

  if (!task) {
    error(404, 'Tâche introuvable.');
  }

  const jeuneId = locals.session!.user.id;

  // Vérifier que le jeune est assigné à cette tâche
  const assignments = await getTaskAssignmentsByTask(db, params.task_id);
  let isAssigned = assignments.some(a => a.jeune_id === jeuneId);

  // Vérifier si le jeune est membre de l'équipe du projet
  if (!isAssigned) {
    const project = await getProjectById(db, task.project_id);
    if (project && project.team_id) {
      const team = await getTeamByJeune(db, jeuneId);
      if (team && team.id === project.team_id) {
        isAssigned = true;
      }
    }
  }

  if (!isAssigned) {
    error(403, 'Vous n\'êtes pas assigné à cette tâche.');
  }

  return { task, isAssigned };
};

export const actions: Actions = {
  updateTask: async ({ request, params, platform, locals }) => {
    requireJeune(locals);

    const db = platform!.env.DB;
    const formData = await request.formData();
    const description = (formData.get('description') as string) || '';
    const state = formData.get('state') as 'todo' | 'in_progress' | 'done' | 'delivered';

    // Récupérer les compétences existantes
    const task = await getTaskById(db, params.task_id);
    if (!task) error(404, 'Tâche introuvable.');

    // Conserver les compétences existantes
    const skillIds = task.skills.map(s => s.skill_id);

    try {
      await updateTask(db, params.task_id, task.title, description, state, skillIds, locals.session!.user.id);
    } catch (err) {
      return { error: 'Échec de la mise à jour de la tâche' };
    }

    redirect(303, `/jeune/projets/${task.project_id}`);
  },
};
