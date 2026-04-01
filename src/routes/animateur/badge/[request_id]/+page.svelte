<script lang="ts">
  import type { PageData } from './$types';
  import { generateBadgeSvg } from '$lib/utils/badge-svg';
  import { LEVEL_COLORS } from '$lib/utils/level';

  let { data } = $props<{ data: PageData }>();

  const svgContent = generateBadgeSvg(data.domainIcon, data.level);
  const levelColor = LEVEL_COLORS[data.level];

  function downloadSvg() {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `badge-${data.domainIcon}-${data.level}-${data.jeune.prenom.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="max-w-md mx-auto">
  <a href="/animateur/validations" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour aux validations
  </a>

  <div class="bg-gray-900 rounded-xl p-6 text-center">
    <h1 class="text-xl font-bold text-orange-400 mb-1">Badge généré</h1>
    <p class="text-sm text-gray-400 mb-6">
      {data.jeune.prenom} {data.jeune.nom} — {data.domainName}
    </p>

    <!-- Aperçu SVG -->
    <div class="flex justify-center mb-6">
      <div
        class="w-40 h-40 flex items-center justify-center"
        style="filter: drop-shadow(0 4px 12px {levelColor}66)"
      >
        {@html svgContent}
      </div>
    </div>

    <!-- Infos badge -->
    <div class="flex justify-center gap-3 mb-6">
      <span
        class="text-sm font-bold px-4 py-1.5 rounded-full"
        style="background:{levelColor}; color:{data.level === 'blanc' ? '#333' : '#fff'}"
      >
        {data.level.toUpperCase()}
      </span>
      <span class="text-sm text-gray-400 py-1.5">{data.domainName}</span>
    </div>

    <!-- Instructions impression 3D -->
    <div class="bg-gray-800 rounded-lg p-4 mb-5 text-left">
      <p class="text-xs font-medium text-gray-300 mb-2">Instructions impression 3D :</p>
      <ol class="text-xs text-gray-500 space-y-1 list-decimal list-inside">
        <li>Télécharger le fichier SVG</li>
        <li>Importer dans Inkscape ou Fusion 360</li>
        <li>Extruder à 3–4 mm d'épaisseur</li>
        <li>Imprimer avec le filament couleur <strong class="text-gray-300">{data.level}</strong></li>
      </ol>
    </div>

    <!-- Bouton téléchargement -->
    <button
      onclick={downloadSvg}
      class="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <span>⬇</span> Télécharger le SVG
    </button>
  </div>
</div>
