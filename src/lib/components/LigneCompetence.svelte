<script lang="ts">
  /**
   * Une ligne de compétence du passeport.
   *
   * Extraite parce que le passeport la rendait DEUX FOIS avec une logique
   * identique : une branche pour les compétences catégorisées, une pour les
   * non catégorisées. C'était le vrai contenu de ses 211 lignes.
   *
   * Cible tactile : la ligne ENTIÈRE est cliquable, avec 44px de hauteur
   * minimum. Le bouton « Envoyer » d'origine mesurait 17px de haut, soit 39 %
   * de la norme WCAG 2.5.5, sur l'action principale du produit.
   *
   * `dataTour` est passé en prop, pas géré ici : l'attribut est un contrat
   * avec `onboarding.ts`, qui filtre silencieusement les étapes dont le
   * sélecteur est absent. Une casse ne produirait aucune erreur.
   */
  type SkillState = {
    id: string;
    title: string;
    description?: string;
    approved: boolean;
    pendingRequest: boolean;
    rejectedRequest: boolean;
    toCompleteRequest: boolean;
    reviewerComment?: string | null;
    rejectionComment?: string | null;
    toCompleteComment?: string | null;
  };

  let { skill, dataTour = undefined }: { skill: SkillState; dataTour?: string } = $props();

  /** Un seul endroit décide de l'état : pas de cascade dupliquée dans le markup. */
  const state = $derived(
    skill.approved
      ? 'approved'
      : skill.pendingRequest
        ? 'pending'
        : skill.toCompleteRequest
          ? 'tocomplete'
          : skill.rejectedRequest
            ? 'rejected'
            : 'todo'
  );

  const GLYPH = { approved: '✓', pending: '⏳', tocomplete: '✎', rejected: '✗', todo: '○' } as const;
  const ACTION = { pending: 'Modifier', tocomplete: 'Compléter', rejected: 'Renvoyer', todo: 'Soumettre →' } as const;
  /** Texte accessible : les glyphes sont décoratifs, l'état passe par ici. */
  const A11Y = {
    approved: 'validée',
    pending: 'en attente de validation',
    tocomplete: 'à compléter',
    rejected: 'refusée',
    todo: 'à soumettre',
  } as const;

  const note = $derived(
    state === 'approved' && skill.reviewerComment
      ? `💬 ${skill.reviewerComment}`
      : state === 'rejected' && skill.rejectionComment
        ? `Refusé : ${skill.rejectionComment}`
        : state === 'tocomplete' && skill.toCompleteComment
          ? `À compléter : ${skill.toCompleteComment}`
          : null
  );
</script>

{#snippet body()}
  <span class="g" aria-hidden="true">{GLYPH[state]}</span>
  <span class="title">
    {skill.title}
    <span class="sr-only">, {A11Y[state]}</span>
    {#if note}<em class="note">{note}</em>{/if}
  </span>
  {#if state !== 'approved'}
    <span class="act">{ACTION[state as keyof typeof ACTION]}</span>
  {/if}
{/snippet}

{#if state === 'approved'}
  <div class="ligne is-approved">{@render body()}</div>
{:else}
  <a href="/jeune/demande/{skill.id}" class="ligne is-{state}" data-tour={dataTour}>
    {@render body()}
  </a>
{/if}

<style>
  /* 44px minimum : WCAG 2.5.5 / Apple HIG. Non négociable. */
  .ligne {
    display: flex;
    align-items: center;
    gap: var(--nh-s1, 8px);
    min-height: 44px;
    padding: var(--nh-s0, 4px) var(--nh-s1, 8px) var(--nh-s0, 4px) var(--nh-s4, 24px);
    font-size: 14px;
    color: var(--nh-ink-muted, #9fb0c9);
    text-decoration: none;
    border-radius: 6px;
  }
  .g { width: 18px; flex: 0 0 18px; text-align: center; }
  .title { flex: 1; min-width: 0; }
  .note { display: block; font-size: 12px; font-style: italic; color: var(--nh-ink-dim, #7a8aa5); }
  .act {
    margin-left: auto;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  /* Sur mobile il n'y a pas de survol : l'affordance passe par la forme et la
     couleur, jamais par une interaction. */
  a.ligne:hover { background: var(--nh-surface-1, #0d1526); }
  a.ligne:active { background: var(--nh-surface-2, #111a2e); }
  a.ligne:focus-visible {
    outline: 2px solid var(--accent, #9fb0c9);
    outline-offset: 2px;
  }

  .is-approved { color: var(--nh-ink-muted, #9fb0c9); }
  .is-approved .g { color: var(--nh-ok, #4ade80); }

  /* `à faire` porte l'action principale : c'était l'état le plus terne, il est
     désormais le plus lisible des cinq. */
  .is-todo { color: var(--nh-ink, #fff); }
  .is-todo .g { color: var(--nh-ink-dim, #7a8aa5); }
  .is-todo .act { color: var(--accent, #9fb0c9); }

  .is-pending .g, .is-pending .act { color: #facc15; }
  .is-tocomplete .g, .is-tocomplete .act { color: #fbbf24; }
  .is-rejected .g, .is-rejected .act { color: #f87171; }
  .is-rejected .title { color: #fca5a5; }

  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
</style>
