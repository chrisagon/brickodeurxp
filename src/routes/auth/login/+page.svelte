<script lang="ts">
  import type { ActionData } from './$types';
  let { form } = $props<{ form: ActionData }>();
</script>

<div class="max-w-md mx-auto mt-16 p-6 bg-gray-900 rounded-xl">
  <h1 class="text-2xl font-bold text-orange-400 mb-6">Connexion Brickodeurs</h1>

  {#if form?.error}
    <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
  {/if}

  <form method="POST" class="flex flex-col gap-4">
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="email">Email</label>
      <input
        id="email" name="email" type="email" required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="password">Mot de passe</label>
      <input
        id="password" name="password" type="password" required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <button
      type="submit"
      class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded-lg transition-colors"
    >
      Se connecter
    </button>
    <p class="text-sm text-gray-500 text-center">
      Pas encore de compte ?
      <a href="/auth/register" class="text-orange-400 hover:underline">S'inscrire</a>
    </p>
  </form>
</div>
