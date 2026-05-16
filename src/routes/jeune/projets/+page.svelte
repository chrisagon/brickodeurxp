<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-6">Mes Projets</h1>
  <p class="text-sm text-gray-400 mb-6">
    Bonjour {data.user.prenom} ! Voici vos tâches en cours.
  </p>

  {#if data.tasks.length === 0}
    <div class="text-center py-16 text-gray-600 bg-gray-900 rounded-xl">
      <p class="text-lg mb-2">Aucune tâche pour le moment.</p>
      <p class="text-sm">Vos animateurs vous attribueront des tâches prochainement.</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each data.tasks as task}
        <a
          href="/animateur/projets/{task.project_id}"
          class="block bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition-colors"
        >
          <div class="flex items-start justify-between mb-2">
            <span class="text-xs text-gray-600 font-mono">Tâche #{task.order_num}</span>
            <span class="text-xs px-2 py-0.5 rounded-full
              {task.state === 'todo' ? 'bg-gray-800 text-gray-400' :
               task.state === 'in_progress' ? 'bg-blue-900 text-blue-400' :
               task.state === 'done' ? 'bg-green-900 text-green-400' : 'bg-purple-900 text-purple-400'}">
              {task.state === 'todo' ? 'À faire' :
               task.state === 'in_progress' ? 'En cours' :
               task.state === 'done' ? 'Terminée' : 'Livrée'}
            </span>
          </div>

          <h3 class="font-medium text-gray-200 mb-2">{task.title}</h3>
          {#if task.description}
            <p class="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
          {/if}

          {#if task.skills.length > 0}
            <div class="flex flex-wrap gap-1">
              {#each task.skills as skill}
                <span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                  {skill.skill_title}
                </span>
              {/each}
            </div>
          {/if}

          <div class="text-xs text-gray-600 mt-2">
            {task.assigned_count} jeune{task.assigned_count !== 1 ? 's' : ''} impliqué{task.assigned_count !== 1 ? 's' : ''}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
