export type Level = 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';

export const LEVEL_COLORS: Record<Level, string> = {
  blanc:  '#ffffff',
  jaune:  '#ffd700',
  orange: '#f97316',
  rouge:  '#dc2626',
  noir:   '#111111',
};

export const LEVEL_LABELS: Record<Level, string> = {
  blanc:  'Blanc',
  jaune:  'Jaune',
  orange: 'Orange',
  rouge:  'Rouge',
  noir:   'Noir',
};

export const LEVEL_IMAGES: Record<Level, string> = {
  blanc:  '/hexa_blanc.png',
  jaune:  '/hexa_jaune.png',
  orange: '/hexa_orange.png',
  // Corrigé : pointait sur /hexa_vert.png après le renommage du niveau en
  // « Rouge » (#dc2626). Le fichier hexa_rouge.png n'existait pas, l'asset a
  // été créé en SVG. Voir tests/level-contract.test.ts.
  rouge:  '/hexa_rouge.svg',
  noir:   '/hexa_noir.png',
};

const THRESHOLDS: [number, Level][] = [
  [5, 'noir'],
  [4, 'rouge'],
  [3, 'orange'],
  [2, 'jaune'],
  [1, 'blanc'],
];

export function calculateLevel(badgeCount: number): Level | null {
  if (badgeCount <= 0) return null;
  for (const [threshold, level] of THRESHOLDS) {
    if (badgeCount >= threshold) return level;
  }
  return null;
}
