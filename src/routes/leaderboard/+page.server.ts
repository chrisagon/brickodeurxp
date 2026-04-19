import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getLeaderboardByTeam } from '$lib/server/db';
import type { LeaderboardEntry } from '$lib/server/db';

export type TeamLeaderboard = {
  team_id: string;
  team_name: string;
  team_description: string;
  members: LeaderboardEntry[];
};

export const load: PageServerLoad = async ({ platform, locals }) => {
  if (!locals.session) redirect(303, '/');

  const db = platform!.env.DB;
  const entries = await getLeaderboardByTeam(db);

  // Regrouper par équipe en conservant l'ordre (déjà trié par team_name côté SQL)
  const teamMap = new Map<string, TeamLeaderboard>();
  for (const entry of entries) {
    if (!teamMap.has(entry.team_id)) {
      teamMap.set(entry.team_id, {
        team_id: entry.team_id,
        team_name: entry.team_name,
        team_description: entry.team_description,
        members: [],
      });
    }
    teamMap.get(entry.team_id)!.members.push(entry);
  }

  return { teams: [...teamMap.values()] };
};
