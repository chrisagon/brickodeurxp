<script lang="ts">
  import type { LayoutData } from './$types';

  let { children, data } = $props<{ children: any; data: LayoutData }>();

  const isAdmin = $derived(data.user.role === 'admin');
</script>

<div class="max-w-4xl mx-auto">
  <nav class="flex flex-wrap gap-4 mb-6 border-b border-gray-800 pb-3">
    {#if isAdmin}
      <a href="/competences"        class="text-sm text-gray-400 hover:text-orange-400">Compétences</a>
      <a href="/admin/propositions" class="text-sm text-gray-400 hover:text-orange-400">Propositions</a>
      <a href="/admin/animateurs"   class="text-sm text-gray-400 hover:text-orange-400">Animateurs</a>
      <a href="/admin/utilisateurs" class="text-sm text-gray-400 hover:text-orange-400">Utilisateurs</a>
      <a href="/admin/utilisateurs/export" class="text-sm text-gray-500 hover:text-green-400 ml-auto">⬇ Export CSV</a>
    {:else}
      <a href="/animateur/validations" class="text-sm text-gray-400 hover:text-orange-400">Validations</a>
      <a href="/competences"           class="text-sm text-gray-400 hover:text-orange-400">Compétences</a>
      <a href="/animateur/proposer"    class="text-sm text-gray-400 hover:text-orange-400">Proposer une compétence</a>
      <a href="/animateur/impression"  class="text-sm text-gray-400 hover:text-orange-400">Impression badges</a>
      <a href="/animateur/annuaire"    class="text-sm text-gray-400 hover:text-orange-400">Annuaire &amp; Messages</a>
    {/if}
  </nav>
  {@render children()}
</div>
