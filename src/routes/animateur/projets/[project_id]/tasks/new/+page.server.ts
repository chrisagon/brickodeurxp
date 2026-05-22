import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createTask } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, params, platform }) => {
  if (!locals.session) redirect(303, '/auth/login');
  if (locals.session.user.role !== 'animateur') redirect(303, '/');

  const db = platform!.env.DB;
  const project = await db.prepare('SELECT id, name FROM projects WHERE id = ?').bind(params.project_id).first<{ id: string; name: string }>();
  if (!project) error(404, 'Projet non trouvé');

  // Get all skills for the select options with domain info
  const skills = await db.prepare(`
    SELECT s.id, s.domain_id, d.name AS domain_title, s.title AS skill_title
    FROM skills s
    JOIN domains d ON d.id = s.domain_id
    ORDER BY d.name, s.title
  `).all<{ id: string; domain_id: string; domain_title: string; skill_title: string }>();

  return {
    project,
    skills: skills.results,
  };
};

export const actions: Actions = {
  createTask: async ({ request, params, locals, platform }) => {
    if (!locals.session) redirect(303, '/auth/login');
    if (locals.session.user.role !== 'animateur') redirect(303, '/');

    const db = platform!.env.DB;
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const skillIds = (formData.get('skillIds') as string)?.split(',') || [];

    if (!title || title.trim().length < 2) {
      return { formError: 'Le titre doit contenir au moins 2 caractères' };
    }

    try {
      // Get the current max order number for this project
      const maxOrder = await db.prepare('SELECT MAX(order_num) as max FROM project_tasks WHERE project_id = ?')
        .bind(params.project_id)
        .first<{ max: number | null }>();

      const orderNum = (maxOrder?.max || 0) + 1;

      await createTask(db, params.project_id, orderNum, title, description, skillIds);

      throw redirect(303, `/animateur/projets/${params.project_id}`);
    } catch (err: any) {
      if (err?.status && err.status >= 300 && err.status < 400) throw err;
      return { formError: 'Échec de la création de la tâche' };
    }
  },
};
