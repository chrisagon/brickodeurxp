<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  let rejectingId = $state<string | null>(null);
</script>

<div class="max-w-2xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-orange-400">Propositions de compétences</h1>
      <p class="text-sm text-gray-400 mt-1">
        {data.proposals.length} proposition{data.proposals.length !== 1 ? 's' : ''} en attente
      </p>
    </div>
  </div>

  {#if form?.error}
    <div class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
      {form.error}
    </div>
  {/if}

  {#if data.proposals.length === 0}
    <div class="text-center py-16 text-gray-600">
      <p class="text-4xl mb-3">✅</p>
      <p>Aucune proposition en attente.</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each data.proposals as proposal}
        <div class="bg-gray-900 rounded-xl p-5">
          <div class="flex items-start justify-between gap-4 mb-2">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                  {proposal.domain_name}
                </span>
                <span class="text-xs text-gray-500">
                  par {proposal.proposer_prenom} {proposal.proposer_nom}
                </span>
              </div>
              <h2 class="font-bold text-gray-100">{proposal.title}</h2>
              {#if proposal.description}
                <p class="text-sm text-gray-400 mt-1">{proposal.description}</p>
              {/if}
            </div>
          </div>

          {#if rejectingId === proposal.id}
            <!-- Formulaire de rejet -->
            <form method="POST" action="?/reject" class="mt-3 space-y-3">
              <input type="hidden" name="proposal_id" value={proposal.id} />
              <textarea
                name="note"
                rows="2"
                placeholder="Motif du refus (optionnel)…"
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              ></textarea>
              <div class="flex gap-2">
                <button
                  type="submit"
                  class="bg-red-700 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Confirmer le refus
                </button>
                <button
                  type="button"
                  onclick={() => (rejectingId = null)}
                  class="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          {:else}
            <!-- Actions -->
            <div class="flex gap-2 mt-3">
              <form method="POST" action="?/approve">
                <input type="hidden" name="proposal_id" value={proposal.id} />
                <button
                  type="submit"
                  class="bg-green-700 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  ✓ Approuver
                </button>
              </form>
              <button
                type="button"
                onclick={() => (rejectingId = proposal.id)}
                class="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                ✗ Refuser
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
