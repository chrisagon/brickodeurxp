import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getValidMagicLoginToken, markMagicLoginTokenUsed, getUserByEmail } from '$lib/server/db';
import { createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, platform, cookies }) => {
  const token = url.searchParams.get('token');
  if (!token) {
    redirect(303, '/auth/login');
  }

  const db = platform!.env.DB;
  const tokenData = await getValidMagicLoginToken(db, token);

  if (!tokenData) {
    redirect(303, '/auth/login?magicError=1');
  }

  const user = await getUserByEmail(db, tokenData.email);
  if (!user) {
    redirect(303, '/auth/login?magicError=1');
  }

  // Marquer le token comme utilisé et créer la session en batch
  const session = await createSession(db, user.id);

  await db.batch([
    db.prepare('UPDATE magic_login_tokens SET used = 1 WHERE token = ?').bind(token),
  ]);

  cookies.set('session', session.token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(303, '/');
};
