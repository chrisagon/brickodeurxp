import type { PageServerLoad } from './$types';
import {
  getDirectoryUsers,
  getUnreadCounts,
  getDirectoryTeamMemberships,
  getAllTeams,
} from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, locals }) => {
  const db = platform!.env.DB;
  const currentId = locals.session!.user.id;
  const [users, unread, memberships, teams] = await Promise.all([
    getDirectoryUsers(db, currentId),
    getUnreadCounts(db, currentId),
    getDirectoryTeamMemberships(db),
    getAllTeams(db, true),
  ]);

  // Map jeune_id -> [team_id] pour le filtre par équipe
  const teamMap: Record<string, string[]> = {};
  for (const m of memberships) {
    (teamMap[m.jeune_id] ??= []).push(m.team_id);
  }

  return {
    users,
    unread,
    teamMap,
    teams: teams.map((t) => ({ id: t.id, name: t.name })),
  };
};
