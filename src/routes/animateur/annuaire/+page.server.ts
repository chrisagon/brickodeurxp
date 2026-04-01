import type { PageServerLoad } from './$types';
import { getDirectoryUsers, getUnreadCounts } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, locals }) => {
  const db = platform!.env.DB;
  const currentId = locals.session!.user.id;
  const [users, unread] = await Promise.all([
    getDirectoryUsers(db, currentId),
    getUnreadCounts(db, currentId),
  ]);
  return { users, unread };
};
