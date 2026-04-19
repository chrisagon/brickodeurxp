<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const MEDAL = ['🥇', '🥈', '🥉'];
</script>

<div class="max-w-3xl mx-auto">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-orange-400">Classement</h1>
    <p class="text-sm text-gray-400 mt-1">Classement des jeunes par équipe, selon leurs badges et compétences validées.</p>
  </div>

  {#if data.teams.length === 0}
    <div class="text-center py-16 text-gray-600 bg-gray-900 rounded-xl">
      Aucune équipe n'a encore été créée.
    </div>
  {:else}
    <div class="space-y-8">
      {#each data.teams as team}
        <div class="bg-gray-900 rounded-xl overflow-hidden">
          <!-- En-tête équipe -->
          <div class="px-5 py-4 border-b border-gray-800">
            <div class="flex items-baseline justify-between gap-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-100">{team.team_name}</h2>
                {#if team.team_description}
                  <p class="text-sm text-gray-500 mt-0.5">{team.team_description}</p>
                {/if}
              </div>
              <span class="shrink-0 text-xs text-gray-600">
                {team.members.length} membre{team.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <!-- Tableau membres -->
          {#if team.members.length === 0}
            <div class="px-5 py-6 text-sm text-gray-600">Aucun membre dans cette équipe.</div>
          {:else}
            <div class="divide-y divide-gray-800">
              {#each team.members as member, i}
                <a
                  href="/leaderboard/{member.jeune_id}"
                  class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-800 transition-colors group"
                >
                  <!-- Rang -->
                  <div class="w-8 text-center shrink-0">
                    {#if i < 3}
                      <span class="text-lg">{MEDAL[i]}</span>
                    {:else}
                      <span class="text-sm text-gray-600">#{i + 1}</span>
                    {/if}
                  </div>

                  <!-- Nom -->
                  <div class="flex-1 min-w-0">
                    <span class="font-medium text-gray-200 group-hover:text-orange-400 transition-colors">
                      {member.prenom} {member.nom}
                    </span>
                  </div>

                  <!-- Stats -->
                  <div class="shrink-0 flex items-center gap-4 text-sm">
                    <div class="flex items-center gap-1.5" title="Badges obtenus">
                      <span class="text-base">🏅</span>
                      <span class="font-semibold text-gray-200">{member.badge_count}</span>
                      <span class="text-gray-600 hidden sm:inline">
                        badge{member.badge_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5" title="Compétences validées">
                      <span class="text-green-500 font-bold">✓</span>
                      <span class="font-semibold text-gray-200">{member.skill_count}</span>
                      <span class="text-gray-600 hidden sm:inline">
                        compétence{member.skill_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span class="text-gray-700 group-hover:text-gray-500 transition-colors">→</span>
                  </div>
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
