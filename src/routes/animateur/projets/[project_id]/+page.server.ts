import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectById, getTasksByProject, getAllDomains, getSkillsByDomain } from '$lib/server/db';

function requireAnimateur(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'animateur' && role !== 'admin') {
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

  // Vérifier que l'utilisateur fait partie de l'équipe ou est admin
  if (locals.session!.user.role !== 'admin') {
    const teamMember = await db
      .prepare('SELECT 1 FROM team_members WHERE team_id = ? AND jeune_id = ?')
      .bind(project.team_id, locals.session!.user.id)
      .first();
    const projectCreator = await db
      .prepare('SELECT 1 FROM projects WHERE id = ? AND created_by = ?')
      .bind(params.project_id, locals.session!.user.id)
      .first();

    if (!teamMember && !projectCreator) {
      error(403, 'Accès non autorisé à ce projet.');
    }
  }

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
