<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let expanded = $state<Record<string, boolean>>({});

  function toggleDomain(id: string) {
    expanded[id] = !expanded[id];
  }
</script>

<div class="max-w-2xl mx-auto">
  <!-- Retour -->
  <a href="/leaderboard" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour au classement
  </a>

  <!-- En-tête profil -->
  <div class="bg-gray-900 rounded-xl p-5 mb-6">
    <h1 class="text-2xl font-bold text-orange-400">
      {data.jeune.prenom} {data.jeune.nom}
    </h1>
    <div class="flex items-center gap-6 mt-3 text-sm">
      <div class="flex items-center gap-2">
        <span class="text-xl">🏅</span>
        <div>
          <div class="font-semibold text-gray-100">{data.totalBadges}</div>
          <div class="text-xs text-gray-500">badge{data.totalBadges !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xl text-green-500 font-bold">✓</span>
        <div>
          <div class="font-semibold text-gray-100">{data.totalSkills}</div>
          <div class="text-xs text-gray-500">compétence{data.totalSkills !== 1 ? 's' : ''} validée{data.totalSkills !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Domaines -->
  <div class="space-y-4">
    {#each data.profile as dp}
      {@const isOpen = expanded[dp.domain.id] ?? false}

      <div class="bg-gray-900 rounded-xl overflow-hidden">
        <!-- En-tête domaine -->
        <button
          onclick={() => toggleDomain(dp.domain.id)}
          class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800 transition-colors text-left"
        >
          <div class="flex items-center gap-3">
            <!-- Point couleur domaine -->
            <div class="w-3 h-3 rounded-full shrink-0" style="background-color: {dp.domain.color}"></div>
            <span class="font-semibold text-gray-100">{dp.domain.name}</span>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <!-- Niveau badge image -->
            {#if dp.levelImage}
              <img src={dp.levelImage} alt={dp.level ?? ''} class="h-8 w-8 object-contain" />
            {:else}
              <div class="h-8 w-8 rounded-full bg-gray-800 border-2 border-dashed border-gray-700"></div>
            {/if}
            <!-- Compteur catégories -->
            <span class="text-xs text-gray-500">
              {dp.categoryBadgeCount}/{dp.categories.length} badge{dp.categories.length !== 1 ? 's' : ''}
            </span>
            <span class="text-gray-600 text-xs">{isOpen ? '▲' : '▼'}</span>
          </div>
        </button>

        {#if isOpen}
          <div class="border-t border-gray-800 divide-y divide-gray-800/50">
            {#each dp.categories as cp}
              <div class="px-5 py-3">
                <!-- En-tête catégorie -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    {#if cp.hasBadge}
                      <img
                        src={cp.badgeImage ?? ''}
                        alt={cp.badgeLevel ?? ''}
                        class="h-6 w-6 object-contain"
                      />
                    {:else}
                      <div class="h-6 w-6 rounded-full bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center">
                        <span class="text-gray-600 text-xs">{cp.completedCount}</span>
                      </div>
                    {/if}
                    <span class="text-sm font-medium text-gray-200">{cp.category.name}</span>
                  </div>
                  <span class="text-xs text-gray-500">
                    {cp.completedCount}/{cp.totalCount}
                  </span>
                </div>

                <!-- Compétences -->
                {#if cp.skills.length > 0}
                  <div class="space-y-1 ml-8">
                    {#each cp.skills as skill}
                      <div class="flex items-start gap-2 text-sm">
                        {#if skill.approved}
                          <span class="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                        {:else if skill.pendingRequest}
                          <span class="text-yellow-500 shrink-0 mt-0.5">⏳</span>
                        {:else if skill.rejectedRequest}
                          <span class="text-red-500 shrink-0 mt-0.5">✗</span>
                        {:else}
                          <span class="text-gray-700 shrink-0 mt-0.5">○</span>
                        {/if}
                        <span class="{skill.approved ? 'text-gray-300' : 'text-gray-500'}">
                          {skill.title}
                        </span>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}

            <!-- Compétences sans catégorie -->
            {#if dp.uncategorizedSkills.length > 0}
              <div class="px-5 py-3">
                <div class="text-xs text-gray-600 mb-2">Sans catégorie</div>
                <div class="space-y-1 ml-2">
                  {#each dp.uncategorizedSkills as skill}
                    <div class="flex items-start gap-2 text-sm">
                      {#if skill.approved}
                        <span class="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                      {:else}
                        <span class="text-gray-700 shrink-0 mt-0.5">○</span>
                      {/if}
                      <span class="{skill.approved ? 'text-gray-300' : 'text-gray-500'}">
                        {skill.title}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
