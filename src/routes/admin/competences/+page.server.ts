import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  getAllDomains,
  getAllSkillsByDomain,
  getCategoriesByDomain,
  createCategory,
  updateCategory,
  deleteCategory,
  assignSkillToCategory,
} from '$lib/server/db';
import type { Skill, Category } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform!.env.DB;
  const domains = await getAllDomains(db);

  const skillsByDomain: Record<string, Skill[]> = {};
  const categoriesByDomain: Record<string, Category[]> = {};

  for (const domain of domains) {
    skillsByDomain[domain.id] = await getAllSkillsByDomain(db, domain.id);
    categoriesByDomain[domain.id] = await getCategoriesByDomain(db, domain.id);
  }

  return { domains, skillsByDomain, categoriesByDomain };
};

export const actions: Actions = {
  addSkill: async ({ request, platform }) => {
    const data = await request.formData();
    const domain_id = String(data.get('domain_id') ?? '');
    const category_id = String(data.get('category_id') ?? '').trim() || null;
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!domain_id || !title) {
      return fail(400, { error: 'Domaine et titre requis.' });
    }

    const db = platform!.env.DB;
    const maxOrder = await db
      .prepare('SELECT COALESCE(MAX(sort_order), -1) as max_order FROM skills WHERE domain_id = ?')
      .bind(domain_id)
      .first<{ max_order: number }>();

    await db
      .prepare('INSERT INTO skills (domain_id, category_id, title, description, sort_order) VALUES (?, ?, ?, ?, ?)')
      .bind(domain_id, category_id, title, description, (maxOrder?.max_order ?? -1) + 1)
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

  addCategory: async ({ request, platform }) => {
    const data = await request.formData();
    const domain_id = String(data.get('domain_id') ?? '');
    const name = String(data.get('name') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!domain_id || !name) return fail(400, { error: 'Domaine et nom requis.' });

    await createCategory(platform!.env.DB, domain_id, name, description);
    return { success: true };
  },

  editCategory: async ({ request, platform }) => {
    const data = await request.formData();
    const category_id = String(data.get('category_id') ?? '');
    const name = String(data.get('name') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!category_id || !name) return fail(400, { error: 'Données manquantes.' });

    await updateCategory(platform!.env.DB, category_id, name, description);
    return { success: true };
  },

  deleteCategory: async ({ request, platform }) => {
    const data = await request.formData();
    const category_id = String(data.get('category_id') ?? '');
    if (!category_id) return fail(400, { error: 'category_id requis.' });

    await deleteCategory(platform!.env.DB, category_id);
    return { success: true };
  },

  assignSkill: async ({ request, platform }) => {
    const data = await request.formData();
    const skill_id = String(data.get('skill_id') ?? '');
    const category_id = String(data.get('category_id') ?? '').trim() || null;

    if (!skill_id) return fail(400, { error: 'skill_id requis.' });

    await assignSkillToCategory(platform!.env.DB, skill_id, category_id);
    return { success: true };
  },
};
