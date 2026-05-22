<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let showCreate = $state(false);
  let showArchiveModal = $state<string | null>(null);
  let defaultStartDate = $state('');
  let defaultEndDate = $state('');

  // Calculer des dates par défaut (aujourd'hui pour le début, 1 an pour la fin)
  $effect(() => {
    const now = new Date();
    defaultStartDate = now.toISOString().split('T')[0];
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    defaultEndDate = nextYear.toISOString().split('T')[0];
  });

  function toggleActiveFilter() {
    window.location.search = data.onlyActive ? '' : '?active=true';
  }
</script>

<div class="max-w-2xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-orange-400">
        {data.isAdmin ? 'Toutes les équipes' : 'Mes équipes'}
      </h1>
      <p class="text-sm text-gray-400 mt-1">
        {data.teams.length} équipe{data.teams.length !== 1 ? 's' : ''}
        {#if !data.onlyActive}<span class="text-gray-500"> (dont archivées)</span>{/if}
      </p>
    </div>
    <div class="flex gap-2">
      <button
        onclick={() => (showCreate = !showCreate)}
        class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
      >
        + Créer une équipe
      </button>
    </div>
  </div>

  <!-- Filtre actif/archivé -->
  <div class="mb-4">
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={data.onlyActive}
        onchange={() => { showCreate = false; }} // Fermer le formulaire si on filtre
        class="w-4 h-4 text-orange-600 rounded bg-gray-800 border-gray-700 focus:ring-orange-500"
      />
      <span class="text-sm text-gray-300">Afficher uniquement les équipes actives</span>
    </label>
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

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1" for="start_date">Début *</label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            value={defaultStartDate}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1" for="end_date">Fin *</label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            required
            value={defaultEndDate}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>
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
              <div class="text-xs text-gray-600 mt-2">
                {team.archived
                  ? `Du ${new Date(team.start_date * 1000).toLocaleDateString()} au ${new Date(team.end_date * 1000).toLocaleDateString()} (archivé)`
                  : `Du ${new Date(team.start_date * 1000).toLocaleDateString()} au ${new Date(team.end_date * 1000).toLocaleDateString()}`
                }
              </div>
              {#if data.isAdmin && !team.archived}
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

  <!-- Modale de confirmation d'archivage -->
  {#if showArchiveModal}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold text-gray-200 mb-2">
          {#if data.teams.find(t => t.id === showArchiveModal)?.archived}
            Désarchiver l'équipe ?
          {:else}
            Archiver l'équipe ?
          {/if}
        </h3>
        <p class="text-sm text-gray-400 mb-6">
          {#if data.teams.find(t => t.id === showArchiveModal)?.archived}
            L'équipe sera à nouveau visible dans vos équipes actives.
          {:else}
            L'équipe sera marquée comme archivée et ne s'affichera plus dans la liste filtrée.
            Les données resteront disponibles dans l'historique.
          {/if}
        </p>
        <div class="flex gap-3 justify-end">
          <button
            onclick={() => (showArchiveModal = null)}
            class="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Annuler
          </button>
          <form
            method="POST"
            action="?/archiveTeam"
            use:enhance={() => {
              showArchiveModal = null;
              return () => {};
            }}
            class="flex gap-2"
          >
            <input type="hidden" name="team_id" value={showArchiveModal} />
            <input type="hidden" name="archive" value={data.teams.find(t => t.id === showArchiveModal)?.archived ? 'false' : 'true'} />
            <button
              type="submit"
              class="px-4 py-2 text-sm {data.teams.find(t => t.id === showArchiveModal)?.archived ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'} text-white rounded-lg transition-colors"
            >
              {#if data.teams.find(t => t.id === showArchiveModal)?.archived}
                Confirmer le rétablissement
              {:else}
                Confirmer l'archivage
              {/if}
            </button>
          </form>
        </div>
      </div>
    </div>
  {/if}
</div>
