import type { Level } from './level';
import { LEVEL_COLORS } from './level';

export type BadgeDomain = 'brick' | 'codeur';

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (90 + i * 60);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function brickIcon(cx: number, cy: number): string {
  const positions = [
    [cx - 14, cy - 12],
    [cx + 14, cy - 12],
    [cx - 14, cy + 12],
    [cx + 14, cy + 12],
  ] as const;
  return positions
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="8.5" fill="none" stroke="currentColor" stroke-width="2.5"/>` +
        `<circle cx="${x}" cy="${y}" r="4.5" fill="currentColor"/>`
    )
    .join('');
}

function codeurIcon(cx: number, cy: number): string {
  return `<text x="${cx}" y="${cy + 9}" font-family="monospace" font-size="26" font-weight="bold" text-anchor="middle" fill="currentColor">&lt;/&gt;</text>`;
}

export function generateBadgeSvg(domain: BadgeDomain, level: Level): string {
  const fillColor = LEVEL_COLORS[level];
  const strokeColor = level === 'blanc' ? '#cccccc' : fillColor;
  const iconColor = level === 'blanc' ? '#444444' : '#ffffff';
  const cx = 60;
  const cy = 70;

  const outerPts = hexPoints(cx, cy, 55);
  const innerPts = hexPoints(cx, cy, 46);
  const icon = domain === 'brick' ? brickIcon(cx, cy - 4) : codeurIcon(cx, cy - 2);
  const domainLabel = domain === 'brick' ? 'BRICK' : 'CODEUR';
  const levelLabel = level.toUpperCase();

  return `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
  <polygon points="${outerPts}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="3"/>
  <polygon points="${innerPts}" fill="${fillColor}" stroke="${iconColor}" stroke-width="1" opacity="0.2"/>
  <g color="${iconColor}" fill="${iconColor}" stroke="${iconColor}">
    ${icon}
  </g>
  <text x="${cx}" y="108" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="${iconColor}">${domainLabel}</text>
  <text x="${cx}" y="119" font-family="sans-serif" font-size="8" text-anchor="middle" fill="${iconColor}" opacity="0.8">${levelLabel}</text>
</svg>`;
}
