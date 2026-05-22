<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let projectData = $state({
    name: data.project.name,
    description: data.project.description || '',
    startDate: new Date(data.project.start_date * 1000).toISOString().split('T')[0],
    endDate: new Date(data.project.end_date * 1000).toISOString().split('T')[0],
    teamId: data.project.team_id || ''
  });
</script>

<div class="max-w-2xl mx-auto">
  <!-- Retour -->
  <a href="/animateur/projets/{data.project.id}" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour au projet
  </a>

  <h1 class="text-2xl font-bold text-orange-400 mb-6">Modifier le projet</h1>

  <!-- Messages -->
  {#if form?.error}
    <div class="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
      {form.error}
    </div>
  {/if}

  <!-- Formulaire -->
  <form method="POST" action="?/updateProject" use:enhance={() => {
    // This handler will be replaced by Svelte's enhance
  }}>
    <div class="space-y-6">
      <div>
        <label class="block text-xs text-gray-400 mb-2" for="name">Nom du projet *</label>
        <input
          id="name"
          type="text"
          name="name"
          required
          bind:value={projectData.name}
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label class="block text-xs text-gray-400 mb-2" for="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows="4"
          bind:value={projectData.description}
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-2" for="startDate">Date de début *</label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            required
            bind:value={projectData.startDate}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-2" for="endDate">Date de fin *</label>
          <input
            id="endDate"
            type="date"
            name="endDate"
            required
            bind:value={projectData.endDate}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

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

      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          class="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onclick={() => goto('/animateur/projets/' + data.project.id)}
          class="flex-1 text-center text-sm text-gray-400 hover:text-gray-200 px-6 py-3 rounded-lg transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  </form>
</div>
