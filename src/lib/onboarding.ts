import { driver, type DriveStep, type Popover } from 'driver.js';
import 'driver.js/dist/driver.css';

export type OnboardingRole = 'jeune' | 'animateur';

const STORAGE_KEY = (role: OnboardingRole) => `onboarding_seen_${role}`;

const SHARED_POPOVER: Popover = {
  showButtons: ['next', 'close'],
  nextBtnText: 'Suivant →',
  prevBtnText: '← Précédent',
  doneBtnText: 'Terminer',
};

/**
 * Étapes du tour d'onboarding pour le rôle « jeune ».
 * Démarre sur /jeune/passeport (page d'accueil du jeune).
 */
const JEUNE_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Bienvenue sur BrickodeurXP 👋',
      description:
        "Voici ton espace personnel. En quelques étapes, je te montre comment valider tes compétences et décrocher des badges !",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="brand"]',
    popover: {
      title: 'Ton point de départ',
      description: "Clique sur BrickodeurXP pour revenir à ton passeport à tout moment.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="jeune-passeport"]',
    popover: {
      title: 'Mon passeport',
      description:
        "C'est ton carnet de compétences : tu vois ici les domaines, catégories et toutes les compétences que tu peux valider.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="jeune-projets"]',
    popover: {
      title: 'Mes projets',
      description: "Retrouve ici les projets que ton animateur t'a confiés et leur avancement.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="jeune-annuaire"]',
    popover: {
      title: 'Annuaire',
      description: "La liste des autres jeunes de ton organisation.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="jeune-messages"]',
    popover: {
      title: 'Messages',
      description: "Discute avec ton animateur. Le badge orange indique les messages non lus.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="passeport-title"]',
    popover: {
      title: 'Le passeport',
      description:
        "Chaque compétence peut être soumise pour validation. Clique sur « Soumettre » à côté d'une compétence pour envoyer une preuve (photo, vidéo, fichier).",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="jeune-submit"]',
    popover: {
      title: 'Soumettre une preuve',
      description:
        "Ce bouton ouvre le formulaire où tu décris ta preuve et joins un fichier. Ton animateur validera ensuite ta demande.",
      showButtons: ['next', 'close'],
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
    },
  },
  {
    element: '[data-tour="leaderboard"]',
    popover: {
      title: 'Classement',
      description: "Suis la progression de ton équipe et compare-toi aux autres jeunes.",
      showButtons: ['next', 'close'],
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
    },
  },
  {
    element: '[data-tour="profile"]',
    popover: {
      title: 'Ton profil',
      description: "Gère tes informations personnelles depuis ici.",
      showButtons: ['next', 'close'],
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
    },
  },
];

/**
 * Étapes du tour d'onboarding pour le rôle « animateur ».
 * Démarre sur /animateur/validations (page d'accueil de l'animateur).
 */
const ANIMATEUR_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Bienvenue animateur 👋',
      description:
        "Voici ton espace d'encadrement. Je te montre rapidement comment valider les demandes et gérer ton groupe.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="anim-validations"]',
    popover: {
      title: 'Validations',
      description:
        "La file des demandes de badges envoyées par les jeunes. Clique sur une demande pour la développer et valider, demander un complément ou refuser.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="anim-competences"]',
    popover: {
      title: 'Compétences',
      description: "Consulte le catalogue public des compétences disponibles.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="anim-equipes"]',
    popover: {
      title: 'Équipes',
      description: "Gère la composition des équipes de jeunes.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="anim-projets"]',
    popover: {
      title: 'Projets',
      description: "Crée et suis les projets confiés aux jeunes.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="anim-proposer"]',
    popover: {
      title: 'Proposer une compétence',
      description: "Suggère une nouvelle compétence au catalogue, soumise à validation admin.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="anim-impression"]',
    popover: {
      title: 'Impression badges',
      description: "Génère des badges imprimables (SVG) pour les jeunes.",
      ...SHARED_POPOVER,
    },
  },
  {
    element: '[data-tour="anim-validations-title"]',
    popover: {
      title: 'La file de validation',
      description:
        "Chaque demande est repliable. Clique dessus pour voir la preuve (photo/vidéo/fichier) puis valider, demander un complément ou refuser. Quand toutes les compétences d'une catégorie sont validées, un badge est automatiquement décerné.",
      showButtons: ['next', 'close'],
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
    },
  },
  {
    element: '[data-tour="anim-annuaire"]',
    popover: {
      title: 'Annuaire & Messages',
      description: "Contacte les jeunes et consulte l'annuaire.",
      showButtons: ['next', 'close'],
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
    },
  },
];

const STEPS: Record<OnboardingRole, DriveStep[]> = {
  jeune: JEUNE_STEPS,
  animateur: ANIMATEUR_STEPS,
};

/**
 * Démarre le tour d'onboarding pour le rôle donné.
 * Marque le tour comme « vu » à la fermeture (complété ou interrompu)
 * pour ne pas relancer automatiquement à chaque visite.
 */
function filterExisting(steps: DriveStep[]): DriveStep[] {
  // Ne conserve que les étapes sans élément (popover centré) ou dont
  // l'élément ciblé est présent dans le DOM. Évite les erreurs quand un
  // bloc conditionnel (ex. bouton « Soumettre ») n'est pas rendu.
  return steps.filter((step) => {
    if (!step.element) return true;
    return document.querySelector(String(step.element)) !== null;
  });
}

export function startTour(role: OnboardingRole) {
  const steps = filterExisting(STEPS[role]);
  if (steps.length === 0) return;
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    progressText: '{{current}} / {{total}}',
    nextBtnText: 'Suivant →',
    prevBtnText: '← Précédent',
    doneBtnText: 'Terminer',
    steps,
    onDestroyed: () => {
      try {
        localStorage.setItem(STORAGE_KEY(role), '1');
      } catch {
        /* localStorage indisponible (mode privé) : on ignore */
      }
    },
  });
  driverObj.drive();
}

/**
 * Démarre automatiquement le tour si l'utilisateur n'a jamais vu
 * l'onboarding pour ce rôle. À appeler côté client uniquement.
 */
export function maybeAutoStart(role: OnboardingRole) {
  try {
    if (localStorage.getItem(STORAGE_KEY(role))) return;
  } catch {
    return;
  }
  // Petit délai pour laisser le DOM de la page se stabiliser.
  setTimeout(() => startTour(role), 300);
}

/**
 * Réinitialise l'état « vu » et relance le tour (bouton « Revoir le guide »).
 */
export function replayTour(role: OnboardingRole) {
  try {
    localStorage.removeItem(STORAGE_KEY(role));
  } catch {
    /* ignore */
  }
  startTour(role);
}

/**
 * Indique si l'onboarding a déjà été vu pour ce rôle.
 */
export function hasSeenOnboarding(role: OnboardingRole): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY(role)));
  } catch {
    return false;
  }
}