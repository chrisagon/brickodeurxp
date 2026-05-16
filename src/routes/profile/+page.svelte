<script lang="ts">
  import type { ActionData, PageData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="max-w-md mx-auto mt-8 p-6 bg-gray-900 rounded-xl">
  <h1 class="text-2xl font-bold text-orange-400 mb-2">Mon profil</h1>
  <p class="text-sm text-gray-400 mb-6">Modifiez vos informations personnelles.</p>

  {#if form?.error}
    <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
  {/if}

  <form method="POST" class="flex flex-col gap-4">
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="prenom">Prénom</label>
      <input
        id="prenom" name="prenom" type="text" required minlength="2"
        value={data.user.prenom}
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="nom">Nom</label>
      <input
        id="nom" name="nom" type="text" required minlength="2"
        value={data.user.nom}
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="email">Email</label>
      <input
        id="email" name="email" type="email" required
        value={data.user.email}
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <button
      type="submit"
      class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded-lg transition-colors"
    >
      Enregistrer les modifications
    </button>
  </form>
</div>
