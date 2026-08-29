<script lang="ts">
  import type { PageData } from './$types';
  import { LEVEL_LABELS, LEVEL_COLORS, type Level } from '$lib/utils/level';
  let { data } = $props<{ data: PageData }>();

  // PROTOTYPE : dérivation d'accent inline. En lot 1 ça devient
  // src/lib/utils/accent.ts, fonction pure et testée (décision D4/D5).
  // Totale : ne lève jamais, repli neutre sur entrée non parsable.
  function vivid(input: string): string {
    const fallback = '#9fb0c9';
    if (typeof input !== 'string') return fallback;
    let h = input.trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return fallback;
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    let hu = 0, s = 0;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) hu = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) hu = (b - r) / d + 2;
      else hu = (r - g) / d + 4;
      hu *= 60;
    }
    // Plancher de luminance et de saturation : garantit un accent lisible
    // même si un admin saisit une couleur sombre ou désaturée.
    return `hsl(${Math.round(hu)} ${Math.round(Math.max(s, 0.55) * 100)}% ${Math.round(Math.max(l, 0.62) * 100)}%)`;
  }

  // D6 : dernier badge obtenu. Approximation de prototype — le serveur
  // n'expose pas awarded_at, on prend le premier badge trouvé.
  const lastBadge = $derived.by(() => {
    for (const dp of data.passeport) {
      for (const cp of dp.categories) {
        if (cp.hasBadge) return { cat: cp.category.name, dom: dp.domain.name, img: cp.badgeImage, lvl: cp.badgeLevel };
      }
    }
    return null;
  });
</script>

<div class="nh">
  <p class="nh-page-title" data-tour="passeport-title">Mon passeport</p>

  {#if lastBadge}
    <!-- D6 : dernier badge obtenu -->
    <div class="nh-last">
      {#if lastBadge.img}
        <img src={lastBadge.img} alt="Badge {lastBadge.lvl}" class="nh-last-img" />
      {/if}
      <div>
        <p class="nh-last-lab">Dernier badge</p>
        <p class="nh-last-name">{lastBadge.cat} · {lastBadge.dom}</p>
      </div>
    </div>
  {/if}

  {#each data.passeport as dp}
    <!-- D7 : plus de carte. Séparation par --nh-s5 et par la typographie. -->
    <section class="nh-domain" style="--accent:{vivid(dp.domain.color)}; --rank:{dp.level ? LEVEL_COLORS[dp.level as Level] : '#7a8aa5'}">
      <div class="nh-dhead">
        {#if dp.levelImage}
          <img src={dp.levelImage} alt="Rang {dp.level ? LEVEL_LABELS[dp.level as Level] : ''}" class="nh-hex" />
        {:else}
          <span class="nh-hex nh-hex-empty" aria-hidden="true">⬡</span>
        {/if}
        <div class="nh-dtitles">
          <h2 class="nh-dname">{dp.domain.name}</h2>
          {#if dp.level}
            <p class="nh-rank">Niveau {LEVEL_LABELS[dp.level as Level]}</p>
          {:else}
            <!-- Sans rang, l'ancrage visuel dit ce qui est ACQUIS, pas ce qui
                 manque. « Pas encore de rang » en 28px est démoralisant. -->
            {@const done = dp.categories.reduce((n: number, c: any) => n + c.completedCount, 0)}
            {#if done > 0}
              <p class="nh-rank nh-rank-soft">{done} compétence{done > 1 ? 's' : ''} validée{done > 1 ? 's' : ''}</p>
            {:else}
              <p class="nh-rank nh-rank-soft">Ton premier badge t'attend</p>
            {/if}
          {/if}
        </div>
      </div>

      {#if dp.categories.length > 0}
        <div class="nh-bar" aria-hidden="true">
          {#each dp.categories as _, i}
            <i class={i < dp.categoryBadgeCount ? 'on' : ''}></i>
          {/each}
        </div>
        <p class="nh-count">{dp.categoryBadgeCount} sur {dp.categories.length} badge{dp.categories.length !== 1 ? 's' : ''}</p>
      {/if}

      {#each dp.categories as cp}
        <div class="nh-cat">
          {#if cp.hasBadge && cp.badgeImage}
            <img src={cp.badgeImage} alt="" class="nh-cbadge-img" />
          {:else}
            <span class="nh-cbadge" aria-hidden="true">{cp.completedCount}/{cp.totalCount}</span>
          {/if}
          <span class="nh-cname">{cp.category.name}</span>
          <span class="nh-cstate {cp.hasBadge ? 'done' : ''}">
            {#if cp.hasBadge}Badge {cp.badgeLevel}{:else}{cp.completedCount} sur {cp.totalCount}{/if}
          </span>
        </div>

        {#each cp.skills as skill}
          {@render skillRow(skill)}
        {:else}
          <p class="nh-empty-sm">Rien à valider ici pour l'instant.</p>
        {/each}
      {:else}
        <p class="nh-empty-sm">Rien à valider dans ce domaine pour l'instant.</p>
      {/each}

      {#if dp.uncategorizedSkills.length > 0}
        <div class="nh-cat nh-cat-other"><span class="nh-cname">Autres compétences de ce domaine</span></div>
        {#each dp.uncategorizedSkills as skill}
          {@render skillRow(skill)}
        {/each}
      {/if}
    </section>
  {:else}
    <!-- D5 : micro-copie de l'état vide -->
    <div class="nh-empty">
      <p class="nh-empty-title">Ton passeport est encore vierge.</p>
      <p class="nh-empty-body">Les compétences arrivent bientôt. En attendant, va voir tout ce qu'il y a à débloquer.</p>
      <a href="/competences" class="nh-empty-cta">Voir les compétences →</a>
    </div>
  {/each}
</div>

{#snippet skillRow(skill: any)}
  {#if !skill.approved && !skill.pendingRequest && !skill.rejectedRequest && !skill.toCompleteRequest}
    <!-- D9 : la LIGNE ENTIÈRE est la cible tactile, pas un petit bouton -->
    <a href="/jeune/demande/{skill.id}" class="nh-skill nh-todo" data-tour="jeune-submit">
      <span class="nh-g" aria-hidden="true">○</span>
      <span class="nh-stitle">{skill.title}</span>
      <span class="nh-act">Soumettre →</span>
    </a>
  {:else if skill.pendingRequest}
    <a href="/jeune/demande/{skill.id}" class="nh-skill nh-pending">
      <span class="nh-g" aria-hidden="true">⏳</span>
      <span class="nh-stitle">{skill.title}</span>
      <span class="nh-act">Modifier</span>
    </a>
  {:else if skill.toCompleteRequest}
    <a href="/jeune/demande/{skill.id}" class="nh-skill nh-tocomplete">
      <span class="nh-g" aria-hidden="true">✎</span>
      <span class="nh-stitle">{skill.title}
        {#if skill.toCompleteComment}<em class="nh-note">À compléter : {skill.toCompleteComment}</em>{/if}
      </span>
      <span class="nh-act">Compléter</span>
    </a>
  {:else if skill.rejectedRequest}
    <a href="/jeune/demande/{skill.id}" class="nh-skill nh-rejected">
      <span class="nh-g" aria-hidden="true">✗</span>
      <span class="nh-stitle">{skill.title}
        {#if skill.rejectionComment}<em class="nh-note">Refusé : {skill.rejectionComment}</em>{/if}
      </span>
      <span class="nh-act">Renvoyer</span>
    </a>
  {:else}
    <div class="nh-skill nh-done">
      <span class="nh-g" aria-hidden="true">✓</span>
      <span class="nh-stitle">{skill.title}
        {#if skill.reviewerComment}<em class="nh-note">💬 {skill.reviewerComment}</em>{/if}
      </span>
    </div>
  {/if}
{/snippet}

<style>
  .nh { max-width: 390px; margin: 0 auto; padding-bottom: var(--nh-s5); }

  /* D4 : titre déclassé — le jeune vient de cliquer sur « Mon passeport » */
  .nh-page-title {
    font-size: 14px; letter-spacing: .14em; text-transform: uppercase;
    color: var(--nh-ink-dim); margin-bottom: var(--nh-s4);
  }

  /* D6 : dernier badge */
  .nh-last { display: flex; align-items: center; gap: var(--nh-s2); margin-bottom: var(--nh-s5); }
  .nh-last-img { width: 48px; height: 48px; object-fit: contain;
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--nh-warn) 55%, transparent)); }
  .nh-last-lab { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--nh-ink-dim); }
  .nh-last-name { font-size: 16px; font-weight: 700; color: var(--nh-warn); }

  /* D7 : aucune bordure, aucun fond de bloc — c'est --nh-s5 qui sépare */
  .nh-domain { margin-bottom: var(--nh-s5); }
  .nh-dhead { display: flex; align-items: center; gap: var(--nh-s2); }
  .nh-hex { width: 44px; height: 44px; flex: 0 0 44px; object-fit: contain;
    filter: drop-shadow(0 0 12px color-mix(in srgb, var(--rank) 50%, transparent)); }
  .nh-hex-empty { display: grid; place-items: center; font-size: 24px; color: var(--nh-line); }
  .nh-dtitles { min-width: 0; }
  .nh-dname { font-size: 18px; font-weight: 700; letter-spacing: .05em;
    text-transform: uppercase; color: var(--accent); line-height: 1.1; }
  /* D4 : le rang est l'ancrage visuel — 28px, pas 10px */
  .nh-rank { font-size: 28px; font-weight: 700; line-height: 1.15; color: var(--rank);
    text-shadow: 0 0 14px color-mix(in srgb, var(--rank) 45%, transparent); }
  /* Sans rang : même poids visuel, mais dans l'accent du domaine et sans lueur —
     l'ancrage reste occupé par une information positive, pas par un manque. */
  .nh-rank-soft { color: var(--accent); font-size: 24px; text-shadow: none; }

  .nh-bar { display: flex; gap: 3px; margin: var(--nh-s2) 0 var(--nh-s0); }
  .nh-bar i { height: 8px; flex: 1; min-width: 4px; border-radius: 2px; background: var(--nh-surface-2); }
  .nh-bar i.on { background: var(--accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 55%, transparent); }
  .nh-count { font-size: 13px; color: var(--nh-ink-dim); letter-spacing: .06em; }

  .nh-cat { display: flex; align-items: center; gap: var(--nh-s2);
    min-height: 44px; margin-top: var(--nh-s3); border-top: 1px solid var(--nh-line-soft); }
  .nh-cat-other { color: var(--nh-ink-dim); }
  .nh-cbadge-img { width: 26px; height: 26px; flex: 0 0 26px; object-fit: contain;
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--nh-warn) 50%, transparent)); }
  .nh-cbadge { width: 26px; height: 26px; flex: 0 0 26px; border-radius: 50%;
    display: grid; place-items: center; font-size: 10px;
    background: var(--nh-surface-2); color: var(--nh-ink-dim); }
  .nh-cname { flex: 1; font-size: 15px; font-weight: 500; }
  .nh-cstate { font-size: 13px; color: var(--nh-ink-dim); white-space: nowrap; }
  .nh-cstate.done { color: var(--nh-warn); }

  /* D9 : 44px minimum sur toute ligne, focus visible */
  .nh-skill { display: flex; align-items: center; gap: var(--nh-s1);
    min-height: 44px; padding: var(--nh-s0) var(--nh-s1) var(--nh-s0) var(--nh-s4);
    font-size: 14px; color: var(--nh-ink-muted); text-decoration: none; border-radius: 6px; }
  .nh-g { width: 18px; flex: 0 0 18px; text-align: center; }
  .nh-stitle { flex: 1; min-width: 0; }
  .nh-note { display: block; font-size: 12px; font-style: italic; color: var(--nh-ink-dim); }
  .nh-act { margin-left: auto; font-size: 13px; font-weight: 700;
    color: var(--accent); letter-spacing: .04em; white-space: nowrap; }

  .nh-todo { color: var(--nh-ink); }
  .nh-todo:hover, .nh-pending:hover, .nh-tocomplete:hover, .nh-rejected:hover { background: var(--nh-surface-1); }
  .nh-todo:active, .nh-pending:active, .nh-tocomplete:active, .nh-rejected:active { background: var(--nh-surface-2); }
  .nh-skill:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .nh-done .nh-g { color: var(--nh-ok); }
  .nh-pending .nh-g, .nh-pending .nh-act { color: #facc15; }
  .nh-tocomplete .nh-g, .nh-tocomplete .nh-act { color: #fbbf24; }
  .nh-rejected .nh-g, .nh-rejected .nh-act { color: #f87171; }
  .nh-rejected .nh-stitle { color: #fca5a5; }
  .nh-todo .nh-g { color: var(--nh-ink-dim); }

  /* D5 : états vides rédigés */
  .nh-empty { padding: var(--nh-s5) 0; text-align: center; }
  .nh-empty-title { font-size: 18px; font-weight: 700; margin-bottom: var(--nh-s1); }
  .nh-empty-body { font-size: 14px; color: var(--nh-ink-muted); margin-bottom: var(--nh-s4); }
  .nh-empty-cta { display: inline-flex; align-items: center; min-height: 44px;
    padding: 0 var(--nh-s3); border-radius: 8px; font-weight: 700; font-size: 14px;
    color: var(--nh-surface-0); background: var(--nh-warn); text-decoration: none; }
  .nh-empty-sm { font-size: 13px; color: var(--nh-ink-dim); padding: var(--nh-s2) 0 var(--nh-s2) var(--nh-s4); }

  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
  }
</style>
