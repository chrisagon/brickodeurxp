import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getProjectById, getAllDomains, getAllActiveSkills, createTask } from '$lib/server/db';
import { groupSkillsByDomain } from '$lib/utils/skills';

function requireAdmin(locals: App.Locals) {
  if (locals.session?.user.role !== 'admin') {
    error(403, 'Accès non autorisé.');
  }
}

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireAdmin(locals);

  const db = platform!.env.DB;
  const project = await getProjectById(db, params.id);

  if (!project) {
    error(404, 'Projet introuvable.');
  }

  // Correctif N+1 : `getSkillsByDomain` était appelée une fois par domaine,
  // en série. Deux requêtes parallèles suffisent, puis on regroupe en
  // mémoire. Le coût ne dépend plus du nombre de domaines.
  const [domains, allSkills] = await Promise.all([getAllDomains(db), getAllActiveSkills(db)]);
  const skillsByDomain = groupSkillsByDomain(allSkills);

  // La vue fait `skillsByDomain.get(domain.id) ?? []`, mais on garantit une
  // entrée par domaine pour que la Map reste le reflet exact de l'ancienne.
  for (const domain of domains) {
    if (!skillsByDomain.has(domain.id)) skillsByDomain.set(domain.id, []);
  }

  return { project, domains: domains ?? [], skillsByDomain };
};

export const actions: Actions = {
  createTask: async ({ request, params, platform, locals }) => {
    requireAdmin(locals);

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
        .bind(params.id)
        .first<{ max: number | null }>();

      const orderNum = (maxOrder?.max || 0) + 1;

      await createTask(db, params.id, orderNum, title, description, skillIds);

      throw redirect(303, `/admin/projets/${params.id}`);
    } catch (err: any) {
      if (err?.status && err.status >= 300 && err.status < 400) throw err;
      return { formError: 'Échec de la création de la tâche' };
    }
  },
};
