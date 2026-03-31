<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<h1 class="text-xl font-bold text-orange-400 mb-6">Référentiel de compétences</h1>

{#if form?.error}
  <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
{/if}

{#each data.domains as domain}
  <div class="mb-8">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:{domain.color}"></span>
      {domain.name}
    </h2>

    <div class="space-y-2 mb-4">
      {#each data.skillsByDomain[domain.id] ?? [] as skill}
        <div class="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
          <div>
            <p class="font-medium text-sm">{skill.title}</p>
            {#if skill.description}
              <p class="text-xs text-gray-500 mt-0.5">{skill.description}</p>
            {/if}
          </div>
          <div class="flex gap-2">
            <form method="POST" action="?/toggleSkill">
              <input type="hidden" name="skill_id" value={skill.id} />
              <input type="hidden" name="active" value={skill.active} />
              <button type="submit"
                class="text-xs px-2 py-1 rounded {skill.active ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}">
                {skill.active ? 'Actif' : 'Inactif'}
              </button>
            </form>
            <form method="POST" action="?/deleteSkill">
              <input type="hidden" name="skill_id" value={skill.id} />
              <button type="submit"
                class="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/60">
                Retirer
              </button>
            </form>
          </div>
        </div>
      {:else}
        <p class="text-gray-600 text-sm">Aucune compétence active dans ce domaine.</p>
      {/each}
    </div>

    <form method="POST" action="?/addSkill" class="flex gap-2">
      <input type="hidden" name="domain_id" value={domain.id} />
      <input name="title" type="text" placeholder="Titre de la compétence" required
        class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      <input name="description" type="text" placeholder="Description (optionnel)"
        class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      <button type="submit"
        class="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap">
        + Ajouter
      </button>
    </form>
  </div>
{/each}
