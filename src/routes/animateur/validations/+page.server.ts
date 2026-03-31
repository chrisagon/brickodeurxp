import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPendingRequests, approveRequest, rejectRequest } from '$lib/server/db';

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
      return { success: true, badge_id: badge.id, approved_request_id: request_id };
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
