<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-orange-400 mb-1">Animateurs</h1>
  <p class="text-sm text-gray-400 mb-8">Invitez des animateurs par email pour qu'ils créent leur compte.</p>

  <!-- Formulaire d'invitation -->
  <div class="bg-gray-900 rounded-xl p-5 mb-8">
    <h2 class="font-bold text-gray-200 mb-4">Envoyer une invitation</h2>

    {#if form?.error}
      <div class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
        {form.error}
      </div>
    {/if}
    {#if form?.success}
      <div class="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
        ✅ Invitation envoyée par email !
      </div>
    {/if}

    <form method="POST" action="?/invite" class="flex gap-3">
      <input
        type="email"
        name="email"
        required
        placeholder="animateur@email.fr"
        class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <button
        type="submit"
        class="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
      >
        Inviter
      </button>
    </form>
  </div>

  <!-- Invitations en attente -->
  {#if data.pendingInvitations.length > 0}
    <div class="mb-8">
      <h2 class="font-bold text-gray-200 mb-3">
        Invitations en attente
        <span class="text-xs text-gray-500 font-normal ml-2">({data.pendingInvitations.length})</span>
      </h2>
      <div class="space-y-2">
        {#each data.pendingInvitations as inv}
          <div class="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
            <span class="text-sm text-gray-300">{inv.email}</span>
            <span class="text-xs text-yellow-500">
              ⏳ expire le {new Date(inv.expires_at * 1000).toLocaleDateString('fr-FR')}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Liste des animateurs -->
  <div>
    <h2 class="font-bold text-gray-200 mb-3">
      Animateurs actifs
      <span class="text-xs text-gray-500 font-normal ml-2">({data.animateurs.length})</span>
    </h2>
    {#if data.animateurs.length === 0}
      <div class="text-center py-8 text-gray-600 bg-gray-900 rounded-xl">
        <p>Aucun animateur pour l'instant.</p>
        <p class="text-sm mt-1">Envoyez une invitation ci-dessus.</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each data.animateurs as anim}
          <div class="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
            <div>
              <span class="font-medium text-gray-200">{anim.prenom} {anim.nom}</span>
              <span class="text-xs text-gray-500 ml-2">{anim.email}</span>
            </div>
            <span class="text-xs text-green-500">✓ Actif</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
