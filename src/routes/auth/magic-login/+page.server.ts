import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getUserByEmail, createMagicLoginToken } from '$lib/server/db';
import { sendEmail, buildMagicLoginEmail } from '$lib/server/email';

export const actions: Actions = {
  default: async ({ request, platform }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();

    if (!email) {
      return fail(400, { error: 'Email requis.' });
    }

    const db = platform!.env.DB;
    const user = await getUserByEmail(db, email);

    if (user) {
      const token = await createMagicLoginToken(db, email);
      const appUrl = platform!.env.APP_URL ?? 'http://localhost:5173';
      const magicLink = `${appUrl}/auth/magic-login/callback?token=${token}`;

      const emailPayload = buildMagicLoginEmail({ magicLink, appUrl });
      emailPayload.to = email;

      try {
        await sendEmail(platform!.env.RESEND_API_KEY, platform!.env.RESEND_FROM, emailPayload);
      } catch (err) {
        console.error('Failed to send magic login email:', err);
        // Best-effort : l'utilisateur voit quand même le message de succès générique
      }
    }

    // Message volontairement vague — ne pas révéler l'existence d'un compte
    return { success: true };
  },
};
