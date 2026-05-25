import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getUnreadCounts } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
  if (!locals.session) redirect(303, '/auth/login');
  if (locals.session.user.role !== 'jeune') redirect(303, '/');

  const db = platform!.env.DB;
  const unread = await getUnreadCounts(db, locals.session.user.id);
  const totalUnread = Object.values(unread).reduce((s, n) => s + n, 0);

  return { user: locals.session.user, totalUnread };
};
