<script lang="ts">
  import type { PageData } from './$types';
  import { LEVEL_LABELS, type Level } from '$lib/utils/level';
  import RangNiveau from '$lib/components/RangNiveau.svelte';
  import LigneCompetence from '$lib/components/LigneCompetence.svelte';

  let { data } = $props<{ data: PageData }>();

  /**
   * Dernier badge obtenu. Approximation : le serveur n'expose pas
   * `badges.awarded_at`, on prend le premier trouvé. Les badges sont déjà
   * chargés par le `Promise.all` du load, aucune requête supplémentaire.
   */
  const lastBadge = $derived.by(() => {
    for (const dp of data.passeport) {
      for (const cp of dp.categories) {
        if (cp.hasBadge && cp.badgeLevel) {
          return { cat: cp.category.name, dom: dp.domain.name, level: cp.badgeLevel as Level };
        }
      }
    }
    return null;
  });
</script>

<div class="nh">
  <p class="page-title" data-tour="passeport-title">Mon passeport</p>

  {#if lastBadge}
    <div class="last">
      <RangNiveau level={lastBadge.level} size={48} />
      <div>
        <p class="last-lab">Dernier badge</p>
        <p class="last-name">{lastBadge.cat} · {lastBadge.dom}</p>
      </div>
    </div>
  {/if}

  {#each data.passeport as dp}
    {@const validees = dp.categories.reduce((n: number, c: any) => n + c.completedCount, 0)}
    <section class="domain" style="--accent:{dp.accent}" aria-labelledby="dom-{dp.domain.id}">
      <div class="dhead">
        <RangNiveau level={dp.level} />
        <div class="dtitles">
          <h2 class="dname" id="dom-{dp.domain.id}">{dp.domain.name}</h2>
          {#if dp.level}
            <p class="rank">Niveau {LEVEL_LABELS[dp.level as Level]}</p>
          {:else if validees > 0}
            <!-- Sans rang, l'ancrage visuel dit ce qui est ACQUIS. « Pas encore
                 de rang » en 28px annoncerait un manque au premier plan. -->
            <p class="rank rank-soft">{validees} compétence{validees > 1 ? 's' : ''} validée{validees > 1 ? 's' : ''}</p>
          {:else}
            <p class="rank rank-soft">Ton premier badge t'attend</p>
          {/if}
        </div>
      </div>

      {#if dp.categories.length > 0}
        <div class="bar" aria-hidden="true">
          {#each dp.categories as _, i}
            <i class={i < dp.categoryBadgeCount ? 'on' : ''}></i>
          {/each}
        </div>
        <p class="count">{dp.categoryBadgeCount} sur {dp.categories.length} badge{dp.categories.length !== 1 ? 's' : ''}</p>
      {/if}

      {#each dp.categories as cp}
        <div class="cat">
          {#if cp.hasBadge && cp.badgeLevel}
            <RangNiveau level={cp.badgeLevel as Level} size={26} />
          {:else}
            <span class="cbadge" aria-hidden="true">{cp.completedCount}/{cp.totalCount}</span>
          {/if}
          <span class="cname">{cp.category.name}</span>
          <span class="cstate" class:done={cp.hasBadge}>
            {#if cp.hasBadge && cp.badgeLevel}
              Badge {LEVEL_LABELS[cp.badgeLevel as Level]}
            {:else}
              {cp.completedCount} sur {cp.totalCount}
            {/if}
          </span>
        </div>

        {#each cp.skills as skill, i}
          <LigneCompetence {skill} dataTour={i === 0 ? 'jeune-submit' : undefined} />
        {:else}
          <p class="empty-sm">Rien à valider ici pour l'instant.</p>
        {/each}
      {:else}
        <p class="empty-sm">Rien à valider dans ce domaine pour l'instant.</p>
      {/each}

      {#if dp.uncategorizedSkills.length > 0}
        <div class="cat cat-other"><span class="cname">Autres compétences de ce domaine</span></div>
        {#each dp.uncategorizedSkills as skill, i}
          <LigneCompetence {skill} dataTour={dp.categories.length === 0 && i === 0 ? 'jeune-submit' : undefined} />
        {/each}
      {/if}
    </section>
  {:else}
    <div class="empty">
      <p class="empty-title">Ton passeport est encore vierge.</p>
      <p class="empty-body">Les compétences arrivent bientôt. En attendant, va voir tout ce qu'il y a à débloquer.</p>
      <a href="/competences" class="empty-cta">Voir les compétences →</a>
    </div>
  {/each}
</div>

<style>
  .nh { max-width: 390px; margin: 0 auto; padding-bottom: var(--nh-s5); }

  /* Titre déclassé : le jeune vient de cliquer sur « Mon passeport ». */
  .page-title {
    font-size: 14px; letter-spacing: .14em; text-transform: uppercase;
    color: var(--nh-ink-dim); margin-bottom: var(--nh-s4);
  }

  .last { display: flex; align-items: center; gap: var(--nh-s2); margin-bottom: var(--nh-s5); }
  .last-lab { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--nh-ink-dim); }
  .last-name { font-size: 16px; font-weight: 700; color: var(--nh-warn); }

  /* Aucune bordure, aucun fond de bloc : c'est --nh-s5 qui sépare. */
  .domain { margin-bottom: var(--nh-s5); }
  .dhead { display: flex; align-items: center; gap: var(--nh-s2); }
  .dtitles { min-width: 0; }
  .dname { font-size: 18px; font-weight: 700; letter-spacing: .05em;
    text-transform: uppercase; color: var(--accent); line-height: 1.1; }
  /* Le rang est l'ancrage visuel. Il était à 10px. */
  .rank { font-size: 28px; font-weight: 700; line-height: 1.15; color: var(--nh-ink); }
  .rank-soft { color: var(--accent); font-size: 24px; }

  .bar { display: flex; gap: 3px; margin: var(--nh-s2) 0 var(--nh-s0); }
  .bar i { height: 8px; flex: 1; min-width: 4px; border-radius: 2px; background: var(--nh-surface-2); }
  .bar i.on { background: var(--accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 55%, transparent); }
  .count { font-size: 13px; color: var(--nh-ink-dim); letter-spacing: .06em; }

  .cat { display: flex; align-items: center; gap: var(--nh-s2);
    min-height: 44px; margin-top: var(--nh-s3); border-top: 1px solid var(--nh-line-soft); }
  .cat-other { color: var(--nh-ink-dim); }
  .cbadge { width: 26px; height: 26px; flex: 0 0 26px; border-radius: 50%;
    display: grid; place-items: center; font-size: 10px;
    background: var(--nh-surface-2); color: var(--nh-ink-dim); }
  .cname { flex: 1; font-size: 15px; font-weight: 500; }
  .cstate { font-size: 13px; color: var(--nh-ink-dim); white-space: nowrap; }
  .cstate.done { color: var(--nh-warn); }

  .empty { padding: var(--nh-s5) 0; text-align: center; }
  .empty-title { font-size: 18px; font-weight: 700; margin-bottom: var(--nh-s1); }
  .empty-body { font-size: 14px; color: var(--nh-ink-muted); margin-bottom: var(--nh-s4); }
  .empty-cta { display: inline-flex; align-items: center; min-height: 44px;
    padding: 0 var(--nh-s3); border-radius: 8px; font-weight: 700; font-size: 14px;
    color: var(--nh-surface-0); background: var(--nh-warn); text-decoration: none; }
  .empty-cta:focus-visible { outline: 2px solid var(--nh-ink); outline-offset: 2px; }
  .empty-sm { font-size: 13px; color: var(--nh-ink-dim); padding: var(--nh-s2) 0 var(--nh-s2) var(--nh-s4); }

  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
  }
</style>
