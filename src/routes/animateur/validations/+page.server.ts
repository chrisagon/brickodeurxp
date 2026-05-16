import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getParentsByChild,
  getRequestById,
  getUserById,
} from '$lib/server/db';
import { sendEmail, buildBadgeNotificationEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ platform }) => {
  const requests = await getPendingRequests(platform!.env.DB);
  return { requests };
};

export const actions: Actions = {
  approve: async ({ request, locals, platform }) => {
    const data = await request.formData();
    const request_id = String(data.get('request_id') ?? '');
    const comment = String(data.get('comment') ?? '');

    if (!request_id) return fail(400, { error: 'ID de demande manquant.' });

    try {
      const badge = await approveRequest(
        platform!.env.DB,
        request_id,
        locals.session!.user.id,
        comment
      );

      // Notification email aux parents si badge accordé (best-effort)
      if (badge) {
        try {
          const db = platform!.env.DB;
          const appUrl = platform!.env.APP_URL;
          const badgeRequest = await getRequestById(db, request_id);

          if (badgeRequest) {
            const jeune = await getUserById(db, badgeRequest.jeune_id);
            const parents = await getParentsByChild(db, badgeRequest.jeune_id);

            if (jeune && parents.length > 0) {
              for (const parent of parents) {
                const emailPayload = buildBadgeNotificationEmail({
                  parentName: parent.prenom,
                  childName: jeune.prenom + ' ' + jeune.nom,
                  skillTitle: '',
                  domainName: '',
                  appUrl,
                });
                emailPayload.to = parent.email;
                await sendEmail(platform!.env.RESEND_API_KEY, platform!.env.RESEND_FROM, emailPayload);
              }
            }
          }
        } catch (err) {
          console.error('Failed to send badge notification:', err);
        }
      }

      return {
        success: true,
        badge_awarded: !!badge,
        badge_id: badge?.id ?? null,
        approved_request_id: request_id,
      };
    } catch (e) {
      return fail(400, { error: e instanceof Error ? e.message : 'Erreur lors de la validation.' });
    }
  },

  reject: async ({ request, locals, platform }) => {
    const data = await request.formData();
    const request_id = String(data.get('request_id') ?? '');
    const comment = String(data.get('comment') ?? '');

    if (!request_id) return fail(400, { error: 'ID de demande manquant.' });
    if (!comment.trim()) return fail(400, { error: 'Un commentaire est requis pour un refus.' });

    try {
      await rejectRequest(
        platform!.env.DB,
        request_id,
        locals.session!.user.id,
        comment
      );
      return { rejected: true };
    } catch (e) {
      return fail(400, { error: e instanceof Error ? e.message : 'Erreur lors du refus.' });
    }
  },
};
