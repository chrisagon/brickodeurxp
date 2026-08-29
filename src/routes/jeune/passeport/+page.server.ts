import type { PageServerLoad } from './$types';
import {
  getAllDomains,
  getCategoriesByDomain,
  getSkillsByDomain,
  getBadgesByJeune,
  getCategoryBadge,
  getBadgeRequestsByJeune,
} from '$lib/server/db';
import { calculateLevel, LEVEL_IMAGES } from '$lib/utils/level';
import type { Level } from '$lib/utils/level';
import type { Category } from '$lib/server/db';
import { groupSkillsByCategory, uncategorizedSkills } from '$lib/utils/skills';
import { deriveAccent } from '$lib/utils/accent';

type SkillState = {
  id: string;
  title: string;
  description: string;
  pendingRequest: boolean;
  rejectedRequest: boolean;
  toCompleteRequest: boolean;
  toCompleteComment: string | null;
  rejectionComment: string | null;
  reviewerComment: string | null;
  approved: boolean;
};

type CategoryPasseport = {
  category: Category;
  hasBadge: boolean;
  badgeLevel: Level | null;
  badgeImage: string | null;
  completedCount: number;
  totalCount: number;
  skills: SkillState[];
};

export type DomainPasseport = {
  domain: { id: string; name: string; color: string; icon: string };
  /**
   * Accent d'affichage dérivé de `domain.color`, calculé côté serveur.
   * Toujours une couleur exploitable : `deriveAccent` est totale.
   */
  accent: string;
  categories: CategoryPasseport[];
  uncategorizedSkills: SkillState[];
  categoryBadgeCount: number;
  level: Level | null;
  levelImage: string | null;
};

export const load: PageServerLoad = async ({ locals, platform }) => {
  const db = platform!.env.DB;
  const jeuneId = locals.session!.user.id;

  const [domains, badges, requests] = await Promise.all([
    getAllDomains(db),
    getBadgesByJeune(db, jeuneId),
    getBadgeRequestsByJeune(db, jeuneId),
  ]);

  // Maps des demandes par skill_id
  const pendingSkillIds = new Set(
    requests.filter((r) => r.status === 'pending').map((r) => r.skill_id)
  );
  const approvedCommentBySkillId = new Map(
    requests
      .filter((r) => r.status === 'approved')
      .map((r) => [r.skill_id, r.reviewer_comment])
  );
  const rejectedBySkillId = new Map(
    requests
      .filter((r) => r.status === 'rejected')
      .map((r) => [r.skill_id, r.reviewer_comment])
  );
  const toCompleteBySkillId = new Map(
    requests
      .filter((r) => r.status === 'to_complete')
      .map((r) => [r.skill_id, r.reviewer_comment])
  );
  const toCompleteSkillIds = new Set(
    requests.filter((r) => r.status === 'to_complete').map((r) => r.skill_id)
  );
  const approvedSkillIds = new Set(
    requests.filter((r) => r.status === 'approved').map((r) => r.skill_id)
  );

  // Map des badges par category_id
  const badgeByCategoryId = new Map(badges.map((b) => [b.category_id, b]));

  const passeport: DomainPasseport[] = [];

  for (const domain of domains) {
    // Deux requêtes indépendantes : en parallèle plutôt qu'en série.
    const [categories, allSkillsInDomain] = await Promise.all([
      getCategoriesByDomain(db, domain.id),
      getSkillsByDomain(db, domain.id),
    ]);

    // Correctif N+1 : `allSkillsInDomain` contient déjà toutes les compétences
    // actives du domaine, triées par sort_order. Les regrouper en mémoire
    // remplace un appel `getSkillsByCategory` par catégorie.
    const skillsByCategoryId = groupSkillsByCategory(allSkillsInDomain);

    const categoriesList: CategoryPasseport[] = [];

    for (const cat of categories) {
      const skills = skillsByCategoryId.get(cat.id) ?? [];
      const badge = badgeByCategoryId.get(cat.id) ?? null;

      const skillStates: SkillState[] = skills.map((s) => {
        const isToComplete = toCompleteSkillIds.has(s.id) && !approvedSkillIds.has(s.id);
        const isRejected =
          rejectedBySkillId.has(s.id) &&
          !approvedSkillIds.has(s.id) &&
          !pendingSkillIds.has(s.id) &&
          !isToComplete;
        return {
          id: s.id,
          title: s.title,
          description: s.description,
          approved: approvedSkillIds.has(s.id),
          pendingRequest: pendingSkillIds.has(s.id),
          rejectedRequest: isRejected,
          toCompleteRequest: isToComplete,
          toCompleteComment: isToComplete ? (toCompleteBySkillId.get(s.id) ?? null) : null,
          rejectionComment: isRejected ? (rejectedBySkillId.get(s.id) ?? null) : null,
          reviewerComment: approvedSkillIds.has(s.id)
            ? (approvedCommentBySkillId.get(s.id) ?? null)
            : null,
        };
      });

      const completedCount = skillStates.filter((s) => s.approved).length;

      categoriesList.push({
        category: cat,
        hasBadge: !!badge,
        badgeLevel: badge?.level ?? null,
        badgeImage: badge?.level ? LEVEL_IMAGES[badge.level as Level] : null,
        completedCount,
        totalCount: skills.length,
        skills: skillStates,
      });
    }

    // Compétences sans catégorie
    const uncategorized = uncategorizedSkills(allSkillsInDomain);
    const uncategorizedStates: SkillState[] = uncategorized.map((s) => {
      const isToComplete = toCompleteSkillIds.has(s.id) && !approvedSkillIds.has(s.id);
      const isRejected =
        rejectedBySkillId.has(s.id) &&
        !approvedSkillIds.has(s.id) &&
        !pendingSkillIds.has(s.id) &&
        !isToComplete;
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        approved: approvedSkillIds.has(s.id),
        pendingRequest: pendingSkillIds.has(s.id),
        rejectedRequest: isRejected,
        toCompleteRequest: isToComplete,
        toCompleteComment: isToComplete ? (toCompleteBySkillId.get(s.id) ?? null) : null,
        rejectionComment: isRejected ? (rejectedBySkillId.get(s.id) ?? null) : null,
        reviewerComment: approvedSkillIds.has(s.id)
          ? (approvedCommentBySkillId.get(s.id) ?? null)
          : null,
      };
    });

    const categoryBadgeCount = categoriesList.filter((c) => c.hasBadge).length;
    const level = calculateLevel(categoryBadgeCount);

    passeport.push({
      domain,
      accent: deriveAccent(domain.color),
      categories: categoriesList,
      uncategorizedSkills: uncategorizedStates,
      categoryBadgeCount,
      level,
      levelImage: level ? LEVEL_IMAGES[level] : null,
    });
  }

  return { passeport, user: locals.session!.user };
};
