import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRequestById, getUserById, getAllDomains, getSkillsByDomain } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform }) => {
  const db = platform!.env.DB;
  const req = await getRequestById(db, params.request_id);

  if (!req) throw error(404, 'Demande introuvable');
  if (req.status !== 'approved') throw error(400, 'Ce badge n\'a pas encore été validé');

  const jeune = await getUserById(db, req.jeune_id);
  if (!jeune) throw error(404, 'Jeune introuvable');

  // Trouver le domaine de la compétence
  const domains = await getAllDomains(db);
  let domainIcon: 'brick' | 'codeur' = 'brick';
  let domainName = '';

  for (const domain of domains) {
    const skills = await getSkillsByDomain(db, domain.id);
    if (skills.some((s) => s.id === req.skill_id)) {
      domainIcon = domain.icon === 'codeur' ? 'codeur' : 'brick';
      domainName = domain.name;
      break;
    }
  }

  // Récupérer le niveau du badge depuis la table badges
  const badgeLevel = await db
    .prepare('SELECT level FROM badges WHERE request_id = ?')
    .bind(req.id)
    .first<{ level: string }>();

  const level = (badgeLevel?.level ?? 'blanc') as 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';

  return {
    jeune: { prenom: jeune.prenom, nom: jeune.nom },
    domainIcon,
    domainName,
    level,
    requestId: params.request_id,
  };
};
