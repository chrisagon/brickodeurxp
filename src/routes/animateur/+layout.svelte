<script lang="ts">
  let { children } = $props();
</script>

<div class="max-w-4xl mx-auto">
  <nav class="flex flex-wrap gap-4 mb-6 border-b border-gray-800 pb-3">
    <a href="/animateur/validations" class="text-sm text-gray-400 hover:text-orange-400">Validations</a>
    <a href="/competences"           class="text-sm text-gray-400 hover:text-orange-400">Compétences</a>
    <a href="/animateur/proposer"    class="text-sm text-gray-400 hover:text-orange-400">Proposer une compétence</a>
    <a href="/animateur/annuaire"    class="text-sm text-gray-400 hover:text-orange-400">Annuaire &amp; Messages</a>
  </nav>
  {@render children()}
</div>
