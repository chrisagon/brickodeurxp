# DESIGN.md — BrickodeurXP

Design system documenté, extrait de l'audit `/design-review` du 2026-08-28
(voir `design-audit-brickodeurxp.md` et `design-baseline.json`).

> **Deux systèmes coexistent, par périmètre.** Les sections 1 à 9 décrivent le
> **système historique**, qui s'applique aux rôles animateur, parent, admin et
> aux pages publiques. La section 10 décrit **Néon HUD**, qui s'applique au
> seul espace jeune, activé par la classe `.theme-jeune` posée sur le layout
> racine quand `session.user.role === 'jeune'`.
>
> Deux règles du système historique sont **communes aux deux** parce qu'elles
> sont justes et déjà auditées : les cibles tactiles ≥ 44px (§5, règle 1) et
> les règles d'écriture de la micro-copie (§3).

---

## 1. Identité

Plateforme sombre "atelier" pour jeunes (LEGO + code) : fond navy très sombre,
accent orange unique, couleurs de domaine pour la navigation visuelle.
Aucun gradient décoratif, aucune ombre fantaisiste —
la hiérarchie vient de la couleur et de la densité. Aucun squelette de chargement.

- **Theme-color mobile** : `#f97316` (orange-500, cf. `src/routes/+layout.svelte`)
- **Langue** : français, tutoiement côté jeune, vouvoiement côté animateur.

## 2. Palette

### Fonds (du plus profond au plus haut)

| Token | Hex | Usage |
|---|---|---|
| `bg-gray-950` | `#030712` | Fond de page racine (`+layout.svelte`) |
| `bg-gray-900` | `#111827` | Cartes, blocs de contenu, en-têtes accordéon |
| `bg-gray-800` | `#1f2937` | Blocs imbriqués (commentaires, preuves), inputs |
| `bg-gray-800/50`, `/30` | — | Zones secondaires, dropzones, sections vides |
| `bg-gray-700/30` | — | Lignes "validée" dans les listes |

### Accent

| Token | Hex | Usage |
|---|---|---|
| `orange-500` | `#f97316` | CTA principal, compteurs, focus bordures, theme-color |
| `orange-400` | `#fb923c` | Titres, liens actifs, marque, hover texte |
| `orange-300` | `#fdba74` | Hover de lien déjà orange |

### Sémantiques (toujours en `-400`/`-300` sur fond sombre, jamais `-600+` en texte)

| Sens | Fond | Texte |
|---|---|---|
| Succès / validé | `bg-green-600` (bouton), `bg-green-900/30` (bandeau) | `text-green-400` |
| Refus / destructif | `bg-red-900/40` (bandeau), `bg-red-500/15` (bouton secondaire) | `text-red-400` / `text-red-300` |
| À compléter / attention | `bg-amber-900/30` (bandeau), `bg-amber-500/15` (bouton secondaire) | `text-amber-400` |
| Info / nouveau | `bg-yellow-900/30` | `text-yellow-400` |

### Couleurs de domaine

Stockées en DB (`domains.color`), appliquées en `style="background:{color}"` —
pastilles `w-3 h-3 rounded-full` uniquement. Ne pas coder en dur.

## 3. Typographie

Stack par défaut (Tailwind 4) : `ui-sans-serif, system-ui, …`.
⚠️ **F-005 (open)** : fonte générique — une fonte de marque reste à choisir.

| Rôle | Classes |
|---|---|
| Titre de page | `text-xl font-bold text-orange-400 mb-6` |
| Titre de section/carte | `font-semibold` / `font-bold text-gray-100` |
| Corps | `text-sm text-gray-300` (dense, tout en `text-sm`/`text-xs`) |
| Métadonnée / aide | `text-xs text-gray-500` / `text-gray-600` |
| Lien d'action | `text-sm text-orange-400 hover:text-orange-300` |

Microcopy : phrases courtes, orientées action ("Choisis les compétences que tu veux
valider…"), jamais de jargon interne ("catégorisation" → "Autres compétences de ce domaine").

## 4. Espacements, rayons, densité

- **Rayons** : `rounded-lg` (8px) = standard boutons/inputs ; `rounded-xl` (12px) = cartes ;
  `rounded-full` = pastilles, compteurs, badges.
- **Padding carte** : `p-4`…`p-6`. Interne : `px-3 py-2` (lignes), `px-4 py-2.5` (boutons).
- **Bordures** : `border-gray-800` (séparateurs de page), `border-gray-700` (inputs,
  sections), `border-dashed` = zone vide/dropzone.
- **Conteneur** : `max-w-4xl mx-auto` (layouts), `max-w-3xl` (listes), `max-w-lg` (formulaires).

## 5. Boutons

### Variantes

| Variante | Classes | Usage |
|---|---|---|
| **Primaire** | `bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2.5 min-h-[44px] rounded-lg` | 1 seul par vue (envoyer, valider le flux) |
| **Primaire succès** | `bg-green-600 hover:bg-green-500 text-white … min-h-[44px]` | Action métier attendue (✓ Valider) |
| **Secondaire colorée** | `bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 …` / idem rouge | Actions alt. moins fréquentes (✎ À compléter, ✗ Refuser) |
| **Lien / pastille** | `inline-flex items-center px-3.5 py-2 min-h-[40px] rounded-lg bg-{teinte}/xx text-{teinte}-400` | Actions par ligne (Soumettre, Modifier) |
| **Lien texte** | `text-sm text-gray-400 hover:text-orange-400` | Nav secondaire, annuler |

### Règles

1. **Touch target ≥ 44px** (WCAG 2.5.5 / Apple HIG). Ligne compacte → minimum `min-h-[40px]`.
2. Un seul fond saturé par zone : le primaire seul porte `bg-*-600/500` plein ; tout le reste est translucide (`bg-*/15` + texte `*-400`).
3. Chaque bouton porte un verbe + un préfixe d'état : `✓ Valider`, `✎ À compléter`, `✗ Refuser` (les préfixes gl. agissent comme icônes tant que F-009 est open).
4. Destructif exige toujours un champ de raison associé (`required`).

## 6. Formulaires & inputs

```html
<input class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm
  focus:outline-none focus:border-{accent}-500" />
```

- Accent de focus = couleur sémantique du formulaire (vert pour valider, rouge pour refuser).
- Labels `text-sm text-gray-400 mb-1`, requis → `*` rouge.
- Upload : `label` déguisé en dropzone `border-2 border-dashed border-gray-700
  rounded-xl hover:border-orange-500`, emoji + nom de fichier choisi en orange.

## 7. Components récurrents

- **Carte** : `bg-gray-900 rounded-xl overflow-hidden` (+ `p-4`/`p-6` contenu).
- **Accordéon** : `w-full` bouton en-tête `px-5 py-4 hover:bg-gray-800/50`, chevron `▼/▲`,
  corps `px-5 pb-5 border-t border-gray-800`.
- **Compteur** : `text-sm bg-orange-500 text-white rounded-full px-2 py-0.5`.
- **Barre de progression** (passeport) : piste `bg-gray-700 h-1.5` + remplissage `bg-orange-500`,
  libellé `X/Y compétences validées`.
- **Empty state** : centré, emoji 3xl–4xl, titre `text-lg text-gray-400`,
  CTA visible (jamais vide sans action).
- **Feedback post-action** : bandeau `bg-{sémantique}-900/30 border border-{sémantique}-800
  rounded-lg p-4` avec texte `text-{sémantique}-400 text-sm` + éventuel CTA.
- **Fallback image** : `src/lib/components/ProofImage.svelte` — placeholder thémé
  (bordure `border-dashed`, icône + "Image indisponible") au lieu d'une image cassée.
- **Onboarding (driver.js)** : overrides CSS globaux dans `src/app.css` (fond `#1e293b`,
  titre orange, boutons orange + outline secondaire). Ne jamais remettre le popover blanc.

## 8. Accessibilité

Fait :
- navs `min-h-[44px] flex items-center`, nav wrapée sur mobile (`flex-wrap`, prénom masqué `hidden sm:inline`) ;
- `lang="fr"`, alt descriptifs (`alt="Preuve de {prénom} {nom}"`), `aria-label` sur "? Guide".

À faire (backlog) :
- **F-012** focus visibles : ajouter un `focus-visible:outline-2 focus-visible:outline-orange-500`
  global dans `app.css` ;
- 37 warnings svelte-check `a11y_label_has_associated_control` à éliminer (`for=`/`id=`) ;
- remplacer les emojis par un jeu d'icônes cohérent (**F-009**).

## 9. À ne PAS faire

- Pas de popover/élément natif blanc (tout composant tiers doit être thémé foncé).
- Pas de jaune plein `bg-yellow-*` comme CTA — réservé aux bandeaux d'attente.
- Pas de couleur de domaine codée en dur hors `style="background:{db_color}"`.
- Pas de nouveau composant tiers sans override CSS global documenté ici.

---

# 10. Néon HUD — espace jeune

Périmètre : les écrans vus par un utilisateur de rôle `jeune`. Activé par
`.theme-jeune` sur le layout racine (`+layout.svelte`), conditionné à
`data.session?.user?.role === 'jeune'`.

Le scope est par **rôle** et non par URL : un scope par chemin cassait le thème
dès que le jeune cliquait sur « Classement » ou « Profil ».

## 10.1 Identité

Interface de jeu plutôt qu'outil de gestion. Fond bleu nuit profond, accent
chromatique par domaine, typographie condensée en majuscules espacées, lueur
réservée aux acquis. Public visé : 12-15 ans, quasi exclusivement sur mobile.

- **Theme-color mobile** : `#07080f` sous `.theme-jeune`, `#f97316` ailleurs.
- **Aucune carte.** Les domaines sont séparés par l'espace et la typographie.
  Bordures et fonds de bloc sont interdits autour d'un domaine.

## 10.2 Jetons

Déclarés dans `src/app.css`, sous `.theme-jeune`.

| Jeton | Valeur | Usage |
|---|---|---|
| `--nh-surface-0` | `#07080f` | Page |
| `--nh-surface-1` | `#0d1526` | Survol de ligne |
| `--nh-surface-2` | `#111a2e` | Élément inerte, pression |
| `--nh-line` | `#1d2b45` | Séparateur fort |
| `--nh-line-soft` | `#141d33` | Séparateur de catégorie |
| `--nh-ink` | `#ffffff` | Texte principal |
| `--nh-ink-muted` | `#9fb0c9` | Texte secondaire |
| `--nh-ink-dim` | `#7a8aa5` | Méta, compteurs |
| `--nh-ok` | `#4ade80` | Compétence validée |
| `--nh-warn` | `#ffd166` | Badge obtenu |

**Accent de domaine.** Jamais un jeton : injecté par bloc via
`style="--accent:{dp.accent}"`, où `dp.accent` est calculé côté serveur par
`deriveAccent(domain.color)` (`src/lib/utils/accent.ts`).

## 10.3 Contraste mesuré

Toutes les paires passent WCAG AA texte (≥ 4,5:1).

| Premier plan | Fond | Ratio |
|---|---|---|
| `--nh-ink` | surface-1 | 18,22:1 |
| `--nh-ink-muted` | surface-1 | 8,27:1 |
| `--nh-ink-dim` | surface-1 | 5,21:1 |
| `--nh-ink-dim` | surface-0 | 5,72:1 |
| `--nh-ink-muted` | surface-2 | 7,87:1 |
| `--nh-ink-dim` | surface-2 | **4,96:1** (le plus serré) |
| `--nh-ok` | surface-1 | 10,46:1 |
| `--nh-warn` | surface-1 | 12,64:1 |

Accents dérivés, sur `surface-0` :

| Domaine | Base | Dérivé | L perçue | Contraste |
|---|---|---|---|---|
| Brick | `#f97316` | `#ff843c` | 0,705 → 0,741 | 7,13 → **8,20:1** |
| Codeur | `#6366f1` | `#96a2ff` | 0,585 → 0,741 | 4,47 → **8,48:1** |

## 10.4 Échelle typographique

Six tailles, pas sept. L'ordre de lecture est le suivant :

| Ordre | Rôle | Taille |
|---|---|---|
| 1 | Rang du domaine | 28px / 700 |
| 2 | Nom du domaine | 18px / 700, majuscules, `--accent` |
| 3 | Nom de catégorie | 15px / 500 |
| 4 | Compétence | 14px / 500 |
| 5 | Compteur, action, méta | 13px |
| — | Titre de page | 14px, `--nh-ink-dim`, **déclassé** |

Le titre de page est volontairement discret : le jeune vient de cliquer sur
« Mon passeport », il sait où il est. Le rang est l'ancrage visuel — il était
à 10px avant, la plus petite taille de l'écran.

**Sans rang**, l'ancrage affiche ce qui est acquis (« 2 compétences validées »),
jamais ce qui manque. Le plus gros texte de l'écran ne doit pas annoncer un vide.

## 10.5 Échelle d'espacement

`--nh-s0` 4px · `--nh-s1` 8px · `--nh-s2` 12px · `--nh-s3` 16px ·
`--nh-s4` 24px · `--nh-s5` 40px.

`--nh-s5` sépare les domaines. Depuis la suppression des cartes, il est
**structurel** : le réduire casse la lecture de la page.

## 10.6 Composants

- **`RangNiveau.svelte`** — hexagone dessiné en SVG, coloré par `LEVEL_COLORS`.
  Seul traducteur d'un `Level` en visuel. Ne charge aucune image.
- **`LigneCompetence.svelte`** — une ligne de compétence, cinq états. Ligne
  entière cliquable, 44px minimum. `data-tour` passé en prop.

## 10.7 États d'interaction

| Élément | Repos | Survol | Focus | Pressé |
|---|---|---|---|---|
| Ligne à faire | `--nh-ink`, `○`, action en `--accent` | `--nh-surface-1` | `outline: 2px solid var(--accent)`, offset 2px | `--nh-surface-2` |
| Ligne validée | `--nh-ink-muted`, `✓` vert | — | — (non interactive) | — |
| Ligne en attente / à compléter / refusée | glyphe et action colorés | `--nh-surface-1` | idem | `--nh-surface-2` |

**Il n'y a pas de survol sur mobile.** Aucune affordance ne doit dépendre d'une
interaction : la forme, la couleur et la position suffisent.

## 10.8 Micro-copie des états vides

Passeport sans aucun domaine :

> **Ton passeport est encore vierge.**
> Les compétences arrivent bientôt. En attendant, va voir tout ce qu'il y a à débloquer.
> `[ Voir les compétences → ]`

Domaine sans catégorie : « Rien à valider dans ce domaine pour l'instant. »
Catégorie sans compétence : « Rien à valider ici pour l'instant. »

**Interdit** : « Aucun résultat », « Aucun domaine disponible », « Liste vide ».

## 10.9 À ne PAS faire, en plus des règles générales

- Pas de bordure ni de fond de bloc autour d'un domaine.
- Pas de `clip-path` sur un conteneur interactif : il rogne les anneaux de
  focus, les ombres portées et casse `position: sticky`. Passer par un
  pseudo-élément avec `pointer-events: none`.
- Pas de lueur sur du texte courant ni sur un conteneur : rang et badges
  obtenus uniquement. Test : en retirant toutes les lueurs, la page doit
  rester hiérarchisée.
- Pas de septième taille de police.
- Pas d'affichage de `badge.level` brut — passer par `RangNiveau` ou
  `LEVEL_LABELS`. La base stocke `rouge`, l'interface affiche `Rouge`.

## 10.10 Reste ouvert

- **Motion** : aucune règle définie. Voir `TODOS.md`.
- **Fonte de marque** : le point F-005 du système historique visait Chakra Petch
  self-hostée. Non implémenté — la pile système est conservée pour l'instant.
- Pas de texte `text-white` hors boutons pleins ; le corps vit en `gray-100…gray-500`.