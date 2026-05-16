import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRequestById, getUserById } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform }) => {
  const db = platform!.env.DB;
  const req = await getRequestById(db, params.request_id);

  if (!req) throw error(404, 'Demande introuvable');
  if (req.status !== 'approved') throw error(400, "Ce badge n'a pas encore été validé");

  const jeune = await getUserById(db, req.jeune_id);
  if (!jeune) throw error(404, 'Jeune introuvable');

  // Récupérer le badge + catégorie + domaine via la demande
  const badgeRow = await db
    .prepare(`
      SELECT b.level, c.name AS category_name, d.name AS domain_name, d.icon AS domain_icon
      FROM badges b
      JOIN categories c ON c.id = b.category_id
      JOIN domains d ON d.id = c.domain_id
      WHERE b.request_id = ?
    `)
    .bind(req.id)
    .first<{ level: string; category_name: string; domain_name: string; domain_icon: string }>();

  // Fallback si le badge n'est pas encore accordé (catégorie pas complète)
  const level = (badgeRow?.level ?? 'blanc') as 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';
  const domainIcon = badgeRow?.domain_icon === 'codeur' ? 'codeur' : 'brick';
  const domainName = badgeRow?.domain_name ?? '';
  const categoryName = badgeRow?.category_name ?? '';

  return {
    jeune: { prenom: jeune.prenom, nom: jeune.nom },
    domainIcon,
    domainName,
    categoryName,
    level,
    requestId: params.request_id,
  };
};
