<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let showCreate = $state(false);
  let newProject = $state({ name: '', description: '', startDate: '', endDate: '' });
</script>

<div class="max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-orange-400">Projets</h1>
      <p class="text-sm text-gray-400 mt-1">
        {data.projects.length} projet{data.projects.length !== 1 ? 's' : ''}
      </p>
    </div>
    <button
      onclick={() => { showCreate = true; newProject = { name: '', description: '', startDate: '', endDate: '' }; }}
      class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
    >
      + Nouveau projet
    </button>
  </div>

  {#if showCreate}
    <div class="bg-gray-900 rounded-xl p-5 mb-6">
      <h2 class="text-sm font-semibold text-orange-300 uppercase tracking-wide mb-4">Nouveau projet</h2>

      {#if form?.error}
        <div class="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {form.error}
        </div>
      {/if}

      <form method="POST" action="?/createProject" use:enhance={() => {
        showCreate = false;
        newProject = { name: '', description: '', startDate: '', endDate: '' };
      }}>
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nom du projet *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: Camp d'été 2026"
              bind:value={newProject.name}
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Description du projet..."
              rows="2"
              bind:value={newProject.description}
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Date de début *</label>
              <input
                type="date"
                name="startDate"
                required
                bind:value={newProject.startDate}
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Date de fin *</label>
              <input
                type="date"
                name="endDate"
                required
                bind:value={newProject.endDate}
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="submit"
              class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Créer
            </button>
            <button
              type="button"
              onclick={() => { showCreate = false; }}
              class="text-sm text-gray-400 hover:text-gray-200 px-4 py-2 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  {/if}

  {#if data.projects.length === 0}
    <div class="text-center py-16 text-gray-600 bg-gray-900 rounded-xl">
      <p class="text-lg mb-2">Aucun projet pour l'instant.</p>
      <p class="text-sm">Créez votre premier projet pour commencer à organiser les tâches !</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each data.projects as project}
        <a
          href="/animateur/projets/{project.id}"
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
