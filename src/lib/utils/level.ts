export type Level = 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';

export const LEVEL_COLORS: Record<Level, string> = {
  blanc:  '#ffffff',
  jaune:  '#ffd700',
  orange: '#f97316',
  rouge:  '#dc2626',
  noir:   '#111111',
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
