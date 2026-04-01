<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  let fileName = $state('');
  let previewUrl = $state<string | null>(null);
  let isVideo = $state(false);

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    fileName = file.name;
    isVideo = file.type.startsWith('video/');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
  }
</script>

<div class="max-w-lg mx-auto">
  <a href="/jeune/passeport" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour au passeport
  </a>

  <div class="bg-gray-900 rounded-xl p-6">
    <h1 class="text-xl font-bold text-orange-400 mb-1">Soumettre une preuve</h1>
    <p class="text-sm text-gray-400 mb-1">Compétence : <strong class="text-gray-200">{data.skill.title}</strong></p>
    <p class="text-xs text-gray-500 mb-6">Domaine : {data.skill.domain_name}</p>

    {#if data.hasApproved}
      <div class="bg-green-900/30 border border-green-800 rounded-lg p-4">
        <p class="text-green-400 text-sm font-medium">✓ Tu as déjà obtenu ce badge !</p>
      </div>
    {:else if data.hasPending}
      <div class="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4">
        <p class="text-yellow-400 text-sm font-medium">⏳ Une demande est déjà en attente pour cette compétence.</p>
        <p class="text-xs text-gray-500 mt-1">Un animateur va la valider prochainement.</p>
      </div>
    {:else}
      {#if form?.error}
        <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
      {/if}

      {#if data.skill.description}
        <div class="mb-5 p-3 bg-gray-800 rounded-lg">
          <p class="text-xs text-gray-400 font-medium mb-1">Description :</p>
          <p class="text-sm text-gray-300">{data.skill.description}</p>
        </div>
      {/if}

      <form method="POST" enctype="multipart/form-data" class="flex flex-col gap-4">
        <div>
          <p class="block text-sm text-gray-400 mb-2">
            Photo ou vidéo de ta réalisation
          </p>
          <label
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-gray-800/50"
          >
            <input
              name="proof"
              type="file"
              accept="image/*,video/*"
              class="hidden"
              onchange={onFileChange}
              required
            />
            {#if fileName}
              <span class="text-sm text-orange-400">{fileName}</span>
            {:else}
              <span class="text-3xl mb-1">📎</span>
              <span class="text-sm text-gray-500">Cliquer pour choisir</span>
              <span class="text-xs text-gray-600">Image ou vidéo • max 50 Mo</span>
            {/if}
          </label>
        </div>

        {#if previewUrl}
          <div class="rounded-lg overflow-hidden bg-gray-800 max-h-48">
            {#if isVideo}
              <video src={previewUrl} controls class="w-full max-h-48 object-contain">
                <track kind="captions" src="" label="Sous-titres" />
              </video>
            {:else}
              <img src={previewUrl} alt="Aperçu" class="w-full max-h-48 object-contain" />
            {/if}
          </div>
        {/if}

        <button
          type="submit"
          class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          Envoyer ma preuve
        </button>
      </form>
    {/if}
  </div>
</div>
