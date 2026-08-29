import { describe, it, expect } from 'vitest';
import { deriveAccent, hexToOklch, oklchToHex, ACCENT_FALLBACK } from '$lib/utils/accent';

/**
 * `domains.color` est `TEXT NOT NULL` mais rien ne valide son format :
 * ni la base, ni `createDomain` (db.ts:146-158), ni le formulaire admin.
 * Ces tests garantissent qu'aucune saisie ne peut faire tomber le passeport,
 * qui est l'écran d'accueil de tous les jeunes.
 */

/** Luminosité perceptuelle d'une sortie, pour les assertions. */
const lOf = (hex: string) => hexToOklch(hex)!.l;
/** Chroma d'une sortie. */
const cOf = (hex: string) => hexToOklch(hex)!.c;
/** Teinte d'une sortie. */
const hOf = (hex: string) => hexToOklch(hex)!.h;

describe('deriveAccent', () => {
  describe('entrées valides', () => {
    it('accepte un hex 6 chiffres avec croisillon', () => {
      expect(deriveAccent('#f97316')).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('accepte un hex 6 chiffres sans croisillon', () => {
      expect(deriveAccent('f97316')).toBe(deriveAccent('#f97316'));
    });

    it('accepte un hex 3 chiffres et le développe', () => {
      expect(deriveAccent('#f73')).toBe(deriveAccent('#ff7733'));
    });

    it('est insensible à la casse', () => {
      expect(deriveAccent('#F97316')).toBe(deriveAccent('#f97316'));
    });

    it('tolère les espaces autour', () => {
      expect(deriveAccent('  #f97316  ')).toBe(deriveAccent('#f97316'));
    });
  });

  describe('couleurs réelles des domaines (0002_seed.sql)', () => {
    it('Brick #f97316 conserve sa teinte orange', () => {
      expect(hOf(deriveAccent('#f97316'))).toBeCloseTo(hOf('#f97316'), 0);
    });

    it('Codeur #6366f1 conserve sa teinte indigo', () => {
      expect(hOf(deriveAccent('#6366f1'))).toBeCloseTo(hOf('#6366f1'), 0);
    });

    it("Codeur est perceptuellement plus sombre que Brick — c'est le problème à corriger", () => {
      expect(lOf('#6366f1')).toBeLessThan(lOf('#f97316'));
    });

    it('remonte Codeur au plancher de luminosité perceptuelle', () => {
      expect(lOf('#6366f1')).toBeLessThan(0.74);
      expect(lOf(deriveAccent('#6366f1'))).toBeGreaterThanOrEqual(0.72);
    });

    it('rapproche les deux domaines en luminosité perçue', () => {
      const ecartAvant = Math.abs(lOf('#f97316') - lOf('#6366f1'));
      const ecartApres = Math.abs(lOf(deriveAccent('#f97316')) - lOf(deriveAccent('#6366f1')));
      expect(ecartApres).toBeLessThan(ecartAvant);
    });
  });

  describe('plancher de luminosité — le garde-fou de contraste', () => {
    it('remonte un bleu nuit saturé', () => {
      expect(lOf(deriveAccent('#0a1a4d'))).toBeGreaterThanOrEqual(0.72);
    });

    it('remonte un vert très sombre', () => {
      expect(lOf(deriveAccent('#042b12'))).toBeGreaterThanOrEqual(0.72);
    });

    it('ne rabaisse pas une couleur déjà claire', () => {
      expect(lOf(deriveAccent('#ffe0a0'))).toBeGreaterThanOrEqual(lOf('#ffe0a0') - 0.02);
    });

    it('remonte le chroma des couleurs trop ternes', () => {
      expect(cOf(deriveAccent('#6b6f7d'))).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('entrées invalides — aucune ne doit lever', () => {
    const bad: unknown[] = [
      '', '   ', 'bleu', 'rouge', '#', '#12', '#1234', '#12345', '#1234567',
      '#gggggg', 'rgb(255,0,0)', 'transparent', null, undefined, 42, {}, [], NaN,
    ];

    for (const value of bad) {
      it(`renvoie le repli pour ${JSON.stringify(value) ?? String(value)}`, () => {
        expect(() => deriveAccent(value)).not.toThrow();
        expect(deriveAccent(value)).toBe(ACCENT_FALLBACK);
      });
    }
  });

  describe('gris — pas de teinte à préserver', () => {
    it('renvoie le repli pour du blanc', () => {
      expect(deriveAccent('#ffffff')).toBe(ACCENT_FALLBACK);
    });

    it('renvoie le repli pour du noir', () => {
      expect(deriveAccent('#000000')).toBe(ACCENT_FALLBACK);
    });

    it('renvoie le repli pour un gris moyen', () => {
      expect(deriveAccent('#808080')).toBe(ACCENT_FALLBACK);
    });

    it('renvoie le repli pour le gris sombre du design doc (#333333)', () => {
      expect(deriveAccent('#333333')).toBe(ACCENT_FALLBACK);
    });
  });

  describe('sortie', () => {
    it('produit toujours un hexadécimal valide', () => {
      const inputs: unknown[] = ['#f97316', '#6366f1', 'bleu', '', '#333333', null, '#0a1a4d'];
      for (const i of inputs) {
        expect(deriveAccent(i)).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('est déterministe', () => {
      expect(deriveAccent('#6366f1')).toBe(deriveAccent('#6366f1'));
    });
  });
});

describe('hexToOklch / oklchToHex', () => {
  it('fait un aller-retour sans perte notable', () => {
    for (const hex of ['#f97316', '#6366f1', '#dc2626', '#22c55e', '#ffd700']) {
      const lch = hexToOklch(hex)!;
      expect(oklchToHex(lch.l, lch.c, lch.h)).toBe(hex);
    }
  });

  it('donne une luminosité de 1 au blanc et 0 au noir', () => {
    expect(hexToOklch('#ffffff')!.l).toBeCloseTo(1, 2);
    expect(hexToOklch('#000000')!.l).toBeCloseTo(0, 2);
  });

  it('donne un chroma quasi nul aux gris', () => {
    expect(hexToOklch('#808080')!.c).toBeLessThan(0.01);
  });

  it('renvoie null sur une entrée non hexadécimale', () => {
    expect(hexToOklch('bleu')).toBeNull();
  });

  it('écrête les couleurs hors gamut au lieu de produire du NaN', () => {
    expect(oklchToHex(0.9, 0.4, 250)).toMatch(/^#[0-9a-f]{6}$/);
  });
});
