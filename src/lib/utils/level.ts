export type Level = 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';

export const LEVEL_COLORS: Record<Level, string> = {
  blanc:  '#ffffff',
  jaune:  '#ffd700',
  orange: '#f97316',
  rouge:  '#22c55e',
  noir:   '#111111',
};

export const LEVEL_LABELS: Record<Level, string> = {
  blanc:  'Blanc',
  jaune:  'Jaune',
  orange: 'Orange',
  rouge:  'Vert',
  noir:   'Noir',
};

export const LEVEL_IMAGES: Record<Level, string> = {
  blanc:  '/hexa_blanc.png',
  jaune:  '/hexa_jaune.png',
  orange: '/hexa_orange.png',
  rouge:  '/hexa_vert.png',
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
