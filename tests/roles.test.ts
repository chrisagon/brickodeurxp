import { describe, it, expect } from 'vitest';
import {
  ROLES,
  ROLE_LABELS,
  ROLE_COLORS,
  isRole,
  roleLabel,
  allowedPromotions,
  canPromote,
  promotionSideEffects,
  promotionWarning,
  type Role,
} from '$lib/utils/roles';

/**
 * La promotion de rôle est irréversible côté interface et privilégiée par
 * nature. Ces tests verrouillent la matrice des transitions : tout ce qui
 * n'est pas explicitement autorisé doit être refusé.
 */

describe('intégrité des tables', () => {
  it('couvre les quatre rôles de la contrainte CHECK du schéma', () => {
    expect([...ROLES].sort()).toEqual(['admin', 'animateur', 'jeune', 'parent']);
  });

  it('a un libellé et une couleur pour chaque rôle', () => {
    for (const r of ROLES) {
      expect(ROLE_LABELS[r]).toBeTruthy();
      expect(ROLE_COLORS[r]).toBeTruthy();
    }
  });

  it('nomme admin « Administrateur » — le composant admin ne le connaissait pas', () => {
    expect(ROLE_LABELS.admin).toBe('Administrateur');
  });
});

describe('isRole / roleLabel', () => {
  it('reconnaît les quatre rôles', () => {
    for (const r of ROLES) expect(isRole(r)).toBe(true);
  });

  it('rejette tout le reste sans lever', () => {
    for (const v of ['Jeune', 'ADMIN', 'moderateur', '', null, undefined, 42, {}, []]) {
      expect(isRole(v)).toBe(false);
    }
  });

  it('retombe sur la valeur brute pour un rôle inconnu', () => {
    expect(roleLabel('moderateur')).toBe('moderateur');
    expect(roleLabel(null)).toBe('');
  });
});

describe('matrice de promotion', () => {
  it('jeune ne peut devenir qu’animateur', () => {
    expect(allowedPromotions('jeune')).toEqual(['animateur']);
  });

  it('parent ne peut devenir qu’animateur', () => {
    expect(allowedPromotions('parent')).toEqual(['animateur']);
  });

  it('animateur ne peut devenir qu’admin', () => {
    expect(allowedPromotions('animateur')).toEqual(['admin']);
  });

  it('admin est un terminus', () => {
    expect(allowedPromotions('admin')).toEqual([]);
  });

  it('refuse le saut direct jeune → admin', () => {
    expect(canPromote('jeune', 'admin')).toBe(false);
  });

  it('refuse le saut direct parent → admin', () => {
    expect(canPromote('parent', 'admin')).toBe(false);
  });

  it('refuse toute rétrogradation — la promotion est à sens unique', () => {
    const retro: [Role, Role][] = [
      ['animateur', 'jeune'],
      ['animateur', 'parent'],
      ['admin', 'animateur'],
      ['admin', 'jeune'],
      ['admin', 'parent'],
    ];
    for (const [from, to] of retro) expect(canPromote(from, to)).toBe(false);
  });

  it('refuse le changement latéral jeune ↔ parent', () => {
    expect(canPromote('jeune', 'parent')).toBe(false);
    expect(canPromote('parent', 'jeune')).toBe(false);
  });

  it('refuse la promotion vers soi-même', () => {
    for (const r of ROLES) expect(canPromote(r, r)).toBe(false);
  });

  it('n’autorise que 3 transitions sur les 16 combinaisons possibles', () => {
    const autorisees = ROLES.flatMap((f) =>
      ROLES.filter((t) => canPromote(f, t)).map((t) => `${f}→${t}`)
    );
    expect(autorisees.sort()).toEqual(['animateur→admin', 'jeune→animateur', 'parent→animateur']);
  });

  it('refuse toute entrée invalide sans lever', () => {
    for (const v of [null, undefined, '', 'root', 42, {}]) {
      expect(() => canPromote(v, 'admin')).not.toThrow();
      expect(canPromote(v, 'admin')).toBe(false);
      expect(canPromote('animateur', v)).toBe(false);
    }
  });
});

describe('effets de bord', () => {
  it('un jeune promu quitte ses équipes mais garde ses liens parentaux', () => {
    expect(promotionSideEffects('jeune', 'animateur')).toEqual({
      leaveTeams: true,
      dropParentLinks: false,
    });
  });

  it('un parent promu perd ses liens enfants mais n’a pas d’équipe à quitter', () => {
    expect(promotionSideEffects('parent', 'animateur')).toEqual({
      leaveTeams: false,
      dropParentLinks: true,
    });
  });

  it('un animateur promu admin ne déclenche aucun effet de bord', () => {
    expect(promotionSideEffects('animateur', 'admin')).toEqual({
      leaveTeams: false,
      dropParentLinks: false,
    });
  });

  it('une transition refusée ne déclenche aucun effet — pas de suppression sur un refus', () => {
    expect(promotionSideEffects('admin', 'jeune')).toEqual({
      leaveTeams: false,
      dropParentLinks: false,
    });
    expect(promotionSideEffects('bidon', 'animateur')).toEqual({
      leaveTeams: false,
      dropParentLinks: false,
    });
  });
});

describe('message de confirmation', () => {
  it('annonce le caractère définitif', () => {
    expect(promotionWarning('jeune', 'animateur')).toContain('définitive');
  });

  it('prévient le jeune du retrait des équipes et de la conservation des badges', () => {
    const w = promotionWarning('jeune', 'animateur');
    expect(w).toContain('équipes');
    expect(w).toContain('badges');
  });

  it('prévient le parent du retrait des liens enfants', () => {
    expect(promotionWarning('parent', 'animateur')).toContain('enfants');
  });

  it('ne promet pas de retrait d’équipe à un animateur promu admin', () => {
    expect(promotionWarning('animateur', 'admin')).not.toContain('équipes');
  });

  it('refuse explicitement une transition non autorisée', () => {
    expect(promotionWarning('admin', 'jeune')).toContain('pas autorisée');
  });
});
