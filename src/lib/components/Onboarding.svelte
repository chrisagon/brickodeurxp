<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { maybeAutoStart, replayTour, type OnboardingRole } from '$lib/onboarding';

  let {
    role,
    homePath,
  }: { role: OnboardingRole; homePath: string } = $props();

  // Démarre automatiquement le tour à la première visite de la page
  // d'accueil du rôle. maybeAutoStart est un no-op si déjà vu.
  $effect(() => {
    if (!browser) return;
    if (page.url.pathname === homePath) {
      maybeAutoStart(role);
    }
  });
</script>

<button
  type="button"
  onclick={() => replayTour(role)}
  class="text-xs text-gray-400 hover:text-orange-400 transition-colors ml-2"
  title="Revoir le guide"
  aria-label="Revoir le guide d'onboarding"
>
  ? Guide
</button>