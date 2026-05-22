<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-orange-400">Projets</h1>
      <p class="text-sm text-gray-400 mt-1">
        {data.projects.length} projet{data.projects.length !== 1 ? 's' : ''}
      </p>
    </div>
  </div>

  {#if data.projects?.length === 0}
    <div class="text-center py-16 text-gray-600 bg-gray-900 rounded-xl">
      <p class="text-lg mb-2">Aucun projet pour l'instant.</p>
      <p class="text-sm">Les animateurs peuvent créer des projets pour organiser leurs tâches.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each data.projects as project}
        <a
          href="/admin/projets/{project.id}"
          class="block bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition-colors"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-semibold text-gray-200">{project.name}</h3>
            <span class="text-xs px-2.5 py-1 rounded-full
              {project.tasks_done_count === 0 ? 'bg-gray-800 text-gray-400' :
               project.tasks_done_count === project.task_count ? 'bg-green-900 text-green-400' : 'bg-orange-900 text-orange-400'}">
              {project.tasks_done_count}/{project.task_count} tâches
            </span>
          </div>
          {#if project.description}
            <p class="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
          {/if}
          {#if project.team_name}
            <p class="text-xs text-gray-600 mb-2">Équipe: {project.team_name}</p>
          {/if}
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span>
              📅 {new Date(project.start_date * 1000).toLocaleDateString('fr-FR')} -
              {new Date(project.end_date * 1000).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
