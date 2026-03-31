import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { hashPassword, createSession } from '$lib/server/auth';
import { getUserByEmail, createParentInvitation } from '$lib/server/db';

export const actions: Actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const password = String(data.get('password') ?? '');
    const nom = String(data.get('nom') ?? '').trim();
    const prenom = String(data.get('prenom') ?? '').trim();
    const parent_email = String(data.get('parent_email') ?? '').trim().toLowerCase();

    if (!email || !password || !nom || !prenom || !parent_email) {
      return fail(400, { error: 'Tous les champs sont requis.' });
    }
    if (password.length < 8) {
      return fail(400, { error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const db = platform!.env.DB;
    const existing = await getUserByEmail(db, email);
    if (existing) {
      return fail(400, { error: 'Cet email est déjà utilisé.' });
    }

    const password_hash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db
      .prepare(
        'INSERT INTO users (id, email, password_hash, role, nom, prenom) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, email, password_hash, 'jeune', nom, prenom)
      .run();

    // Create parent invitation
    const inviteToken = await createParentInvitation(db, parent_email, userId);

    // In dev: log the invitation link (Plan 3 will send it via Resend)
    const appUrl = platform!.env.APP_URL ?? 'http://localhost:5173';
    console.log(`[DEV] Lien invitation parent: ${appUrl}/auth/magic?token=${inviteToken}`);

    const session = await createSession(db, userId);
    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(303, '/jeune/passeport');
  },
};
