/**
 * Rôles, libellés, et transitions de promotion autorisées.
 *
 * Centralise `ROLE_LABELS` / `ROLE_COLORS`, qui étaient redéfinis en dur dans
 * trois composants (`admin/utilisateurs`, `animateur/annuaire`,
 * `jeune/annuaire`), chacun avec un sous-ensemble différent des quatre rôles.
 *
 * La promotion est **à sens unique** : on ne redescend jamais depuis
 * l'interface. Une promotion erronée se corrige en base, pas dans l'app.
 *
 *     jeune  ──┐
 *              ├──►  animateur  ──►  admin
 *     parent ──┘
 *
 * Il n'y a **pas de saut direct** de `jeune` ou `parent` vers `admin` : il
 * faut deux promotions successives. C'est volontaire — ça rend impossible de
 * transformer un enfant en administrateur par une seule mauvaise sélection
 * dans une liste déroulante.
 */

export const ROLES = ['jeune', 'parent', 'animateur', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/** Libellés affichés. La base stocke les clés en minuscules. */
export const ROLE_LABELS: Record<Role, string> = {
  jeune: 'Jeune',
  parent: 'Parent',
  animateur: 'Animateur',
  admin: 'Administrateur',
};

/** Classes de couleur par rôle, pour les badges de liste. */
export const ROLE_COLORS: Record<Role, string> = {
  jeune: 'text-blue-400',
  parent: 'text-purple-400',
  animateur: 'text-orange-400',
  admin: 'text-red-400',
};

/** Pour chaque rôle, les rôles vers lesquels il peut être promu. */
const PROMOTIONS: Record<Role, readonly Role[]> = {
  jeune: ['animateur'],
  parent: ['animateur'],
  animateur: ['admin'],
  admin: [],
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/** Libellé d'un rôle, ou la valeur brute si elle est inconnue. */
export function roleLabel(role: unknown): string {
  return isRole(role) ? ROLE_LABELS[role] : String(role ?? '');
}

/** Rôles vers lesquels `role` peut être promu. Tableau vide si aucun. */
export function allowedPromotions(role: unknown): readonly Role[] {
  return isRole(role) ? PROMOTIONS[role] : [];
}

/** `true` si la promotion `from → to` est autorisée. */
export function canPromote(from: unknown, to: unknown): boolean {
  if (!isRole(from) || !isRole(to)) return false;
  return PROMOTIONS[from].includes(to);
}

/**
 * Effets de bord d'une promotion sur les liens dépendants du rôle quitté.
 *
 * Les badges et les demandes de badge sont **conservés** : un badge obtenu est
 * une réussite réelle, l'effacer fausserait l'historique. Seuls les liens qui
 * créeraient une incohérence de rôle sont coupés.
 */
export interface PromotionSideEffects {
  /** Retirer ses appartenances d'équipe, qui le désignent comme jeune. */
  leaveTeams: boolean;
  /**
   * Couper les liens parent-enfant : un parent devenu animateur validerait
   * sinon les compétences de son propre enfant.
   */
  dropParentLinks: boolean;
}

export function promotionSideEffects(from: unknown, to: unknown): PromotionSideEffects {
  if (!canPromote(from, to)) return { leaveTeams: false, dropParentLinks: false };
  return { leaveTeams: from === 'jeune', dropParentLinks: from === 'parent' };
}

/**
 * Phrase décrivant à l'admin ce que la promotion va faire, avant confirmation.
 * Une action irréversible doit annoncer ses conséquences.
 */
export function promotionWarning(from: unknown, to: unknown): string {
  if (!canPromote(from, to)) return 'Cette promotion n’est pas autorisée.';

  const fx = promotionSideEffects(from, to);
  const parts = [`${roleLabel(from)} deviendra ${roleLabel(to)}.`];

  if (fx.leaveTeams) parts.push('Ses appartenances aux équipes seront retirées.');
  if (fx.dropParentLinks) parts.push('Ses liens avec ses enfants seront retirés.');
  if (from === 'jeune') parts.push('Ses badges et son historique sont conservés.');

  parts.push('Cette action est définitive.');
  return parts.join(' ');
}
