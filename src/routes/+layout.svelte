<script lang="ts">
  import '../app.css';
  import type { LayoutData } from './$types';
  import { browser } from '$app/environment';

  let { data, children } = $props();

  $effect(() => {
    if (browser && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  });

  const ROLE_HOME: Record<string, string> = {
    jeune:     '/jeune/passeport',
    animateur: '/animateur/validations',
    admin:     '/competences',
    parent:    '/parent/enfant',
  };

  const roleHome = $derived(
    data.session ? (ROLE_HOME[data.session.user.role] ?? '/') : '/'
  );
</script>

<svelte:head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#f97316" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />
</svelte:head>

<div class="min-h-screen bg-gray-950 text-gray-100">
  {#if data.session}
    <nav class="border-b border-gray-800 px-4 py-2 flex flex-wrap items-center justify-between gap-y-1">
      <div class="flex items-center gap-5">
        <a href={roleHome} class="font-bold text-orange-400 min-h-[44px] flex items-center" data-tour="brand">BrickodeurXP</a>
        <a href="/leaderboard" class="text-sm text-gray-400 hover:text-orange-400 transition-colors min-h-[44px] flex items-center" data-tour="leaderboard">Classement</a>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <a href="/profile" class="text-gray-400 hover:text-orange-400 transition-colors min-h-[44px] flex items-center" data-tour="profile">Profil</a>
        <a href={roleHome} class="text-gray-400 hover:text-orange-400 transition-colors hidden sm:inline min-h-[44px] flex items-center">
          {data.session.user.prenom} {data.session.user.nom}
        </a>
        <form method="POST" action="/auth/logout">
          <button class="text-gray-500 hover:text-gray-300 min-h-[44px] flex items-center px-2">Déconnexion</button>
        </form>
      </div>
    </nav>
  {/if}
  <main class="p-4">
    {@render children()}
  </main>
</div>
