<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';

  let { data, form } = $props<{ data: PageData; form: ActionData }>();
  let textarea = $state('');
</script>

<div class="max-w-2xl mx-auto flex flex-col h-[calc(100vh-180px)]">
  <!-- En-tête -->
  <div class="flex items-center gap-3 mb-4">
    <a href="/animateur/annuaire" class="text-gray-500 hover:text-gray-300 text-sm">← Annuaire</a>
    <div class="h-4 w-px bg-gray-800"></div>
    <span class="font-bold text-gray-200">{data.other.prenom} {data.other.nom}</span>
    <span class="text-xs text-gray-500">{data.other.email}</span>
  </div>

  <!-- Fil de messages -->
  <div class="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
    {#if data.messages.length === 0}
      <div class="text-center py-12 text-gray-600 text-sm">
        Aucun message. Commencez la conversation !
      </div>
    {:else}
      {#each data.messages as msg}
        {@const mine = msg.from_id === data.currentId}
        <div class="flex {mine ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[75%]">
            {#if !mine}
              <div class="text-xs text-gray-500 mb-1 ml-1">
                {msg.sender_prenom} {msg.sender_nom}
              </div>
            {/if}
            <div
              class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed {mine
                ? 'bg-orange-500 text-white rounded-tr-sm'
                : 'bg-gray-800 text-gray-200 rounded-tl-sm'}"
            >
              {msg.content}
            </div>
            <div class="text-xs text-gray-600 mt-1 {mine ? 'text-right' : 'text-left'} mx-1">
              {new Date(msg.created_at * 1000).toLocaleString('fr-FR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Zone de saisie -->
  {#if form?.error}
    <p class="text-red-400 text-xs mb-2">{form.error}</p>
  {/if}

  <form
    method="POST"
    use:enhance={() => {
      return ({ update }) => { textarea = ''; update(); };
    }}
    class="flex gap-2"
  >
    <textarea
      name="content"
      bind:value={textarea}
      rows="2"
      placeholder="Votre message…"
      required
      maxlength="2000"
      onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }}
      class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
    ></textarea>
    <button
      type="submit"
      class="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 rounded-xl transition-colors self-end pb-2 pt-2"
    >
      ↑
    </button>
  </form>
</div>
