<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  // Libellés et couleurs viennent de $lib/utils/roles : ils étaient redéfinis
  // ici sans le rôle `admin`, qui se serait affiché en brut une fois promu.
  import {
    ROLE_LABELS,
    ROLE_COLORS,
    allowedPromotions,
    promotionWarning,
    roleLabel,
    type Role,
  } from '$lib/utils/roles';

  let filterRole = $state<string>('all');
  let confirmDeleteId = $state<string | null>(null);
  /** Promotion en attente de confirmation, au format `userId:role`. */
  let confirmPromote = $state<string | null>(null);

  let filtered = $derived(
    filterRole === 'all' ? data.users : data.users.filter((u: (typeof data.users)[number]) => u.role === filterRole)
  );

  const counts = $derived({
    all: data.users.length,
    jeune: data.users.filter((u: (typeof data.users)[number]) => u.role === 'jeune').length,
    animateur: data.users.filter((u: (typeof data.users)[number]) => u.role === 'animateur').length,
    parent: data.users.filter((u: (typeof data.users)[number]) => u.role === 'parent').length,
    admin: data.users.filter((u: (typeof data.users)[number]) => u.role === 'admin').length,
  });
</script>

<div class="max-w-3xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-orange-400">Utilisateurs</h1>
      <p class="text-sm text-gray-400 mt-1">{data.users.length} compte{data.users.length > 1 ? 's' : ''}</p>
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
    {#each [['all','Tous'], ['jeune','Jeunes'], ['animateur','Animateurs'], ['parent','Parents'], ['admin','Admins']] as [role, label]}
      <button
        onclick={() => (filterRole = role)}
        class="text-sm px-3 py-1.5 rounded-full transition-colors {filterRole === role
          ? 'bg-orange-500 text-white font-bold'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
      >
        {label}
        <span class="ml-1 text-xs opacity-70">{counts[role as keyof typeof counts]}</span>
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
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-800 {ROLE_COLORS[user.role as Role] ?? 'text-gray-400'}">
                {roleLabel(user.role)}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-0.5">{user.email}</div>
          </div>

          <div class="flex items-center gap-2 shrink-0 ml-4">
            <!-- Promotion. Irréversible : on confirme avant d'appliquer, en
                 annonçant les effets de bord (équipes, liens parentaux). -->
            {#each allowedPromotions(user.role) as target}
              {#if confirmPromote === `${user.id}:${target}`}
                <form method="POST" action="?/promoteUser" class="flex items-center gap-2">
                  <input type="hidden" name="user_id" value={user.id} />
                  <input type="hidden" name="new_role" value={target} />
                  <span class="text-xs text-amber-400 max-w-xs text-right">
                    {promotionWarning(user.role, target)}
                  </span>
                  <button
                    type="submit"
                    class="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 min-h-[40px] rounded-lg font-bold transition-colors whitespace-nowrap"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onclick={() => (confirmPromote = null)}
                    class="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 min-h-[40px] rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </form>
              {:else if confirmPromote === null && confirmDeleteId === null}
                <button
                  type="button"
                  onclick={() => (confirmPromote = `${user.id}:${target}`)}
                  class="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 min-h-[40px] rounded-lg transition-colors whitespace-nowrap"
                  title="Promouvoir {user.prenom} {user.nom} au rôle {roleLabel(target)}"
                >
                  → {roleLabel(target)}
                </button>
              {/if}
            {/each}

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
            {:else if user.role !== 'admin' && confirmPromote === null}
              <!-- `deleteUser` refuse déjà les admins côté serveur ; on ne
                   propose pas une action qui échouerait. -->
              <button
                onclick={() => (confirmDeleteId = user.id)}
                class="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1 min-h-[40px]"
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
