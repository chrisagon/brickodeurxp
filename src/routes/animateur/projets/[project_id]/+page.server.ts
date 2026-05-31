import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getProjectById, getTasksByProject, getAllDomains, getSkillsByDomain, getTaskById, updateTaskState } from '$lib/server/db';

const VALID_STATES = ['todo', 'in_progress', 'done', 'delivered'] as const;
type TaskState = (typeof VALID_STATES)[number];

function requireAnimateur(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'animateur' && role !== 'admin') {
    error(403, 'Accès non autorisé.');
  }
}

async function assertProjectAccess(_db: D1Database, _projectId: string, locals: App.Locals) {
  // Tous les animateurs et admins ont accès à tous les projets.
  const role = locals.session!.user.role;
  if (role !== 'admin' && role !== 'animateur') {
    error(403, 'Accès non autorisé à ce projet.');
  }
}

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireAnimateur(locals);

  const db = platform!.env.DB;
  const project = await getProjectById(db, params.project_id);

  if (!project) {
    error(404, 'Projet introuvable.');
  }

  // Vérifier que l'utilisateur fait partie de l'équipe ou est admin
  await assertProjectAccess(db, params.project_id, locals);

  const tasks = await getTasksByProject(db, params.project_id);

  // Récupérer les compétences du domaine de l'équipe
  const domains = await getAllDomains(db);
  const skillsByDomain = new Map<string, any[]>();
  for (const domain of domains) {
    const skills = await getSkillsByDomain(db, domain.id);
    skillsByDomain.set(domain.id, skills);
  }

  return { project, tasks, skillsByDomain };
};

export const actions: Actions = {
  updateState: async ({ request, params, platform, locals }) => {
    requireAnimateur(locals);

    const db = platform!.env.DB;
    await assertProjectAccess(db, params.project_id, locals);

    const formData = await request.formData();
    const taskId = formData.get('taskId') as string;
    const state = formData.get('state') as TaskState;

    if (!taskId || !VALID_STATES.includes(state)) {
      return fail(400, { error: 'Données invalides.' });
    }

    const task = await getTaskById(db, taskId);
    if (!task || task.project_id !== params.project_id) {
      return fail(404, { error: 'Tâche introuvable.' });
    }

    await updateTaskState(db, taskId, state, locals.session!.user.id);
    return { success: true };
  },
};
