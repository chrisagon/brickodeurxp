import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteSession } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ cookies, platform }) => {
    const token = cookies.get('session');
    if (token && platform?.env.DB) {
      await deleteSession(platform.env.DB, token);
    }
    cookies.delete('session', { path: '/' });
    redirect(303, '/auth/login');
  },
};
