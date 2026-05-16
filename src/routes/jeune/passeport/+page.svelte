<script lang="ts">
  import type { PageData } from './$types';
  let { data } = $props<{ data: PageData }>();
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-2">Mon Passeport Brickodeurs</h1>
  <p class="text-sm text-gray-400 mb-8">
    Bonjour {data.user.prenom} ! Voici tes compétences validées.
  </p>

  {#each data.passeport as dp}
    <div class="mb-8 bg-gray-900 rounded-xl p-5">
      <!-- En-tête domaine -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="w-4 h-4 rounded-full" style="background:{dp.domain.color}"></span>
          <h2 class="text-lg font-bold">{dp.domain.name}</h2>
        </div>
        <div class="flex items-center gap-2">
          {#if dp.levelImage}
            <img src={dp.levelImage} alt={dp.level ?? ''} class="w-9 h-9 object-contain drop-shadow" />
          {/if}
          <span class="text-xs text-gray-500">{dp.categoryBadgeCount}/{dp.categories.length} badge{dp.categories.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <!-- Barre de progression -->
      {#if dp.categories.length > 0}
        <div class="w-full bg-gray-800 rounded-full h-2 mb-5">
          <div
            class="h-2 rounded-full transition-all"
            style="width:{Math.min(dp.categoryBadgeCount / Math.max(dp.categories.length, 1) * 100, 100)}%; background:{dp.domain.color}"
          ></div>
        </div>
      {/if}

      <!-- Catégories -->
      <div class="space-y-4">
        {#each dp.categories as cp}
          <div class="bg-gray-800/60 rounded-xl overflow-hidden">
            <!-- En-tête catégorie -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
              <div class="flex items-center gap-2">
                {#if cp.hasBadge && cp.badgeImage}
                  <img src={cp.badgeImage} alt={cp.badgeLevel ?? 'badge'} class="w-7 h-7 object-contain drop-shadow flex-shrink-0" />
                {:else}
                  <span class="w-7 h-7 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-gray-600 text-xs">{cp.completedCount}/{cp.totalCount}</span>
                  </span>
                {/if}
                <div>
                  <p class="font-semibold text-sm {cp.hasBadge ? 'text-orange-300' : 'text-gray-300'}">{cp.category.name}</p>
                  {#if cp.hasBadge}
                    <p class="text-xs text-orange-400/70">Badge {cp.badgeLevel} obtenu !</p>
                  {:else}
                    <p class="text-xs text-gray-500">{cp.completedCount}/{cp.totalCount} compétence{cp.totalCount !== 1 ? 's' : ''} validée{cp.completedCount !== 1 ? 's' : ''}</p>
                  {/if}
                </div>
              </div>
              <!-- Mini barre catégorie -->
              {#if !cp.hasBadge && cp.totalCount > 0}
                <div class="w-20 bg-gray-700 rounded-full h-1.5 ml-2 flex-shrink-0">
                  <div
                    class="h-1.5 rounded-full bg-orange-500/60 transition-all"
                    style="width:{Math.min(cp.completedCount / cp.totalCount * 100, 100)}%"
                  ></div>
                </div>
              {/if}
            </div>

            <!-- Compétences de la catégorie -->
            <div class="space-y-1 p-2">
              {#each cp.skills as skill}
                <div class="flex items-center justify-between px-3 py-2 rounded-lg
                  {skill.approved ? 'bg-gray-700/30' : skill.rejectedRequest ? 'bg-red-900/10' : 'bg-transparent'}">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    {#if skill.approved}
                      <span class="text-green-400 text-sm w-5 text-center flex-shrink-0">✓</span>
                    {:else if skill.pendingRequest}
                      <span class="text-yellow-400 text-sm w-5 text-center flex-shrink-0">⏳</span>
                    {:else if skill.rejectedRequest}
                      <span class="text-red-400 text-sm w-5 text-center flex-shrink-0">✗</span>
                    {:else}
                      <span class="text-gray-600 text-sm w-5 text-center flex-shrink-0">○</span>
                    {/if}
                    <div class="min-w-0">
                      <p class="text-sm {skill.approved ? 'text-gray-200' : skill.rejectedRequest ? 'text-red-300' : 'text-gray-400'}">
                        {skill.title}
                      </p>
                      {#if skill.description}
                        <p class="text-xs text-gray-600">{skill.description}</p>
                      {/if}
                      {#if skill.approved && skill.reviewerComment}
                        <p class="text-xs text-gray-500 italic mt-0.5">💬 {skill.reviewerComment}</p>
                      {/if}
                      {#if skill.rejectedRequest && skill.rejectionComment}
                        <p class="text-xs text-red-400/70 mt-0.5">Refusé : {skill.rejectionComment}</p>
                      {/if}
                    </div>
                  </div>
                  {#if !skill.approved && !skill.pendingRequest && !skill.rejectedRequest}
                    <a
                      href="/jeune/demande/{skill.id}"
                      class="text-xs bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 px-3 py-1 rounded-lg transition-colors whitespace-nowrap ml-2"
                    >
                      Soumettre
                    </a>
                  {:else if skill.pendingRequest}
                    <span class="text-xs text-yellow-500/60 ml-2 whitespace-nowrap">En attente</span>
                  {:else if skill.rejectedRequest}
                    <a
                      href="/jeune/demande/{skill.id}"
                      class="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg transition-colors whitespace-nowrap ml-2"
                    >
                      Renvoyer
                    </a>
                  {/if}
                </div>
              {:else}
                <p class="text-sm text-gray-600 text-center py-2">Aucune compétence dans cette catégorie.</p>
              {/each}
            </div>
          </div>
        {:else}
          <p class="text-sm text-gray-600 text-center py-2">Aucune catégorie dans ce domaine.</p>
        {/each}

        <!-- Compétences sans catégorie -->
        {#if dp.uncategorizedSkills.length > 0}
          <div class="bg-gray-800/30 rounded-xl overflow-hidden border border-dashed border-gray-700/50">
            <div class="px-4 py-2 border-b border-gray-700/30">
              <p class="text-xs text-gray-600">Compétences en cours de catégorisation</p>
            </div>
            <div class="space-y-1 p-2">
              {#each dp.uncategorizedSkills as skill}
                <div class="flex items-center justify-between px-3 py-2 rounded-lg
                  {skill.approved ? 'bg-gray-700/30' : skill.rejectedRequest ? 'bg-red-900/10' : 'bg-transparent'}">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    {#if skill.approved}
                      <span class="text-green-400 text-sm w-5 text-center flex-shrink-0">✓</span>
                    {:else if skill.pendingRequest}
                      <span class="text-yellow-400 text-sm w-5 text-center flex-shrink-0">⏳</span>
                    {:else if skill.rejectedRequest}
                      <span class="text-red-400 text-sm w-5 text-center flex-shrink-0">✗</span>
                    {:else}
                      <span class="text-gray-600 text-sm w-5 text-center flex-shrink-0">○</span>
                    {/if}
                    <p class="text-sm {skill.approved ? 'text-gray-200' : skill.rejectedRequest ? 'text-red-300' : 'text-gray-400'}">
                      {skill.title}
                    </p>
                  </div>
                  {#if !skill.approved && !skill.pendingRequest && !skill.rejectedRequest}
                    <a
                      href="/jeune/demande/{skill.id}"
                      class="text-xs bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 px-3 py-1 rounded-lg transition-colors whitespace-nowrap ml-2"
                    >
                      Soumettre
                    </a>
                  {:else if skill.pendingRequest}
                    <span class="text-xs text-yellow-500/60 ml-2 whitespace-nowrap">En attente</span>
                  {:else if skill.rejectedRequest}
                    <a
                      href="/jeune/demande/{skill.id}"
                      class="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg transition-colors whitespace-nowrap ml-2"
                    >
                      Renvoyer
                    </a>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
