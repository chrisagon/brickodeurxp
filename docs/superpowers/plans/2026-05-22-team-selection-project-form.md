# Sélection d'équipe dans le formulaire de projet

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à un animateur de rattacher une équipe active à un projet qu'il créé

**Architecture:** 
- Modifier le formulaire de création de projet pour inclure un champ de sélection d'équipe
- L'équipe par défaut sera celle de l'animateur
- L'animateur pourra choisir une autre équipe active s'il en a le droit
- Seules les équipes actives (non archivées, date de fin dans le futur) seront affichées

**Tech Stack:** SvelteKit 2, TypeScript, D1 (SQLite)

---

## Contexte du code

### Structure existante

**Table `teams`** (déjà présente en BDD):
- `id`, `name`, `description`, `created_by`, `created_at`
- `start_date`, `end_date`, `archived` (ajoutés par migration 0015)

**Table `projects`** (déjà présente):
- `team_id` est déjà une colonne optionnelle dans la table

**Fonctions existantes:**
- `getAllTeams(db, onlyActive: boolean)` - Récupère toutes les équipes, optionnellement filtrées par active
- `getTeamsByJeune(db, jeuneId)` - Récupère les équipes d'un jeune
- `getTeamsByCreator(db, createdBy, onlyActive)` - Récupère les équipes d'un créateur
- `createProject(..., teamId: string, ...)` - Crée un projet avec une équipe
- `updateProject(..., teamId: string | null, ...)` - Met à jour l'équipe d'un projet

---

## Fichiers à modifier

### 1. `src/routes/animateur/projets/+page.server.ts`

**Role:** Load function pour récupérer les équipes disponibles

**Modifications:**
- Ajouter une requête pour récupérer les équipes actives de l'animateur
- Passer les équipes au template

### 2. `src/routes/animateur/projets/+page.svelte`

**Role:** Formulaire de création de projet

**Modifications:**
- Ajouter un champ `<select>` pour choisir une équipe
- Utiliser l'équipe de l'animateur comme valeur par défaut
- Si admin, afficher toutes les équipes actives

### 3. `src/routes/animateur/projets/[project_id]/edit/+page.server.ts`

**Role:** Déjà existant - récupère les équipes pour la modification

**Modifications:**
- Filtrer pour n'afficher que les équipes actives
- Récupérer les équipes correctement selon le rôle

### 4. `src/routes/animateur/projets/[project_id]/edit/+page.svelte`

**Role:** Déjà existe - a déjà un champ d'équipe

**Modifications:**
- S'assurer que le champ affiche uniquement les équipes actives
- Ajouter un indicateur visuel si l'équipe n'est plus active

---

## Tâches

### Task 1: Modifier +page.server.ts pour charger les équipes

**Files:**
- Modify: `src/routes/animateur/projets/+page.server.ts:12-52`

- [ ] **Step 1: Modifier la load function pour récupérer les équipes actives**

Ajouter la logique pour récupérer les équipes actives de l'animateur dans la function `load`:

```typescript
export const load: PageServerLoad = async ({ platform, locals }) => {
  requireAnimateur(locals);

  const db = platform!.env.DB;
  const user = locals.session!.user;

  try {
    // Récupérer les équipes actives selon le rôle
    let teams = [];
    let teamId = '';
    let noTeam = false;

    if (user.role === 'animateur') {
      // Récupérer l'équipe créée par l'animateur
      const teamRow = await db
        .prepare('SELECT id, name FROM teams WHERE created_by = ? AND archived = 0 AND end_date > ? LIMIT 1')
        .bind(user.id, Math.floor(Date.now() / 1000))
        .first<{ id: string; name: string }>();

      if (!teamRow) {
        noTeam = true;
      } else {
        teamId = teamRow.id;
        teams.push(teamRow);
      }

      // Récupérer les projets de cette équipe
      const projects = teamId ? await getProjectsByTeam(db, teamId) : [];
      return { projects, teams, teamId, isAdmin: false, noTeam };
    }

    // Pour les admins, afficher tous les projets avec toutes les équipes actives
    if (user.role === 'admin') {
      teams = await getAllTeams(db, true); // onlyActive = true
      const projects: any[] = [];

      for (const team of teams) {
        const teamProjects = await getProjectsByTeam(db, team.id);
        projects.push(...teamProjects);
      }

      return { projects, teams, teamId: '', isAdmin: true, noTeam: false };
    }

    return { projects: [], teams: [], teamId: '', isAdmin: false, noTeam: false };
  } catch (err) {
    console.error('Error loading projects:', err);
    error(500, 'Erreur lors du chargement des projets.');
  }
};
```

Note: Importer `getAllTeams` si ce n'est pas déjà fait:
```typescript
import { getProjectsByTeam, createProject, getAllTeams, getTeamById } from '$lib/server/db';
```

---

### Task 2: Mettre à jour le formulaire de création pour inclure la sélection d'équipe

**Files:**
- Modify: `src/routes/animateur/projets/+page.svelte:8-40`

- [ ] **Step 1: Ajouter la variable teamId dans newProject**

Modifier la déclaration de `newProject` pour inclure `teamId`:

```typescript
let newProject = $state({ name: '', description: '', startDate: '', endDate: '', teamId: '' });
```

- [ ] **Step 2: Ajouter le champ de sélection d'équipe dans le formulaire**

Ajouter le champ `<select>` après la date de fin, avant le bouton de soumission:

```svelte
{#if data.teams && data.teams.length > 0}
  <div>
    <label class="block text-xs text-gray-400 mb-1" for="team_id">Équipe *</label>
    <select
      id="team_id"
      name="team_id"
      required
      bind:value={newProject.teamId}
      class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
    >
      {#each data.teams as team}
        <option value={team.id}>{team.name}</option>
      {/each}
    </select>
  </div>
{/if}
```

- [ ] **Step 3: Passer teamId dans createProject**

Modifier le callable du `enhance` pour inclure `teamId`:

```typescript
use:enhance={() => {
  showCreate = false;
  newProject = { name: '', description: '', startDate: '', endDate: '', teamId: '' };
}}
```

Et ajouter `teamId` aux données soumises:

```typescript
const data = await request.formData();
const name = (data.get('name') as string | null)?.trim() ?? '';
const description = (data.get('description') as string | null)?.trim() ?? '';
const startDateStr = data.get('startDate') as string | null;
const endDateStr = data.get('endDate') as string | null;
const teamId = data.get('team_id') as string | null;
```

---

### Task 3: Mettre à jour l'action createProject pour utiliser teamId

**Files:**
- Modify: `src/routes/animateur/projets/+page.server.ts:54-103`

- [ ] **Step 1: Modifier l'action createProject pour accepter teamId**

Mettre à jour l'action pour extraire `teamId` du formulaire:

```typescript
export const actions: Actions = {
  createProject: async ({ request, platform, locals }) => {
    requireAnimateur(locals);

    const db = platform!.env.DB;
    const user = locals.session!.user;

    const data = await request.formData();
    const name = (data.get('name') as string | null)?.trim() ?? '';
    const description = (data.get('description') as string | null)?.trim() ?? '';
    const startDateStr = data.get('startDate') as string | null;
    const endDateStr = data.get('endDate') as string | null;
    const teamId = data.get('team_id') as string | null;

    if (!name || !startDateStr || !endDateStr) {
      return { error: 'Veuillez remplir tous les champs obligatoires.' };
    }

    const startDate = Math.floor(new Date(startDateStr).getTime() / 1000);
    const endDate = Math.floor(new Date(endDateStr).getTime() / 1000);

    if (endDate <= startDate) {
      return { error: 'La date de fin doit être postérieure à la date de début.' };
    }

    // Valider que l'équipe est active si fournie
    if (teamId) {
      const teamActive = await db
        .prepare('SELECT 1 FROM teams WHERE id = ? AND archived = 0 AND end_date > ?')
        .bind(teamId, Math.floor(Date.now() / 1000))
        .first();
      
      if (!teamActive) {
        return { error: 'L\'équipe sélectionnée n\'est pas active.' };
      }
    }

    // Pour les animateurs: utiliser l'équipe sélectionnée ou leur équipe par défaut
    if (user.role === 'animateur') {
      // Si aucune équipe sélectionnée, utiliser leur équipe par défaut
      const selectedTeamId = teamId || await (async () => {
        const teamRow = await db
          .prepare('SELECT id FROM teams WHERE created_by = ? AND archived = 0 AND end_date > ? LIMIT 1')
          .bind(user.id, Math.floor(Date.now() / 1000))
          .first<{ id: string }>();
        return teamRow?.id ?? '';
      })();

      if (!selectedTeamId) {
        return { error: 'Aucune équipe active associée à votre compte.' };
      }

      try {
        await createProject(
          db,
          name,
          description,
          startDate,
          endDate,
          selectedTeamId,
          user.id
        );
        redirect(303, '/animateur/projets');
      } catch (e) {
        return { error: 'Erreur lors de la création du projet.' };
      }
    }

    // Pour les admins: utiliser l'équipe sélectionnée
    if (user.role === 'admin' && teamId) {
      try {
        await createProject(
          db,
          name,
          description,
          startDate,
          endDate,
          teamId,
          user.id
        );
        redirect(303, '/animateur/projets');
      } catch (e) {
        return { error: 'Erreur lors de la création du projet.' };
      }
    }

    return { error: 'Veuillez sélectionner une équipe.' };
  }
};
```

---

### Task 4: Mettre à jour +page.svelte pour afficher les équipes

**Files:**
- Modify: `src/routes/animateur/projets/+page.svelte:1-142`

- [ ] **Step 1: Modifier le bouton de création pour afficher l'équipe par défaut**

```typescript
let { data, form }: { data: PageData; form: ActionData } = $props();

let showCreate = $state(false);
let newProject = $state({ name: '', description: '', startDate: '', endDate: '', teamId: data.teamId || '' });
```

- [ ] **Step 2: Afficher un message si aucune équipe**

Après le formulaire de création (avant `{/if}` fermant):

```svelte
{#if showCreate}
  <!-- ... formulaire ... -->
{/if}

{#if !showCreate && data.noTeam && !data.isAdmin}
  <div class="mb-6 p-4 bg-orange-900/30 border border-orange-800 rounded-lg text-orange-400 text-sm">
    <p class="font-semibold mb-1">Aucune équipe active</p>
    <p>Votre équipe n'est plus active ou n'a pas été créée. Veuillez contacter un administrateur.</p>
  </div>
{/if}
```

- [ ] **Step 3: Ajouter l'affichage de l'équipe dans la liste des projets**

Ajouter l'affichage de l'équipe pour chaque projet:

```svelte
<div class="flex items-center gap-4 text-xs text-gray-600">
  <span>
    📅 {new Date(project.start_date * 1000).toLocaleDateString('fr-FR')} -
    {new Date(project.end_date * 1000).toLocaleDateString('fr-FR')}
  </span>
  {#if project.team_name}
    <span class="px-2 py-0.5 rounded bg-gray-800 text-gray-400">
      👥 {project.team_name}
    </span>
  {/if}
</div>
```

---

### Task 5: Mettre à jour le formulaire d'édition pour n'afficher que les équipes actives

**Files:**
- Modify: `src/routes/animateur/projets/[project_id]/edit/+page.server.ts:11-46`

- [ ] **Step 1: Modifier la load function pour filtrer les équipes actives**

```typescript
export const load: PageServerLoad = async ({ params, platform, locals }) => {
  requireAnimateur(locals);

  const db = platform!.env.DB;
  const project = await getProjectById(db, params.project_id);

  if (!project) {
    error(404, 'Projet introuvable.');
  }

  // Vérifier que l'utilisateur a accès à ce projet
  if (locals.session!.user.role !== 'admin') {
    const teamMember = await db
      .prepare('SELECT 1 FROM team_members WHERE team_id = ? AND jeune_id = ?')
      .bind(project.team_id || '', locals.session!.user.id)
      .first();
    const projectCreator = await db
      .prepare('SELECT 1 FROM projects WHERE id = ? AND created_by = ?')
      .bind(params.project_id, locals.session!.user.id)
      .first();

    if (!teamMember && !projectCreator) {
      error(403, 'Accès non autorisé à ce projet.');
    }
  }

  // Récupérer les équipes actives accessibles par l'utilisateur
  let teams = [];
  if (locals.session!.user.role === 'admin') {
    // Admin: toutes les équipes actives
    teams = await getAllTeams(db, true);
  } else {
    //Animateur: seulement ses équipes actives
    teams = await getTeamsByCreator(db, locals.session!.user.id, true);
  }

  return { project, teams };
};
```

Note: Importer `getAllTeams` au début:
```typescript
import { getProjectById, getTasksByProject, getAllDomains, getSkillsByDomain, getAllTeams } from '$lib/server/db';
```

- [ ] **Step 2: Mettre à jour +page.svelte pour trier et afficher les équipes actives**

Le fichier `.svelte` existe déjà avec un champ d'équipe. Il suffit de s'assurer que le tri est correct:

```svelte
{#if data.teams && data.teams.length > 0}
  <div>
    <label class="block text-xs text-gray-400 mb-2" for="team_id">Équipe</label>
    <select
      id="team_id"
      name="team_id"
      bind:value={projectData.teamId}
      class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
    >
      <option value="">-- Aucune équipe --</option>
      {#each data.teams.sort((a, b) => a.name.localeCompare(b.name)) as team}
        <option value={team.id}>{team.name}</option>
      {/each}
    </select>
  </div>
{/if}
```

---

## Test plan

### Test manuel

1. **En tant qu'animateur:**
   - Aller sur `/animateur/projets`
   - Vérifier que la liste des équipes est affichée dans le formulaire
   - Vérifier que l'équipe par défaut est celle de l'animateur
   - Créer un projet avec l'équipe par défaut
   - Créer un projet avec une autre équipe (si admin ou membre)
   - Vérifier que l'équipe est bien attachée au projet

2. **En tant qu'admin:**
   - Vérifier que toutes les équipes actives sont affichées
   - Créer un projet avec une équipe différente
   - Vérifier que le projet est bien rattaché à l'équipe

3. **Vérification BDD:**
   ```sql
   SELECT p.name, t.name as team_name 
   FROM projects p 
   LEFT JOIN teams t ON t.id = p.team_id;
   ```

4. **Équipes non actives:**
   - Archiver une équipe (end_date dans le passé ou archived=1)
   - Vérifier qu'elle n'apparaît plus dans la liste

---

## Notes

- La migration 0015 (`teams_dates.sql`) doit être appliquée pour avoir les colonnes `start_date`, `end_date`, `archived`
- La validation se fait au niveau serveur pour s'assurer que seule une équipe active peut être sélectionnée
- Le champ est requis dans le formulaire de création, mais optionnel dans le formulaire d'édition (permet de retirer l'équipe d'un projet)
