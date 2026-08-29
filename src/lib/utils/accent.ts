/**
 * Dérivation de l'accent d'affichage à partir de `domains.color`.
 *
 * Pourquoi côté serveur et non en CSS : `oklch(from var(--accent) …)` est à
 * ~90 % de support (Firefox en développement), donc ~10 % des visiteurs
 * verraient la couleur brute — exactement l'accent terne que la dérivation
 * doit corriger. Calculé en TypeScript et renvoyé en hexadécimal : 100 % de
 * support navigateur, et surtout testable.
 *
 * Pourquoi OKLCH et non HSL : HSL est une transformation mathématique du RGB,
 * pas un modèle perceptuel. `#6366f1` (indigo, Codeur) a une luminance HSL de
 * 0,667 — au-dessus de tout plancher raisonnable — alors que l'œil le perçoit
 * comme nettement plus sombre que `#f97316` (orange, Brick). En OKLCH, qui est
 * perceptuellement uniforme, l'écart est visible et corrigeable.
 *
 * TOTALE PAR CONTRAT : ne lève jamais. `domains.color` est `TEXT NOT NULL`
 * mais rien ne valide son format — ni la base, ni `createDomain`
 * (`db.ts:146-158`), ni le formulaire admin. Une exception ici renverrait une
 * 500 sur l'écran d'accueil de TOUS les jeunes.
 */

/** Couleur de repli, neutre et lisible sur fond sombre. */
export const ACCENT_FALLBACK = '#9fb0c9';

/** Plancher de luminosité perceptuelle OKLCH, dans [0, 1]. */
const MIN_L = 0.74;
/** Plancher de chroma OKLCH : évite qu'un quasi-gris devienne invisible. */
const MIN_C = 0.13;
/** En dessous de ce chroma, la couleur n'a pas de teinte exploitable. */
const GREY_C = 0.02;

// ---------------------------------------------------------------------------
// Conversions. Matrices d'après la définition d'OKLab (Björn Ottosson, 2020).
// ---------------------------------------------------------------------------

function normalizeHex(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let h = input.trim().replace(/^#/, '').toLowerCase();
  if (h.length === 3 && /^[0-9a-f]{3}$/.test(h)) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return /^[0-9a-f]{6}$/.test(h) ? h : null;
}

/** sRGB encodé [0,1] → linéaire. */
const toLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

/** Linéaire → sRGB encodé [0,1]. */
const toGamma = (c: number): number =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Convertit un hexadécimal en OKLCH.
 * `l` dans [0,1], `c` en unités OKLCH (~0 à 0,37), `h` en degrés.
 */
export function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  const n = normalizeHex(hex);
  if (!n) return null;

  const r = toLinear(parseInt(n.slice(0, 2), 16) / 255);
  const g = toLinear(parseInt(n.slice(2, 4), 16) / 255);
  const b = toLinear(parseInt(n.slice(4, 6), 16) / 255);

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return { l: L, c, h };
}

/** OKLCH → RGB linéaire, sans écrêtage. */
function oklchToLinearRgb(l: number, c: number, h: number): [number, number, number] {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L = l_ * l_ * l_;
  const M = m_ * m_ * m_;
  const S = s_ * s_ * s_;

  return [
    +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}

const EPS = 1e-4;
const inGamut = ([r, g, b]: [number, number, number]): boolean =>
  r >= -EPS && r <= 1 + EPS && g >= -EPS && g <= 1 + EPS && b >= -EPS && b <= 1 + EPS;

/**
 * Convertit OKLCH en hexadécimal sRGB.
 *
 * Si la couleur sort du gamut sRGB, on **réduit le chroma** par recherche
 * binaire jusqu'à y rentrer, au lieu d'écrêter les canaux RGB. Écrêter les
 * canaux décale la teinte et la luminosité : mesuré à 1° de teinte et 0,024
 * de luminosité sur `#6366f1` remonté. Réduire le chroma les préserve toutes
 * les deux, ce qui est le comportement défini par la spécification CSS.
 */
export function oklchToHex(l: number, c: number, h: number): string {
  let rgb = oklchToLinearRgb(l, c, h);

  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinearRgb(l, mid, h))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinearRgb(l, lo, h);
  }

  const hex = (v: number): string =>
    Math.round(clamp01(toGamma(clamp01(v))) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${hex(rgb[0])}${hex(rgb[1])}${hex(rgb[2])}`;
}

/**
 * Dérive l'accent d'affichage : monte la luminosité perceptuelle et le chroma
 * jusqu'à leurs planchers, en CONSERVANT la teinte.
 *
 * On ne mélange pas vers le blanc : cela monterait la luminosité mais ferait
 * chuter le chroma, transformant un indigo en périwinkle pastel — l'inverse
 * d'un néon.
 *
 * @param input n'importe quoi. Une entrée non exploitable renvoie le repli.
 * @returns une couleur hexadécimale sRGB, ou `ACCENT_FALLBACK`.
 */
export function deriveAccent(input: unknown): string {
  const lch = typeof input === 'string' ? hexToOklch(input) : null;
  if (!lch) return ACCENT_FALLBACK;

  // Un gris n'a pas de teinte à préserver : le saturer inventerait une couleur.
  if (lch.c < GREY_C) return ACCENT_FALLBACK;

  return oklchToHex(Math.max(lch.l, MIN_L), Math.max(lch.c, MIN_C), lch.h);
}
