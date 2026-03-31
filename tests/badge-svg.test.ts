import { describe, it, expect } from 'vitest';
import { generateBadgeSvg } from '$lib/utils/badge-svg';

describe('generateBadgeSvg', () => {
  it('retourne une chaîne SVG valide pour brick/blanc', () => {
    const svg = generateBadgeSvg('brick', 'blanc');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('viewBox');
  });

  it('contient la couleur blanc (#ffffff) pour le niveau blanc', () => {
    const svg = generateBadgeSvg('brick', 'blanc');
    expect(svg).toContain('#ffffff');
  });

  it('contient la couleur jaune (#ffd700) pour le niveau jaune', () => {
    const svg = generateBadgeSvg('codeur', 'jaune');
    expect(svg).toContain('#ffd700');
  });

  it('contient la couleur orange (#f97316) pour le niveau orange', () => {
    const svg = generateBadgeSvg('brick', 'orange');
    expect(svg).toContain('#f97316');
  });

  it('contient la couleur rouge (#dc2626) pour le niveau rouge', () => {
    const svg = generateBadgeSvg('codeur', 'rouge');
    expect(svg).toContain('#dc2626');
  });

  it('contient la couleur noir (#111111) pour le niveau noir', () => {
    const svg = generateBadgeSvg('brick', 'noir');
    expect(svg).toContain('#111111');
  });

  it('contient des cercles (studs LEGO) pour le domaine brick', () => {
    const svg = generateBadgeSvg('brick', 'orange');
    expect(svg).toContain('<circle');
  });

  it('contient le symbole code pour le domaine codeur', () => {
    const svg = generateBadgeSvg('codeur', 'rouge');
    expect(svg).toContain('&lt;/&gt;');
  });

  it('contient le label BRICK pour le domaine brick', () => {
    const svg = generateBadgeSvg('brick', 'blanc');
    expect(svg).toContain('BRICK');
  });

  it('contient le label CODEUR pour le domaine codeur', () => {
    const svg = generateBadgeSvg('codeur', 'noir');
    expect(svg).toContain('CODEUR');
  });

  it('contient deux polygones (hexagone externe et interne)', () => {
    const svg = generateBadgeSvg('brick', 'jaune');
    const count = (svg.match(/<polygon/g) ?? []).length;
    expect(count).toBe(2);
  });
});
