<script lang="ts">
  import type { PageData } from './$types';
  let { data } = $props<{ data: PageData }>();

  const ROLE_LABELS: Record<string, string> = { jeune: 'Jeune', animateur: 'Animateur' };
  const ROLE_COLORS: Record<string, string> = { jeune: 'text-blue-400', animateur: 'text-orange-400' };

  let search = $state('');
  let roleFilter = $state<'all' | 'jeune' | 'animateur'>('all');

  const filtered = $derived(
    data.users.filter((u: (typeof data.users)[number]) => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        u.prenom.toLowerCase().includes(q) ||
        u.nom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchRole && matchSearch;
    })
  );
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-1">Annuaire</h1>
  <p class="text-sm text-gray-400 mb-5">Cliquez sur un utilisateur pour lui envoyer un message.</p>

  <!-- Filtres -->
  <div class="flex flex-col sm:flex-row gap-3 mb-5">
    <!-- Recherche -->
    <input
      type="search"
      placeholder="Rechercher un nom, prénom, email…"
      bind:value={search}
      class="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500"
    />

    <!-- Filtre rôle -->
    <div class="flex rounded-lg overflow-hidden border border-gray-800 shrink-0">
      {#each [['all', 'Tous'], ['animateur', 'Animateurs'], ['jeune', 'Jeunes']] as [val, label]}
        <button
          onclick={() => roleFilter = val as typeof roleFilter}
          class="px-3 py-2 text-sm transition-colors
            {roleFilter === val
              ? 'bg-orange-600 text-white font-medium'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}"
        >
          {label}
        </button>
      {/each}
    </div>
  </div>

  {#if filtered.length === 0}
    <div class="text-center py-12 text-gray-600 bg-gray-900 rounded-xl">
      {search || roleFilter !== 'all' ? 'Aucun résultat pour cette recherche.' : 'Aucun utilisateur.'}
    </div>
  {:else}
    <div class="space-y-2">
      {#each filtered as user}
        {@const unread = data.unread[user.id] ?? 0}
        <a
          href="/animateur/messages/{user.id}"
          class="flex items-center justify-between bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-200">{user.prenom} {user.nom}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-800 {ROLE_COLORS[user.role]}">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-0.5">{user.email}</div>
          </div>
          {#if unread > 0}
            <span class="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unread}
            </span>
          {:else}
            <span class="text-gray-700 text-sm">→</span>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
