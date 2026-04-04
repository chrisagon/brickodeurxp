import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.session) redirect(303, '/auth/login');
  const role = locals.session.user.role;
  if (role !== 'admin' && role !== 'animateur') redirect(303, '/');
  return { user: locals.session.user };
};
