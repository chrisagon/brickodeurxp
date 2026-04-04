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
          <span class="text-xs text-gray-500">{dp.badgeCount}/5 badges</span>
        </div>
      </div>

      <!-- Barre de progression -->
      <div class="w-full bg-gray-800 rounded-full h-2 mb-4">
        <div
          class="h-2 rounded-full transition-all"
          style="width:{Math.min(dp.badgeCount / 5 * 100, 100)}%; background:{dp.domain.color}"
        ></div>
      </div>

      <!-- Liste des compétences -->
      <div class="space-y-2">
        {#each dp.skills as skill}
          <div class="flex items-center justify-between px-3 py-2.5 rounded-lg
            {skill.hasBadge ? 'bg-gray-800/50' : 'bg-gray-800/20'}">
            <div class="flex items-center gap-2">
              {#if skill.hasBadge && skill.badgeImage}
                <img src={skill.badgeImage} alt={skill.badgeLevel ?? 'badge'} class="w-7 h-7 object-contain" />
              {:else if skill.pendingRequest}
                <span class="text-yellow-400 text-sm w-7 text-center">⏳</span>
              {:else}
                <span class="text-gray-600 text-sm w-7 text-center">○</span>
              {/if}
              <div>
                <p class="text-sm font-medium {skill.hasBadge ? 'text-gray-200' : 'text-gray-400'}">
                  {skill.title}
                </p>
                {#if skill.description}
                  <p class="text-xs text-gray-600">{skill.description}</p>
                {/if}
              </div>
            </div>
            {#if !skill.hasBadge && !skill.pendingRequest}
              <a
                href="/jeune/demande/{skill.id}"
                class="text-xs bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
              >
                Soumettre
              </a>
            {:else if skill.pendingRequest}
              <span class="text-xs text-yellow-500/60">En attente</span>
            {/if}
          </div>
        {:else}
          <p class="text-sm text-gray-600 text-center py-2">
            Aucune compétence dans ce domaine pour le moment.
          </p>
        {/each}
      </div>
    </div>
  {/each}
</div>
