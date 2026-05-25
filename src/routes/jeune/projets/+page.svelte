<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const stateColors: Record<string, string> = {
    todo: 'bg-gray-800 text-gray-400',
    in_progress: 'bg-blue-900 text-blue-400',
    done: 'bg-green-900 text-green-400',
    delivered: 'bg-purple-900 text-purple-400'
  };
  const stateLabels: Record<string, string> = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminée',
    delivered: 'Livrée'
  };
</script>

<div class="max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-6">Mes Projets</h1>
  <p class="text-sm text-gray-400 mb-8">Bonjour {data.user.prenom} !</p>

  <!-- Projet de l'équipe -->
  {#if data.teamProjects.length > 0}
    <section class="mb-10">
      <h2 class="text-lg font-semibold text-gray-200 mb-4">
        Projet de mon équipe
        {#if data.team}
          <span class="text-sm font-normal text-gray-500 ml-2">— {data.team.name}</span>
        {/if}
      </h2>
      <div class="space-y-4">
        {#each data.teamProjects as project}
          <a
            href="/jeune/projets/{project.id}"
            class="block bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition-colors border border-gray-800 hover:border-gray-700"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-gray-100 text-base">{project.name}</h3>
              <span class="text-xs text-gray-500 ml-4 whitespace-nowrap">
                {project.tasks_done_count}/{project.task_count} tâche{project.task_count !== 1 ? 's' : ''} terminée{project.task_count !== 1 ? 's' : ''}
              </span>
            </div>
            {#if project.description && project.description.trim() !== ''}
              <p class="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
            {/if}
            <div class="flex items-center gap-3">
              {#if project.task_count > 0}
                <div class="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div
                    class="bg-orange-500 h-1.5 rounded-full"
                    style="width: {Math.round((project.tasks_done_count / project.task_count) * 100)}%"
                  ></div>
                </div>
              {/if}
              <span class="text-xs text-orange-400 font-medium shrink-0">Voir les tâches →</span>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {:else if !data.team}
    <div class="text-center py-10 text-gray-600 bg-gray-900 rounded-xl mb-10 border border-gray-800">
      <p class="text-base mb-1">Vous n'êtes pas encore dans une équipe.</p>
      <p class="text-sm">Votre animateur vous ajoutera prochainement.</p>
    </div>
  {:else}
    <div class="text-center py-10 text-gray-600 bg-gray-900 rounded-xl mb-10 border border-gray-800">
      <p class="text-base mb-1">Aucun projet pour votre équipe pour l'instant.</p>
      <p class="text-sm">Votre animateur créera un projet prochainement.</p>
    </div>
  {/if}

  <!-- Tâches assignées -->
  {#if data.assignedTasks.length > 0}
    <section>
      <h2 class="text-lg font-semibold text-gray-200 mb-4">Mes tâches assignées</h2>
      <div class="space-y-3">
        {#each data.assignedTasks as task}
          <a
            href="/jeune/projets/{task.project_id}/tasks/{task.id}"
            class="block bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition-colors border border-gray-800 hover:border-gray-700"
          >
            <div class="flex items-start justify-between mb-1">
              <h3 class="font-medium text-gray-200">{task.title}</h3>
              <span class="text-xs px-2 py-0.5 rounded-full ml-3 shrink-0 {stateColors[task.state]}">
                {stateLabels[task.state]}
              </span>
            </div>
            {#if task.description}
              <p class="text-sm text-gray-500 line-clamp-2 mb-2">{task.description}</p>
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
          </a>
        {/each}
      </div>
    </section>
  {/if}
</div>
