import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hashPassword, createSession } from '$lib/server/auth';
import { getValidInvitation, getUserByEmail } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, platform }) => {
  const token = url.searchParams.get('token');
  if (!token) return { error: 'Lien invalide.' };

  const invitation = await getValidInvitation(platform!.env.DB, token);
  if (!invitation) return { error: 'Ce lien est invalide ou a expiré.' };

  return { token, parent_email: invitation.parent_email };
};

export const actions: Actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    const token = String(data.get('token') ?? '');
    const password = String(data.get('password') ?? '');
    const nom = String(data.get('nom') ?? '').trim();
    const prenom = String(data.get('prenom') ?? '').trim();

    if (!token || !password || !nom || !prenom) {
      return fail(400, { error: 'Tous les champs sont requis.' });
    }

    const db = platform!.env.DB;
    const invitation = await getValidInvitation(db, token);
    if (!invitation) {
      return fail(400, { error: 'Ce lien est invalide ou a expiré.' });
    }

    const existing = await getUserByEmail(db, invitation.parent_email);
    if (existing) {
      return fail(400, { error: 'Un compte existe déjà avec cet email.' });
    }

    const password_hash = await hashPassword(password);
    const parentId = crypto.randomUUID();

    try {
      await db.batch([
        db.prepare('INSERT INTO users (id, email, password_hash, role, nom, prenom) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(parentId, invitation.parent_email, password_hash, 'parent', nom, prenom),
        db.prepare('INSERT OR IGNORE INTO parent_child (parent_id, child_id) VALUES (?, ?)')
          .bind(parentId, invitation.child_id),
        db.prepare('UPDATE parent_invitations SET used = 1 WHERE token = ?')
          .bind(token),
      ]);
    } catch {
      return fail(500, { error: 'Ce compte ne peut pas être créé. Veuillez contacter un animateur.' });
    }

    const session = await createSession(db, parentId);
    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(303, '/parent/enfant');
  },
};
