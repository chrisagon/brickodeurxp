import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getUserByEmailWithPassword } from '$lib/server/db';
import { verifyPassword, createSession } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const password = String(data.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'Email et mot de passe requis.' });
    }

    const db = platform!.env.DB;
    const user = await getUserByEmailWithPassword(db, email);

    if (!user || !user.password_hash) {
      return fail(401, { error: 'Email ou mot de passe incorrect.' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return fail(401, { error: 'Email ou mot de passe incorrect.' });
    }

    const session = await createSession(db, user.id);

    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(303, '/');
  },
};
