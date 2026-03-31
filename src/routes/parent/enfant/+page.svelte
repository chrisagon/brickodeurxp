<script lang="ts">
  import type { PageData } from './$types';
  let { data } = $props<{ data: PageData }>();
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-2">Suivi de progression</h1>
  <p class="text-sm text-gray-400 mb-8">
    Bonjour {data.user.prenom} ! Voici la progression de vos enfants.
  </p>

  {#if data.childrenPasseports.length === 0}
    <div class="text-center py-16 text-gray-600">
      <p class="text-4xl mb-3">👶</p>
      <p>Aucun enfant lié à votre compte pour le moment.</p>
      <p class="text-sm mt-2">Demandez à votre enfant de s'inscrire sur Brickodeurs.</p>
    </div>
  {:else}
    {#each data.childrenPasseports as cp}
      <div class="mb-10">
        <h2 class="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">
          {cp.enfant.prenom} {cp.enfant.nom}
        </h2>

        {#each cp.passeport as dp}
          <div class="mb-6 bg-gray-900 rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="w-4 h-4 rounded-full" style="background:{dp.domain.color}"></span>
                <h3 class="font-bold">{dp.domain.name}</h3>
              </div>
              <div class="flex items-center gap-2">
                {#if dp.level}
                  <span
                    class="text-xs font-bold px-3 py-1 rounded-full"
                    style="background:{dp.levelColor}; color:{dp.level === 'blanc' ? '#333' : '#fff'}"
                  >
                    {dp.level.toUpperCase()}
                  </span>
                {/if}
                <span class="text-xs text-gray-500">{dp.badgeCount}/5 badges</span>
              </div>
            </div>

            <div class="w-full bg-gray-800 rounded-full h-2 mb-3">
              <div
                class="h-2 rounded-full transition-all"
                style="width:{Math.min(dp.badgeCount / 5 * 100, 100)}%; background:{dp.domain.color}"
              ></div>
            </div>

            <div class="space-y-1">
              {#each dp.skills as skill}
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg {skill.hasBadge ? 'bg-gray-800/50' : 'bg-gray-800/20'}">
                  {#if skill.hasBadge}
                    <span class="text-green-400 text-sm">✓</span>
                  {:else if skill.pendingRequest}
                    <span class="text-yellow-400 text-sm">⏳</span>
                  {:else}
                    <span class="text-gray-600 text-sm">○</span>
                  {/if}
                  <span class="text-sm {skill.hasBadge ? 'text-gray-200' : 'text-gray-500'}">{skill.title}</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  {/if}
</div>
