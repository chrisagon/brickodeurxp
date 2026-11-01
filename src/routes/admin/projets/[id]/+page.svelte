<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let editing = $state(false);
  let confirmDelete = $state(false);

  /** `<input type="date">` attend AAAA-MM-JJ ; la base stocke des secondes Unix. */
  const toDateInput = (seconds: number) =>
    new Date(seconds * 1000).toISOString().slice(0, 10);

  const taskStates = ['todo', 'in_progress', 'done', 'delivered'] as const;
  const stateLabels = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminée',
    delivered: 'Livrée'
  };
  const stateColors = {
    todo: 'border-l-4 border-gray-500',
    in_progress: 'border-l-4 border-blue-500',
    done: 'border-l-4 border-green-500',
    delivered: 'border-l-4 border-purple-500'
  };
</script>

<div class="max-w-7xl mx-auto">
  <!-- En-tête projet -->
  <div class="mb-6">
    <a href="/admin/projets" class="text-sm text-gray-500 hover:text-gray-300 mb-2 inline-block">
      ← Retour aux projets
    </a>
    {#if form?.error}
      <div class="mb-4 bg-red-900/40 border border-red-800 rounded-lg p-3 text-sm text-red-400">
        {form.error}
      </div>
    {/if}
    {#if form?.success}
      <div class="mb-4 bg-green-900/30 border border-green-800 rounded-lg p-3 text-sm text-green-400">
        Projet modifié.
      </div>
    {/if}

    <div class="flex items-start justify-between gap-4">
      <h1 class="text-3xl font-bold text-orange-400 mb-2">{data.project.name}</h1>
      <div class="flex items-center gap-2 shrink-0">
        {#if !editing && !confirmDelete}
          <button
            type="button"
            onclick={() => (editing = true)}
            class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 min-h-[44px] rounded-lg transition-colors"
          >
            Modifier
          </button>
          <button
            type="button"
            onclick={() => (confirmDelete = true)}
            class="text-sm text-gray-600 hover:text-red-400 px-3 py-2 min-h-[44px] transition-colors"
            title="Supprimer ce projet"
          >
            Supprimer
          </button>
        {/if}
      </div>
    </div>

    {#if confirmDelete}
      <!-- project_tasks.project_id est en ON DELETE CASCADE, et
           task_assignments.task_id aussi : les tâches et leurs affectations
           partent avec le projet. On l'annonce, chiffre à l'appui. -->
      <form method="POST" action="?/deleteProject" class="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-4">
        <p class="text-sm text-red-300 mb-3">
          Supprimer « {data.project.name} » ?
          {#if data.tasks.length > 0}
            Ses {data.tasks.length} tâche{data.tasks.length > 1 ? 's' : ''} seront supprimées également.
          {/if}
          Cette action est définitive.
        </p>
        <div class="flex gap-2">
          <button
            type="submit"
            class="text-sm bg-red-700 hover:bg-red-600 text-white px-4 py-2 min-h-[44px] rounded-lg font-bold transition-colors"
          >
            Supprimer définitivement
          </button>
          <button
            type="button"
            onclick={() => (confirmDelete = false)}
            class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 min-h-[44px] rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    {/if}

    {#if editing}
      <form method="POST" action="?/updateProject" class="bg-gray-900 rounded-xl p-4 mb-4 space-y-3">
        <div>
          <label for="name" class="block text-sm text-gray-400 mb-1">Nom <span class="text-red-400">*</span></label>
          <input
            id="name" name="name" required value={data.project.name}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label for="description" class="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            id="description" name="description" rows="2"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >{data.project.description ?? ''}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="start_date" class="block text-sm text-gray-400 mb-1">Début <span class="text-red-400">*</span></label>
            <input
              id="start_date" name="start_date" type="date" required value={toDateInput(data.project.start_date)}
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label for="end_date" class="block text-sm text-gray-400 mb-1">Fin <span class="text-red-400">*</span></label>
            <input
              id="end_date" name="end_date" type="date" required value={toDateInput(data.project.end_date)}
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
        <!-- L'équipe n'est pas modifiable ici : la réaffecter déplacerait les
             tâches d'un groupe à l'autre. On conserve la valeur existante. -->
        <input type="hidden" name="team_id" value={data.project.team_id ?? ''} />
        <div class="flex gap-2 pt-1">
          <button
            type="submit"
            class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 min-h-[44px] rounded-lg font-bold transition-colors"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onclick={() => (editing = false)}
            class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 min-h-[44px] rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    {/if}

    <div class="flex flex-wrap gap-4 text-sm text-gray-400">
      {#if data.project.description}
        <span>{data.project.description}</span>
      {/if}
      {#if data.project.team_name}
        <span>👥 {data.project.team_name}</span>
      {/if}
      <span>📅 {new Date(data.project.start_date * 1000).toLocaleDateString('fr-FR')} -
        {new Date(data.project.end_date * 1000).toLocaleDateString('fr-FR')}</span>
    </div>
  </div>

  <!-- Barre d'outils -->
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-gray-300">Tâches</h2>
    <div class="flex gap-2">
      <a
        href="/admin/projets/{data.project.id}/tasks/new"
        class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
      >
        + Nouvelle tâche
      </a>
    </div>
  </div>

  <!-- KANBAN -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each taskStates as state}
      <div class="flex flex-col">
        <div class="p-3 mb-2 rounded-lg bg-gray-900/50 border border-gray-800">
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm text-gray-300">{stateLabels[state]}</span>
            <span class="text-xs text-gray-600 px-2 py-0.5 rounded-full bg-gray-800">
              {data.tasks.filter(t => t.state === state).length}
            </span>
          </div>
        </div>

        <div class="space-y-3 flex-1 min-h-[200px]">
          {#each data.tasks.filter(t => t.state === state) as task (task.id)}
            <div class="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
              <div class="flex items-start justify-between mb-2">
                <span class="text-xs text-gray-600 font-mono">#{task.order_num}</span>
                <span class="text-xs text-gray-500">{new Date(task.updated_at * 1000).toLocaleDateString('fr-FR')}</span>
              </div>

              <h3 class="font-medium text-gray-200 mb-2">{task.title}</h3>
              {#if task.description}
                <p class="text-sm text-gray-500 mb-3 line-clamp-3">{task.description}</p>
              {/if}

              {#if task.skills.length > 0}
                <div class="flex flex-wrap gap-1 mb-3">
                  {#each task.skills.slice(0, 3) as skill}
                    <span class="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                      {skill.skill_title}
                    </span>
                  {/each}
                  {#if task.skills.length > 3}
                    <span class="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-500">
                      +{task.skills.length - 3}
                    </span>
                  {/if}
                </div>
              {/if}

              <div class="flex items-center justify-between text-xs text-gray-600">
                <span>👥 {task.assigned_count} jeune{task.assigned_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          {:else}
            <div class="h-32 border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center text-gray-700 text-sm">
              Aucune tâche
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
