<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let editing = $state(false);
  let editName = $state('');
  let editDesc = $state('');
  let editStartDate = $state('');
  let editEndDate = $state('');

  // Réinitialiser le formulaire d'édition si les données changent
  $effect(() => {
    editName = data.team.name;
    editDesc = data.team.description;
    editStartDate = new Date(data.team.start_date * 1000).toISOString().split('T')[0];
    editEndDate = new Date(data.team.end_date * 1000).toISOString().split('T')[0];
  });
</script>

<div class="max-w-2xl mx-auto">
  <!-- Retour -->
  <a href="/animateur/equipes" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour aux équipes
  </a>

  <!-- En-tête équipe -->
  <div class="bg-gray-900 rounded-xl p-5 mb-6 relative">
    <!-- Indicateur archivé -->
    {#if data.team.archived}
      <span class="absolute top-4 right-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
        Archivé
      </span>
    {:else if data.team.end_date < Math.floor(Date.now() / 1000)}
      <span class="absolute top-4 right-4 text-xs font-bold text-red-500 uppercase tracking-wider">
        Terminé
      </span>
    {/if}

    {#if editing && data.canManage}
      <form
        method="POST"
        action="?/editTeam"
        use:enhance={() => () => { editing = false; }}
        class="space-y-3"
      >
        {#if form?.editError}
          <p class="text-red-400 text-sm">{form.editError}</p>
        {/if}
        <div>
          <label class="block text-xs text-gray-400 mb-1" for="edit-name">Nom *</label>
          <input
            id="edit-name"
            name="name"
            type="text"
            required
            bind:value={editName}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1" for="edit-desc">Description</label>
          <input
            id="edit-desc"
            name="description"
            type="text"
            bind:value={editDesc}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1" for="edit-start-date">Début *</label>
            <input
              id="edit-start-date"
              name="start_date"
              type="date"
              required
              bind:value={editStartDate}
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1" for="edit-end-date">Fin *</label>
            <input
              id="edit-end-date"
              name="end_date"
              type="date"
              required
              bind:value={editEndDate}
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
        <div class="flex gap-2 pt-1">
          <button
            type="submit"
            class="text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onclick={() => (editing = false)}
            class="text-sm text-gray-400 hover:text-gray-200 px-4 py-1.5 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    {:else}
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-orange-400">{data.team.name}</h1>
          {#if data.team.description}
            <p class="text-sm text-gray-400 mt-1">{data.team.description}</p>
          {/if}
          <div class="text-xs text-gray-600 mt-2">
            {#if data.team.archived}
              Du {new Date(data.team.start_date * 1000).toLocaleDateString()} au {new Date(data.team.end_date * 1000).toLocaleDateString()} (archivé)
            {:else}
              Du {new Date(data.team.start_date * 1000).toLocaleDateString()} au {new Date(data.team.end_date * 1000).toLocaleDateString()}
            {/if}
          </div>
        </div>
        <div class="flex items-center gap-2">
          {#if data.canManage}
            <button
              onclick={() => (editing = true)}
              class="text-xs text-gray-500 hover:text-orange-400 border border-gray-700 hover:border-orange-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Modifier
            </button>
            <button
              onclick={() => document.getElementById('archiveModal').classList.remove('hidden')}
              class="text-xs {data.team.archived ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'} text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {#if data.team.archived}
                Désarchiver
              {:else}
                Archiver
              {/if}
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Membres -->
  <div class="mb-6">
    <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
      Membres
      <span class="text-gray-600 font-normal normal-case ml-1">
        ({data.members.length} jeune{data.members.length !== 1 ? 's' : ''})
      </span>
    </h2>

    {#if data.members.length === 0}
      <div class="text-center py-8 text-gray-600 bg-gray-900 rounded-xl text-sm">
        Aucun jeune dans cette équipe.
      </div>
    {:else}
      <div class="space-y-2">
        {#each data.members as member}
          <div class="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3">
            <div>
              <div class="font-medium text-gray-200">{member.prenom} {member.nom}</div>
              <div class="text-xs text-gray-500 mt-0.5">{member.email}</div>
            </div>
            {#if data.canManage}
              <form method="POST" action="?/removeMember" use:enhance>
                <input type="hidden" name="jeune_id" value={member.jeune_id} />
                <button
                  type="submit"
                  class="text-xs text-gray-600 hover:text-red-400 border border-gray-700 hover:border-red-700 px-3 py-1 rounded-lg transition-colors"
                >
                  Retirer
                </button>
              </form>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Ajouter un jeune -->
  {#if data.canManage}
    <div class="bg-gray-900 rounded-xl p-5">
      <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
        Ajouter un jeune
      </h2>

      {#if form?.addError}
        <p class="text-red-400 text-sm mb-3">{form.addError}</p>
      {/if}

      {#if data.availableJeunes.length === 0}
        <p class="text-sm text-gray-600">Tous les jeunes sont déjà dans cette équipe.</p>
      {:else}
        <form method="POST" action="?/addMember" use:enhance class="flex gap-2">
          <select
            name="jeune_id"
            required
            class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          >
            <option value="">-- Choisir un jeune --</option>
            {#each data.availableJeunes as jeune}
              <option value={jeune.id}>{jeune.prenom} {jeune.nom}</option>
            {/each}
          </select>
          <button
            type="submit"
            class="shrink-0 text-sm bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Ajouter
          </button>
        </form>
      {/if}
    </div>
  {/if}

  <!-- Projets de l'équipe -->
  <div class="mb-6">
    <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
      Projets
      <span class="text-gray-600 font-normal normal-case ml-1">
        ({data.projects.length} projet{data.projects.length !== 1 ? 's' : ''})
      </span>
    </h2>

    {#if data.projects.length === 0}
      <div class="text-center py-8 text-gray-600 bg-gray-900 rounded-xl text-sm">
        Aucun projet pour cette équipe.
      </div>
    {:else}
      <div class="space-y-3">
        {#each data.projects as project}
          <a
            href="/animateur/projets/{project.id}"
            class="block bg-gray-900 hover:bg-gray-800 rounded-xl px-5 py-4 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="font-semibold text-gray-200 truncate">{project.name}</div>
                {#if project.description}
                  <div class="text-sm text-gray-500 mt-0.5 truncate">{project.description}</div>
                {/if}
                <div class="text-xs text-gray-600 mt-1">
                  Créé par {project.creator_prenom} {project.creator_nom}
                </div>
              </div>
              <div class="shrink-0 flex items-center gap-2">
                <span class="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">
                  {project.tasks_done_count}/{project.task_count} tâches
                </span>
                <span class="text-gray-700">→</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Modale de confirmation d'archivage -->
<div id="archiveModal" class="hidden fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
  <div class="bg-gray-900 rounded-xl p-6 max-w-md w-full">
    <h3 class="text-lg font-semibold text-gray-200 mb-2">
      {#if data.team.archived}
        Désarchiver l'équipe ?
      {:else}
        Archiver l'équipe ?
      {/if}
    </h3>
    <p class="text-sm text-gray-400 mb-6">
      {#if data.team.archived}
        L'équipe sera à nouveau visible dans vos équipes actives.
      {:else}
        L'équipe sera marquée comme archivée et ne s'affichera plus dans la liste filtrée.
        Les données resteront disponibles dans l'historique.
      {/if}
    </p>
    <div class="flex gap-3 justify-end">
      <button
        onclick={() => document.getElementById('archiveModal').classList.add('hidden')}
        class="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        Annuler
      </button>
      <form
        method="POST"
        action="?/archiveTeam"
        use:enhance={() => {
          document.getElementById('archiveModal').classList.add('hidden');
          return () => {};
        }}
      >
        <input type="hidden" name="archive" value={data.team.archived ? 'false' : 'true'} />
        <button
          type="submit"
          class="px-4 py-2 text-sm {data.team.archived ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'} text-white rounded-lg transition-colors"
        >
          {#if data.team.archived}
            Confirmer le rétablissement
          {:else}
            Confirmer l'archivage
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>
