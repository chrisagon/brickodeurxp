<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  const editing = $derived(!!data.editableRequest);

  let fileName = $state('');
  let previewUrl = $state<string | null>(null);
  let isVideo = $state(false);

  let projectFileName = $state('');
  let projectPreviewUrl = $state<string | null>(null);
  let projectIsImage = $state(false);
  let removeProject = $state(false);

  const existingProofUrl = $derived(
    data.editableRequest ? `/api/proofs/${data.editableRequest.proof_url.replace('proofs/', '')}` : null
  );
  const existingProjectUrl = $derived(
    data.editableRequest?.project_url
      ? `/api/projects/${data.editableRequest.project_url.replace('projects/', '')}`
      : null
  );

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    fileName = file.name;
    isVideo = file.type.startsWith('video/');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
  }

  function onProjectChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    projectFileName = file.name;
    projectIsImage = file.type.startsWith('image/');
    if (projectPreviewUrl) URL.revokeObjectURL(projectPreviewUrl);
    projectPreviewUrl = projectIsImage ? URL.createObjectURL(file) : null;
    removeProject = false;
  }
</script>

<div class="max-w-lg mx-auto">
  <a href="/jeune/passeport" class="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
    ← Retour au passeport
  </a>

  <div class="bg-gray-900 rounded-xl p-6">
    <h1 class="text-xl font-bold text-orange-400 mb-1">
      {editing ? 'Modifier ma preuve' : 'Soumettre une preuve'}
    </h1>
    <p class="text-sm text-gray-400 mb-1">Compétence : <strong class="text-gray-200">{data.skill.title}</strong></p>
    <p class="text-xs text-gray-500 mb-6">Domaine : {data.skill.domain_name}</p>

    {#if data.hasApproved}
      <div class="bg-green-900/30 border border-green-800 rounded-lg p-4">
        <p class="text-green-400 text-sm font-medium">✓ Tu as déjà obtenu ce badge !</p>
      </div>
    {:else}
      {#if form?.error}
        <p class="mb-4 p-3 bg-red-900/40 text-red-300 rounded-lg text-sm">{form.error}</p>
      {/if}

      {#if data.editableRequest?.status === 'to_complete'}
        <div class="mb-4 p-3 bg-amber-900/30 border border-amber-800 rounded-lg">
          <p class="text-amber-400 text-sm font-medium">✎ L'animateur demande de compléter cette preuve.</p>
          {#if data.editableRequest.reviewer_comment}
            <p class="text-sm text-gray-300 mt-1">{data.editableRequest.reviewer_comment}</p>
          {/if}
        </div>
      {:else if data.editableRequest?.status === 'pending'}
        <div class="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg">
          <p class="text-yellow-400 text-sm font-medium">⏳ Demande en attente de validation.</p>
          <p class="text-xs text-gray-500 mt-1">Tu peux encore la modifier tant qu'un animateur ne l'a pas traitée.</p>
        </div>
      {/if}

      {#if data.skill.description}
        <div class="mb-5 p-3 bg-gray-800 rounded-lg">
          <p class="text-xs text-gray-400 font-medium mb-1">Description :</p>
          <p class="text-sm text-gray-300">{data.skill.description}</p>
        </div>
      {/if}

      <form
        method="POST"
        action={editing ? '?/update' : undefined}
        enctype="multipart/form-data"
        class="flex flex-col gap-4"
      >
        {#if editing}
          <input type="hidden" name="request_id" value={data.editableRequest.id} />
        {/if}

        <!-- Commentaire du jeune -->
        <div>
          <label class="block text-sm text-gray-400 mb-1" for="comment">
            Commentaire (optionnel)
          </label>
          <textarea
            id="comment"
            name="comment"
            rows="3"
            placeholder="Décris ce que tu as fait, les difficultés rencontrées..."
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
            >{data.editableRequest?.jeune_comment ?? ''}</textarea>
        </div>

        <!-- Capture d'écran / vidéo -->
        <div>
          <p class="block text-sm text-gray-400 mb-2">
            Photo ou vidéo de ta réalisation {#if !editing}<span class="text-red-400">*</span>{/if}
          </p>

          {#if editing && !previewUrl && existingProofUrl}
            <div class="mb-2 rounded-lg overflow-hidden bg-gray-800 max-h-48">
              {#if data.editableRequest.proof_type === 'video'}
                <video src={existingProofUrl} controls class="w-full max-h-48 object-contain">
                  <track kind="captions" src="" label="Sous-titres" />
                </video>
              {:else}
                <img src={existingProofUrl} alt="Preuve actuelle" class="w-full max-h-48 object-contain" />
              {/if}
            </div>
            <p class="text-xs text-gray-500 mb-2">Preuve actuelle. Choisis un fichier pour la remplacer.</p>
          {/if}

          <label
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-gray-800/50"
          >
            <input
              name="proof"
              type="file"
              accept="image/*,video/*"
              class="hidden"
              onchange={onFileChange}
              required={!editing}
            />
            {#if fileName}
              <span class="text-sm text-orange-400">{fileName}</span>
            {:else}
              <span class="text-3xl mb-1">📎</span>
              <span class="text-sm text-gray-500">{editing ? 'Cliquer pour remplacer' : 'Cliquer pour choisir'}</span>
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

        <!-- Fichier projet (optionnel) -->
        <div>
          <p class="block text-sm text-gray-400 mb-2">Fichier projet (optionnel)</p>

          {#if editing && existingProjectUrl && !projectFileName && !removeProject}
            <div class="mb-2 flex items-center justify-between gap-2 p-2 bg-gray-800 rounded-lg">
              <a href={existingProjectUrl} target="_blank" rel="noopener" class="text-sm text-orange-400 hover:underline truncate">
                Fichier projet actuel
              </a>
              <button
                type="button"
                onclick={() => (removeProject = true)}
                class="text-xs text-red-400 hover:text-red-300 shrink-0"
              >
                Supprimer
              </button>
            </div>
          {/if}

          {#if editing && removeProject}
            <input type="hidden" name="remove_project" value="true" />
            <p class="text-xs text-red-400 mb-2">
              Le fichier projet sera supprimé.
              <button type="button" onclick={() => (removeProject = false)} class="underline hover:text-red-300">Annuler</button>
            </p>
          {/if}

          <label
            class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-gray-800/50"
          >
            <input
              name="project"
              type="file"
              class="hidden"
              onchange={onProjectChange}
            />
            {#if projectFileName}
              <span class="text-sm text-orange-400">{projectFileName}</span>
            {:else}
              <span class="text-2xl mb-1">🗂️</span>
              <span class="text-sm text-gray-500">ZIP, PDF, image...</span>
            {/if}
          </label>
        </div>

        {#if projectPreviewUrl}
          <div class="rounded-lg overflow-hidden bg-gray-800 max-h-32">
            <img src={projectPreviewUrl} alt="Aperçu projet" class="w-full max-h-32 object-contain" />
          </div>
        {/if}

        <button
          type="submit"
          class="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {editing ? 'Enregistrer les modifications' : 'Envoyer ma preuve'}
        </button>
      </form>
    {/if}
  </div>
</div>
