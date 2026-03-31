import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.session) redirect(303, '/auth/login');
  if (locals.session.user.role !== 'jeune') redirect(303, '/');
  return { user: locals.session.user };
};
