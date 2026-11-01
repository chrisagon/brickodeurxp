import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  getProjectById,
  getTasksByProject,
  updateProject,
  deleteProject,
} from '$lib/server/db';

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

  // `domains` et `skillsByDomain` étaient chargés ici — une requête par
  // domaine, en série — mais la vue ne les lit jamais. Le correctif du N+1
  // n'est pas de l'optimiser, c'est de le supprimer. La liste des
  // compétences sert à la création de tâche, qui la charge pour son compte
  // (`tasks/new/+page.server.ts`).
  return { project, tasks };
};

export const actions: Actions = {
  /** Modifie le projet. `updateProject` existait déjà, elle n'était exposée nulle part côté admin. */
  updateProject: async ({ request, params, platform, locals }) => {
    requireAdmin(locals);

    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    const startDate = String(data.get('start_date') ?? '').trim();
    const endDate = String(data.get('end_date') ?? '').trim();
    const teamId = String(data.get('team_id') ?? '').trim();

    if (!name) return fail(400, { error: 'Le nom du projet est requis.' });
    if (!startDate || !endDate) return fail(400, { error: 'Les deux dates sont requises.' });

    // Les dates arrivent en AAAA-MM-JJ depuis <input type="date"> ; la base
    // stocke des entiers Unix en secondes.
    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = Math.floor(new Date(endDate).getTime() / 1000);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return fail(400, { error: 'Dates invalides.' });
    }
    if (end < start) {
      return fail(400, { error: 'La date de fin ne peut pas précéder la date de début.' });
    }

    try {
      await updateProject(platform!.env.DB, params.id, name, description, start, end, teamId || null);
      return { success: true };
    } catch (e) {
      console.error('updateProject:', e);
      return fail(500, { error: 'Échec de la modification du projet.' });
    }
  },

  /**
   * Supprime le projet. `project_tasks.project_id` est en ON DELETE CASCADE
   * (`0012_projects.sql:18`), et `task_assignments.task_id` l'est aussi : les
   * tâches et leurs affectations partent avec. L'interface doit le dire avant
   * de confirmer.
   */
  deleteProject: async ({ params, platform, locals }) => {
    requireAdmin(locals);

    try {
      await deleteProject(platform!.env.DB, params.id);
    } catch (e) {
      console.error('deleteProject:', e);
      return fail(500, { error: 'Échec de la suppression du projet.' });
    }

    // Redirection hors du try : `redirect` lève par conception, la capturer
    // la transformerait en erreur 500.
    redirect(303, '/admin/projets');
  },
};
