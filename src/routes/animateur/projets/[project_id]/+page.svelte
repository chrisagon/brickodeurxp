<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';

  let { data }: { data: PageData } = $props();

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
    <a href="/animateur/projets" class="text-sm text-gray-500 hover:text-gray-300 mb-2 inline-block">
      ← Retour aux projets
    </a>
    <h1 class="text-3xl font-bold text-orange-400 mb-2">{data.project.name}</h1>
    <div class="flex flex-wrap gap-4 text-sm text-gray-400">
      {#if data.project.description}
        <span>{data.project.description}</span>
      {/if}
      <span>📅 {new Date(data.project.start_date * 1000).toLocaleDateString('fr-FR')} -
        {new Date(data.project.end_date * 1000).toLocaleDateString('fr-FR')}</span>
    </div>
  </div>

  <!-- Barre d'outils -->
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-gray-300">Tâches</h2>
    <div class="flex gap-2">
      <button
        onclick={() => goto('/animateur/projets/' + data.project.id + '/tasks/new')}
        class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
      >
        + Nouvelle tâche
      </button>
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
