<script lang="ts">
  let { children } = $props();
</script>

<div class="max-w-4xl mx-auto">
  <nav class="flex flex-wrap gap-4 mb-6 border-b border-gray-800 pb-3">
    <a href="/competences"        class="text-sm text-gray-400 hover:text-orange-400">Compétences</a>
    <a href="/admin/propositions" class="text-sm text-gray-400 hover:text-orange-400">Propositions</a>
    <a href="/admin/animateurs"   class="text-sm text-gray-400 hover:text-orange-400">Animateurs</a>
    <a href="/admin/utilisateurs" class="text-sm text-gray-400 hover:text-orange-400">Utilisateurs</a>
    <a href="/admin/utilisateurs/export" class="text-sm text-gray-500 hover:text-green-400 ml-auto">⬇ Export CSV</a>
  </nav>
  {@render children()}
</div>
