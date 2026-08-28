<script lang="ts">
  import { page } from '$app/state';
  import Onboarding from '$lib/components/Onboarding.svelte';
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
  <nav class="flex flex-wrap items-center gap-4 mb-6 border-b border-gray-800 pb-3">
    <a href="/animateur/validations" class={linkClass('/animateur/validations')} data-tour="anim-validations">Validations</a>
    <a href="/competences"           class={linkClass('/competences')} data-tour="anim-competences">Compétences</a>
    <a href="/animateur/equipes"     class={linkClass('/animateur/equipes')} data-tour="anim-equipes">Équipes</a>
    <a href="/animateur/projets"     class={linkClass('/animateur/projets')} data-tour="anim-projets">Projets</a>
    <a href="/animateur/proposer"    class={linkClass('/animateur/proposer')} data-tour="anim-proposer">Proposer une compétence</a>
    <a href="/animateur/impression"  class={linkClass('/animateur/impression')} data-tour="anim-impression">Impression badges</a>
    <a href="/animateur/annuaire"    class={linkClass('/animateur/annuaire')} data-tour="anim-annuaire">Annuaire &amp; Messages</a>
    <span class="ml-auto"></span>
    <Onboarding role="animateur" homePath="/animateur/validations" />
  </nav>
  {@render children()}
</div>
