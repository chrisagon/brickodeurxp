<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<h1 class="text-xl font-bold text-orange-400 mb-6">Animateurs</h1>

{#if form?.error}
  <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
{/if}
{#if form?.success}
  <p class="mb-4 p-3 bg-green-900/40 text-green-300 rounded-lg text-sm">Animateur créé avec succès.</p>
{/if}

<div class="space-y-2 mb-8">
  {#each data.animateurs as a}
    <div class="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
      <div>
        <p class="font-medium text-sm">{a.prenom} {a.nom}</p>
        <p class="text-xs text-gray-500">{a.email}</p>
      </div>
    </div>
  {:else}
    <p class="text-gray-500 text-sm">Aucun animateur encore.</p>
  {/each}
</div>

<h2 class="text-base font-semibold mb-3 text-gray-300">Créer un compte animateur</h2>
<form method="POST" action="?/createAnimateur" class="grid grid-cols-2 gap-3 max-w-lg">
  <input name="prenom" type="text" placeholder="Prénom" required
    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
  <input name="nom" type="text" placeholder="Nom" required
    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
  <input name="email" type="email" placeholder="Email" required
    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
  <input name="password" type="password" placeholder="Mot de passe temporaire" required minlength="8"
    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
  <button type="submit"
    class="col-span-2 bg-orange-500 hover:bg-orange-400 text-white font-medium py-2 rounded-lg">
    Créer l'animateur
  </button>
</form>
