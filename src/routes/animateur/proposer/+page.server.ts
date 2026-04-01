import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllDomains, createSkillProposal } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform!.env.DB;
  const domains = await getAllDomains(db);
  return { domains };
};

export const actions: Actions = {
  default: async ({ request, platform, locals }) => {
    const data = await request.formData();
    const domain_id = String(data.get('domain_id') ?? '').trim();
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!domain_id || !title) {
      return fail(400, { error: 'Domaine et titre requis.', domain_id, title, description });
    }
    if (title.length > 100) {
      return fail(400, { error: 'Titre trop long (max 100 caractères).', domain_id, title, description });
    }

    const db = platform!.env.DB;
    const proposedBy = locals.session!.user.id;

    await createSkillProposal(db, proposedBy, domain_id, title, description);
    redirect(303, '/animateur/proposer?success=1');
  },
};
