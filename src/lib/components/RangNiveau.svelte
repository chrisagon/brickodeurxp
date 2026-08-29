<script lang="ts">
  import { LEVEL_LABELS, LEVEL_COLORS, type Level } from '$lib/utils/level';

  /**
   * Hexagone de rang, dessiné en SVG et coloré par `LEVEL_COLORS`.
   *
   * Pourquoi du SVG et non les PNG `/hexa_*.png` : le commit `faf8394` a
   * corrigé `LEVEL_LABELS.rouge` en « Rouge » et `LEVEL_COLORS.rouge` en
   * `#dc2626`, mais a laissé `LEVEL_IMAGES.rouge` sur `/hexa_vert.png` — et
   * `static/hexa_rouge.png` n'existe pas. Le rang « Rouge » s'affichait donc
   * avec un hexagone vert. En dessinant la forme et en la colorant depuis la
   * même source que le label, la divergence devient impossible.
   *
   * RÈGLE : ce composant est le SEUL endroit qui traduit un `Level` en
   * visuel. Aucun appelant ne doit lire `badge.level` pour l'afficher.
   */
  let {
    level,
    size = 44,
    glow = true,
  }: { level: Level | null; size?: number; glow?: boolean } = $props();

  const color = $derived(level ? LEVEL_COLORS[level] : 'var(--nh-line, #1d2b45)');
  const label = $derived(level ? LEVEL_LABELS[level] : null);
</script>

<span
  class="rang"
  style="--rang-color:{color}; --rang-size:{size}px"
  class:glow={glow && !!level}
  role="img"
  aria-label={label ? `Rang ${label}` : 'Aucun rang obtenu'}
>
  <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <!-- Hexagone pointe en haut, comme les visuels d'origine. -->
    <polygon
      points="50,4 91,27 91,73 50,96 9,73 9,27"
      fill={level ? 'var(--rang-color)' : 'none'}
      stroke="var(--rang-color)"
      stroke-width={level ? 0 : 6}
      stroke-linejoin="round"
    />
    {#if level}
      <polygon
        points="50,18 78,34 78,66 50,82 22,66 22,34"
        fill="none"
        stroke="rgba(0,0,0,.28)"
        stroke-width="4"
        stroke-linejoin="round"
      />
    {/if}
  </svg>
</span>

<style>
  .rang {
    display: inline-grid;
    place-items: center;
    width: var(--rang-size);
    height: var(--rang-size);
    flex: 0 0 var(--rang-size);
  }
  .rang svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .glow svg {
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--rang-color) 55%, transparent));
  }
  @media (prefers-reduced-motion: reduce) {
    .rang svg { transition: none; }
  }
</style>
