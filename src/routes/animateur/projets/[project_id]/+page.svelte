<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  let { data }: { data: PageData } = $props();

  const taskStates = ['todo', 'in_progress', 'done', 'delivered'] as const;
  const stateLabels = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminée',
    delivered: 'Livrée'
  };

  let tasks = $state(data.tasks);
  $effect(() => {
    tasks = data.tasks;
  });

  let draggingId = $state<string | null>(null);
  let dragOverState = $state<string | null>(null);

  function handleDragStart(e: DragEvent, taskId: string) {
    draggingId = taskId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', taskId);
    }
  }

  function handleDragEnd() {
    draggingId = null;
    dragOverState = null;
  }

  async function handleDrop(e: DragEvent, newState: string) {
    e.preventDefault();
    dragOverState = null;
    const taskId = draggingId ?? e.dataTransfer?.getData('text/plain');
    draggingId = null;
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.state === newState) return;

    const previousState = task.state;
    task.state = newState as typeof task.state; // optimiste

    const body = new FormData();
    body.set('taskId', taskId);
    body.set('state', newState);

    try {
      const res = await fetch('?/updateState', { method: 'POST', body });
      if (!res.ok) throw new Error('http');
      const result = (await res.json()) as { type?: string };
      if (result.type === 'failure' || result.type === 'error') throw new Error('action');
    } catch {
      task.state = previousState; // rollback
    }
  }
</script>

<div class="max-w-7xl mx-auto">
  <!-- En-tête projet -->
  <div class="mb-6">
    <a href="/animateur/projets" class="text-sm text-gray-500 hover:text-gray-300 mb-2 inline-block">
      ← Retour aux projets
    </a>
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-orange-400 mb-2">{data.project.name}</h1>
        <div class="flex flex-wrap gap-4 text-sm text-gray-400">
          {#if data.project.description}
            <span>{data.project.description}</span>
          {/if}
          <span>📅 {new Date(data.project.start_date * 1000).toLocaleDateString('fr-FR')} –
            {new Date(data.project.end_date * 1000).toLocaleDateString('fr-FR')}</span>
          {#if data.project.team_name}
            <span class="text-orange-400/70">👥 {data.project.team_name}</span>
          {/if}
        </div>
      </div>
      <a
        href="/animateur/projets/{data.project.id}/edit"
        class="shrink-0 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-gray-100 px-4 py-2 rounded-lg transition-colors ml-4"
      >
        ✏️ Modifier le projet
      </a>
    </div>
  </div>

  <!-- Barre d'outils -->
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-gray-300">Tâches</h2>
    <button
      onclick={() => goto('/animateur/projets/' + data.project.id + '/tasks/new')}
      class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
    >
      + Nouvelle tâche
    </button>
  </div>

  <!-- KANBAN -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each taskStates as state}
      <div class="flex flex-col">
        <div class="p-3 mb-2 rounded-lg bg-gray-900/50 border border-gray-800">
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm text-gray-300">{stateLabels[state]}</span>
            <span class="text-xs text-gray-600 px-2 py-0.5 rounded-full bg-gray-800">
              {tasks.filter(t => t.state === state).length}
            </span>
          </div>
        </div>

        <div
          role="list"
          class="space-y-3 flex-1 min-h-[200px] rounded-lg transition-colors {dragOverState === state ? 'bg-orange-500/5 ring-2 ring-orange-500/40' : ''}"
          ondragover={(e) => { e.preventDefault(); dragOverState = state; }}
          ondragleave={() => { if (dragOverState === state) dragOverState = null; }}
          ondrop={(e) => handleDrop(e, state)}
        >
          {#each tasks.filter(t => t.state === state) as task (task.id)}
            <div
              role="listitem"
              draggable="true"
              ondragstart={(e) => handleDragStart(e, task.id)}
              ondragend={handleDragEnd}
              onclick={() => goto(`/animateur/projets/${data.project.id}/tasks/${task.id}`)}
              onkeydown={(e) => { if (e.key === 'Enter') goto(`/animateur/projets/${data.project.id}/tasks/${task.id}`); }}
              tabindex="0"
              class="block bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-orange-600/50 transition-colors group cursor-grab active:cursor-grabbing {draggingId === task.id ? 'opacity-50' : ''}"
            >
              <div class="flex items-start justify-between mb-2">
                <span class="text-xs text-gray-600 font-mono">#{task.order_num}</span>
                <span class="text-xs text-gray-500">{new Date(task.updated_at * 1000).toLocaleDateString('fr-FR')}</span>
              </div>

              <h3 class="font-medium text-gray-200 mb-2 group-hover:text-orange-300 transition-colors">{task.title}</h3>
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
                <span class="text-orange-500/60 group-hover:text-orange-400 transition-colors">Modifier →</span>
              </div>
            </div>
          {:else}
            <div class="h-32 border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center text-gray-700 text-sm">
              Déposez une tâche ici
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
