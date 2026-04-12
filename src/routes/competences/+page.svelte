<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  const isAdmin = $derived(data.role === 'admin');

  let expandedDomain    = $state<string | null>(null);
  let editingDomain     = $state<string | null>(null);
  let addingCategoryFor = $state<string | null>(null);
  let editingCategory   = $state<string | null>(null);
  let editingSkill      = $state<string | null>(null);
  let addingDomain      = $state(false);
</script>

<h1 class="text-xl font-bold text-orange-400 mb-6">Référentiel de compétences</h1>

{#if form?.error}
  <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
{/if}

<!-- ── Liste des domaines ───────────────────────────────────────────────────── -->
{#each data.domains as domain}
  {@const categories    = data.categoriesByDomain[domain.id] ?? []}
  {@const allSkills     = data.skillsByDomain[domain.id] ?? []}
  {@const uncategorized = allSkills.filter(s => !s.category_id)}

  <div class="mb-6 bg-gray-900/50 rounded-xl overflow-hidden">

    <!-- En-tête domaine -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
      <button
        class="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
        onclick={() => { expandedDomain = expandedDomain === domain.id ? null : domain.id; editingDomain = null; }}
      >
        <span class="w-3 h-3 rounded-full flex-shrink-0" style="background:{domain.color}"></span>
        <h2 class="text-lg font-semibold">{domain.name}</h2>
        <span class="text-xs text-gray-500">
          {categories.length} catégorie{categories.length !== 1 ? 's' : ''} · {allSkills.length} compétence{allSkills.length !== 1 ? 's' : ''}
        </span>
        <span class="text-gray-600 ml-1">{expandedDomain === domain.id ? '▲' : '▼'}</span>
      </button>
      {#if isAdmin}
        <button
          class="text-xs text-gray-500 hover:text-orange-400 px-2 py-1 rounded transition-colors ml-3 flex-shrink-0"
          onclick={(e) => { e.stopPropagation(); editingDomain = editingDomain === domain.id ? null : domain.id; expandedDomain = domain.id; }}
        >
          Modifier domaine
        </button>
      {/if}
    </div>

    <!-- Formulaire modification domaine (admin) -->
    {#if isAdmin && editingDomain === domain.id}
      <form method="POST" action="?/editDomain" class="flex flex-wrap gap-3 px-5 py-4 bg-gray-800/60 border-b border-gray-700">
        <input type="hidden" name="domain_id" value={domain.id} />
        <div class="flex-1 min-w-32">
          <label class="text-xs text-gray-400 mb-1 block">Nom</label>
          <input name="name" type="text" value={domain.name} required
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Couleur</label>
          <input name="color" type="color" value={domain.color}
            class="h-9 w-16 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer" />
        </div>
        <div class="flex-1 min-w-32">
          <label class="text-xs text-gray-400 mb-1 block">Icône (emoji ou URL)</label>
          <input name="icon" type="text" value={domain.icon}
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div class="flex items-end gap-2">
          <button type="submit" class="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-1.5 rounded-lg">Sauvegarder</button>
          <button type="button" onclick={() => editingDomain = null} class="text-gray-500 hover:text-gray-300 text-sm px-3 py-1.5">Annuler</button>
        </div>
      </form>
    {/if}

    <!-- Contenu domaine (déplié) -->
    {#if expandedDomain === domain.id}
      <div class="px-5 pb-5 pt-4 space-y-4">

        <!-- Catégories -->
        {#each categories as cat}
          {@const catSkills = allSkills.filter(s => s.category_id === cat.id)}

          <div class="bg-gray-800 rounded-xl overflow-hidden">

            <!-- En-tête catégorie -->
            <div class="flex items-center justify-between px-4 py-3">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="font-semibold text-sm text-orange-300">{cat.name}</span>
                {#if cat.description}
                  <span class="text-xs text-gray-500 truncate">— {cat.description}</span>
                {/if}
                <span class="text-xs text-gray-600 flex-shrink-0">({catSkills.length})</span>
              </div>
              {#if isAdmin}
                <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button
                    class="text-xs text-gray-500 hover:text-orange-400 px-2 py-1 rounded transition-colors"
                    onclick={() => editingCategory = editingCategory === cat.id ? null : cat.id}
                  >
                    Modifier
                  </button>
                  <form method="POST" action="?/deleteCategory">
                    <input type="hidden" name="category_id" value={cat.id} />
                    <button type="submit"
                      class="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
                      onclick={(e) => { if (!confirm(`Supprimer la catégorie "${cat.name}" ?`)) e.preventDefault(); }}>
                      Supprimer
                    </button>
                  </form>
                </div>
              {/if}
            </div>

            <!-- Formulaire modification catégorie (admin) -->
            {#if isAdmin && editingCategory === cat.id}
              <form method="POST" action="?/editCategory" class="flex flex-wrap gap-2 px-4 py-3 bg-gray-700/40 border-t border-gray-700">
                <input type="hidden" name="category_id" value={cat.id} />
                <input name="name" type="text" value={cat.name} required placeholder="Nom"
                  class="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
                <input name="description" type="text" value={cat.description} placeholder="Description (optionnel)"
                  class="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
                <div class="flex gap-2">
                  <button type="submit" class="bg-orange-500 hover:bg-orange-400 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap">Sauvegarder</button>
                  <button type="button" onclick={() => editingCategory = null} class="text-gray-500 hover:text-gray-300 text-sm px-2">✕</button>
                </div>
              </form>
            {/if}

            <!-- Compétences de la catégorie -->
            <div class="divide-y divide-gray-700/40 border-t border-gray-700/40">
              {#each catSkills as skill}
                <div class="px-4 py-2.5 {skill.active ? '' : 'opacity-50'}">
                  {#if editingSkill === skill.id}
                    <form method="POST" action="?/editSkill" class="flex flex-wrap gap-2">
                      <input type="hidden" name="skill_id" value={skill.id} />
                      <input name="title" type="text" value={skill.title} required
                        class="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-orange-500" />
                      <input name="description" type="text" value={skill.description} placeholder="Description"
                        class="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-orange-500" />
                      <div class="flex gap-2">
                        <button type="submit" class="bg-orange-500 text-white text-xs px-3 py-1 rounded-lg">OK</button>
                        <button type="button" onclick={() => editingSkill = null} class="text-gray-500 text-xs px-2">✕</button>
                      </div>
                    </form>
                  {:else}
                    <div class="flex items-center justify-between gap-2">
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium {skill.active ? '' : 'line-through text-gray-500'}">{skill.title}</p>
                        {#if skill.description}
                          <p class="text-xs text-gray-500 truncate">{skill.description}</p>
                        {/if}
                        {#if !skill.active}
                          <span class="text-xs bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded mt-0.5 inline-block">Inactive</span>
                        {/if}
                      </div>
                      <div class="flex items-center gap-1.5 flex-shrink-0">
                        <form method="POST" action="?/assignSkill">
                          <input type="hidden" name="skill_id" value={skill.id} />
                          <select name="category_id" onchange={(e) => (e.target as HTMLSelectElement).form?.submit()}
                            class="text-xs bg-gray-700 border border-gray-600 rounded px-1.5 py-1 focus:outline-none max-w-28">
                            <option value="">Sans catégorie</option>
                            {#each categories as c}
                              <option value={c.id} selected={c.id === skill.category_id}>{c.name}</option>
                            {/each}
                          </select>
                        </form>
                        <button onclick={() => editingSkill = skill.id}
                          class="text-xs text-gray-500 hover:text-orange-400 px-2 py-1 rounded transition-colors">
                          Modifier
                        </button>
                        <form method="POST" action="?/toggleSkill">
                          <input type="hidden" name="skill_id" value={skill.id} />
                          <input type="hidden" name="active" value={skill.active} />
                          <button type="submit"
                            class="text-xs px-2 py-1 rounded {skill.active ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-500'}"
                            onclick={(e) => { if (skill.active && !confirm('Désactiver cette compétence ?')) e.preventDefault(); }}>
                            {skill.active ? 'Actif' : 'Inactif'}
                          </button>
                        </form>
                        {#if isAdmin}
                          <form method="POST" action="?/deactivateSkill">
                            <input type="hidden" name="skill_id" value={skill.id} />
                            <button type="submit"
                              class="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/60"
                              onclick={(e) => { if (!confirm('Retirer cette compétence ?')) e.preventDefault(); }}>
                              Retirer
                            </button>
                          </form>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>

            <!-- Ajouter compétence dans cette catégorie -->
            <div class="px-4 py-3 border-t border-gray-700/40 bg-gray-800/40">
              <form method="POST" action="?/addSkill" class="flex flex-wrap gap-2">
                <input type="hidden" name="domain_id" value={domain.id} />
                <input type="hidden" name="category_id" value={cat.id} />
                <input name="title" type="text" placeholder="Nouvelle compétence…" required
                  class="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
                <input name="description" type="text" placeholder="Description (optionnel)"
                  class="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
                <button type="submit"
                  class="bg-orange-500/80 hover:bg-orange-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap">
                  + Ajouter
                </button>
              </form>
            </div>
          </div>
        {/each}

        <!-- Compétences sans catégorie -->
        {#if uncategorized.length > 0}
          <div class="bg-gray-800/40 rounded-xl overflow-hidden border border-dashed border-gray-700">
            <div class="px-4 py-2.5 border-b border-gray-700/50">
              <span class="text-xs font-medium text-gray-500">Sans catégorie ({uncategorized.length})</span>
            </div>
            {#each uncategorized as skill}
              <div class="px-4 py-2.5 {skill.active ? '' : 'opacity-50'} border-b border-gray-700/30 last:border-0">
                {#if editingSkill === skill.id}
                  <form method="POST" action="?/editSkill" class="flex flex-wrap gap-2">
                    <input type="hidden" name="skill_id" value={skill.id} />
                    <input name="title" type="text" value={skill.title} required
                      class="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-orange-500" />
                    <input name="description" type="text" value={skill.description} placeholder="Description"
                      class="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-orange-500" />
                    <div class="flex gap-2">
                      <button type="submit" class="bg-orange-500 text-white text-xs px-3 py-1 rounded-lg">OK</button>
                      <button type="button" onclick={() => editingSkill = null} class="text-gray-500 text-xs px-2">✕</button>
                    </div>
                  </form>
                {:else}
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium {skill.active ? '' : 'line-through text-gray-500'}">{skill.title}</p>
                      {#if skill.description}<p class="text-xs text-gray-500">{skill.description}</p>{/if}
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      {#if categories.length > 0}
                        <form method="POST" action="?/assignSkill">
                          <input type="hidden" name="skill_id" value={skill.id} />
                          <select name="category_id" onchange={(e) => (e.target as HTMLSelectElement).form?.submit()}
                            class="text-xs bg-gray-700 border border-gray-600 rounded px-1.5 py-1 focus:outline-none max-w-28">
                            <option value="">Sans catégorie</option>
                            {#each categories as c}
                              <option value={c.id}>{c.name}</option>
                            {/each}
                          </select>
                        </form>
                      {/if}
                      <button onclick={() => editingSkill = skill.id}
                        class="text-xs text-gray-500 hover:text-orange-400 px-2 py-1 rounded transition-colors">
                        Modifier
                      </button>
                      <form method="POST" action="?/toggleSkill">
                        <input type="hidden" name="skill_id" value={skill.id} />
                        <input type="hidden" name="active" value={skill.active} />
                        <button type="submit"
                          class="text-xs px-2 py-1 rounded {skill.active ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-500'}"
                          onclick={(e) => { if (skill.active && !confirm('Désactiver cette compétence ?')) e.preventDefault(); }}>
                          {skill.active ? 'Actif' : 'Inactif'}
                        </button>
                      </form>
                      {#if isAdmin}
                        <form method="POST" action="?/deactivateSkill">
                          <input type="hidden" name="skill_id" value={skill.id} />
                          <button type="submit"
                            class="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/60"
                            onclick={(e) => { if (!confirm('Retirer cette compétence ?')) e.preventDefault(); }}>
                            Retirer
                          </button>
                        </form>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

        <!-- Ajouter une catégorie (admin) -->
        {#if isAdmin}
          {#if addingCategoryFor === domain.id}
            <form method="POST" action="?/addCategory" class="flex flex-wrap gap-3 items-end bg-gray-800 rounded-xl p-4">
              <input type="hidden" name="domain_id" value={domain.id} />
              <div class="flex-1 min-w-32">
                <label class="text-xs text-gray-400 mb-1 block">Nom de la catégorie</label>
                <input name="name" type="text" placeholder="ex : Transmission" required
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div class="flex-1 min-w-32">
                <label class="text-xs text-gray-400 mb-1 block">Description (optionnel)</label>
                <input name="description" type="text" placeholder="ex : Axes, engrenages…"
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div class="flex gap-2">
                <button type="submit" class="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap">Créer</button>
                <button type="button" onclick={() => addingCategoryFor = null} class="text-gray-500 hover:text-gray-300 text-sm px-3 py-2">Annuler</button>
              </div>
            </form>
          {:else}
            <button
              onclick={() => addingCategoryFor = domain.id}
              class="w-full flex items-center justify-center gap-2 py-3 text-sm text-orange-400 hover:text-orange-300 border border-dashed border-orange-500/30 hover:border-orange-500/60 rounded-xl transition-colors">
              + Ajouter une catégorie
            </button>
          {/if}
        {/if}

        <!-- Ajouter compétence sans catégorie -->
        <div>
          <p class="text-xs text-gray-600 mb-2">Ajouter une compétence sans catégorie :</p>
          <form method="POST" action="?/addSkill" class="flex flex-wrap gap-2">
            <input type="hidden" name="domain_id" value={domain.id} />
            <input name="title" type="text" placeholder="Titre de la compétence" required
              class="flex-1 min-w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
            <input name="description" type="text" placeholder="Description (optionnel)"
              class="flex-1 min-w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
            <button type="submit"
              class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap">
              + Ajouter
            </button>
          </form>
        </div>

      </div>
    {/if}
  </div>
{/each}

<!-- ── Ajouter un domaine (admin seulement) ───────────────────────────────── -->
{#if isAdmin}
  {#if addingDomain}
    <form method="POST" action="?/addDomain" class="flex flex-wrap gap-3 items-end bg-gray-900/60 border border-dashed border-orange-500/30 rounded-xl p-5 mb-4">
      <div class="flex-1 min-w-40">
        <label class="text-xs text-gray-400 mb-1 block">Nom du domaine</label>
        <input name="name" type="text" placeholder="ex : Robotique" required
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      </div>
      <div>
        <label class="text-xs text-gray-400 mb-1 block">Couleur</label>
        <input name="color" type="color" value="#6366f1"
          class="h-9 w-16 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer" />
      </div>
      <div class="flex-1 min-w-40">
        <label class="text-xs text-gray-400 mb-1 block">Icône (emoji ou URL)</label>
        <input name="icon" type="text" placeholder="🤖"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
      </div>
      <div class="flex gap-2">
        <button type="submit" class="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap">Créer le domaine</button>
        <button type="button" onclick={() => addingDomain = false} class="text-gray-500 hover:text-gray-300 text-sm px-3 py-2">Annuler</button>
      </div>
    </form>
  {:else}
    <button
      onclick={() => addingDomain = true}
      class="w-full flex items-center justify-center gap-2 py-4 text-sm text-orange-400 hover:text-orange-300 border border-dashed border-orange-500/20 hover:border-orange-500/50 rounded-xl transition-colors">
      + Ajouter un domaine
    </button>
  {/if}
{/if}
