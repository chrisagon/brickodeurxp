import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addJeuneToTask,
  removeJeuneFromTask,
  addSkillToTask,
  removeSkillFromTask
} from '$lib/server/db';

export const GET: RequestHandler = async ({ params, platform, locals }) => {
  const db = platform!.env.DB;
  const user = locals.session?.user;

  if (!user || (user.role !== 'animateur' && user.role !== 'admin')) {
    error(403, 'Accès non autorisé.');
  }

  // Vérifier l'accès au projet
  const project = await db
    .prepare('SELECT id, team_id, created_by FROM projects WHERE id = ?')
    .bind(params.project_id)
    .first();

  if (!project) {
    error(404, 'Projet introuvable.');
  }

  // Vérifier que l'utilisateur fait partie de l'équipe ou est admin
  if (user.role !== 'admin') {
    const teamMember = await db
      .prepare('SELECT 1 FROM team_members WHERE team_id = ? AND jeune_id = ?')
      .bind(project.team_id, user.id)
      .first();

    if (!teamMember && project.created_by !== user.id) {
      error(403, 'Accès non autorisé.');
    }
  }

  const tasks = await db
    .prepare(
      `SELECT id, project_id, order_num, title, description, state, created_at, updated_at
       FROM project_tasks WHERE project_id = ?
       ORDER BY order_num ASC`
    )
    .bind(params.project_id)
    .all();

  return new Response(JSON.stringify(tasks.results), { status: 200 });
};

export const POST: RequestHandler = async ({ request, params, platform, locals }) => {
  const db = platform!.env.DB;
  const user = locals.session!.user;

  if (!user || (user.role !== 'animateur' && user.role !== 'admin')) {
    error(403, 'Accès non autorisé.');
  }

  // Vérifier que l'utilisateur peut modifier ce projet
  const project = await db
    .prepare('SELECT id, created_by, team_id FROM projects WHERE id = ?')
    .bind(params.project_id)
    .first();

  if (!project) {
    error(404, 'Projet introuvable.');
  }

  if (user.role !== 'admin' && project.created_by !== user.id) {
    error(403, 'Accès non autorisé à ce projet.');
  }

  const data = await request.json();
  const { action, ...body } = data;

  if (action === 'create') {
    const { orderNum, title, description, skillIds = [] } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: 'Titre requis' }), { status: 400 });
    }

    const maxOrder = await db
      .prepare('SELECT COALESCE(MAX(order_num), 0) AS max FROM project_tasks WHERE project_id = ?')
      .bind(params.project_id)
      .first<{ max: number }>();

    const task = await createTask(
      db,
      params.project_id,
      orderNum ?? (maxOrder?.max ?? 0) + 1,
      title,
      description ?? '',
      skillIds
    );

    return new Response(JSON.stringify(task), { status: 201 });
  }

  if (action === 'update') {
    const { taskId, title, description, state, skillIds = [] } = body;

    if (!taskId) {
      return new Response(JSON.stringify({ error: 'ID de tâche requis' }), { status: 400 });
    }

    await updateTask(db, taskId, title, description, state, skillIds);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  if (action === 'delete') {
    const { taskId } = body;

    if (!taskId) {
      return new Response(JSON.stringify({ error: 'ID de tâche requis' }), { status: 400 });
    }

    await deleteTask(db, taskId);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  if (action === 'assign') {
    const { taskId, jeuneId } = body;

    if (!taskId || !jeuneId) {
      return new Response(JSON.stringify({ error: 'Paramètres requis' }), { status: 400 });
    }

    await addJeuneToTask(db, taskId, jeuneId, user.id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  if (action === 'unassign') {
    const { taskId, jeuneId } = body;

    if (!taskId || !jeuneId) {
      return new Response(JSON.stringify({ error: 'Paramètres requis' }), { status: 400 });
    }

    await removeJeuneFromTask(db, taskId, jeuneId);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  error(400, 'Action non reconnue.');
};
