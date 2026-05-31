<script lang="ts">
  import { page } from '$app/state';
  import type { LayoutData } from './$types';

  let { children, data } = $props<{ children: any; data: LayoutData }>();

  const isAdmin = $derived(data.user.role === 'admin');

  function isActive(href: string): boolean {
    const path = page.url.pathname;
    return path === href || path.startsWith(href + '/');
  }

  const linkClass = (href: string) =>
    isActive(href)
      ? 'text-sm text-orange-400 font-medium'
      : 'text-sm text-gray-400 hover:text-orange-400';
</script>

<div class="max-w-4xl mx-auto">
  <nav class="flex flex-wrap gap-4 mb-6 border-b border-gray-800 pb-3">
    {#if isAdmin}
      <a href="/competences"        class={linkClass('/competences')}>Compétences</a>
      <a href="/admin/propositions" class={linkClass('/admin/propositions')}>Propositions</a>
      <a href="/admin/animateurs"   class={linkClass('/admin/animateurs')}>Animateurs</a>
      <a href="/admin/utilisateurs" class={linkClass('/admin/utilisateurs')}>Utilisateurs</a>
      <a href="/admin/utilisateurs/export" class="text-sm text-gray-500 hover:text-green-400 ml-auto">⬇ Export CSV</a>
    {:else}
      <a href="/animateur/validations" class={linkClass('/animateur/validations')}>Validations</a>
      <a href="/competences"           class={linkClass('/competences')}>Compétences</a>
      <a href="/animateur/equipes"     class={linkClass('/animateur/equipes')}>Équipes</a>
      <a href="/animateur/projets"     class={linkClass('/animateur/projets')}>Projets</a>
      <a href="/animateur/proposer"    class={linkClass('/animateur/proposer')}>Proposer une compétence</a>
      <a href="/animateur/impression"  class={linkClass('/animateur/impression')}>Impression badges</a>
      <a href="/animateur/annuaire"    class={linkClass('/animateur/annuaire')}>Annuaire &amp; Messages</a>
    {/if}
  </nav>
  {@render children()}
</div>
