<script lang="ts">
  let { children } = $props();
</script>

<div class="max-w-4xl mx-auto">
  <nav class="flex gap-4 mb-6 border-b border-gray-800 pb-3">
    <a href="/admin/competences" class="text-sm text-gray-400 hover:text-orange-400">Compétences</a>
    <a href="/admin/animateurs" class="text-sm text-gray-400 hover:text-orange-400">Animateurs</a>
  </nav>
  {@render children()}
</div>
