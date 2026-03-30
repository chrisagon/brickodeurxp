import type { Handle } from '@sveltejs/kit';
import { getSessionFromToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');

  if (token && event.platform?.env.DB) {
    const session = await getSessionFromToken(event.platform.env.DB, token);
    event.locals.session = session;
  } else {
    event.locals.session = null;
  }

  return resolve(event);
};
