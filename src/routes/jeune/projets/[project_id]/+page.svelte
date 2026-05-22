<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const stateLabels: Record<string, string> = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminée',
    delivered: 'Livrée'
  };

  function getTasksByState(tasks: any[], state: string) {
    return tasks.filter(t => t.state === state);
  }
</script>

<div class="max-w-4xl mx-auto">
  <!-- Retour -->
  <a href="/jeune/projets" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour à mes projets
  </a>

  <h1 class="text-2xl font-bold text-orange-400 mb-6">{data.project.name}</h1>

  {#if data.project.description && data.project.description.trim() !== ''}
    <p class="text-sm text-gray-400 mb-6">{data.project.description}</p>
  {:else}
    <p class="text-sm text-gray-600 italic mb-6">Aucune description</p>
  {/if}

  <!-- KANBAN -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each Object.keys(stateLabels) as state}
      <div class="flex flex-col">
        <div class="p-3 mb-2 rounded-lg bg-gray-900/50 border border-gray-800">
          <span class="font-medium text-sm text-gray-300">{stateLabels[state]}</span>
        </div>

        <div class="space-y-3">
          {#each getTasksByState(data.tasks, state) as task (task.id)}
            <a
              href="/jeune/projets/{data.project.id}/tasks/{task.id}"
              class="block bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div class="flex items-start justify-between mb-2">
                <span class="text-xs text-gray-600 font-mono">#{task.order_num}</span>
                <span class="text-xs px-2 py-0.5 rounded-full
                  {task.state === 'todo' ? 'bg-gray-800 text-gray-400' :
                   task.state === 'in_progress' ? 'bg-blue-900 text-blue-400' :
                   task.state === 'done' ? 'bg-green-900 text-green-400' : 'bg-purple-900 text-purple-400'}">
                  {stateLabels[task.state]}
                </span>
              </div>

              <h3 class="font-medium text-gray-200 mb-2">{task.title}</h3>
              {#if task.description}
                <p class="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
              {/if}

              {#if task.skills && task.skills.length > 0}
                <div class="flex flex-wrap gap-1">
                  {#each task.skills.slice(0, 2) as skill}
                    <span class="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                      {skill.skill_title}
                    </span>
                  {/each}
                </div>
              {/if}
            </a>
          {:else}
            <div class="h-20 border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center text-gray-700 text-sm">
              Aucune tâche
            </div>
          {/each}
        </div>
      </div>
    {/each}

    <!-- Bouton pour ajouter une tâche -->
    <div class="mt-4">
      <a
        href="/jeune/projets/{data.project.id}/tasks/new"
        class="flex items-center justify-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 text-orange-400 hover:text-orange-300 px-4 py-2 rounded-lg transition-colors"
      >
        + Ajouter une tâche
      </a>
    </div>
  </div>
</div>
