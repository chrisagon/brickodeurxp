import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
  getUserById,
  getAllDomains,
  getCategoriesByDomain,
  getSkillsByCategory,
  getSkillsByDomain,
  getBadgesByJeune,
  getBadgeRequestsByJeune,
} from '$lib/server/db';
import { calculateLevel, LEVEL_IMAGES } from '$lib/utils/level';
import type { Level } from '$lib/utils/level';
import type { Category } from '$lib/server/db';

type SkillState = {
  id: string;
  title: string;
  description: string;
  approved: boolean;
  pendingRequest: boolean;
  rejectedRequest: boolean;
};

type CategoryProfile = {
  category: Category;
  hasBadge: boolean;
  badgeLevel: Level | null;
  badgeImage: string | null;
  completedCount: number;
  totalCount: number;
  skills: SkillState[];
};

export type DomainProfile = {
  domain: { id: string; name: string; color: string; icon: string };
  categories: CategoryProfile[];
  uncategorizedSkills: SkillState[];
  categoryBadgeCount: number;
  level: Level | null;
  levelImage: string | null;
};

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  if (!locals.session) redirect(303, '/');

  const db = platform!.env.DB;

  const jeune = await getUserById(db, params.jeune_id);
  if (!jeune || jeune.role !== 'jeune') error(404, 'Profil introuvable.');

  const [domains, badges, requests] = await Promise.all([
    getAllDomains(db),
    getBadgesByJeune(db, jeune.id),
    getBadgeRequestsByJeune(db, jeune.id),
  ]);

  const pendingSkillIds = new Set(
    requests.filter((r) => r.status === 'pending').map((r) => r.skill_id)
  );
  const approvedSkillIds = new Set(
    requests.filter((r) => r.status === 'approved').map((r) => r.skill_id)
  );
  const rejectedSkillIds = new Set(
    requests
      .filter((r) => r.status === 'rejected' && !approvedSkillIds.has(r.skill_id) && !pendingSkillIds.has(r.skill_id))
      .map((r) => r.skill_id)
  );

  const badgeByCategoryId = new Map(badges.map((b) => [b.category_id, b]));

  const profile: DomainProfile[] = [];

  for (const domain of domains) {
    const categories = await getCategoriesByDomain(db, domain.id);
    const allSkillsInDomain = await getSkillsByDomain(db, domain.id);

    const categoriesList: CategoryProfile[] = [];

    for (const cat of categories) {
      const skills = await getSkillsByCategory(db, cat.id);
      const badge = badgeByCategoryId.get(cat.id) ?? null;

      const skillStates: SkillState[] = skills.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        approved: approvedSkillIds.has(s.id),
        pendingRequest: pendingSkillIds.has(s.id),
        rejectedRequest: rejectedSkillIds.has(s.id),
      }));

      categoriesList.push({
        category: cat,
        hasBadge: !!badge,
        badgeLevel: badge?.level ?? null,
        badgeImage: badge?.level ? LEVEL_IMAGES[badge.level as Level] : null,
        completedCount: skillStates.filter((s) => s.approved).length,
        totalCount: skills.length,
        skills: skillStates,
      });
    }

    const uncategorized = allSkillsInDomain.filter((s) => !s.category_id);
    const uncategorizedStates: SkillState[] = uncategorized.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      approved: approvedSkillIds.has(s.id),
      pendingRequest: pendingSkillIds.has(s.id),
      rejectedRequest: rejectedSkillIds.has(s.id),
    }));

    const categoryBadgeCount = categoriesList.filter((c) => c.hasBadge).length;
    const level = calculateLevel(categoryBadgeCount);

    profile.push({
      domain,
      categories: categoriesList,
      uncategorizedSkills: uncategorizedStates,
      categoryBadgeCount,
      level,
      levelImage: level ? LEVEL_IMAGES[level] : null,
    });
  }

  const totalBadges = badges.length;
  const totalSkills = approvedSkillIds.size;

  return { profile, jeune, totalBadges, totalSkills };
};
