<script lang="ts">
  import { page } from '$app/state';
  import type { LayoutData } from './$types';
  import Onboarding from '$lib/components/Onboarding.svelte';
  let { children, data }: { children: any; data: LayoutData } = $props();

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
    <a href="/jeune/passeport" class={linkClass('/jeune/passeport')} data-tour="jeune-passeport">Mon passeport</a>
    <a href="/jeune/projets" class={linkClass('/jeune/projets')} data-tour="jeune-projets">Mes projets</a>
    <a href="/jeune/annuaire" class={linkClass('/jeune/annuaire')} data-tour="jeune-annuaire">Annuaire</a>
    <a href="/jeune/messages" class="relative {linkClass('/jeune/messages')}" data-tour="jeune-messages">
      Messages
      {#if data.totalUnread > 0}
        <span class="absolute -top-1.5 -right-3 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {data.totalUnread > 9 ? '9+' : data.totalUnread}
        </span>
      {/if}
    </a>
    <span class="ml-auto"></span>
    <Onboarding role="jeune" homePath="/jeune/passeport" />
  </nav>
  {@render children()}
</div>
