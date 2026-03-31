# Brickodeurs — Plan 1 : Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en place la base complète : SvelteKit + Cloudflare, schéma D1, authentification (email/password pour jeunes/animateurs/admin, magic link pour parents), et panneau admin pour gérer le référentiel de compétences (domaines + compétences).

**Architecture:** SvelteKit full-stack avec adaptateur Cloudflare. L'API est composée de SvelteKit server routes et de form actions. better-auth gère les sessions et le magic link. Les tables D1 sont créées via des migrations SQL Wrangler.

**Tech Stack:** SvelteKit 2, `@sveltejs/adapter-cloudflare`, TailwindCSS 4 (`@tailwindcss/vite`), `bcryptjs`, Cloudflare D1, Vitest, Wrangler CLI

---

## Structure des fichiers

```
brickodeurxp/
├── src/
│   ├── app.d.ts                          # Types Platform (D1, R2, secrets)
│   ├── app.html
│   ├── app.css                           # Tailwind base
│   ├── hooks.server.ts                   # Session auth sur chaque requête
│   ├── lib/
│   │   ├── server/
│   │   │   ├── auth.ts                   # Création instance better-auth
│   │   │   └── db.ts                     # Helper requêtes D1
│   │   ├── components/
│   │   │   ├── Nav.svelte                # Navigation par rôle
│   │   │   └── FormError.svelte          # Affichage erreurs formulaire
│   │   └── utils/
│   │       └── level.ts                  # Calcul niveau ceinture (pur, testable)
│   └── routes/
│       ├── +layout.svelte                # Layout global + nav
│       ├── +layout.server.ts             # Chargement session
│       ├── +page.svelte                  # Redirection selon rôle
│       ├── api/
│       │   └── auth/
│       │       └── [...all]/
│       │           └── +server.ts        # Handler better-auth (GET + POST)
│       ├── auth/
│       │   ├── login/
│       │   │   ├── +page.svelte          # Formulaire connexion
│       │   │   └── +page.server.ts       # Action login
│       │   ├── register/
│       │   │   ├── +page.svelte          # Formulaire inscription jeune
│       │   │   └── +page.server.ts       # Action register + invitation parent
│       │   └── magic/
│       │       ├── +page.svelte          # Activation magic link parent
│       │       └── +page.server.ts       # Validation token + création compte
│       └── admin/
│           ├── +layout.svelte            # Guard rôle admin
│           ├── +layout.server.ts         # Vérif rôle admin
│           ├── competences/
│           │   ├── +page.svelte          # Liste domaines + compétences
│           │   └── +page.server.ts       # CRUD domaines + skills
│           └── animateurs/
│               ├── +page.svelte          # Liste animateurs
│               └── +page.server.ts       # Création compte animateur
├── migrations/
│   ├── 0001_schema.sql                   # Toutes les tables
│   └── 0002_seed.sql                     # Domaines Brick + Codeur
├── tests/
│   └── level.test.ts                     # Tests calcul niveau ceinture
├── svelte.config.ts
├── vite.config.ts
├── wrangler.toml
├── tailwind.config.ts                    # (minimal avec TW4)
└── package.json
```

---

## Task 1 : Scaffolding du projet

**Files:**
- Create: `package.json`, `svelte.config.ts`, `vite.config.ts`, `wrangler.toml`, `src/app.d.ts`, `src/app.html`, `src/app.css`

- [ ] **Step 1.1 : Créer le projet SvelteKit**

```bash
cd E:/Applications/brickodeurxp
npm create svelte@latest . -- --template skeleton --types typescript
```

Répondre aux prompts : ✓ TypeScript, ✗ ESLint, ✗ Prettier, ✗ Playwright, ✓ Vitest

- [ ] **Step 1.2 : Installer les dépendances**

```bash
npm install
npm install -D @sveltejs/adapter-cloudflare @cloudflare/workers-types
npm install -D @tailwindcss/vite tailwindcss
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 1.3 : Configurer l'adaptateur Cloudflare**

Remplacer `svelte.config.ts` :

```typescript
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { Config } from '@sveltejs/kit';

const config: Config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      routes: { include: ['/*'], exclude: ['<all>'] }
    })
  }
};

export default config;
```

- [ ] **Step 1.4 : Configurer Vite avec Tailwind et Vitest**

Remplacer `vite.config.ts` :

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node'
  }
});
```

- [ ] **Step 1.5 : Créer `wrangler.toml`**

```toml
name = "brickodeurxp"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".svelte-kit/cloudflare"

[[d1_databases]]
binding = "DB"
database_name = "brickodeurxp"
database_id = "placeholder"

[[r2_buckets]]
binding = "R2"
bucket_name = "brickodeurxp-proofs"

[vars]
APP_URL = "http://localhost:5173"
```

- [ ] **Step 1.6 : Créer `src/app.d.ts`**

```typescript
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
  namespace App {
    interface Locals {
      session: {
        user: {
          id: string;
          email: string;
          role: string;
          nom: string;
          prenom: string;
        };
      } | null;
    }
    interface Platform {
      env: {
        DB: D1Database;
        R2: R2Bucket;
        RESEND_API_KEY: string;
        BETTER_AUTH_SECRET: string;
        APP_URL: string;
      };
    }
  }
}

export {};
```

- [ ] **Step 1.7 : Configurer Tailwind dans `src/app.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 1.8 : Mettre à jour `src/app.html`**

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 1.9 : Vérifier que le projet compile**

```bash
npm run build
```

Résultat attendu : build réussi sans erreur.

- [ ] **Step 1.10 : Commit**

```bash
git init
git add .
git commit -m "feat: scaffolding SvelteKit + Cloudflare + Tailwind"
```

---

## Task 2 : Schéma de base de données D1

**Files:**
- Create: `migrations/0001_schema.sql`, `migrations/0002_seed.sql`
- Create: `src/lib/server/db.ts`

- [ ] **Step 2.1 : Créer `migrations/0001_schema.sql`**

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'jeune'
    CHECK(role IN ('jeune','animateur','parent','admin')),
  nom TEXT NOT NULL DEFAULT '',
  prenom TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE parent_child (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(parent_id, child_id)
);

CREATE TABLE parent_invitations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  token TEXT UNIQUE NOT NULL,
  parent_email TEXT NOT NULL,
  child_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE domains (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL
);

CREATE TABLE skills (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE badge_requests (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  jeune_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','approved','rejected')),
  proof_url TEXT NOT NULL,
  proof_type TEXT NOT NULL CHECK(proof_type IN ('photo','video')),
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  reviewed_at INTEGER,
  reviewer_id TEXT REFERENCES users(id),
  reviewer_comment TEXT
);

CREATE TABLE badges (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  jeune_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL REFERENCES badge_requests(id) ON DELETE CASCADE,
  awarded_at INTEGER NOT NULL DEFAULT (unixepoch()),
  level TEXT NOT NULL CHECK(level IN ('blanc','jaune','orange','rouge','noir'))
);

CREATE INDEX idx_badge_requests_pending ON badge_requests(status) WHERE status = 'pending';
CREATE INDEX idx_badges_jeune_domain ON badges(jeune_id);
CREATE INDEX idx_skills_domain ON skills(domain_id, active);
```

- [ ] **Step 2.2 : Créer `migrations/0002_seed.sql`**

```sql
INSERT INTO domains (id, name, color, icon) VALUES
  ('dom-brick',   'Brick',  '#f97316', 'brick'),
  ('dom-codeur',  'Codeur', '#6366f1', 'codeur');
```

- [ ] **Step 2.3 : Créer la DB locale et appliquer les migrations**

```bash
npx wrangler d1 create brickodeurxp
# Copier le database_id affiché et le coller dans wrangler.toml

npx wrangler d1 execute brickodeurxp --local --file=migrations/0001_schema.sql
npx wrangler d1 execute brickodeurxp --local --file=migrations/0002_seed.sql
```

Résultat attendu : `Successfully executed` pour chaque migration.

- [ ] **Step 2.4 : Créer `src/lib/server/db.ts`**

```typescript
import type { D1Database } from '@cloudflare/workers-types';

export type User = {
  id: string;
  email: string;
  role: 'jeune' | 'animateur' | 'parent' | 'admin';
  nom: string;
  prenom: string;
  created_at: number;
};

export type Domain = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Skill = {
  id: string;
  domain_id: string;
  title: string;
  description: string;
  sort_order: number;
  active: number;
};

export type Badge = {
  id: string;
  jeune_id: string;
  skill_id: string;
  request_id: string;
  awarded_at: number;
  level: 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';
};

export type BadgeRequest = {
  id: string;
  jeune_id: string;
  skill_id: string;
  status: 'pending' | 'approved' | 'rejected';
  proof_url: string;
  proof_type: 'photo' | 'video';
  submitted_at: number;
  reviewed_at: number | null;
  reviewer_id: string | null;
  reviewer_comment: string | null;
};

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT id, email, role, nom, prenom, created_at FROM users WHERE email = ?')
    .bind(email)
    .first<User>();
  return result ?? null;
}

export async function getUserByEmailWithPassword(
  db: D1Database,
  email: string
): Promise<(User & { password_hash: string | null }) | null> {
  const result = await db
    .prepare('SELECT id, email, password_hash, role, nom, prenom, created_at FROM users WHERE email = ?')
    .bind(email)
    .first<User & { password_hash: string | null }>();
  return result ?? null;
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT id, email, role, nom, prenom, created_at FROM users WHERE id = ?')
    .bind(id)
    .first<User>();
  return result ?? null;
}

export async function getAllDomains(db: D1Database): Promise<Domain[]> {
  const result = await db.prepare('SELECT * FROM domains ORDER BY name').all<Domain>();
  return result.results;
}

export async function getSkillsByDomain(db: D1Database, domainId: string): Promise<Skill[]> {
  const result = await db
    .prepare('SELECT * FROM skills WHERE domain_id = ? AND active = 1 ORDER BY sort_order')
    .bind(domainId)
    .all<Skill>();
  return result.results;
}

export async function getBadgesByJeune(db: D1Database, jeuneId: string): Promise<Badge[]> {
  const result = await db
    .prepare('SELECT * FROM badges WHERE jeune_id = ? ORDER BY awarded_at DESC')
    .bind(jeuneId)
    .all<Badge>();
  return result.results;
}
```

- [ ] **Step 2.5 : Commit**

```bash
git add migrations/ src/lib/server/db.ts
git commit -m "feat: schéma D1 et helpers de base de données"
```

---

## Task 3 : Calcul du niveau de ceinture (TDD)

**Files:**
- Create: `src/lib/utils/level.ts`
- Create: `tests/level.test.ts`

- [ ] **Step 3.1 : Écrire le test**

Créer `tests/level.test.ts` :

```typescript
import { describe, it, expect } from 'vitest';
import { calculateLevel, LEVEL_COLORS } from '$lib/utils/level';

describe('calculateLevel', () => {
  it('retourne null pour 0 badge', () => {
    expect(calculateLevel(0)).toBe(null);
  });

  it('retourne blanc pour 1 badge', () => {
    expect(calculateLevel(1)).toBe('blanc');
  });

  it('retourne jaune pour 2 badges', () => {
    expect(calculateLevel(2)).toBe('jaune');
  });

  it('retourne orange pour 3 badges', () => {
    expect(calculateLevel(3)).toBe('orange');
  });

  it('retourne rouge pour 4 badges', () => {
    expect(calculateLevel(4)).toBe('rouge');
  });

  it('retourne noir pour 5 badges', () => {
    expect(calculateLevel(5)).toBe('noir');
  });

  it('retourne noir pour plus de 5 badges', () => {
    expect(calculateLevel(7)).toBe('noir');
  });
});

describe('LEVEL_COLORS', () => {
  it('contient la couleur hex pour chaque niveau', () => {
    expect(LEVEL_COLORS.blanc).toBe('#ffffff');
    expect(LEVEL_COLORS.jaune).toBe('#ffd700');
    expect(LEVEL_COLORS.orange).toBe('#f97316');
    expect(LEVEL_COLORS.rouge).toBe('#dc2626');
    expect(LEVEL_COLORS.noir).toBe('#111111');
  });
});
```

- [ ] **Step 3.2 : Vérifier que le test échoue**

```bash
npm run test -- tests/level.test.ts
```

Résultat attendu : FAIL — `Cannot find module '$lib/utils/level'`

- [ ] **Step 3.3 : Implémenter `src/lib/utils/level.ts`**

```typescript
export type Level = 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';

export const LEVEL_COLORS: Record<Level, string> = {
  blanc:  '#ffffff',
  jaune:  '#ffd700',
  orange: '#f97316',
  rouge:  '#dc2626',
  noir:   '#111111',
};

const THRESHOLDS: [number, Level][] = [
  [5, 'noir'],
  [4, 'rouge'],
  [3, 'orange'],
  [2, 'jaune'],
  [1, 'blanc'],
];

export function calculateLevel(badgeCount: number): Level | null {
  if (badgeCount <= 0) return null;
  for (const [threshold, level] of THRESHOLDS) {
    if (badgeCount >= threshold) return level;
  }
  return null;
}
```

- [ ] **Step 3.4 : Vérifier que les tests passent**

```bash
npm run test -- tests/level.test.ts
```

Résultat attendu : PASS — 8/8 tests.

- [ ] **Step 3.5 : Commit**

```bash
git add src/lib/utils/level.ts tests/level.test.ts
git commit -m "feat: calcul niveau ceinture avec tests"
```

---

## Task 4 : Authentification avec better-auth

**Files:**
- Create: `src/lib/server/auth.ts`
- Create: `src/routes/api/auth/[...all]/+server.ts`
- Create: `src/hooks.server.ts`
- Create: `src/routes/+layout.server.ts`

- [ ] **Step 4.1 : Installer la dépendance bcrypt**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 4.2 : Créer `src/lib/server/auth.ts`**

```typescript
import bcrypt from 'bcryptjs';
import type { D1Database } from '@cloudflare/workers-types';
import { getUserByEmail, getUserById } from './db';

export type Session = {
  user: {
    id: string;
    email: string;
    role: string;
    nom: string;
    prenom: string;
  };
  token: string;
  expires_at: number;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(db: D1Database, userId: string): Promise<Session> {
  const user = await getUserById(db, userId);
  if (!user) throw new Error('Utilisateur introuvable');

  const token = crypto.randomUUID();
  const expires_at = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 jours

  await db
    .prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (lower(hex(randomblob(16))), ?, ?, ?)'
    )
    .bind(userId, token, expires_at)
    .run();

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
    },
    token,
    expires_at,
  };
}

export async function getSessionFromToken(db: D1Database, token: string): Promise<Session | null> {
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare(`
      SELECT s.token, s.expires_at, u.id, u.email, u.role, u.nom, u.prenom
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ?
    `)
    .bind(token, now)
    .first<{
      token: string; expires_at: number;
      id: string; email: string; role: string; nom: string; prenom: string;
    }>();

  if (!row) return null;

  return {
    user: { id: row.id, email: row.email, role: row.role, nom: row.nom, prenom: row.prenom },
    token: row.token,
    expires_at: row.expires_at,
  };
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}
```

- [ ] **Step 4.3 : Ajouter la table sessions à la migration**

Ajouter à la fin de `migrations/0001_schema.sql` :

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL
);
```

Appliquer localement :

```bash
npx wrangler d1 execute brickodeurxp --local --command="CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))), user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, token TEXT UNIQUE NOT NULL, expires_at INTEGER NOT NULL);"
```

- [ ] **Step 4.4 : Créer `src/hooks.server.ts`**

```typescript
import type { Handle } from '@sveltejs/kit';
import { getSessionFromToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');

  if (token && event.platform?.env.DB) {
    const session = await getSessionFromToken(event.platform.env.DB, token);
    event.locals.session = session;
  } else {
    event.locals.session = null;
  }

  return resolve(event);
};
```

- [ ] **Step 4.5 : Créer `src/routes/+layout.server.ts`**

```typescript
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return { session: locals.session };
};
```

- [ ] **Step 4.6 : Créer `src/routes/+layout.svelte`**

```svelte
<script lang="ts">
  import '../app.css';
  import type { LayoutData } from './$types';

  let { data, children } = $props();
</script>

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

- [ ] **Step 4.7 : Créer `src/routes/+page.svelte`** (redirection selon rôle)

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data } = $props();

  $effect(() => {
    if (!data.session) {
      goto('/auth/login');
    } else {
      const role = data.session.user.role;
      if (role === 'jeune')      goto('/jeune/passeport');
      else if (role === 'animateur') goto('/animateur/validations');
      else if (role === 'parent')    goto('/parent/enfant');
      else if (role === 'admin')     goto('/admin/competences');
    }
  });
</script>
```

- [ ] **Step 4.8 : Créer la page de connexion `src/routes/auth/login/+page.server.ts`**

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getUserByEmail } from '$lib/server/db';
import { verifyPassword, createSession } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const password = String(data.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'Email et mot de passe requis.' });
    }

    const db = platform!.env.DB;
    const user = await getUserByEmailWithPassword(db, email);

    if (!user || !user.password_hash) {
      return fail(401, { error: 'Email ou mot de passe incorrect.' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return fail(401, { error: 'Email ou mot de passe incorrect.' });
    }

    const session = await createSession(db, user.id);

    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(303, '/');
  },
};
```

- [ ] **Step 4.9 : Créer `src/routes/auth/login/+page.svelte`**

```svelte
<script lang="ts">
  import type { ActionData } from './$types';
  let { form } = $props<{ form: ActionData }>();
</script>

<div class="max-w-md mx-auto mt-16 p-6 bg-gray-900 rounded-xl">
  <h1 class="text-2xl font-bold text-orange-400 mb-6">Connexion Brickodeurs</h1>

  {#if form?.error}
    <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
  {/if}

  <form method="POST" class="flex flex-col gap-4">
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="email">Email</label>
      <input
        id="email" name="email" type="email" required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="password">Mot de passe</label>
      <input
        id="password" name="password" type="password" required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <button
      type="submit"
      class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded-lg transition-colors"
    >
      Se connecter
    </button>
    <p class="text-sm text-gray-500 text-center">
      Pas encore de compte ?
      <a href="/auth/register" class="text-orange-400 hover:underline">S'inscrire</a>
    </p>
  </form>
</div>
```

- [ ] **Step 4.10 : Créer la route de déconnexion `src/routes/auth/logout/+page.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteSession } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ cookies, platform }) => {
    const token = cookies.get('session');
    if (token && platform?.env.DB) {
      await deleteSession(platform.env.DB, token);
    }
    cookies.delete('session', { path: '/' });
    redirect(303, '/auth/login');
  },
};
```

- [ ] **Step 4.11 : Tester la connexion en local**

```bash
npx wrangler pages dev --d1 DB=brickodeurxp -- npm run dev
```

Créer un utilisateur de test manuellement :

```bash
npx wrangler d1 execute brickodeurxp --local --command="INSERT INTO users (email, password_hash, role, nom, prenom) VALUES ('admin@test.com', '\$2a\$12\$placeholder', 'admin', 'Admin', 'Test');"
```

Vérifier que la page `/auth/login` s'affiche sans erreur.

- [ ] **Step 4.12 : Commit**

```bash
git add src/ migrations/
git commit -m "feat: authentification email/password avec sessions D1"
```

---

## Task 5 : Inscription d'un jeune + invitation parent

**Files:**
- Create: `src/routes/auth/register/+page.svelte`
- Create: `src/routes/auth/register/+page.server.ts`
- Create: `src/routes/auth/magic/+page.svelte`
- Create: `src/routes/auth/magic/+page.server.ts`
- Modify: `src/lib/server/db.ts` (ajout helpers invitations)

- [ ] **Step 5.1 : Ajouter les helpers d'invitation dans `src/lib/server/db.ts`**

Ajouter à la fin du fichier :

```typescript
export async function createParentInvitation(
  db: D1Database,
  parentEmail: string,
  childId: string
): Promise<string> {
  const token = crypto.randomUUID();
  const expires_at = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 jours

  await db
    .prepare(
      'INSERT INTO parent_invitations (token, parent_email, child_id, expires_at) VALUES (?, ?, ?, ?)'
    )
    .bind(token, parentEmail, childId, expires_at)
    .run();

  return token;
}

export async function getValidInvitation(
  db: D1Database,
  token: string
): Promise<{ parent_email: string; child_id: string } | null> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(
      'SELECT parent_email, child_id FROM parent_invitations WHERE token = ? AND expires_at > ? AND used = 0'
    )
    .bind(token, now)
    .first<{ parent_email: string; child_id: string }>();
  return result ?? null;
}

export async function markInvitationUsed(db: D1Database, token: string): Promise<void> {
  await db
    .prepare('UPDATE parent_invitations SET used = 1 WHERE token = ?')
    .bind(token)
    .run();
}

export async function linkParentChild(
  db: D1Database,
  parentId: string,
  childId: string
): Promise<void> {
  await db
    .prepare(
      'INSERT OR IGNORE INTO parent_child (parent_id, child_id) VALUES (?, ?)'
    )
    .bind(parentId, childId)
    .run();
}
```

- [ ] **Step 5.2 : Créer `src/routes/auth/register/+page.server.ts`**

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { hashPassword, createSession } from '$lib/server/auth';
import { getUserByEmail, createParentInvitation } from '$lib/server/db';

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

    // Créer l'invitation pour le parent
    const inviteToken = await createParentInvitation(db, parent_email, userId);

    // TODO Plan 3 : envoyer l'email d'invitation via Resend
    // Pour l'instant, logguer le lien en développement
    const appUrl = platform!.env.APP_URL ?? 'http://localhost:5173';
    console.log(`[DEV] Lien invitation parent: ${appUrl}/auth/magic?token=${inviteToken}`);

    const session = await createSession(db, userId);
    cookies.set('session', session.token, {
      path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30,
    });

    redirect(303, '/jeune/passeport');
  },
};
```

- [ ] **Step 5.3 : Créer `src/routes/auth/register/+page.svelte`**

```svelte
<script lang="ts">
  import type { ActionData } from './$types';
  let { form } = $props<{ form: ActionData }>();
</script>

<div class="max-w-md mx-auto mt-12 p-6 bg-gray-900 rounded-xl">
  <h1 class="text-2xl font-bold text-orange-400 mb-2">Rejoindre les Brickodeurs</h1>
  <p class="text-sm text-gray-400 mb-6">Crée ton compte pour obtenir tes badges.</p>

  {#if form?.error}
    <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
  {/if}

  <form method="POST" class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm text-gray-400 mb-1" for="prenom">Prénom</label>
        <input id="prenom" name="prenom" type="text" required
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1" for="nom">Nom</label>
        <input id="nom" name="nom" type="text" required
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      </div>
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="email">Ton email</label>
      <input id="email" name="email" type="email" required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="password">Mot de passe</label>
      <input id="password" name="password" type="password" required minlength="8"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="parent_email">Email de ton parent</label>
      <input id="parent_email" name="parent_email" type="email" required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      <p class="text-xs text-gray-500 mt-1">Ton parent recevra un lien pour créer son compte.</p>
    </div>
    <button type="submit"
      class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded-lg transition-colors">
      Créer mon compte
    </button>
    <p class="text-sm text-gray-500 text-center">
      Déjà inscrit ? <a href="/auth/login" class="text-orange-400 hover:underline">Se connecter</a>
    </p>
  </form>
</div>
```

- [ ] **Step 5.4 : Créer `src/routes/auth/magic/+page.server.ts`**

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hashPassword, createSession } from '$lib/server/auth';
import { getValidInvitation, markInvitationUsed, linkParentChild, getUserByEmail } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, platform }) => {
  const token = url.searchParams.get('token');
  if (!token) return { error: 'Lien invalide.' };

  const invitation = await getValidInvitation(platform!.env.DB, token);
  if (!invitation) return { error: 'Ce lien est invalide ou a expiré.' };

  return { token, parent_email: invitation.parent_email };
};

export const actions: Actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    const token = String(data.get('token') ?? '');
    const password = String(data.get('password') ?? '');
    const nom = String(data.get('nom') ?? '').trim();
    const prenom = String(data.get('prenom') ?? '').trim();

    if (!token || !password || !nom || !prenom) {
      return fail(400, { error: 'Tous les champs sont requis.' });
    }

    const db = platform!.env.DB;
    const invitation = await getValidInvitation(db, token);
    if (!invitation) {
      return fail(400, { error: 'Ce lien est invalide ou a expiré.' });
    }

    const existing = await getUserByEmail(db, invitation.parent_email);
    if (existing) {
      return fail(400, { error: 'Un compte existe déjà avec cet email.' });
    }

    const password_hash = await hashPassword(password);
    const parentId = crypto.randomUUID();

    await db
      .prepare('INSERT INTO users (id, email, password_hash, role, nom, prenom) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(parentId, invitation.parent_email, password_hash, 'parent', nom, prenom)
      .run();

    await linkParentChild(db, parentId, invitation.child_id);
    await markInvitationUsed(db, token);

    const session = await createSession(db, parentId);
    cookies.set('session', session.token, {
      path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30,
    });

    redirect(303, '/parent/enfant');
  },
};
```

- [ ] **Step 5.5 : Créer `src/routes/auth/magic/+page.svelte`**

```svelte
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="max-w-md mx-auto mt-16 p-6 bg-gray-900 rounded-xl">
  {#if data.error}
    <p class="text-red-400">{data.error}</p>
  {:else}
    <h1 class="text-2xl font-bold text-orange-400 mb-2">Créer votre compte parent</h1>
    <p class="text-sm text-gray-400 mb-6">Compte lié à : <strong>{data.parent_email}</strong></p>

    {#if form?.error}
      <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
    {/if}

    <form method="POST" class="flex flex-col gap-4">
      <input type="hidden" name="token" value={data.token} />
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm text-gray-400 mb-1" for="prenom">Prénom</label>
          <input id="prenom" name="prenom" type="text" required
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1" for="nom">Nom</label>
          <input id="nom" name="nom" type="text" required
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
        </div>
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1" for="password">Choisissez un mot de passe</label>
        <input id="password" name="password" type="password" required minlength="8"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      </div>
      <button type="submit"
        class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded-lg transition-colors">
        Créer mon compte
      </button>
    </form>
  {/if}
</div>
```

- [ ] **Step 5.6 : Tester le flux d'inscription en local**

```bash
npx wrangler pages dev --d1 DB=brickodeurxp -- npm run dev
```

1. Aller sur `http://localhost:5173/auth/register`
2. Remplir le formulaire avec un email jeune + email parent fictif
3. Vérifier dans les logs le lien d'invitation parent
4. Ouvrir le lien → vérifier que la page de création compte parent s'affiche

- [ ] **Step 5.7 : Commit**

```bash
git add src/
git commit -m "feat: inscription jeune + invitation parent par lien magique"
```

---

## Task 6 : Panneau Admin — Référentiel de compétences

**Files:**
- Create: `src/routes/admin/+layout.server.ts`
- Create: `src/routes/admin/+layout.svelte`
- Create: `src/routes/admin/competences/+page.server.ts`
- Create: `src/routes/admin/competences/+page.svelte`
- Create: `src/routes/admin/animateurs/+page.server.ts`
- Create: `src/routes/admin/animateurs/+page.svelte`

- [ ] **Step 6.1 : Créer le guard admin `src/routes/admin/+layout.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.session) redirect(303, '/auth/login');
  if (locals.session.user.role !== 'admin') redirect(303, '/');
  return { user: locals.session.user };
};
```

- [ ] **Step 6.2 : Créer `src/routes/admin/+layout.svelte`**

```svelte
<script lang="ts">
  let { children } = $props();
</script>

<div class="max-w-4xl mx-auto">
  <nav class="flex gap-4 mb-6 border-b border-gray-800 pb-3">
    <a href="/admin/competences" class="text-sm text-gray-400 hover:text-orange-400">Compétences</a>
    <a href="/admin/animateurs" class="text-sm text-gray-400 hover:text-orange-400">Animateurs</a>
  </nav>
  {@render children()}
</div>
```

- [ ] **Step 6.3 : Créer `src/routes/admin/competences/+page.server.ts`**

```typescript
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllDomains, getSkillsByDomain } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform!.env.DB;
  const domains = await getAllDomains(db);
  const skillsByDomain: Record<string, Awaited<ReturnType<typeof getSkillsByDomain>>> = {};

  for (const domain of domains) {
    skillsByDomain[domain.id] = await getSkillsByDomain(db, domain.id);
  }

  return { domains, skillsByDomain };
};

export const actions: Actions = {
  addSkill: async ({ request, platform }) => {
    const data = await request.formData();
    const domain_id = String(data.get('domain_id') ?? '');
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    if (!domain_id || !title) {
      return fail(400, { error: 'Domaine et titre requis.' });
    }

    const db = platform!.env.DB;
    const maxOrder = await db
      .prepare('SELECT COALESCE(MAX(sort_order), -1) as max_order FROM skills WHERE domain_id = ?')
      .bind(domain_id)
      .first<{ max_order: number }>();

    await db
      .prepare('INSERT INTO skills (domain_id, title, description, sort_order) VALUES (?, ?, ?, ?)')
      .bind(domain_id, title, description, (maxOrder?.max_order ?? -1) + 1)
      .run();

    return { success: true };
  },

  deleteSkill: async ({ request, platform }) => {
    const data = await request.formData();
    const skill_id = String(data.get('skill_id') ?? '');
    if (!skill_id) return fail(400, { error: 'skill_id requis.' });

    await platform!.env.DB
      .prepare('UPDATE skills SET active = 0 WHERE id = ?')
      .bind(skill_id)
      .run();

    return { success: true };
  },

  toggleSkill: async ({ request, platform }) => {
    const data = await request.formData();
    const skill_id = String(data.get('skill_id') ?? '');
    const active = Number(data.get('active') ?? 0);
    if (!skill_id) return fail(400, { error: 'skill_id requis.' });

    await platform!.env.DB
      .prepare('UPDATE skills SET active = ? WHERE id = ?')
      .bind(active ? 0 : 1, skill_id)
      .run();

    return { success: true };
  },
};
```

- [ ] **Step 6.4 : Créer `src/routes/admin/competences/+page.svelte`**

```svelte
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<h1 class="text-xl font-bold text-orange-400 mb-6">Référentiel de compétences</h1>

{#if form?.error}
  <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
{/if}

{#each data.domains as domain}
  <div class="mb-8">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:{domain.color}"></span>
      {domain.name}
    </h2>

    <div class="space-y-2 mb-4">
      {#each data.skillsByDomain[domain.id] ?? [] as skill}
        <div class="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
          <div>
            <p class="font-medium text-sm">{skill.title}</p>
            {#if skill.description}
              <p class="text-xs text-gray-500 mt-0.5">{skill.description}</p>
            {/if}
          </div>
          <div class="flex gap-2">
            <form method="POST" action="?/toggleSkill">
              <input type="hidden" name="skill_id" value={skill.id} />
              <input type="hidden" name="active" value={skill.active} />
              <button type="submit"
                class="text-xs px-2 py-1 rounded {skill.active ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}">
                {skill.active ? 'Actif' : 'Inactif'}
              </button>
            </form>
            <form method="POST" action="?/deleteSkill">
              <input type="hidden" name="skill_id" value={skill.id} />
              <button type="submit"
                class="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/60"
                onclick="return confirm('Désactiver cette compétence ?')">
                Supprimer
              </button>
            </form>
          </div>
        </div>
      {/each}
    </div>

    <!-- Formulaire ajout compétence -->
    <form method="POST" action="?/addSkill" class="flex gap-2">
      <input type="hidden" name="domain_id" value={domain.id} />
      <input name="title" type="text" placeholder="Titre de la compétence" required
        class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      <input name="description" type="text" placeholder="Description (optionnel)"
        class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      <button type="submit"
        class="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg">
        + Ajouter
      </button>
    </form>
  </div>
{/each}
```

- [ ] **Step 6.5 : Créer `src/routes/admin/animateurs/+page.server.ts`**

```typescript
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getUserByEmail } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ platform }) => {
  const animateurs = await platform!.env.DB
    .prepare("SELECT id, email, nom, prenom, created_at FROM users WHERE role = 'animateur' ORDER BY nom")
    .all<{ id: string; email: string; nom: string; prenom: string; created_at: number }>();
  return { animateurs: animateurs.results };
};

export const actions: Actions = {
  createAnimateur: async ({ request, platform }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const nom = String(data.get('nom') ?? '').trim();
    const prenom = String(data.get('prenom') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (!email || !nom || !prenom || !password) {
      return fail(400, { error: 'Tous les champs sont requis.' });
    }

    const db = platform!.env.DB;
    const existing = await getUserByEmail(db, email);
    if (existing) {
      return fail(400, { error: 'Cet email est déjà utilisé.' });
    }

    const password_hash = await hashPassword(password);
    await db
      .prepare('INSERT INTO users (id, email, password_hash, role, nom, prenom) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)')
      .bind(email, password_hash, 'animateur', nom, prenom)
      .run();

    return { success: true };
  },
};
```

- [ ] **Step 6.6 : Créer `src/routes/admin/animateurs/+page.svelte`**

```svelte
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<h1 class="text-xl font-bold text-orange-400 mb-6">Animateurs</h1>

{#if form?.error}
  <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
{/if}
{#if form?.success}
  <p class="mb-4 p-3 bg-green-900/40 text-green-300 rounded-lg text-sm">Animateur créé avec succès.</p>
{/if}

<div class="space-y-2 mb-8">
  {#each data.animateurs as a}
    <div class="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
      <div>
        <p class="font-medium text-sm">{a.prenom} {a.nom}</p>
        <p class="text-xs text-gray-500">{a.email}</p>
      </div>
    </div>
  {:else}
    <p class="text-gray-500 text-sm">Aucun animateur encore.</p>
  {/each}
</div>

<h2 class="text-base font-semibold mb-3 text-gray-300">Créer un compte animateur</h2>
<form method="POST" action="?/createAnimateur" class="grid grid-cols-2 gap-3 max-w-lg">
  <input name="prenom" type="text" placeholder="Prénom" required
    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
  <input name="nom" type="text" placeholder="Nom" required
    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
  <input name="email" type="email" placeholder="Email" required
    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
  <input name="password" type="password" placeholder="Mot de passe temporaire" required
    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
  <button type="submit"
    class="col-span-2 bg-orange-500 hover:bg-orange-400 text-white font-medium py-2 rounded-lg">
    Créer l'animateur
  </button>
</form>
```

- [ ] **Step 6.7 : Tester le panneau admin en local**

```bash
npx wrangler pages dev --d1 DB=brickodeurxp -- npm run dev
```

1. Créer un compte admin en base :

```bash
npx wrangler d1 execute brickodeurxp --local --command="UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';"
```

2. Se connecter avec le compte admin → vérifier la redirection vers `/admin/competences`
3. Ajouter une compétence Brick → vérifier qu'elle apparaît
4. Créer un compte animateur → vérifier qu'il apparaît dans la liste

- [ ] **Step 6.8 : Commit**

```bash
git add src/routes/admin/
git commit -m "feat: panneau admin — CRUD compétences et création animateurs"
```

---

## Vérification finale du Plan 1

Tester les scénarios bout-en-bout :

- [ ] **E2E 1 :** Inscription jeune → lien invitation parent affiché dans les logs → ouverture du lien → création compte parent → liaison visible en base
- [ ] **E2E 2 :** Connexion admin → ajout d'une compétence Brick → ajout d'une compétence Codeur
- [ ] **E2E 3 :** Connexion admin → création d'un compte animateur → connexion avec ce compte animateur → redirection vers `/animateur/validations` (page vide OK à ce stade)
- [ ] **E2E 4 :** Tests unitaires verts : `npm run test`
- [ ] **E2E 5 :** Build de production sans erreur : `npm run build`

```bash
npm run test
npm run build
```

---

## Commit final

```bash
git add .
git commit -m "feat: Plan 1 complet — foundation, auth, admin référentiel"
```

---

## Prochaine étape

**→ Plan 2 :** Passeport jeune + soumission de badge + file de validation animateur + générateur SVG hexagonal
