# Passeport Numérique Brickodeurs — Design Spec

**Date :** 2026-03-30
**Statut :** Approuvé
**Projet :** `brickodeurxp`

---

## Contexte

Le club des Brickodeurs organise des ateliers de construction de robots LEGO (Mindstorms, Spike, Technic) et de programmation pour la FIRST LEGO League. Il n'existe actuellement aucun outil pour suivre et valoriser la progression des jeunes participants.

Ce projet crée un **passeport numérique de compétences** : les jeunes obtiennent des badges validés par les animateurs, les parents suivent la progression de leur enfant, et les badges sont imprimés en 3D pour constituer une récompense physique tangible.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend PWA | SvelteKit + Vite + `@vite-pwa/sveltekit` |
| CSS | TailwindCSS |
| Backend / API | SvelteKit server routes sur Cloudflare Workers |
| Authentification | `better-auth` (email/password + magic link) |
| Base de données | Cloudflare D1 (SQLite) |
| Stockage fichiers | Cloudflare R2 (preuves photo/vidéo) |
| Hébergement | Cloudflare Pages |
| Déploiement | `wrangler deploy` |

---

## Rôles utilisateurs

| Rôle | Capacités |
|---|---|
| **Jeune** | S'inscrit, soumet des preuves (photo/vidéo), consulte son passeport et ses badges |
| **Animateur** | Consulte les demandes en attente, valide ou refuse avec commentaire, génère les badges SVG pour impression 3D |
| **Parent** | Consulte en lecture seule le passeport et la progression de son enfant, reçoit les notifications de nouveaux badges |
| **Admin** | Gère le référentiel de compétences (domaines, compétences), gère les comptes animateurs |

---

## Domaines de compétences

Deux domaines reflétant le nom du club **Brickodeurs** :

- 🧱 **Brick** — Construction physique (LEGO Mindstorms, Spike, Technic)
- 💻 **Codeur** — Programmation des robots pour la FIRST LEGO League

Chaque domaine possède son propre référentiel de compétences, géré par les admins via l'interface.

Chaque domaine est représenté par une **icône SVG personnalisée** inspirée du logo Brickodeurs :
- 🧱 **Brick** → icône plot LEGO / brique Technic (à dessiner en SVG lors de l'implémentation)
- 💻 **Codeur** → icône engrenage Technic + code / circuit (à dessiner en SVG lors de l'implémentation)

Ces icônes sont stockées dans `domains.icon` (chemin SVG ou inline SVG) et réutilisées dans le passeport, les badges et le générateur SVG.

---

## Système de niveaux (ceintures)

Le niveau par domaine est calculé dynamiquement à partir du nombre de badges validés dans ce domaine :

| Badges validés dans le domaine | Niveau | Couleur filament |
|---|---|---|
| 1 | Blanc | Blanc |
| 2 | Jaune | Jaune |
| 3 | Orange | Orange |
| 4 | Rouge | Rouge |
| 5+ | Noir | Noir |

Le niveau est indépendant par domaine : un jeune peut être Orange en Brick et Jaune en Codeur simultanément.

---

## Authentification

- **Jeunes, animateurs, admins** : email + mot de passe classique via `better-auth`
- **Parents** : magic link uniquement — le jeune saisit l'email de son parent lors de l'inscription → le parent reçoit un lien d'invitation par email → il crée son compte en cliquant le lien → liaison parent-enfant automatiquement établie

---

## Modèle de données (Cloudflare D1)

### `users`
```
id, email, password_hash, role (jeune|animateur|parent|admin), nom, prenom, created_at
```

### `parent_child`
```
id, parent_id → users, child_id → users
```

### `magic_links`
```
token, email, expires_at, used
```
> Gérée automatiquement par `better-auth` — ne pas implémenter manuellement.

### `domains`
```
id, name (Brick|Codeur), color, icon
```

### `skills`
```
id, domain_id → domains, title, description, sort_order, active
```

### `badge_requests`
```
id, jeune_id → users, skill_id → skills,
status (pending|approved|rejected),
proof_url (R2 key), proof_type (photo|video),
submitted_at, reviewed_at,
reviewer_id → users, reviewer_comment
```

### `badges`
```
id, jeune_id → users, skill_id → skills,
request_id → badge_requests, awarded_at,
level (blanc|jaune|orange|rouge|noir)
```

> Le champ `level` est calculé au moment de l'attribution : `COUNT(badges WHERE jeune_id = X AND domain = Y)` → niveau correspondant.

---

## Flux utilisateurs

### Inscription d'un jeune
1. S'inscrit avec email + mot de passe
2. Saisit l'email de son parent
3. Le parent reçoit un magic link par email
4. Le parent crée son compte via le lien
5. La liaison parent-enfant est automatiquement établie

### Demande de badge
1. Le jeune choisit une compétence non encore validée
2. Il télécharge une photo ou vidéo comme preuve (stockée dans R2)
3. Il soumet la demande → `badge_requests` créé avec `status = pending`
4. L'animateur reçoit une notification (email ou badge dans l'interface)
5. L'animateur consulte la preuve et valide ou refuse avec commentaire
6. Si validé → entrée créée dans `badges` + notification email au jeune et au parent

### Refus avec résoumission
- En cas de refus, le commentaire de l'animateur est visible par le jeune
- Le jeune peut soumettre une nouvelle demande pour la même compétence

### Suivi parent
- Connexion par magic link (à chaque connexion) ou session persistante
- Vue en lecture seule du passeport enfant : domaines, badges obtenus, niveau actuel
- Fil d'activité récente (derniers badges obtenus ou soumis)
- Notification email à chaque nouveau badge validé

---

## Module de génération de badge pour impression 3D

### Déclenchement
Après validation d'une compétence, l'animateur peut générer le badge physique correspondant depuis la fiche de demande validée.

### Paramètres (pré-remplis automatiquement)
- **Couleur** : déterminée par le niveau atteint dans le domaine (blanc, jaune, orange, rouge, noir) — correspond à la couleur du filament à utiliser
- **Icône** : icône SVG personnalisée par domaine (inspirée du logo Brickodeurs) — pré-sélectionnée selon le domaine
- **Contenu** : nom du domaine + niveau (pas le nom du jeune)

### Format du badge
- **Forme** : hexagonale — calquée sur le logo Brickodeurs
- **Dimensions suggérées** : ∅ 40 mm, épaisseur 4 mm
- **Plots LEGO** : cercles en relief sur la face supérieure (reproduisant les plots du logo), encodés dans le SVG comme surépaisseurs
- **Export** : fichier SVG compatible avec les slicers 3D (Cura, Bambu Studio) et les outils de modélisation (TinkerCAD, Fusion 360)

### Implémentation technique
- Génération côté client (SvelteKit) avec l'API `SVGElement` du navigateur
- Le SVG encode l'hexagone principal + les cercles plots en couches (`z` via `data-height` pour le slicer)
- Téléchargement direct via un lien `blob:` — aucun traitement serveur requis
- Format STL prévu comme évolution future (via bibliothèque JS type `svg-to-stl`)

---

## Structure de l'application (pages SvelteKit)

```
/                          → Redirection selon rôle
/auth/login                → Connexion email + mdp
/auth/magic                → Activation magic link parent
/jeune/passeport           → Vue passeport + liste badges
/jeune/competences         → Catalogue des compétences disponibles
/jeune/demandes            → Mes demandes en cours / historique
/animateur/validations     → File d'attente des demandes
/animateur/badge/[id]      → Détail d'une demande + génération badge SVG
/parent/enfant/[id]        → Passeport enfant en lecture seule
/admin/competences         → CRUD domaines et compétences
/admin/animateurs          → Gestion des comptes animateurs
```

---

## PWA

- Service worker via `@vite-pwa/sveltekit` (Workbox)
- `manifest.json` : nom "Brickodeurs", icône hexagonale, theme color orange
- Installable sur iOS et Android depuis le navigateur (bouton "Ajouter à l'écran d'accueil")
- Mode offline : pages statiques en cache, message d'indisponibilité pour les actions nécessitant le réseau

---

## Stockage R2

- Les preuves (photos/vidéos) sont uploadées directement dans R2 via un **presigned URL** généré par le Worker
- Seule la clé R2 est stockée dans D1 (`proof_url`)
- L'accès aux preuves est sécurisé : l'URL de visualisation est générée à la demande avec une signature temporaire (15 min)

---

## Emails transactionnels

| Événement | Destinataire |
|---|---|
| Invitation parent | Parent |
| Badge validé | Jeune + Parent |
| Badge refusé (avec commentaire) | Jeune |
| Compte animateur créé | Animateur |

Envoi via **Resend** (SDK compatible Cloudflare Workers, support `fetch` natif, tier gratuit généreux).
clé API Resend : re_We8J3fF1_b3d6GHnQTsFHAuNxiNX5dMyA
---

## Vérification (tests end-to-end)

1. Inscription jeune → invitation parent → liaison établie
2. Soumission demande de badge avec photo → visible dans file animateur
3. Validation animateur → badge apparu dans passeport jeune
4. Niveau de ceinture mis à jour correctement après le 3e badge dans un domaine
5. Génération du SVG hexagonal → téléchargeable et importable dans TinkerCAD
6. Vue parent → progression visible et à jour
7. PWA installable sur mobile (manifest + service worker actifs)
8. Accès R2 proof via URL signée → expiration après 15 min
