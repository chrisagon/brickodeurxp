import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllDomains, getAllSkillsByDomain } from '$lib/server/db';
import type { Skill } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, locals }) => {
  const db = platform!.env.DB;
  const domains = await getAllDomains(db);
  const skillsByDomain: Record<string, Skill[]> = {};

  for (const domain of domains) {
    skillsByDomain[domain.id] = await getAllSkillsByDomain(db, domain.id);
  }

  return { domains, skillsByDomain, role: locals.session!.user.role };
};

export const actions: Actions = {
  addSkill: async ({ request, platform, locals }) => {
    if (locals.session?.user.role !== 'admin') error(403, 'Réservé à l\'administrateur.');

    const data = await request.formData();
    const domain_id = String(data.get('domain_id') ?? '');
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!domain_id || !title) return fail(400, { error: 'Domaine et titre requis.' });

    const db = platform!.env.DB;
    const maxOrder = await db
      .prepare('SELECT COALESCE(MAX(sort_order), -1) as max_order FROM skills WHERE domain_id = ?')
      .bind(domain_id)
      .first<{ max_order: number }>();

    await db
      .prepare('INSERT INTO skills (domain_id, title, description, sort_order) VALUES (?, ?, ?, ?)')
      .bind(domain_id, title, description, (maxOrder?.max_order ?? -1) + 1)
      .run();

    return { success: true };
  },

  editSkill: async ({ request, platform, locals }) => {
    if (locals.session?.user.role !== 'admin') error(403, 'Réservé à l\'administrateur.');

    const data = await request.formData();
    const skill_id = String(data.get('skill_id') ?? '').trim();
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!skill_id || !title) return fail(400, { error: 'skill_id et titre requis.' });

    await platform!.env.DB
      .prepare('UPDATE skills SET title = ?, description = ? WHERE id = ?')
      .bind(title, description, skill_id)
      .run();

    return { success: true };
  },

  toggleSkill: async ({ request, platform }) => {
    const data = await request.formData();
    const skill_id = String(data.get('skill_id') ?? '');
    const active = Number(data.get('active') ?? 0);
    if (!skill_id) return fail(400, { error: 'skill_id requis.' });

    await platform!.env.DB
      .prepare('UPDATE skills SET active = ? WHERE id = ?')
      .bind(active ? 0 : 1, skill_id)
      .run();

    return { success: true };
  },

  deactivateSkill: async ({ request, platform }) => {
    const data = await request.formData();
    const skill_id = String(data.get('skill_id') ?? '');
    if (!skill_id) return fail(400, { error: 'skill_id requis.' });

    await platform!.env.DB
      .prepare('UPDATE skills SET active = 0 WHERE id = ?')
      .bind(skill_id)
      .run();

    return { success: true };
  },
};
