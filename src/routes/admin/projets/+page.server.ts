import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllProjects } from '$lib/server/db';

function requireAdmin(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'admin') {
    error(403, 'Accès non autorisé.');
  }
}

export const load: PageServerLoad = async ({ platform, locals }) => {
  requireAdmin(locals);

  const db = platform!.env.DB;

  try {
    const projects = await getAllProjects(db);
    return { projects };
  } catch (err) {
    console.error('Error loading projects:', err);
    error(500, 'Erreur lors du chargement des projets.');
  }
};
