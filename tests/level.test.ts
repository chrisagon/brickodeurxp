import { describe, it, expect } from 'vitest';
import { calculateLevel, LEVEL_COLORS } from '$lib/utils/level';

describe('calculateLevel', () => {
  it('retourne null pour 0 badge', () => {
    expect(calculateLevel(0)).toBe(null);
  });

  it('retourne blanc pour 1 badge', () => {
    expect(calculateLevel(1)).toBe('blanc');
  });

  it('retourne jaune pour 2 badges', () => {
    expect(calculateLevel(2)).toBe('jaune');
  });

  it('retourne orange pour 3 badges', () => {
    expect(calculateLevel(3)).toBe('orange');
  });

  it('retourne rouge pour 4 badges', () => {
    expect(calculateLevel(4)).toBe('rouge');
  });

  it('retourne noir pour 5 badges', () => {
    expect(calculateLevel(5)).toBe('noir');
  });

  it('retourne noir pour plus de 5 badges', () => {
    expect(calculateLevel(7)).toBe('noir');
  });
});

describe('LEVEL_COLORS', () => {
  it('contient la couleur hex pour chaque niveau', () => {
    expect(LEVEL_COLORS.blanc).toBe('#ffffff');
    expect(LEVEL_COLORS.jaune).toBe('#ffd700');
    expect(LEVEL_COLORS.orange).toBe('#f97316');
    expect(LEVEL_COLORS.rouge).toBe('#dc2626');
    expect(LEVEL_COLORS.noir).toBe('#111111');
  });
});
