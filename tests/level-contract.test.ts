import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { LEVEL_LABELS, LEVEL_COLORS, LEVEL_IMAGES, type Level } from '$lib/utils/level';

const LEVELS: Level[] = ['blanc', 'jaune', 'orange', 'rouge', 'noir'];
const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf-8');

/**
 * Garde anti-régression sur l'affichage du rang.
 *
 * Contexte : le commit `faf8394` a corrigé `LEVEL_LABELS.rouge` en « Rouge »
 * et `LEVEL_COLORS.rouge` en `#dc2626`, mais a laissé `LEVEL_IMAGES.rouge`
 * sur `/hexa_vert.png` — un fichier qui décrit une couleur différente. Aucun
 * test ne couvrait `LEVEL_IMAGES`, c'est exactement là que la divergence
 * s'est logée.
 */
describe('cohérence des trois tableaux de level.ts', () => {
  it('les trois tableaux couvrent exactement les cinq niveaux', () => {
    for (const table of [LEVEL_LABELS, LEVEL_COLORS, LEVEL_IMAGES]) {
      expect(Object.keys(table).sort()).toEqual([...LEVELS].sort());
    }
  });

  it('toutes les couleurs sont des hexadécimaux valides', () => {
    for (const level of LEVELS) {
      expect(LEVEL_COLORS[level]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('tous les labels sont non vides et capitalisés', () => {
    for (const level of LEVELS) {
      expect(LEVEL_LABELS[level]).toMatch(/^[A-ZÀ-Ý]/);
    }
  });

  it('chaque image référencée existe dans static/', () => {
    const manquantes: string[] = [];
    for (const level of LEVELS) {
      const file = LEVEL_IMAGES[level].replace(/^\//, '');
      if (!existsSync(resolve(root, 'static', file))) manquantes.push(`${level} → ${file}`);
    }
    expect(manquantes).toEqual([]);
  });
});

/**
 * Contrat d'affichage : le vocabulaire de la base n'est pas celui de
 * l'interface. `badges.level` vaut `rouge` en minuscules ; l'interface doit
 * afficher `Rouge`. Toute interpolation directe de `.level` est un bug.
 */
describe('RangNiveau est le seul traducteur de Level', () => {
  const source = read('src/lib/components/RangNiveau.svelte');

  it('consomme LEVEL_LABELS et LEVEL_COLORS', () => {
    expect(source).toContain('LEVEL_LABELS');
    expect(source).toContain('LEVEL_COLORS');
  });

  it("n'interpole jamais la valeur brute du niveau dans le markup", () => {
    // `{level}` ou `{skill.level}` dans le markup afficherait « rouge »
    // en minuscules au lieu de « Rouge ».
    const markup = source.split('</script>')[1] ?? '';
    expect(markup).not.toMatch(/\{\s*level\s*\}/);
    expect(markup).not.toMatch(/\{\s*\w+\.level\s*\}/);
  });

  it('ne charge aucune image : la forme est dessinée, pas référencée', () => {
    // Les mentions de LEVEL_IMAGES et /hexa_*.png dans les commentaires sont
    // attendues : elles documentent le bug d'origine. On teste l'usage réel.
    expect(source).not.toMatch(/^\s*import[^;]*LEVEL_IMAGES/m);
    const markup = source.split('</script>')[1] ?? '';
    expect(markup).not.toMatch(/<img\b/);
    expect(markup).not.toMatch(/src\s*=/);
  });
});

describe('le passeport délègue le rang à RangNiveau', () => {
  const source = read('src/routes/jeune/passeport/+page.svelte');

  it('importe RangNiveau', () => {
    expect(source).toContain('RangNiveau');
  });

  it("n'affiche pas le niveau brut comme texte", () => {
    const markup = source.split('</script>')[1] ?? '';
    // `level={dp.level}` est un passage de prop : légitime.
    // `>{dp.level}<` serait un affichage : il rendrait « rouge » minuscule.
    const affichagesBruts = [
      /(^|[^=])\{\s*dp\.level\s*\}/m,
      /(^|[^=])\{\s*cp\.badgeLevel\s*\}/m,
    ];
    for (const re of affichagesBruts) {
      expect(markup).not.toMatch(re);
    }
  });

  it('traduit les niveaux par LEVEL_LABELS', () => {
    expect(source).toContain('LEVEL_LABELS');
  });
});
