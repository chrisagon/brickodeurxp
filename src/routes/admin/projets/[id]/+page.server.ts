import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectById, getTasksByProject, getAllDomains, getSkillsByDomain } from '$lib/server/db';

function requireAdmin(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'admin') {
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

  const tasks = await getTasksByProject(db, params.id);

  // Récupérer les compétences du domaine de l'équipe
  const domains = await getAllDomains(db);
  const skillsByDomain = new Map<string, any[]>();
  for (const domain of domains) {
    const skills = await getSkillsByDomain(db, domain.id);
    skillsByDomain.set(domain.id, skills);
  }

  return { project, tasks, skillsByDomain };
};
