<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let title = $state('');
  let description = $state('');
  let selectedSkills = $state<string[]>([]);
</script>

<div class="max-w-2xl mx-auto">
  <!-- Retour -->
  <a href="/admin/projets/{data.project.id}" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour au projet
  </a>

  <h1 class="text-2xl font-bold text-orange-400 mb-6">Nouvelle tâche</h1>

  <!-- Formulaire -->
  <form method="POST" action="?/createTask" class="space-y-6">
    {#if form?.formError}
      <div class="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
        {form.formError}
      </div>
    {/if}

    <div>
      <label class="block text-xs text-gray-400 mb-2" for="title">Titre de la tâche *</label>
      <input
        id="title"
        name="title"
        type="text"
        required
        bind:value={title}
        placeholder="Ex: Préparer l'espace de jeux"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
      />
    </div>

    <div>
      <label class="block text-xs text-gray-400 mb-2" for="description">Description (optionnel)</label>
      <textarea
        id="description"
        name="description"
        rows="4"
        bind:value={description}
        placeholder="Détails de la tâche..."
        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500"
      ></textarea>
    </div>

    <div>
      <label class="block text-xs text-gray-400 mb-2">Compétences associées</label>
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 max-h-80 overflow-y-auto">
        {#if data.domains.length === 0}
          <p class="text-sm text-gray-500">Aucune compétence disponible.</p>
        {:else}
          <div class="space-y-3">
            {#each data.domains as domain}
              <div class="mb-2">
                <div class="text-xs font-semibold text-orange-400 uppercase mb-2">{domain.name}</div>
                <div class="space-y-2 pl-2 border-l-2 border-gray-700">
                  {#each data.skillsByDomain.get(domain.id) ?? [] as skill}
                    <label class="flex items-start gap-3 p-2 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        name="skillIds"
                        value={skill.id}
                        checked={selectedSkills.includes(skill.id)}
                        onchange={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.checked) {
                            selectedSkills.push(skill.id);
                          } else {
                            selectedSkills = selectedSkills.filter(id => id !== skill.id);
                          }
                        }}
                        class="mt-1 w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span class="text-sm text-gray-300">{skill.skill_title}</span>
                    </label>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="flex gap-3 pt-4">
      <button
        type="submit"
        class="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Créer la tâche
      </button>
      <a
        href="/admin/projets/{data.project.id}"
        class="flex-1 text-center text-sm text-gray-400 hover:text-gray-200 px-6 py-3 rounded-lg transition-colors"
      >
        Annuler
      </a>
    </div>
  </form>
</div>
