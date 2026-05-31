<script lang="ts">
  import { page } from '$app/state';
  let { children } = $props();

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
    <a href="/animateur/validations" class={linkClass('/animateur/validations')}>Validations</a>
    <a href="/competences"           class={linkClass('/competences')}>Compétences</a>
    <a href="/animateur/equipes"     class={linkClass('/animateur/equipes')}>Équipes</a>
    <a href="/animateur/projets"     class={linkClass('/animateur/projets')}>Projets</a>
    <a href="/animateur/proposer"    class={linkClass('/animateur/proposer')}>Proposer une compétence</a>
    <a href="/animateur/impression"  class={linkClass('/animateur/impression')}>Impression badges</a>
    <a href="/animateur/annuaire"    class={linkClass('/animateur/annuaire')}>Annuaire &amp; Messages</a>
  </nav>
  {@render children()}
</div>
