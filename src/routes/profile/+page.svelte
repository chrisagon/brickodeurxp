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

  <form method="POST" action="?/updateProfile" class="flex flex-col gap-4">
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

  <hr class="my-8 border-gray-800" />

  <h2 class="text-xl font-bold text-orange-400 mb-2">Mot de passe</h2>
  <p class="text-sm text-gray-400 mb-6">Modifiez votre mot de passe de connexion.</p>

  {#if form?.passwordSuccess}
    <p class="mb-4 p-3 bg-green-900/40 text-green-300 rounded-lg text-sm">Mot de passe mis à jour.</p>
  {/if}
  {#if form?.passwordError}
    <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.passwordError}</p>
  {/if}

  <form method="POST" action="?/updatePassword" class="flex flex-col gap-4">
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="currentPassword">Mot de passe actuel</label>
      <input
        id="currentPassword" name="currentPassword" type="password" autocomplete="current-password"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="newPassword">Nouveau mot de passe</label>
      <input
        id="newPassword" name="newPassword" type="password" required minlength="8" autocomplete="new-password"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <div>
      <label class="block text-sm text-gray-400 mb-1" for="confirmPassword">Confirmer le nouveau mot de passe</label>
      <input
        id="confirmPassword" name="confirmPassword" type="password" required minlength="8" autocomplete="new-password"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </div>
    <button
      type="submit"
      class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded-lg transition-colors"
    >
      Modifier le mot de passe
    </button>
  </form>
</div>
