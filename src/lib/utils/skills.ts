/**
 * Regroupement des compétences par catégorie, en mémoire.
 *
 * Remplace la boucle de requêtes de `jeune/passeport/+page.server.ts` qui
 * appelait `getSkillsByCategory` une fois par catégorie, à l'intérieur d'une
 * boucle sur les domaines. Coût mesuré avant : ~23 requêtes D1 dont 20 en
 * série, soit 200 à 300 ms passés en base avant le premier octet de HTML,
 * sur l'écran d'accueil de tous les jeunes.
 *
 * Équivalence : `getSkillsByDomain` et `getSkillsByCategory` appliquent le
 * même filtre `active = 1` et le même `ORDER BY sort_order`. Regrouper le
 * résultat de la première produit donc exactement la répartition de la
 * seconde, ordre compris.
 */

/** Forme minimale attendue. Volontairement lâche pour rester testable. */
export interface GroupableSkill {
  category_id?: string | null;
}

/**
 * Regroupe des compétences par `category_id`.
 * Les compétences sans catégorie sont exclues — elles sont rendues à part
 * par le passeport, sous « Autres compétences de ce domaine ».
 *
 * @returns une Map dont les valeurs conservent l'ordre d'entrée.
 */
export function groupSkillsByCategory<T extends GroupableSkill>(skills: readonly T[]): Map<string, T[]> {
  const byCategory = new Map<string, T[]>();
  if (!Array.isArray(skills)) return byCategory;

  for (const skill of skills) {
    const id = skill?.category_id;
    if (!id) continue;
    const bucket = byCategory.get(id);
    if (bucket) bucket.push(skill);
    else byCategory.set(id, [skill]);
  }
  return byCategory;
}

/**
 * Compétences sans catégorie, dans l'ordre d'entrée.
 * Contrepartie exacte de `groupSkillsByCategory` : toute compétence est dans
 * l'une ou dans l'autre, jamais dans les deux, jamais dans aucune.
 */
export function uncategorizedSkills<T extends GroupableSkill>(skills: readonly T[]): T[] {
  if (!Array.isArray(skills)) return [];
  return skills.filter((s) => !s?.category_id);
}
