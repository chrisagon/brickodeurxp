<script lang="ts">
  let { src, alt, class: cls = '' }: { src: string; alt: string; class?: string } = $props();

  let failed = $state(false);

  // Réinitialise l'état d'erreur quand on pointe vers une autre image
  // (aperçu de fichier fraîchement choisi, changement de preuve…).
  $effect(() => {
    src;
    failed = false;
  });
</script>

{#key src}
  {#if failed}
    <div class="w-full {cls} min-h-24 bg-gray-800 border border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-500 text-sm p-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 6h.008v.008H18V6zM3.75 19.5h16.5A1.5 1.5 0 0021.75 18V6A1.5 1.5 0 0020.25 4.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
      </svg>
      <span>Image indisponible</span>
      <span class="text-xs text-gray-600">Le fichier n'a pas pu être chargé.</span>
    </div>
  {:else}
    <img
      {src}
      {alt}
      class={cls}
      onerror={() => (failed = true)}
    />
  {/if}
{/key}