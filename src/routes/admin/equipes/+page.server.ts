import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllTeams } from '$lib/server/db';

function requireAdmin(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'admin') error(403, 'Accès non autorisé.');
}

export const load: PageServerLoad = async ({ platform, locals, url }) => {
  requireAdmin(locals);

  const db = platform!.env.DB;
  const onlyActive = url.searchParams.get('active') !== 'false';
  const teams = await getAllTeams(db, onlyActive);

  return { teams, onlyActive };
};
