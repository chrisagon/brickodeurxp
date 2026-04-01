<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { page } from '$app/stores';

  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="max-w-lg mx-auto">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-orange-400">Proposer une compétence</h1>
    <p class="text-sm text-gray-400 mt-1">
      Votre proposition sera soumise à validation par un administrateur.
    </p>
  </div>

  {#if $page.url.searchParams.get('success')}
    <div class="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-xl text-green-300 text-sm">
      ✅ Proposition envoyée ! Un administrateur va l'examiner prochainement.
    </div>
  {/if}

  {#if form?.error}
    <div class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
      {form.error}
    </div>
  {/if}

  <form method="POST" class="space-y-5 bg-gray-900 rounded-xl p-6">
    <div>
      <label for="domain_id" class="block text-sm font-medium text-gray-300 mb-1">Domaine</label>
      <select
        id="domain_id"
        name="domain_id"
        required
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option value="">— Choisir un domaine —</option>
        {#each data.domains as domain}
          <option
            value={domain.id}
            selected={form?.domain_id === domain.id}
          >
            {domain.name}
          </option>
        {/each}
      </select>
    </div>

    <div>
      <label for="title" class="block text-sm font-medium text-gray-300 mb-1">
        Titre de la compétence
      </label>
      <input
        id="title"
        name="title"
        type="text"
        required
        maxlength="100"
        value={form?.title ?? ''}
        placeholder="Ex : Assembler un engrenage planétaire"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-300 mb-1">
        Description <span class="text-gray-500">(optionnel)</span>
      </label>
      <textarea
        id="description"
        name="description"
        rows="3"
        placeholder="Décrivez ce que le jeune doit savoir faire…"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
      >{form?.description ?? ''}</textarea>
    </div>

    <button
      type="submit"
      class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors"
    >
      Envoyer la proposition
    </button>
  </form>
</div>
