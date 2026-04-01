# Brickodeurs — Plan 3 : Portail Parent, Emails & PWA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter la vue parentale lecture seule du passeport, les emails transactionnels Resend (invitation + badge validé), et la configuration PWA (manifest + service worker) pour l'installation mobile.

**Architecture:** Le portail parent réutilise la logique de chargement du passeport jeune via deux nouveaux helpers D1. Les emails sont envoyés via l'API Resend (fetch direct, sans SDK) depuis les actions SvelteKit concernées, avec try/catch non-bloquant. La PWA s'appuie sur un manifest.json statique et un service worker minimal dans `static/`.

**Tech Stack:** SvelteKit 2 / Svelte 5, Cloudflare D1, Resend API (fetch natif), PWA (Web App Manifest + Service Worker)

---

## Contexte — Code existant

**`src/lib/server/db.ts` — helpers parent existants :**
- `createParentInvitation(db, parentEmail, childId)` → token
- `getValidInvitation(db, token)` → `{ parent_email, child_id } | null`
- `markInvitationUsed(db, token)` → void
- `linkParentChild(db, parentId, childId)` → void
- Type `User` : `{ id, email, role, nom, prenom, created_at }`

**`src/routes/auth/register/+page.server.ts` — lignes 39-43 :**
```typescript
const inviteToken = await createParentInvitation(db, parent_email, userId);
// In dev: log the invitation link (Plan 3 will send it via Resend)
const appUrl = platform!.env.APP_URL ?? 'http://localhost:5173';
console.log(`[DEV] Lien invitation parent: ${appUrl}/auth/magic?token=${inviteToken}`);
```
Ces 4 lignes seront remplacées par l'appel email.

**`src/routes/animateur/validations/+page.server.ts` :**
- Action `approve` appelle `approveRequest()` qui retourne `Badge` (contient `jeune_id`)
- À modifier pour envoyer email parents après validation

**`src/app.d.ts` — Platform.env déjà défini :**
```typescript
DB: D1Database; R2: R2Bucket; RESEND_API_KEY: string; APP_URL: string;
```
Manque : `RESEND_FROM?: string`

**`src/routes/+layout.svelte` :**
- Pas encore de `<svelte:head>` ni d'enregistrement service worker

**`static/` :** Contient uniquement `robots.txt`

---

## Structure des fichiers

```
src/
├── app.d.ts                                    MODIFY — ajouter RESEND_FROM?
├── lib/server/
│   ├── db.ts                                   MODIFY — getChildrenByParent, getParentsByChild
│   └── email.ts                                CREATE — sendInvitationEmail, sendBadgeAwardedEmail
├── routes/
│   ├── +layout.svelte                          MODIFY — manifest link + SW registration
│   ├── auth/register/+page.server.ts           MODIFY — remplacer console.log par email
│   ├── animateur/validations/+page.server.ts   MODIFY — email notification badge
│   └── parent/
│       ├── +layout.server.ts                   CREATE — guard rôle parent
│       └── enfant/
│           ├── +page.server.ts                 CREATE — charge enfants + leurs passeports
│           └── +page.svelte                    CREATE — vue lecture seule
static/
├── manifest.json                               CREATE — PWA manifest
├── icons/icon.svg                              CREATE — icône hexagonale orange
└── sw.js                                       CREATE — service worker minimal
```

---

## Task 1 : Helpers D1 pour le portail parent

**Files:**
- Modify: `src/lib/server/db.ts`

- [ ] **Step 1.1 : Ajouter les deux fonctions à la fin de `src/lib/server/db.ts`**

```typescript
export async function getChildrenByParent(db: D1Database, parentId: string): Promise<User[]> {
  const result = await db
    .prepare(
      'SELECT u.id, u.email, u.role, u.nom, u.prenom, u.created_at FROM users u JOIN parent_child pc ON pc.child_id = u.id WHERE pc.parent_id = ?'
    )
    .bind(parentId)
    .all<User>();
  return result.results;
}

export async function getParentsByChild(db: D1Database, childId: string): Promise<User[]> {
  const result = await db
    .prepare(
      'SELECT u.id, u.email, u.role, u.nom, u.prenom, u.created_at FROM users u JOIN parent_child pc ON pc.parent_id = u.id WHERE pc.child_id = ?'
    )
    .bind(childId)
    .all<User>();
  return result.results;
}
```

- [ ] **Step 1.2 : Vérifier le build TypeScript**

```bash
cd E:/Applications/brickodeurxp
npm run build
```

Résultat attendu : build sans erreur.

- [ ] **Step 1.3 : Commit**

```bash
cd E:/Applications/brickodeurxp
git add src/lib/server/db.ts
git commit -m "feat: helpers D1 getChildrenByParent et getParentsByChild"
```

---

## Task 2 : Portail parent (vue lecture seule)

**Files:**
- Create: `src/routes/parent/+layout.server.ts`
- Create: `src/routes/parent/enfant/+page.server.ts`
- Create: `src/routes/parent/enfant/+page.svelte`

- [ ] **Step 2.1 : Créer `src/routes/parent/+layout.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.session) redirect(303, '/auth/login');
  if (locals.session.user.role !== 'parent') redirect(303, '/');
  return { user: locals.session.user };
};
```

- [ ] **Step 2.2 : Créer `src/routes/parent/enfant/+page.server.ts`**

```typescript
import type { PageServerLoad } from './$types';
import { getChildrenByParent, getAllDomains, getSkillsByDomain, getBadgesByJeune, getBadgeRequestsByJeune } from '$lib/server/db';
import { calculateLevel, LEVEL_COLORS } from '$lib/utils/level';
import type { Level } from '$lib/utils/level';

type SkillRow = {
  id: string;
  title: string;
  description: string;
  hasBadge: boolean;
  pendingRequest: boolean;
};

type DomainRow = {
  domain: { id: string; name: string; color: string; icon: string };
  skills: SkillRow[];
  badgeCount: number;
  level: Level | null;
  levelColor: string;
};

type ChildPasseport = {
  enfant: { prenom: string; nom: string };
  passeport: DomainRow[];
};

export const load: PageServerLoad = async ({ locals, platform }) => {
  const db = platform!.env.DB;
  const parentId = locals.session!.user.id;

  const children = await getChildrenByParent(db, parentId);
  const domains = await getAllDomains(db);

  const childrenPasseports: ChildPasseport[] = [];

  for (const child of children) {
    const [badges, requests] = await Promise.all([
      getBadgesByJeune(db, child.id),
      getBadgeRequestsByJeune(db, child.id),
    ]);

    const badgeSkillIds = new Set(badges.map((b) => b.skill_id));
    const pendingSkillIds = new Set(
      requests.filter((r) => r.status === 'pending').map((r) => r.skill_id)
    );

    const passeport: DomainRow[] = [];

    for (const domain of domains) {
      const skills = await getSkillsByDomain(db, domain.id);
      const domainBadgeCount = badges.filter((b) =>
        skills.some((s) => s.id === b.skill_id)
      ).length;
      const level = calculateLevel(domainBadgeCount);

      passeport.push({
        domain,
        skills: skills.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          hasBadge: badgeSkillIds.has(s.id),
          pendingRequest: pendingSkillIds.has(s.id),
        })),
        badgeCount: domainBadgeCount,
        level,
        levelColor: level ? LEVEL_COLORS[level] : '#374151',
      });
    }

    childrenPasseports.push({
      enfant: { prenom: child.prenom, nom: child.nom },
      passeport,
    });
  }

  return { childrenPasseports, user: locals.session!.user };
};
```

- [ ] **Step 2.3 : Créer `src/routes/parent/enfant/+page.svelte`**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  let { data } = $props<{ data: PageData }>();
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-2">Suivi de progression</h1>
  <p class="text-sm text-gray-400 mb-8">
    Bonjour {data.user.prenom} ! Voici la progression de vos enfants.
  </p>

  {#if data.childrenPasseports.length === 0}
    <div class="text-center py-16 text-gray-600">
      <p class="text-4xl mb-3">👶</p>
      <p>Aucun enfant lié à votre compte pour le moment.</p>
      <p class="text-sm mt-2">Demandez à votre enfant de s'inscrire sur Brickodeurs.</p>
    </div>
  {:else}
    {#each data.childrenPasseports as cp}
      <div class="mb-10">
        <h2 class="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">
          {cp.enfant.prenom} {cp.enfant.nom}
        </h2>

        {#each cp.passeport as dp}
          <div class="mb-6 bg-gray-900 rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="w-4 h-4 rounded-full" style="background:{dp.domain.color}"></span>
                <h3 class="font-bold">{dp.domain.name}</h3>
              </div>
              <div class="flex items-center gap-2">
                {#if dp.level}
                  <span
                    class="text-xs font-bold px-3 py-1 rounded-full"
                    style="background:{dp.levelColor}; color:{dp.level === 'blanc' ? '#333' : '#fff'}"
                  >
                    {dp.level.toUpperCase()}
                  </span>
                {/if}
                <span class="text-xs text-gray-500">{dp.badgeCount}/5 badges</span>
              </div>
            </div>

            <div class="w-full bg-gray-800 rounded-full h-2 mb-3">
              <div
                class="h-2 rounded-full transition-all"
                style="width:{Math.min(dp.badgeCount / 5 * 100, 100)}%; background:{dp.domain.color}"
              ></div>
            </div>

            <div class="space-y-1">
              {#each dp.skills as skill}
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg {skill.hasBadge ? 'bg-gray-800/50' : 'bg-gray-800/20'}">
                  {#if skill.hasBadge}
                    <span class="text-green-400 text-sm">✓</span>
                  {:else if skill.pendingRequest}
                    <span class="text-yellow-400 text-sm">⏳</span>
                  {:else}
                    <span class="text-gray-600 text-sm">○</span>
                  {/if}
                  <span class="text-sm {skill.hasBadge ? 'text-gray-200' : 'text-gray-500'}">{skill.title}</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  {/if}
</div>
```

- [ ] **Step 2.4 : Vérifier le build**

```bash
cd E:/Applications/brickodeurxp
npm run build
```

Résultat attendu : build sans erreur TypeScript.

- [ ] **Step 2.5 : Commit**

```bash
cd E:/Applications/brickodeurxp
git add src/routes/parent/
git commit -m "feat: portail parent — vue lecture seule des passeports enfants"
```

---

## Task 3 : Helper email Resend + env RESEND_FROM

**Files:**
- Modify: `src/app.d.ts`
- Create: `src/lib/server/email.ts`

- [ ] **Step 3.1 : Ajouter `RESEND_FROM` à `src/app.d.ts`**

Dans `src/app.d.ts`, dans le bloc `interface Platform { env: { ... } }`, ajouter la ligne `RESEND_FROM?: string;` après `RESEND_API_KEY: string;`.
RESEND_API_KEY=re_We8J3fF1_b3d6GHnQTsFHAuNxiNX5dMyA

Le bloc Platform complet après modification :

```typescript
interface Platform {
  env: {
    DB: D1Database;
    R2: R2Bucket;
    RESEND_API_KEY: string;
    RESEND_FROM?: string;
    APP_URL: string;
  };
}
```

- [ ] **Step 3.2 : Créer `src/lib/server/email.ts`**

```typescript
type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
};

async function sendEmail(apiKey: string, payload: ResendPayload): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error ${response.status}: ${text}`);
  }
}

export async function sendInvitationEmail(
  apiKey: string,
  from: string,
  parentEmail: string,
  jeunePrenom: string,
  inviteLink: string
): Promise<void> {
  await sendEmail(apiKey, {
    from,
    to: [parentEmail],
    subject: `${jeunePrenom} vient de rejoindre Brickodeurs !`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#f97316">Brickodeurs</h2>
        <p>Bonjour,</p>
        <p><strong>${jeunePrenom}</strong> vient de créer son compte sur le passeport numérique Brickodeurs.</p>
        <p>Créez votre compte parent pour suivre sa progression :</p>
        <p style="text-align:center;margin:32px 0">
          <a href="${inviteLink}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Créer mon compte parent
          </a>
        </p>
        <p style="color:#9ca3af;font-size:12px">Ce lien est valable 7 jours.</p>
      </div>
    `,
  });
}

export async function sendBadgeAwardedEmail(
  apiKey: string,
  from: string,
  parentEmail: string,
  jeunePrenom: string,
  jeuneNom: string
): Promise<void> {
  await sendEmail(apiKey, {
    from,
    to: [parentEmail],
    subject: `${jeunePrenom} a obtenu un nouveau badge Brickodeurs !`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#f97316">Brickodeurs</h2>
        <p>Bonjour,</p>
        <p>Bonne nouvelle ! <strong>${jeunePrenom} ${jeuneNom}</strong> vient d'obtenir un nouveau badge validé par un animateur.</p>
        <p>Connectez-vous pour voir sa progression.</p>
        <p style="color:#9ca3af;font-size:12px">L'équipe Brickodeurs</p>
      </div>
    `,
  });
}
```

- [ ] **Step 3.3 : Vérifier le build TypeScript**

```bash
cd E:/Applications/brickodeurxp
npm run build
```

Résultat attendu : build sans erreur.

- [ ] **Step 3.4 : Commit**

```bash
cd E:/Applications/brickodeurxp
git add src/app.d.ts src/lib/server/email.ts
git commit -m "feat: helper email Resend (invitation + badge)"
```

---

## Task 4 : Email invitation parent lors de l'inscription

**Files:**
- Modify: `src/routes/auth/register/+page.server.ts`

- [ ] **Step 4.1 : Réécrire `src/routes/auth/register/+page.server.ts`**

Voici le fichier complet (ajouter l'import `sendInvitationEmail` et remplacer le `console.log`) :

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { hashPassword, createSession } from '$lib/server/auth';
import { getUserByEmail, createParentInvitation } from '$lib/server/db';
import { sendInvitationEmail } from '$lib/server/email';

export const actions: Actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const password = String(data.get('password') ?? '');
    const nom = String(data.get('nom') ?? '').trim();
    const prenom = String(data.get('prenom') ?? '').trim();
    const parent_email = String(data.get('parent_email') ?? '').trim().toLowerCase();

    if (!email || !password || !nom || !prenom || !parent_email) {
      return fail(400, { error: 'Tous les champs sont requis.' });
    }
    if (password.length < 8) {
      return fail(400, { error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const db = platform!.env.DB;
    const existing = await getUserByEmail(db, email);
    if (existing) {
      return fail(400, { error: 'Cet email est déjà utilisé.' });
    }

    const password_hash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db
      .prepare(
        'INSERT INTO users (id, email, password_hash, role, nom, prenom) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, email, password_hash, 'jeune', nom, prenom)
      .run();

    // Créer l'invitation parent et envoyer l'email
    const inviteToken = await createParentInvitation(db, parent_email, userId);
    const appUrl = platform!.env.APP_URL ?? 'http://localhost:5173';
    const inviteLink = `${appUrl}/auth/magic?token=${inviteToken}`;
    const from = platform!.env.RESEND_FROM ?? 'onboarding@resend.dev';
    try {
      await sendInvitationEmail(platform!.env.RESEND_API_KEY, from, parent_email, prenom, inviteLink);
    } catch (err) {
      console.error('[Email] Erreur envoi invitation parent:', err);
    }

    const session = await createSession(db, userId);
    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(303, '/jeune/passeport');
  },
};
```

- [ ] **Step 4.2 : Vérifier le build**

```bash
cd E:/Applications/brickodeurxp
npm run build
```

Résultat attendu : build sans erreur.

- [ ] **Step 4.3 : Commit**

```bash
cd E:/Applications/brickodeurxp
git add src/routes/auth/register/+page.server.ts
git commit -m "feat: envoi email invitation parent lors de l'inscription"
```

---

## Task 5 : Email notification badge validé

**Files:**
- Modify: `src/routes/animateur/validations/+page.server.ts`

- [ ] **Step 5.1 : Réécrire `src/routes/animateur/validations/+page.server.ts`**

Voici le fichier complet. L'action `approve` envoie un email non-bloquant aux parents après validation :

```typescript
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPendingRequests, approveRequest, rejectRequest, getUserById, getParentsByChild } from '$lib/server/db';
import { sendBadgeAwardedEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ platform }) => {
  const requests = await getPendingRequests(platform!.env.DB);
  return { requests };
};

export const actions: Actions = {
  approve: async ({ request, locals, platform }) => {
    const data = await request.formData();
    const request_id = String(data.get('request_id') ?? '');
    const comment = String(data.get('comment') ?? '');

    if (!request_id) return fail(400, { error: 'ID de demande manquant.' });

    try {
      const badge = await approveRequest(
        platform!.env.DB,
        request_id,
        locals.session!.user.id,
        comment
      );

      // Notifier les parents (non-bloquant — une erreur email ne doit pas faire échouer la validation)
      try {
        const [jeune, parents] = await Promise.all([
          getUserById(platform!.env.DB, badge.jeune_id),
          getParentsByChild(platform!.env.DB, badge.jeune_id),
        ]);
        if (jeune && parents.length > 0) {
          const from = platform!.env.RESEND_FROM ?? 'onboarding@resend.dev';
          await Promise.all(
            parents.map((p) =>
              sendBadgeAwardedEmail(platform!.env.RESEND_API_KEY, from, p.email, jeune.prenom, jeune.nom)
            )
          );
        }
      } catch (emailErr) {
        console.error('[Email] Erreur notification badge:', emailErr);
      }

      return { success: true, badge_id: badge.id, approved_request_id: request_id };
    } catch (e) {
      return fail(400, { error: e instanceof Error ? e.message : 'Erreur lors de la validation.' });
    }
  },

  reject: async ({ request, locals, platform }) => {
    const data = await request.formData();
    const request_id = String(data.get('request_id') ?? '');
    const comment = String(data.get('comment') ?? '');

    if (!request_id) return fail(400, { error: 'ID de demande manquant.' });
    if (!comment.trim()) return fail(400, { error: 'Un commentaire est requis pour un refus.' });

    try {
      await rejectRequest(
        platform!.env.DB,
        request_id,
        locals.session!.user.id,
        comment
      );
      return { rejected: true };
    } catch (e) {
      return fail(400, { error: e instanceof Error ? e.message : 'Erreur lors du refus.' });
    }
  },
};
```

- [ ] **Step 5.2 : Vérifier le build et les tests**

```bash
cd E:/Applications/brickodeurxp
npm run build && npm test
```

Résultat attendu : build sans erreur, 19/19 tests PASS.

- [ ] **Step 5.3 : Commit**

```bash
cd E:/Applications/brickodeurxp
git add src/routes/animateur/validations/+page.server.ts
git commit -m "feat: notification email aux parents lors de la validation d'un badge"
```

---

## Task 6 : Configuration PWA

**Files:**
- Create: `static/icons/icon.svg`
- Create: `static/manifest.json`
- Create: `static/sw.js`
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 6.1 : Créer `static/icons/icon.svg`**

```svg
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#111827"/>
  <polygon points="256,48 441,154 441,358 256,464 71,358 71,154" fill="#f97316"/>
  <text x="256" y="300" font-family="sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="#fff">B</text>
</svg>
```

- [ ] **Step 6.2 : Créer `static/manifest.json`**

```json
{
  "name": "Passeport Brickodeurs",
  "short_name": "Brickodeurs",
  "description": "Passeport numérique de compétences pour le club Brickodeurs",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#030712",
  "theme_color": "#f97316",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 6.3 : Créer `static/sw.js`**

```javascript
const CACHE_NAME = 'brickodeurs-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

- [ ] **Step 6.4 : Modifier `src/routes/+layout.svelte`**

Voici le fichier complet après modification (ajout de `<svelte:head>` et de l'enregistrement SW) :

```svelte
<script lang="ts">
  import '../app.css';
  import type { LayoutData } from './$types';
  import { onMount } from 'svelte';

  let { data, children } = $props();

  onMount(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('[SW] Erreur d\'enregistrement:', err);
      });
    }
  });
</script>

<svelte:head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#f97316" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="apple-touch-icon" href="/icons/icon.svg" />
</svelte:head>

<div class="min-h-screen bg-gray-950 text-gray-100">
  {#if data.session}
    <nav class="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <span class="font-bold text-orange-400">Brickodeurs</span>
      <div class="flex items-center gap-4 text-sm">
        <span class="text-gray-400">{data.session.user.prenom} {data.session.user.nom}</span>
        <form method="POST" action="/auth/logout">
          <button class="text-gray-500 hover:text-gray-300">Déconnexion</button>
        </form>
      </div>
    </nav>
  {/if}
  <main class="p-4">
    {@render children()}
  </main>
</div>
```

- [ ] **Step 6.5 : Vérifier le build et les tests**

```bash
cd E:/Applications/brickodeurxp
npm run build && npm test
```

Résultat attendu : build sans erreur, 19/19 tests PASS.

- [ ] **Step 6.6 : Commit**

```bash
cd E:/Applications/brickodeurxp
git add static/ src/routes/+layout.svelte
git commit -m "feat: configuration PWA (manifest, icône, service worker)"
```

---

## Vérification finale du Plan 3

- [ ] **E2E 1 :** Inscription jeune → email reçu par le parent (ou log console si RESEND_API_KEY non configuré)
- [ ] **E2E 2 :** Parent clique le lien d'invitation → crée son compte → redirigé vers `/parent/enfant`
- [ ] **E2E 3 :** Parent voit le passeport en lecture seule (aucun bouton "Soumettre" ni lien de demande)
- [ ] **E2E 4 :** Animateur valide un badge → email reçu par les parents du jeune
- [ ] **E2E 5 :** Sur mobile Chrome → bannière "Ajouter à l'écran d'accueil" apparaît
- [ ] **Tests :** `npm test` → 19/19 PASS

```bash
cd E:/Applications/brickodeurxp
npm test && npm run build
```

---

## Prochaine étape

**→ Plan 4 (optionnel) :** Cache PWA offline-first, notifications push, tableau de bord admin enrichi (statistiques par domaine), export CSV des passeports, page de profil jeune.
