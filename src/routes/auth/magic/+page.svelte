<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="max-w-md mx-auto mt-16 p-6 bg-gray-900 rounded-xl">
  {#if data.error}
    <p class="text-red-400">{data.error}</p>
  {:else}
    <h1 class="text-2xl font-bold text-orange-400 mb-2">Créer votre compte parent</h1>
    <p class="text-sm text-gray-400 mb-6">Compte lié à : <strong>{data.parent_email}</strong></p>

    {#if form?.error}
      <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
    {/if}

    <form method="POST" class="flex flex-col gap-4">
      <input type="hidden" name="token" value={data.token} />
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
        <label class="block text-sm text-gray-400 mb-1" for="password">Choisissez un mot de passe</label>
        <input id="password" name="password" type="password" required minlength="8"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      </div>
      <button type="submit"
        class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded-lg transition-colors">
        Créer mon compte
      </button>
    </form>
  {/if}
</div>
