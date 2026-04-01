<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  let filterRole = $state<string>('all');
  let confirmDeleteId = $state<string | null>(null);

  const ROLE_LABELS: Record<string, string> = {
    jeune: 'Jeune',
    animateur: 'Animateur',
    parent: 'Parent',
  };

  const ROLE_COLORS: Record<string, string> = {
    jeune: 'text-blue-400',
    animateur: 'text-orange-400',
    parent: 'text-purple-400',
  };

  let filtered = $derived(
    filterRole === 'all' ? data.users : data.users.filter((u) => u.role === filterRole)
  );

  const counts = $derived({
    all: data.users.length,
    jeune: data.users.filter((u) => u.role === 'jeune').length,
    animateur: data.users.filter((u) => u.role === 'animateur').length,
    parent: data.users.filter((u) => u.role === 'parent').length,
  });
</script>

<div class="max-w-3xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-orange-400">Utilisateurs</h1>
      <p class="text-sm text-gray-400 mt-1">{data.users.length} comptes (hors admins)</p>
    </div>
    <a
      href="/admin/utilisateurs/export"
      class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      ⬇ Exporter CSV
    </a>
  </div>

  {#if form?.error}
    <div class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
      {form.error}
    </div>
  {/if}
  {#if form?.success}
    <div class="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
      ✅ Compte supprimé.
    </div>
  {/if}

  <!-- Filtres -->
  <div class="flex gap-2 mb-5">
    {#each [['all','Tous'], ['jeune','Jeunes'], ['animateur','Animateurs'], ['parent','Parents']] as [role, label]}
      <button
        onclick={() => (filterRole = role)}
        class="text-sm px-3 py-1.5 rounded-full transition-colors {filterRole === role
          ? 'bg-orange-500 text-white font-bold'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
      >
        {label}
        <span class="ml-1 text-xs opacity-70">{counts[role]}</span>
      </button>
    {/each}
  </div>

  <!-- Liste -->
  {#if filtered.length === 0}
    <div class="text-center py-12 text-gray-600 bg-gray-900 rounded-xl">
      Aucun utilisateur dans cette catégorie.
    </div>
  {:else}
    <div class="space-y-2">
      {#each filtered as user}
        <div class="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-200">
                {user.prenom} {user.nom}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-800 {ROLE_COLORS[user.role]}">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-0.5">{user.email}</div>
          </div>

          <div class="flex items-center gap-2 shrink-0 ml-4">
            {#if confirmDeleteId === user.id}
              <form method="POST" action="?/deleteUser" class="flex items-center gap-2">
                <input type="hidden" name="user_id" value={user.id} />
                <span class="text-xs text-red-400">Confirmer ?</span>
                <button
                  type="submit"
                  class="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onclick={() => (confirmDeleteId = null)}
                  class="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </form>
            {:else}
              <button
                onclick={() => (confirmDeleteId = user.id)}
                class="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
                title="Supprimer ce compte"
              >
                ✕
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
