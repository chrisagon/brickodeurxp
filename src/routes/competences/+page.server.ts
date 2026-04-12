import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  getAllDomains,
  createDomain,
  updateDomain,
  getAllSkillsByDomain,
  getCategoriesByDomain,
  createCategory,
  updateCategory,
  deleteCategory,
  assignSkillToCategory,
} from '$lib/server/db';
import type { Skill, Category } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, locals }) => {
  const db = platform!.env.DB;
  const domains = await getAllDomains(db);

  const skillsByDomain: Record<string, Skill[]> = {};
  const categoriesByDomain: Record<string, Category[]> = {};

  for (const domain of domains) {
    skillsByDomain[domain.id] = await getAllSkillsByDomain(db, domain.id);
    categoriesByDomain[domain.id] = await getCategoriesByDomain(db, domain.id);
  }

  return { domains, skillsByDomain, categoriesByDomain, role: locals.session!.user.role };
};

// ── Helpers de garde ──────────────────────────────────────────────────────────

function requireAdmin(locals: App.Locals) {
  if (locals.session?.user.role !== 'admin') error(403, 'Réservé à l\'administrateur.');
}

function requireAdminOrAnimateur(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'admin' && role !== 'animateur') error(403, 'Accès non autorisé.');
}

// ── Actions ───────────────────────────────────────────────────────────────────

export const actions: Actions = {

  // ── Domaines (admin seulement) ──────────────────────────────────────────────

  addDomain: async ({ request, platform, locals }) => {
    requireAdmin(locals);
    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim();
    const color = String(data.get('color') ?? '#6366f1').trim();
    const icon = String(data.get('icon') ?? '').trim();

    if (!name) return fail(400, { error: 'Nom du domaine requis.' });

    await createDomain(platform!.env.DB, name, color, icon);
    return { success: true };
  },

  editDomain: async ({ request, platform, locals }) => {
    requireAdmin(locals);
    const data = await request.formData();
    const domain_id = String(data.get('domain_id') ?? '');
    const name = String(data.get('name') ?? '').trim();
    const color = String(data.get('color') ?? '').trim();
    const icon = String(data.get('icon') ?? '').trim();

    if (!domain_id || !name) return fail(400, { error: 'Données manquantes.' });

    await updateDomain(platform!.env.DB, domain_id, name, color, icon);
    return { success: true };
  },

  // ── Catégories (admin seulement) ────────────────────────────────────────────

  addCategory: async ({ request, platform, locals }) => {
    requireAdmin(locals);
    const data = await request.formData();
    const domain_id = String(data.get('domain_id') ?? '');
    const name = String(data.get('name') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!domain_id || !name) return fail(400, { error: 'Domaine et nom requis.' });

    await createCategory(platform!.env.DB, domain_id, name, description);
    return { success: true };
  },

  editCategory: async ({ request, platform, locals }) => {
    requireAdmin(locals);
    const data = await request.formData();
    const category_id = String(data.get('category_id') ?? '');
    const name = String(data.get('name') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!category_id || !name) return fail(400, { error: 'Données manquantes.' });

    await updateCategory(platform!.env.DB, category_id, name, description);
    return { success: true };
  },

  deleteCategory: async ({ request, platform, locals }) => {
    requireAdmin(locals);
    const data = await request.formData();
    const category_id = String(data.get('category_id') ?? '');
    if (!category_id) return fail(400, { error: 'category_id requis.' });

    await deleteCategory(platform!.env.DB, category_id);
    return { success: true };
  },

  // ── Compétences (admin + animateur) ─────────────────────────────────────────

  addSkill: async ({ request, platform, locals }) => {
    requireAdminOrAnimateur(locals);
    const data = await request.formData();
    const domain_id = String(data.get('domain_id') ?? '');
    const category_id = String(data.get('category_id') ?? '').trim() || null;
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!domain_id || !title) return fail(400, { error: 'Domaine et titre requis.' });

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

  editSkill: async ({ request, platform, locals }) => {
    requireAdminOrAnimateur(locals);
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

  toggleSkill: async ({ request, platform, locals }) => {
    requireAdminOrAnimateur(locals);
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

  deactivateSkill: async ({ request, platform, locals }) => {
    requireAdminOrAnimateur(locals);
    const data = await request.formData();
    const skill_id = String(data.get('skill_id') ?? '');
    if (!skill_id) return fail(400, { error: 'skill_id requis.' });

    await platform!.env.DB
      .prepare('UPDATE skills SET active = 0 WHERE id = ?')
      .bind(skill_id)
      .run();

    return { success: true };
  },

  assignSkill: async ({ request, platform, locals }) => {
    requireAdminOrAnimateur(locals);
    const data = await request.formData();
    const skill_id = String(data.get('skill_id') ?? '');
    const category_id = String(data.get('category_id') ?? '').trim() || null;

    if (!skill_id) return fail(400, { error: 'skill_id requis.' });

    await assignSkillToCategory(platform!.env.DB, skill_id, category_id);
    return { success: true };
  },
};
