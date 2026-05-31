import type { PageServerLoad } from './$types';
import { getChildrenByParent, getAllDomains, getSkillsByDomain, getBadgesByJeune, getBadgeRequestsByJeune } from '$lib/server/db';
import { calculateLevel, LEVEL_COLORS } from '$lib/utils/level';
import type { Level } from '$lib/utils/level';

type SkillRow = {
  id: string;
  title: string;
  description: string;
  hasBadge: boolean;
  pendingRequest: boolean;
};

type DomainRow = {
  domain: { id: string; name: string; color: string; icon: string };
  skills: SkillRow[];
  badgeCount: number;
  level: Level | null;
  levelColor: string;
};

type ChildPasseport = {
  enfant: { prenom: string; nom: string };
  passeport: DomainRow[];
};

export const load: PageServerLoad = async ({ locals, platform }) => {
  const db = platform!.env.DB;
  const parentId = locals.session!.user.id;

  const children = await getChildrenByParent(db, parentId);
  const domains = await getAllDomains(db);

  const childrenPasseports: ChildPasseport[] = [];

  for (const child of children) {
    const [badges, requests] = await Promise.all([
      getBadgesByJeune(db, child.id),
      getBadgeRequestsByJeune(db, child.id),
    ]);

    // Les compétences validées proviennent des demandes approuvées
    const approvedSkillIds = new Set(
      requests.filter((r) => r.status === 'approved').map((r) => r.skill_id)
    );
    const pendingSkillIds = new Set(
      requests.filter((r) => r.status === 'pending').map((r) => r.skill_id)
    );
    // Les badges sont attribués par catégorie
    const badgeCategoryIds = new Set(badges.map((b) => b.category_id));

    const passeport: DomainRow[] = [];

    for (const domain of domains) {
      const skills = await getSkillsByDomain(db, domain.id);
      const domainCategoryIds = new Set(
        skills.map((s) => s.category_id).filter((id): id is string => !!id)
      );
      const domainBadgeCount = Array.from(domainCategoryIds).filter((id) =>
        badgeCategoryIds.has(id)
      ).length;
      const level = calculateLevel(domainBadgeCount);

      passeport.push({
        domain,
        skills: skills.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          hasBadge: approvedSkillIds.has(s.id),
          pendingRequest: pendingSkillIds.has(s.id),
        })),
        badgeCount: domainBadgeCount,
        level,
        levelColor: level ? LEVEL_COLORS[level] : '#374151',
      });
    }

    childrenPasseports.push({
      enfant: { prenom: child.prenom, nom: child.nom },
      passeport,
    });
  }

  return { childrenPasseports, user: locals.session!.user };
};
