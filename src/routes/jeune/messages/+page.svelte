<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-6">Messages</h1>

  {#if data.inbox.length === 0}
    <div class="text-center py-16 text-gray-600 bg-gray-900 rounded-xl">
      <p class="text-lg mb-2">Aucun message pour le moment.</p>
      <p class="text-sm">Tes animateurs pourront t'envoyer des messages ici.</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.inbox as entry}
        <a
          href="/jeune/messages/{entry.other_id}"
          class="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors"
        >
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center shrink-0 text-orange-400 font-bold text-sm">
            {entry.other_prenom[0]}{entry.other_nom[0]}
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <span class="font-medium text-gray-200">{entry.other_prenom} {entry.other_nom}</span>
              <span class="text-xs text-gray-600 shrink-0 ml-2">
                {new Date(entry.last_at * 1000).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500 truncate">{entry.last_message}</p>
              {#if entry.unread_count > 0}
                <span class="ml-2 shrink-0 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {entry.unread_count}
                </span>
              {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
