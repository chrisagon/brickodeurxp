import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getTaskById, updateTask, getProjectById } from '$lib/server/db';

function requireAnimateur(locals: App.Locals) {
  if (locals.session?.user.role !== 'animateur' && locals.session?.user.role !== 'admin') {
    error(403, 'Accès non autorisé.');
  }
}

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireAnimateur(locals);

  const db = platform!.env.DB;
  const task = await getTaskById(db, params.task_id);

  if (!task) {
    error(404, 'Tâche introuvable.');
  }

  // Vérifier que l'utilisateur a accès à ce projet
  if (locals.session!.user.role !== 'admin') {
    const project = await getProjectById(db, task.project_id);
    if (!project) error(404, 'Projet introuvable.');

    const teamMember = await db
      .prepare('SELECT 1 FROM team_members WHERE team_id = ? AND jeune_id = ?')
      .bind(project.team_id, locals.session!.user.id)
      .first();
    const projectCreator = await db
      .prepare('SELECT 1 FROM projects WHERE id = ? AND created_by = ?')
      .bind(task.project_id, locals.session!.user.id)
      .first();

    if (!teamMember && !projectCreator) {
      error(403, 'Accès non autorisé à ce projet.');
    }
  }

  return { task };
};

export const actions: Actions = {
  updateTask: async ({ request, params, platform, locals }) => {
    requireAnimateur(locals);

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

    redirect(303, `/animateur/projets/${task.project_id}`);
  },
};
