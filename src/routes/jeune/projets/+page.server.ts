import type { PageServerLoad } from './$types';
import { getTasksByJeune, getTeamByJeune, getProjectsByTeam } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, locals }) => {
  const db = platform!.env.DB;
  const jeuneId = locals.session!.user.id;

  const [assignedTasks, team] = await Promise.all([
    getTasksByJeune(db, jeuneId),
    getTeamByJeune(db, jeuneId)
  ]);

  const teamProjects = team ? await getProjectsByTeam(db, team.id) : [];

  return { assignedTasks, teamProjects, team, user: locals.session!.user };
};
