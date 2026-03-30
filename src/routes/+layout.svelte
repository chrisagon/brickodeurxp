<script lang="ts">
  import '../app.css';
  import type { LayoutData } from './$types';

  let { data, children } = $props();
</script>

<div class="min-h-screen bg-gray-950 text-gray-100">
  {#if data.session}
    <nav class="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <span class="font-bold text-orange-400">Brickodeurs</span>
      <div class="flex items-center gap-4 text-sm">
        <span class="text-gray-400">{data.session.user.prenom} {data.session.user.nom}</span>
        <form method="POST" action="/auth/logout">
          <button class="text-gray-500 hover:text-gray-300">Déconnexion</button>
        </form>
      </div>
    </nav>
  {/if}
  <main class="p-4">
    {@render children()}
  </main>
</div>
