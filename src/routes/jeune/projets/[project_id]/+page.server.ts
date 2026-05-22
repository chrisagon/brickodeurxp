import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectById, getTasksByProject, getTaskAssignmentsByTask, getTeamByJeune } from '$lib/server/db';

function requireJeune(locals: App.Locals) {
  if (locals.session?.user.role !== 'jeune') {
    error(403, 'Accès non autorisé.');
  }
}

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireJeune(locals);

  const db = platform!.env.DB;
  const project = await getProjectById(db, params.project_id);

  if (!project) {
    error(404, 'Projet introuvable.');
  }

  const jeuneId = locals.session!.user.id;

  // Vérifier que le jeune est assigné à au moins une tâche de ce projet
  const tasks = await getTasksByProject(db, params.project_id);
  const taskIds = tasks.map(t => t.id);
  let isAssigned = false;

  for (const taskId of taskIds) {
    const assignments = await getTaskAssignmentsByTask(db, taskId);
    if (assignments.some(a => a.jeune_id === jeuneId)) {
      isAssigned = true;
      break;
    }
  }

  // Vérifier si le jeune est membre de l'équipe du projet
  let isTeamMember = false;
  if (project.team_id) {
    const team = await getTeamByJeune(db, jeuneId);
    if (team && team.id === project.team_id) {
      isTeamMember = true;
    }
  }

  if (!isAssigned && !isTeamMember) {
    error(403, 'Vous n\'êtes pas assigné à ce projet.');
  }

  return { project, tasks };
};
