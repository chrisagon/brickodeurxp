# Audit design — BrickodeurXP (2026-08-28)

Audit `/design-review` complet (dev local, modes jeune + animateur, desktop + mobile 360px).
Synthèse machine : `design-baseline.json`. Design system : `DESIGN.md`.

## Scores (10 catégories, A–F)

| Catégorie | Avant | Après fixes | Notes |
|---|---|---|---|
| Typography | C+ | C+ | stack générique (F-005, exclu — décision de marque) |
| Color | B | B | palette navy + orange + couleurs domaine cohérentes |
| Layout & Alignment | B | B | max-w-* maîtrisés, alignements propres |
| Component Consistency | C+ | B | gradation boutons, popover thémé |
| Responsive | D | B | navs wrapées 360px, targets 44px (F-001/F-002) |
| Accessibility | C | B− | targets ≥44px ; focus visibles + labels à finir (F-012) |
| Interaction Feedback | C+ | B− | bandeaux de retour, ProofImage fallback |
| Empty States | B+ | B+ | force du produit : actionnables partout |
| Visual Hierarchy | C | B− | primaire unique, secondaires translucides (F-006) |
| Identity / AI Slop | C | C+ | zéro gradient/skeleton ; emojis (F-009) |

**Overall : C+ → B−** · **AI Slop Score : 3.5 → 3.0**

## Findings

### HIGH (tous corrigés)
- **F-001** Nav top non responsive <768px → `flex-wrap`, prénom `hidden sm:inline`, re-test 360px OK (3 layouts). `d09e4f0`
- **F-002** Touch targets <44px systématiques → `min-h-[44px]`/`[40px]` navs, boutons validation, pastilles passeport, submit, "? Guide". `d09e4f0`+`bdbe92a`
- **F-003** Images preuve cassées sans fallback → composant `src/lib/components/ProofImage.svelte` (placeholder thémé, reset sur changement de src). `f8fbaff`

### MEDIUM (corrigés sauf exclus)
- **F-004** Popover driver.js blanc sur UI sombre → overrides CSS `src/app.css` (navy/orange). `db4b227`
- **F-005** Fonte générique — **open, exclu** (décision de marque).
- **F-006** Bruit de boutons (9× Soumettre plein, pas de gradation) → Valider = seul plein vert ; À compléter/Refuser translucides `bg-*/15`. `c3fde89`
- **F-007** Trous de données (domaines vides, doublon Engrenages) — **open, exclu** (DB/seed).
- **F-008** Microcopy « Compétences en cours de catégorisation » → « Autres compétences de ce domaine ». `c3fde89`

### LOW (backlog, ouverts)
- **F-009** Emojis comme icônes (= 📎 🗂️ ✓ ✎ ✗ ⏳).
- **F-010** « ? Guide » ambigu — taille corrigée (44px), libellé conservé.
- **F-011** Pas de retour app depuis pages publiques (leaderboard/compétences).
- **F-012** Focus visibles rares → recommandé : `focus-visible:outline-2 outline-orange-500` global dans `app.css`.

## Ce qui marche bien
- Empty states actionnables et cohérents sur chaque vue.
- Palette unifiée : navy profond + orange unique + pastilles de domaine (DB).
- Accordéons avec compteurs, barres de progression passeport.
- Onboarding double tour (jeune + animateur) avec reprise via "? Guide".
- Zéro gradient décoratif, zéro skeleton, zéro jargon gratuit.

## Bugs hors design (à traiter séparément)
- **R2 500 en dev** : `/api/proofs/*` et `/api/projects/*` → HTTP 500. Les clés existent
  dans le bucket local Miniflare (vérifié via `node:sqlite`, table `_mf_objects`).
  Cause : `platform.env.R2` absent du process dev courant → redémarrer `npm run dev`.
  L'UI est désormais robuste à ce cas grâce à ProofImage.