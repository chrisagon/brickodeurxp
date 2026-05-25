import type { PageServerLoad } from './$types';
import { getInbox } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, locals }) => {
  const db = platform!.env.DB;
  const userId = locals.session!.user.id;
  const inbox = await getInbox(db, userId);
  return { inbox, user: locals.session!.user };
};
