import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getValidAnimateurInvitation, markAnimateurInvitationUsed, getUserByEmail } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, platform }) => {
  const db = platform!.env.DB;
  const invitation = await getValidAnimateurInvitation(db, params.token);
  if (!invitation) {
    error(410, 'Ce lien d\'invitation est invalide ou a expiré.');
  }
  return { email: invitation.email };
};

export const actions: Actions = {
  default: async ({ params, request, platform }) => {
    const data = await request.formData();
    const prenom = String(data.get('prenom') ?? '').trim();
    const nom    = String(data.get('nom')    ?? '').trim();
    const password = String(data.get('password') ?? '');
    const confirm  = String(data.get('confirm')  ?? '');

    if (!prenom || !nom) {
      return fail(400, { error: 'Prénom et nom requis.' });
    }
    if (password.length < 8) {
      return fail(400, { error: 'Mot de passe trop court (minimum 8 caractères).' });
    }
    if (password !== confirm) {
      return fail(400, { error: 'Les mots de passe ne correspondent pas.' });
    }

    const db = platform!.env.DB;
    const token = params.token;

    const invitation = await getValidAnimateurInvitation(db, token);
    if (!invitation) {
      return fail(410, { error: 'Ce lien d\'invitation est invalide ou a expiré.' });
    }

    const existing = await getUserByEmail(db, invitation.email);
    if (existing) {
      return fail(400, { error: 'Un compte existe déjà pour cet email.' });
    }

    const password_hash = await hashPassword(password);

    await db.batch([
      db
        .prepare(
          'INSERT INTO users (id, email, password_hash, role, nom, prenom) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)'
        )
        .bind(invitation.email, password_hash, 'animateur', nom, prenom),
      db
        .prepare('UPDATE animateur_invitations SET used_at = ? WHERE token = ?')
        .bind(Math.floor(Date.now() / 1000), token),
    ]);

    redirect(303, '/auth/login?invited=1');
  },
};
