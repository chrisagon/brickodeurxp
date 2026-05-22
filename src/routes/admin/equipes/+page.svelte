<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function toggleActiveFilter() {
    window.location.search = data.onlyActive ? '' : '?active=false';
  }
</script>

<div class="max-w-2xl mx-auto">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-orange-400">
      Toutes les équipes
    </h1>
    <p class="text-sm text-gray-400 mt-1">
      {data.teams.length} équipe{data.teams.length !== 1 ? 's' : ''}
      {#if !data.onlyActive}<span class="text-gray-500"> (dont archivées)</span>{/if}
    </p>
  </div>

  <!-- Filtre actif/archivé -->
  <div class="mb-6 flex items-center gap-3">
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={data.onlyActive}
        onchange={toggleActiveFilter}
        class="w-4 h-4 text-orange-600 rounded bg-gray-800 border-gray-700 focus:ring-orange-500"
      />
      <span class="text-sm text-gray-300">Afficher uniquement les équipes actives</span>
    </label>
    {#if !data.onlyActive}
      <button
        onclick={toggleActiveFilter}
        class="text-xs text-orange-500 hover:text-orange-400"
      >
        ← Filtrer les équipes actives
      </button>
    {/if}
  </div>

  {#if data.teams.length === 0}
    <div class="text-center py-12 text-gray-600 bg-gray-900 rounded-xl">
      Aucune équipe pour l'instant.
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.teams as team}
        <a
          href="/admin/equipes/{team.id}"
          class="block bg-gray-900 hover:bg-gray-800 rounded-xl px-5 py-4 transition-colors relative"
        >
          <!-- Indicateur archivé -->
          {#if team.archived}
            <span class="absolute top-4 right-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Archivé
            </span>
          {:else if team.end_date < Math.floor(Date.now() / 1000)}
            <span class="absolute top-4 right-4 text-xs font-bold text-red-500 uppercase tracking-wider">
              Terminé
            </span>
          {/if}

          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="font-semibold text-gray-200 truncate">{team.name}</div>
              {#if team.description}
                <div class="text-sm text-gray-500 mt-0.5 truncate">{team.description}</div>
              {/if}
              <div class="text-xs text-gray-600 mt-1">
                {team.archived
                  ? `Du ${new Date(team.start_date * 1000).toLocaleDateString()} au ${new Date(team.end_date * 1000).toLocaleDateString()} (archivé)`
                  : `Du ${new Date(team.start_date * 1000).toLocaleDateString()} au ${new Date(team.end_date * 1000).toLocaleDateString()}`
                }
              </div>
              <div class="text-xs text-gray-600 mt-1">
                Créée par {team.creator_prenom} {team.creator_nom}
              </div>
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
