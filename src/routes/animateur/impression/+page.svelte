<script lang="ts">
  import type { PageData } from './$types';
  import { LEVEL_IMAGES, LEVEL_LABELS } from '$lib/utils/level';
  import type { Level } from '$lib/utils/level';

  let { data } = $props<{ data: PageData }>();

  const pending = $derived(data.badges.filter((b) => !b.printed_by));
  const done    = $derived(data.badges.filter((b) =>  b.printed_by));
</script>

<div class="max-w-3xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-xl font-bold text-orange-400">Impression des badges</h1>
    <span class="text-sm text-gray-500">{pending.length} en attente · {done.length} imprimé{done.length > 1 ? 's' : ''}</span>
  </div>

  <!-- En attente -->
  {#if pending.length > 0}
    <div class="mb-8">
      <h2 class="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">En attente d'impression</h2>
      <div class="space-y-2">
        {#each pending as badge}
          <div class="bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-4">
            <img
              src={LEVEL_IMAGES[badge.level as Level]}
              alt={LEVEL_LABELS[badge.level as Level]}
              class="w-10 h-10 object-contain shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm text-white">
                {badge.jeune_prenom} {badge.jeune_nom}
              </p>
              <p class="text-xs text-gray-400 truncate">
                {badge.skill_title}
                <span class="text-gray-600">·</span>
                <span style="color:{badge.domain_color}">{badge.domain_name}</span>
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">
                En attente d'impression
              </span>
              <form method="POST" action="?/markPrinted">
                <input type="hidden" name="badge_id" value={badge.id} />
                <button
                  type="submit"
                  class="text-xs bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Fait
                </button>
              </form>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="mb-8 bg-gray-900/60 rounded-xl p-6 text-center text-gray-500 text-sm">
      Aucun badge en attente d'impression.
    </div>
  {/if}

  <!-- Imprimés -->
  {#if done.length > 0}
    <div>
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Imprimés</h2>
      <div class="space-y-2">
        {#each done as badge}
          <div class="bg-gray-900/40 rounded-xl px-4 py-3 flex items-center gap-4 opacity-70">
            <img
              src={LEVEL_IMAGES[badge.level as Level]}
              alt={LEVEL_LABELS[badge.level as Level]}
              class="w-10 h-10 object-contain shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm text-gray-300">
                {badge.jeune_prenom} {badge.jeune_nom}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {badge.skill_title}
                <span class="text-gray-600">·</span>
                {badge.domain_name}
              </p>
            </div>
            <span class="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-lg shrink-0">
              Fait par {badge.printer_prenom} {badge.printer_nom}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
