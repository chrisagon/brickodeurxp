<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  let expandedId = $state<string | null>(null);
</script>

<div class="max-w-3xl mx-auto">
  <h1 class="text-xl font-bold text-orange-400 mb-6">
    Demandes à valider
    {#if data.requests.length > 0}
      <span class="ml-2 text-sm bg-orange-500 text-white rounded-full px-2 py-0.5">
        {data.requests.length}
      </span>
    {/if}
  </h1>

  {#if form?.error}
    <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
  {/if}

  {#if form?.success && form?.approved_request_id}
    <div class="mb-4 p-4 bg-green-900/30 border border-green-800 rounded-lg flex items-center justify-between">
      <p class="text-green-400 text-sm">✓ Badge validé avec succès !</p>
      <a
        href="/animateur/badge/{form.approved_request_id}"
        class="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg"
      >
        Générer le badge SVG →
      </a>
    </div>
  {/if}

  {#if data.requests.length === 0}
    <div class="text-center py-16 text-gray-600">
      <p class="text-4xl mb-3">✓</p>
      <p class="text-lg">Aucune demande en attente.</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each data.requests as req}
        <div class="bg-gray-900 rounded-xl overflow-hidden">
          <!-- En-tête de la demande -->
          <button
            class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors text-left"
            onclick={() => expandedId = expandedId === req.id ? null : req.id}
          >
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full" style="background:{req.domain_color}"></span>
              <div>
                <p class="font-medium text-sm">
                  {req.jeune_prenom} {req.jeune_nom}
                </p>
                <p class="text-xs text-gray-500">{req.domain_name} — {req.skill_title}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span>{new Date(req.submitted_at * 1000).toLocaleDateString('fr-FR')}</span>
              <span>{expandedId === req.id ? '▲' : '▼'}</span>
            </div>
          </button>

          {#if expandedId === req.id}
            <div class="px-5 pb-5 border-t border-gray-800 pt-4">
              <!-- Preuve -->
              <div class="mb-4 bg-gray-800 rounded-lg overflow-hidden">
                {#if req.proof_type === 'video'}
                  <video
                    src="/api/proofs/{req.proof_url.replace('proofs/', '')}"
                    controls
                    class="w-full max-h-64 object-contain"
                  >
                    <track kind="captions" src="" label="Sous-titres" />
                  </video>
                {:else}
                  <img
                    src="/api/proofs/{req.proof_url.replace('proofs/', '')}"
                    alt="Preuve de {req.jeune_prenom} {req.jeune_nom}"
                    class="w-full max-h-64 object-contain"
                  />
                {/if}
              </div>

              <!-- Formulaire approuver -->
              <form method="POST" action="?/approve" class="mb-3">
                <input type="hidden" name="request_id" value={req.id} />
                <div class="flex gap-2">
                  <input
                    name="comment"
                    type="text"
                    placeholder="Commentaire (optionnel)"
                    class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="submit"
                    class="bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
                  >
                    ✓ Valider
                  </button>
                </div>
              </form>

              <!-- Formulaire refuser -->
              <form method="POST" action="?/reject">
                <input type="hidden" name="request_id" value={req.id} />
                <div class="flex gap-2">
                  <input
                    name="comment"
                    type="text"
                    placeholder="Raison du refus (requis)"
                    required
                    class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    class="bg-red-700 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
                  >
                    ✗ Refuser
                  </button>
                </div>
              </form>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
