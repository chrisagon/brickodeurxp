import type { PageServerLoad } from './$types';
import { getAllDomains, getSkillsByDomain, getBadgesByJeune, getBadgeRequestsByJeune } from '$lib/server/db';
import { calculateLevel, LEVEL_COLORS, LEVEL_IMAGES } from '$lib/utils/level';
import type { Level } from '$lib/utils/level';

export type DomainPasseport = {
  domain: { id: string; name: string; color: string; icon: string };
  skills: { id: string; title: string; description: string; hasBadge: boolean; pendingRequest: boolean; badgeLevel: string | null; badgeImage: string | null }[];
  badgeCount: number;
  level: Level | null;
  levelColor: string;
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

  const badgeBySkillId = new Map(badges.map((b) => [b.skill_id, b]));
  const pendingSkillIds = new Set(
    requests.filter((r) => r.status === 'pending').map((r) => r.skill_id)
  );

  const passeport: DomainPasseport[] = [];

  for (const domain of domains) {
    const skills = await getSkillsByDomain(db, domain.id);
    const domainBadgeCount = badges.filter((b) =>
      skills.some((s) => s.id === b.skill_id)
    ).length;
    const level = calculateLevel(domainBadgeCount);

    passeport.push({
      domain,
      skills: skills.map((s) => {
        const badge = badgeBySkillId.get(s.id);
        return {
          id: s.id,
          title: s.title,
          description: s.description,
          hasBadge: !!badge,
          pendingRequest: pendingSkillIds.has(s.id),
          badgeLevel: badge?.level ?? null,
          badgeImage: badge?.level ? LEVEL_IMAGES[badge.level as Level] : null,
        };
      }),
      badgeCount: domainBadgeCount,
      level,
      levelColor: level ? LEVEL_COLORS[level] : '#374151',
      levelImage: level ? LEVEL_IMAGES[level] : null,
    });
  }

  return { passeport, user: locals.session!.user };
};
