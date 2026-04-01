<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="max-w-md mx-auto mt-8 p-6 bg-gray-900 rounded-xl">
  <div class="flex flex-col items-center mb-6">
    <img src="/logo.png" alt="Brickodeurs" class="w-24 h-auto mb-3 drop-shadow-lg" />
    <h1 class="text-xl font-bold text-orange-400">Créer mon compte animateur</h1>
    <p class="text-sm text-gray-400 mt-1">Invitation pour <strong class="text-gray-300">{data.email}</strong></p>
  </div>

  {#if form?.error}
    <div class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
      {form.error}
    </div>
  {/if}

  <form method="POST" class="space-y-4">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm text-gray-400 mb-1" for="prenom">Prénom</label>
        <input
          id="prenom" name="prenom" type="text" required
          value={form?.prenom ?? ''}
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1" for="nom">Nom</label>
        <input
          id="nom" name="nom" type="text" required
          value={form?.nom ?? ''}
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm text-gray-400 mb-1" for="password">Mot de passe</label>
      <input
        id="password" name="password" type="password" required minlength="8"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
      <p class="text-xs text-gray-600 mt-1">Minimum 8 caractères</p>
    </div>

    <div>
      <label class="block text-sm text-gray-400 mb-1" for="confirm">Confirmer le mot de passe</label>
      <input
        id="confirm" name="confirm" type="password" required minlength="8"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>

    <button
      type="submit"
      class="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-2.5 rounded-lg transition-colors"
    >
      Créer mon compte
    </button>
  </form>
</div>
