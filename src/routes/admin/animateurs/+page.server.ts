import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  getUserByEmail,
  getPendingAnimateurInvitations,
  createAnimateurInvitation,
} from '$lib/server/db';
import { sendEmail, buildAnimateurInvitationEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform!.env.DB;
  const [animateursResult, pendingInvitations] = await Promise.all([
    db
      .prepare(
        "SELECT id, email, nom, prenom, created_at FROM users WHERE role = 'animateur' ORDER BY nom, prenom"
      )
      .all<{ id: string; email: string; nom: string; prenom: string; created_at: number }>(),
    getPendingAnimateurInvitations(db),
  ]);
  return {
    animateurs: animateursResult.results,
    pendingInvitations,
  };
};

export const actions: Actions = {
  invite: async ({ request, platform, locals }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return fail(400, { error: 'Adresse email invalide.' });
    }

    const db = platform!.env.DB;

    // Vérifier que l'email n'est pas déjà un compte actif
    const existing = await getUserByEmail(db, email);
    if (existing) {
      return fail(400, { error: 'Un compte existe déjà pour cet email.' });
    }

    const invitedBy = locals.session!.user.id;
    const invitation = await createAnimateurInvitation(db, email, invitedBy);

    const appUrl = platform!.env.APP_URL;
    const inviteLink = `${appUrl}/auth/animateur/${invitation.token}`;

    const emailPayload = buildAnimateurInvitationEmail({ inviteEmail: email, inviteLink, appUrl });

    try {
      await sendEmail(platform!.env.RESEND_API_KEY, platform!.env.RESEND_FROM, emailPayload);
    } catch (err) {
      console.error('Resend error:', err);
      return fail(500, { error: "Invitation créée mais l'email n'a pas pu être envoyé." });
    }

    return { success: true };
  },
};
