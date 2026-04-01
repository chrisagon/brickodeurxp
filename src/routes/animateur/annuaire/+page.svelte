<script lang="ts">
  import type { PageData } from './$types';
  let { data } = $props<{ data: PageData }>();

  const ROLE_LABELS: Record<string, string> = { jeune: 'Jeune', animateur: 'Animateur' };
  const ROLE_COLORS: Record<string, string> = { jeune: 'text-blue-400', animateur: 'text-orange-400' };
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-1">Annuaire</h1>
  <p class="text-sm text-gray-400 mb-6">Cliquez sur un utilisateur pour lui envoyer un message.</p>

  {#if data.users.length === 0}
    <div class="text-center py-12 text-gray-600 bg-gray-900 rounded-xl">Aucun utilisateur.</div>
  {:else}
    <div class="space-y-2">
      {#each data.users as user}
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
