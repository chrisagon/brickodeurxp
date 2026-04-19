<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let showCreate = $state(false);
</script>

<div class="max-w-2xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-orange-400">
        {data.isAdmin ? 'Toutes les équipes' : 'Mes équipes'}
      </h1>
      <p class="text-sm text-gray-400 mt-1">
        {data.teams.length} équipe{data.teams.length !== 1 ? 's' : ''}
      </p>
    </div>
    <button
      onclick={() => (showCreate = !showCreate)}
      class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
    >
      + Créer une équipe
    </button>
  </div>

  {#if showCreate}
    <form
      method="POST"
      action="?/createTeam"
      class="bg-gray-900 rounded-xl p-4 mb-6 space-y-3"
    >
      <h2 class="text-sm font-semibold text-orange-300 uppercase tracking-wide">Nouvelle équipe</h2>

      {#if form?.error}
        <p class="text-red-400 text-sm">{form.error}</p>
      {/if}

      <div>
        <label class="block text-xs text-gray-400 mb-1" for="name">Nom de l'équipe *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          placeholder="Ex : Équipe Alpha"
        />
      </div>

      <div>
        <label class="block text-xs text-gray-400 mb-1" for="description">Description (optionnel)</label>
        <input
          id="description"
          name="description"
          type="text"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          placeholder="Ex : Groupe du samedi matin"
        />
      </div>

      <div class="flex gap-2 pt-1">
        <button
          type="submit"
          class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Créer
        </button>
        <button
          type="button"
          onclick={() => (showCreate = false)}
          class="text-sm text-gray-400 hover:text-gray-200 px-4 py-2 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  {/if}

  {#if data.teams.length === 0}
    <div class="text-center py-12 text-gray-600 bg-gray-900 rounded-xl">
      Aucune équipe pour l'instant. Créez-en une !
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.teams as team}
        <a
          href="/animateur/equipes/{team.id}"
          class="block bg-gray-900 hover:bg-gray-800 rounded-xl px-5 py-4 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="font-semibold text-gray-200 truncate">{team.name}</div>
              {#if team.description}
                <div class="text-sm text-gray-500 mt-0.5 truncate">{team.description}</div>
              {/if}
              {#if data.isAdmin}
                <div class="text-xs text-gray-600 mt-1">
                  Créée par {team.creator_prenom} {team.creator_nom}
                </div>
              {/if}
            </div>
            <div class="shrink-0 flex items-center gap-2">
              <span class="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">
                {team.member_count} membre{team.member_count !== 1 ? 's' : ''}
              </span>
              <span class="text-gray-700">→</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
