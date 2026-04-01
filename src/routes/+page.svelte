<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();

  // Redirect authenticated users to their dashboard
  $effect(() => {
    if (data.session) {
      const role = data.session.user.role;
      if (role === 'jeune')          goto('/jeune/passeport');
      else if (role === 'animateur') goto('/animateur/validations');
      else if (role === 'parent')    goto('/parent/enfant');
      else if (role === 'admin')     goto('/admin/competences');
    }
  });
</script>

<!-- HERO -->
<section class="relative overflow-hidden pt-16 pb-20 text-center">
  <div class="max-w-3xl mx-auto px-4">
    <img src="/logo.png" alt="Brickodeurs" class="w-32 h-auto mx-auto mb-6 drop-shadow-xl" />
    <h1 class="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
      Le passeport numérique<br />
      <span class="text-orange-400">des Brickodeurs</span>
    </h1>
    <p class="text-lg text-gray-400 max-w-xl mx-auto mb-8">
      Prouve tes compétences en construction LEGO et en programmation,
      obtiens des badges et progresse vers la ceinture noire !
    </p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a
        href="/auth/register"
        class="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-3 rounded-xl transition-colors text-base"
      >
        Créer mon compte
      </a>
      <a
        href="/auth/login"
        class="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-8 py-3 rounded-xl transition-colors text-base"
      >
        Se connecter
      </a>
    </div>
  </div>
</section>

<!-- DOMAINS -->
<section class="max-w-4xl mx-auto px-4 pb-16">
  <h2 class="text-2xl font-bold text-center text-white mb-8">Deux domaines, un seul passeport</h2>
  <div class="grid sm:grid-cols-2 gap-6">
    <div class="bg-gray-900 rounded-2xl p-6 border border-orange-500/20">
      <div class="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
        <span class="text-2xl">🧱</span>
      </div>
      <h3 class="text-xl font-bold text-orange-400 mb-2">Brick</h3>
      <p class="text-gray-400 text-sm leading-relaxed">
        Maîtrise la construction LEGO, les engrenages, les structures mécaniques
        et les robots Mindstorms & Spike. Chaque compétence validée t'apporte un badge.
      </p>
    </div>
    <div class="bg-gray-900 rounded-2xl p-6 border border-indigo-500/20">
      <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
        <span class="text-2xl">💻</span>
      </div>
      <h3 class="text-xl font-bold text-indigo-400 mb-2">Codeur</h3>
      <p class="text-gray-400 text-sm leading-relaxed">
        Programme avec Scratch, MakeCode ou Python. Crée des comportements autonomes,
        des capteurs réactifs et des stratégies pour les compétitions FLL.
      </p>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="bg-gray-900/60 py-16">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-white mb-10">Comment ça marche ?</h2>
    <div class="grid sm:grid-cols-3 gap-8">
      <div class="text-center">
        <div class="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
          📸
        </div>
        <h3 class="font-bold text-white mb-2">1. Tu te filmes</h3>
        <p class="text-gray-400 text-sm">
          Réalise la compétence et soumets une photo ou une vidéo comme preuve via l'application.
        </p>
      </div>
      <div class="text-center">
        <div class="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
          ✅
        </div>
        <h3 class="font-bold text-white mb-2">2. Un animateur valide</h3>
        <p class="text-gray-400 text-sm">
          L'animateur de ton club examine ta preuve et valide (ou non) ta compétence.
        </p>
      </div>
      <div class="text-center">
        <div class="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
          🏅
        </div>
        <h3 class="font-bold text-white mb-2">3. Tu gagnes un badge</h3>
        <p class="text-gray-400 text-sm">
          Ton badge s'ajoute à ton passeport. Cumule les badges pour monter de niveau.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- BELT LEVELS -->
<section class="max-w-4xl mx-auto px-4 py-16">
  <h2 class="text-2xl font-bold text-center text-white mb-8">Les niveaux de ceinture</h2>
  <div class="flex flex-wrap justify-center gap-3">
    {#each [
      { level: 'Blanc',  color: '#f1f5f9', text: '#1e293b', badges: 1 },
      { level: 'Jaune',  color: '#eab308', text: '#fff',    badges: 2 },
      { level: 'Orange', color: '#f97316', text: '#fff',    badges: 3 },
      { level: 'Rouge',  color: '#ef4444', text: '#fff',    badges: 4 },
      { level: 'Noir',   color: '#1f2937', text: '#fff',    badges: 5 },
    ] as belt}
      <div class="flex flex-col items-center gap-2 w-24">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center font-black text-lg shadow-lg border-2 border-gray-700"
          style="background:{belt.color}; color:{belt.text}"
        >
          {belt.level.charAt(0)}
        </div>
        <span class="text-sm font-semibold text-gray-300">{belt.level}</span>
        <span class="text-xs text-gray-500">{belt.badges} badge{belt.badges > 1 ? 's' : ''}</span>
      </div>
    {/each}
  </div>
</section>

<!-- FOR PARENTS -->
<section class="bg-gray-900/60 py-16">
  <div class="max-w-2xl mx-auto px-4 text-center">
    <div class="text-4xl mb-4">👨‍👧‍👦</div>
    <h2 class="text-2xl font-bold text-white mb-3">Pour les parents</h2>
    <p class="text-gray-400 mb-6">
      Suivez la progression de votre enfant en temps réel.
      Vous recevez un lien magique par email lors de son inscription —
      aucun mot de passe à retenir.
    </p>
    <div class="inline-flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2 text-sm text-gray-300">
      <span>📧</span>
      <span>Invitation automatique à l'inscription de votre enfant</span>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="max-w-2xl mx-auto px-4 py-20 text-center">
  <h2 class="text-3xl font-extrabold text-white mb-4">Prêt à commencer ?</h2>
  <p class="text-gray-400 mb-8">Rejoins le club, construis, programme et obtiens tes badges !</p>
  <a
    href="/auth/register"
    class="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg shadow-xl"
  >
    Créer mon compte gratuitement
  </a>
</section>