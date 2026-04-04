<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  const isAdmin = data.role === 'admin';

  let editingId = $state<string | null>(null);
  let editTitle = $state('');
  let editDescription = $state('');

  function startEdit(skill: { id: string; title: string; description: string }) {
    editingId = skill.id;
    editTitle = skill.title;
    editDescription = skill.description;
  }

  function cancelEdit() {
    editingId = null;
  }
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
        <div class="bg-gray-900 rounded-lg px-4 py-3">
          {#if editingId === skill.id}
            <!-- Formulaire d'édition inline (admin seulement) -->
            <form method="POST" action="?/editSkill" class="space-y-2">
              <input type="hidden" name="skill_id" value={skill.id} />
              <input
                name="title"
                type="text"
                required
                bind:value={editTitle}
                class="w-full bg-gray-800 border border-orange-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              />
              <input
                name="description"
                type="text"
                placeholder="Description (optionnel)"
                bind:value={editDescription}
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
              />
              <div class="flex gap-2">
                <button
                  type="submit"
                  onclick={cancelEdit}
                  class="text-xs bg-orange-500 hover:bg-orange-400 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onclick={cancelEdit}
                  class="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          {:else}
            <!-- Affichage normal -->
            <div class="flex items-center justify-between gap-4 {!skill.active ? 'opacity-50' : ''}">
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-medium text-sm {!skill.active ? 'line-through text-gray-500' : ''}">{skill.title}</p>
                  {#if !skill.active}
                    <span class="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>
                  {/if}
                </div>
                {#if skill.description}
                  <p class="text-xs text-gray-500 mt-0.5">{skill.description}</p>
                {/if}
              </div>
              <div class="flex gap-2 shrink-0">
                {#if isAdmin}
                  <button
                    type="button"
                    onclick={() => startEdit(skill)}
                    class="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    Modifier
                  </button>
                {/if}
                <form method="POST" action="?/toggleSkill"
                  onsubmit={(e) => {
                    if (skill.active && !confirm(`Désactiver "${skill.title}" ?\n\nLa compétence ne sera plus visible pour les jeunes.`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="skill_id" value={skill.id} />
                  <input type="hidden" name="active" value={skill.active} />
                  <button
                    type="submit"
                    class="text-xs px-2 py-1 rounded {skill.active
                      ? 'bg-green-900/40 text-green-400'
                      : 'bg-gray-800 text-gray-500'}"
                  >
                    {skill.active ? 'Actif' : 'Inactif'}
                  </button>
                </form>
                <form method="POST" action="?/deactivateSkill"
                  onsubmit={(e) => {
                    if (!confirm(`Retirer définitivement "${skill.title}" ?\n\nLa compétence sera masquée pour tous.`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="skill_id" value={skill.id} />
                  <button
                    type="submit"
                    class="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/60"
                  >
                    Retirer
                  </button>
                </form>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <p class="text-gray-600 text-sm">Aucune compétence dans ce domaine.</p>
      {/each}
    </div>

    {#if isAdmin}
      <form method="POST" action="?/addSkill" class="flex gap-2">
        <input type="hidden" name="domain_id" value={domain.id} />
        <input
          name="title"
          type="text"
          placeholder="Titre de la compétence"
          required
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        />
        <input
          name="description"
          type="text"
          placeholder="Description (optionnel)"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        />
        <button
          type="submit"
          class="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
        >
          + Ajouter
        </button>
      </form>
    {:else}
      <p class="text-xs text-gray-600 mt-2">
        Pour proposer une nouvelle compétence →
        <a href="/animateur/proposer" class="text-orange-400 hover:underline">Faire une proposition</a>
      </p>
    {/if}
  </div>
{/each}
