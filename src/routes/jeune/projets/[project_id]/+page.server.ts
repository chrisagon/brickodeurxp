import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getProjectById, getTasksByProject, getTaskAssignmentsByTask, getTeamByJeune, getTaskById, updateTaskState } from '$lib/server/db';

const VALID_STATES = ['todo', 'in_progress', 'done', 'delivered'] as const;
type TaskState = (typeof VALID_STATES)[number];

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

export const actions: Actions = {
  updateState: async ({ request, params, platform, locals }) => {
    requireJeune(locals);

    const db = platform!.env.DB;
    const formData = await request.formData();
    const taskId = formData.get('taskId') as string;
    const state = formData.get('state') as TaskState;

    if (!taskId || !VALID_STATES.includes(state)) {
      return fail(400, { error: 'Données invalides.' });
    }

    const jeuneId = locals.session!.user.id;
    const task = await getTaskById(db, taskId);
    if (!task || task.project_id !== params.project_id) {
      return fail(404, { error: 'Tâche introuvable.' });
    }

    // Vérifier l'accès : assigné à la tâche ou membre de l'équipe du projet
    const assignments = await getTaskAssignmentsByTask(db, taskId);
    let allowed = assignments.some(a => a.jeune_id === jeuneId);
    if (!allowed) {
      const project = await getProjectById(db, task.project_id);
      if (project?.team_id) {
        const team = await getTeamByJeune(db, jeuneId);
        allowed = !!team && team.id === project.team_id;
      }
    }
    if (!allowed) {
      return fail(403, { error: 'Accès non autorisé.' });
    }

    await updateTaskState(db, taskId, state, jeuneId);
    return { success: true };
  },
};
