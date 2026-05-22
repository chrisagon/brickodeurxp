# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Persistent memory (ICM) — MANDATORY

This project uses [ICM](https://github.com/rtk-ai/icm) for persistent memory across sessions.
You MUST use it actively. Not optional.

### Recall (before starting work)
```bash
icm recall "query"                        # search memories
icm recall "query" -t "topic-name"        # filter by topic
icm recall-context "query" --limit 5      # formatted for prompt injection
```

### Store — MANDATORY triggers
You MUST call `icm store` when ANY of the following happens:
1. **Error resolved** → `icm store -t errors-resolved -c "description" -i high -k "keyword1,keyword2"`
2. **Architecture/design decision** → `icm store -t decisions-{project} -c "description" -i high`
3. **User preference discovered** → `icm store -t preferences -c "description" -i critical`
4. **Significant task completed** → `icm store -t context-{project} -c "summary of work done" -i high`
5. **Conversation exceeds ~20 tool calls without a store** → store a progress summary

Do this BEFORE responding to the user. Not after. Not later.

Do NOT store: trivial details, info already in CLAUDE.md, ephemeral state (build logs, git status).

### Other commands
```bash
icm update <id> -c "updated content"     # edit memory in-place
icm health                                # topic hygiene audit
icm topics                                # list all topics
```

---

## Repository layout

This directory contains two distinct projects:

- **`brickodeurxp/`** — SvelteKit app (main active project, documented below)
- **`BDC/`** — Legacy PHP app; see `BDC/CLAUDE.md` for its own guidance

---

## brickodeurxp

A skill-validation and badge-awarding platform for youth organisations. Built with SvelteKit 2 + TypeScript + Tailwind CSS 4, deployed on **Cloudflare Pages** backed by **D1** (SQLite) and **R2** (object storage).

### Commands

```bash
cd brickodeurxp

npm run dev          # local dev server (uses local D1/R2 via Wrangler)
npm run build        # production build
npm run preview      # preview production build locally
npm run check        # svelte-check + TypeScript type-check
npm run test         # run unit tests (Vitest, single pass)
npm run test:unit    # run unit tests in watch mode
```

To apply a new D1 migration locally:
```bash
npx wrangler d1 execute brickodeurxp --local --file=migrations/NNNN_name.sql
```

To apply to production:
```bash
npx wrangler d1 execute brickodeurxp --file=migrations/NNNN_name.sql
```

### Architecture

#### User roles
Four roles enforced both in the DB schema (`CHECK` constraint) and in route-level layout guards:
- `jeune` — youth member; submits skill proofs, earns badges
- `animateur` — leader/counselor; reviews badge requests, manages teams
- `parent` — read-only observer linked to a jeune via invitation
- `admin` — full access including domain/skill management

#### Request / auth flow
```
Browser cookie "session" (token)
  → hooks.server.ts: getSessionFromToken(DB, token) → event.locals.session
  → +layout.server.ts files per role-section: redirect if wrong role/unauthenticated
  → page load functions receive event.locals.session + event.platform.env.{DB,R2}
```

Cloudflare platform bindings (`event.platform.env`) are only available server-side. All DB and R2 access must happen in `+page.server.ts` / `+server.ts` files, never in components.

#### Data layer (`src/lib/server/db.ts`)
Single file exporting typed query functions over `D1Database`. All SQL is parameterised (`.bind()`). No ORM. Types are plain TypeScript interfaces co-located at the top of the file.

#### Badge logic (in `approveRequest`)
When an animateur approves a badge request, the system:
1. Counts all active skills in the skill's category.
2. Counts how many of that category's skills the jeune has approved requests for.
3. If all skills are validated, awards a category badge.
4. Badge level (blanc → jaune → orange → rouge → noir) is determined by how many category badges the jeune already holds in that domain.

#### File storage (`src/lib/server/r2.ts`)
Proof photos/videos are stored in R2 under `proofs/{jeuneId}/{skillId}/{timestamp}.{ext}`. Project files go under `projects/…`. Signed/public URLs are generated per-request.

#### Email (`src/lib/server/email.ts`)
Transactional email via Resend. `RESEND_API_KEY` must be set as a Wrangler secret for production. From address: `noreply@brickodeurs.fr`.

#### Route structure
```
src/routes/
  auth/           login, logout, magic-link, register
  jeune/          passeport (skill overview), demande (submit proof)
  animateur/      validations, badge, proposer, annuaire, messages, equipes, impression
  parent/         (read-only child view)
  admin/          domain/skill/user management
  api/            server-side JSON endpoints (projects, proofs, assets)
  leaderboard/    public team leaderboard
  competences/    public skill catalogue
```

Each role section has a `+layout.server.ts` that enforces role access and redirects unauthenticated users to `/auth/login`.

#### Database migrations
Sequential SQL files in `migrations/`. Always create a new numbered file; never edit existing migrations. The schema uses `lower(hex(randomblob(16)))` as the default primary key for all tables.

---

## Deploy Configuration (configured by /setup-deploy)
- Platform: **Cloudflare Pages**
- Production URL: **https://brickodeurxp.pages.dev**
- Deploy workflow: **Automatic on push to main branch**
- Deploy status command: **HTTP health check**
- Merge method: **squash**
- Project type: **web app**
- Post-deploy health check: **Poll https://brickodeurxp.pages.dev until it responds**

### Custom deploy hooks
- Pre-merge: **Run `npm run build` to verify compilation**
- Deploy trigger: **Automatic on push to main branch via Cloudflare Pages**
- Deploy status: **Poll production URL for HTTP 200 response**
- Health check: **https://brickodeurxp.pages.dev**

---

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
