<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { goto } from '$app/navigation';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const taskStates = ['todo', 'in_progress', 'done', 'delivered'] as const;
  const stateLabels = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminée',
    delivered: 'Livrée'
  };
  const stateColors = {
    todo: 'border-gray-500',
    in_progress: 'border-blue-500',
    done: 'border-green-500',
    delivered: 'border-purple-500'
  };
</script>

<div class="max-w-2xl mx-auto">
  <!-- Retour -->
  <a href="/animateur/projets/{data.task.project_id}" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour au projet
  </a>

  <h1 class="text-2xl font-bold text-orange-400 mb-6">Modifier la tâche #{data.task.order_num}</h1>

  <!-- Messages -->
  {#if form?.error}
    <div class="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
      {form.error}
    </div>
  {/if}

  <!-- Formulaire -->
  <form method="POST" action="?/updateTask" class="space-y-6">
    <div>
      <label class="block text-xs text-gray-400 mb-2">Titre</label>
      <input
        type="text"
        value={data.task.title}
        disabled
        class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
      />
    </div>

    <div>
      <label class="block text-xs text-gray-400 mb-2" for="description">Description</label>
      <textarea
        id="description"
        name="description"
        rows="4"
        bind:value={data.task.description}
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
      ></textarea>
    </div>

    <div>
      <label class="block text-xs text-gray-400 mb-2">Statut</label>
      <select
        name="state"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
      >
        {#each taskStates as state}
          <option value={state} selected={state === data.task.state}>
            {stateLabels[state]}
          </option>
        {/each}
      </select>
    </div>

    {#if data.task.skills.length > 0}
      <div>
        <label class="block text-xs text-gray-400 mb-2">Compétences associées</label>
        <div class="flex flex-wrap gap-2">
          {#each data.task.skills as skill}
            <span class="text-xs px-3 py-1.5 rounded bg-gray-800 text-gray-400 border-l-4 {stateColors[data.task.state]}">
              {skill.skill_title}
            </span>
          {/each}
        </div>
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
        onclick={() => goto('/animateur/projets/' + data.task.project_id)}
        class="flex-1 text-center text-sm text-gray-400 hover:text-gray-200 px-6 py-3 rounded-lg transition-colors"
      >
        Annuler
      </button>
    </div>
  </form>

  <!-- Informations -->
  <div class="mt-8 pt-6 border-t border-gray-800">
    <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Informations</h2>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span class="text-gray-500">Créée le :</span>
        <span class="text-gray-300 ml-2">{new Date(data.task.created_at * 1000).toLocaleDateString('fr-FR')}</span>
      </div>
      <div>
        <span class="text-gray-500">Dernière modification :</span>
        <span class="text-gray-300 ml-2">{new Date(data.task.updated_at * 1000).toLocaleDateString('fr-FR')}</span>
      </div>
    </div>
  </div>
</div>
