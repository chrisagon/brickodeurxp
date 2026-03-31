<script lang="ts">
  import type { ActionData } from './$types';
  let { form } = $props<{ form: ActionData }>();
</script>

<div class="max-w-md mx-auto mt-12 p-6 bg-gray-900 rounded-xl">
  <h1 class="text-2xl font-bold text-orange-400 mb-2">Rejoindre les Brickodeurs</h1>
  <p class="text-sm text-gray-400 mb-6">Crée ton compte pour obtenir tes badges.</p>

  {#if form?.error}
    <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
  {/if}

  <form method="POST" class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm text-gray-400 mb-1" for="prenom">Prénom</label>
        <input id="prenom" name="prenom" type="text" required
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1" for="nom">Nom</label>
        <input id="nom" name="nom" type="text" required
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      </div>
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="email">Ton email</label>
      <input id="email" name="email" type="email" required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="password">Mot de passe</label>
      <input id="password" name="password" type="password" required minlength="8"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="parent_email">Email de ton parent</label>
      <input id="parent_email" name="parent_email" type="email" required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      <p class="text-xs text-gray-500 mt-1">Ton parent recevra un lien pour créer son compte.</p>
    </div>
    <button type="submit"
      class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded-lg transition-colors">
      Créer mon compte
    </button>
    <p class="text-sm text-gray-500 text-center">
      Déjà inscrit ? <a href="/auth/login" class="text-orange-400 hover:underline">Se connecter</a>
    </p>
  </form>
</div>
