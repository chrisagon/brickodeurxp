import type { PageServerLoad } from './$types';
import { getTasksByJeune } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, locals }) => {
  const db = platform!.env.DB;
  const jeuneId = locals.session!.user.id;

  // Récupérer les tâches assignées à ce jeune
  const tasks = await getTasksByJeune(db, jeuneId);

  return { tasks, user: locals.session!.user };
};
