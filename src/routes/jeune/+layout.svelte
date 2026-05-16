<script lang="ts">
  let { children } = $props();
</script>

<div class="max-w-4xl mx-auto">
  <nav class="flex flex-wrap gap-4 mb-6 border-b border-gray-800 pb-3">
    <a href="/jeune/passeport" class="text-sm text-gray-400 hover:text-orange-400">Mon passeport</a>
    <a href="/jeune/projets" class="text-sm text-gray-400 hover:text-orange-400">Mes projets</a>
  </nav>
  {@render children()}
</div>
