import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPendingProposals, approveProposal, rejectProposal } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform!.env.DB;
  const proposals = await getPendingProposals(db);
  return { proposals };
};

export const actions: Actions = {
  approve: async ({ request, platform, locals }) => {
    const data = await request.formData();
    const proposal_id = String(data.get('proposal_id') ?? '').trim();
    if (!proposal_id) return fail(400, { error: 'proposal_id requis.' });

    const db = platform!.env.DB;
    const reviewerId = locals.session!.user.id;

    try {
      await approveProposal(db, proposal_id, reviewerId);
    } catch (err) {
      return fail(400, { error: (err as Error).message });
    }
    return { success: true, action: 'approved' };
  },

  reject: async ({ request, platform, locals }) => {
    const data = await request.formData();
    const proposal_id = String(data.get('proposal_id') ?? '').trim();
    const note = String(data.get('note') ?? '').trim();
    if (!proposal_id) return fail(400, { error: 'proposal_id requis.' });

    const db = platform!.env.DB;
    const reviewerId = locals.session!.user.id;

    try {
      await rejectProposal(db, proposal_id, reviewerId, note);
    } catch (err) {
      return fail(400, { error: (err as Error).message });
    }
    return { success: true, action: 'rejected' };
  },
};
