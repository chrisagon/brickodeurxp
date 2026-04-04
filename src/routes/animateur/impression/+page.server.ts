import type { PageServerLoad, Actions } from './$types';
import { getBadgesForPrinting, markBadgePrinted } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform!.env.DB;
  const badges = await getBadgesForPrinting(db);
  return { badges };
};

export const actions: Actions = {
  markPrinted: async ({ request, locals, platform }) => {
    const db = platform!.env.DB;
    const animateurId = locals.session!.user.id;

    const formData = await request.formData();
    const badgeId = formData.get('badge_id');
    if (!badgeId || typeof badgeId !== 'string') return fail(400, { error: 'badge_id manquant' });

    await markBadgePrinted(db, badgeId, animateurId);
    return { success: true };
  },
};
