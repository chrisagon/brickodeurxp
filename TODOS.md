# TODOS

Dette identifiée et volontairement différée. Chaque entrée dit quoi, pourquoi,
et de quoi elle dépend.

---

## Motion — définir 2 ou 3 mouvements intentionnels

**Quoi.** Spécifier les mouvements de l'espace jeune : apparition du rang au
chargement, remplissage de la barre de progression, retour tactile à la pression
d'une ligne de compétence. Avec durées, courbes d'accélération, et la règle
`@media (prefers-reduced-motion: reduce)`.

**Pourquoi.** Le plan Néon HUD ne contient aucune règle de motion. Le test de
vérification n°6 de la revue design (« le mouvement améliore-t-il la hiérarchie
ou l'atmosphère ? ») est le seul resté échoué après correction. Sans règle
écrite, le développeur ajoutera des transitions au jugé ou n'en mettra aucune —
et une app tactile sans retour au toucher paraît inerte à un ado.

**Pour.** Le mouvement est ce qui sépare une interface correcte d'une interface
qui semble vivante. Deux ou trois mouvements suffisent, ce n'est pas un chantier.
Complète `DESIGN.md`, qui sinon naîtra sans section motion.

**Contre.** Une animation ratée est pire que pas d'animation : elle donne une
impression de lenteur ou de mal de mer. Le motion se conçoit mieux sur du réel
que sur du papier.

**Contexte.** Décidé en `/plan-design-review` le 2026-08-28 (D12). Les six autres
décisions de cette review sont entrées dans le plan ; celle-ci a été sortie parce
que le lot 1 était déjà augmenté par la hiérarchie typographique, la table des
états, la micro-copie, l'échelle d'espacement, la suppression des cartes et les
cibles tactiles à 44px.

**Dépend de.** Le lot 1 livré et déployé en prévisualisation. Le motion se règle
sur un écran réel, pas sur une maquette.

**Référence.** `~/.gstack/projects/chrisagon-brickodeurxp/chris-main-design-20260828-184500.md`

---

## Accessibilité — audit lecteur d'écran complet

**Quoi.** Vérifier le passeport avec un lecteur d'écran réel (VoiceOver iOS,
TalkBack Android), au-delà des points de repère ARIA spécifiés dans le plan.

**Pourquoi.** Le lot 1 spécifie la navigation clavier, les anneaux de focus
visibles et les points de repère ARIA. Il ne vérifie pas ce que le lecteur
d'écran annonce réellement — notamment le rang, dont l'information passe par un
hexagone PNG, et les glyphes d'état (`✓ ⏳ ✎ ✗ ○`) qui sont du texte décoratif.

**Pour.** Les glyphes d'état lus littéralement produisent du bruit incompréhensible.
Correction peu coûteuse une fois identifiée (`aria-label`, `aria-hidden`).

**Contre.** Demande un appareil réel et du temps de test manuel.

**Contexte.** Le plan traite le contraste sur huit paires et les cibles tactiles.
Le reste de l'accessibilité est spécifié mais non vérifié.

**Dépend de.** Le lot 1 déployé en prévisualisation.

---

## Rupture visuelle hors de l'espace jeune

**Quoi.** Quand un jeune clique sur « Classement » ou « Profil », il quitte
`/jeune` et retrouve le thème gris et orange d'origine.

**Pourquoi.** La décision de périmètre du plan limite `.theme-jeune` aux routes
`/jeune/*` pour ne pas toucher les autres rôles. La rupture est assumée mais
réelle, et ces deux liens sont dans la navigation permanente.

**Pour.** Corriger rendrait le parcours jeune cohérent de bout en bout.

**Contre.** Thématiser `/leaderboard` et `/profile` les expose à tous les rôles,
ce que le lot 1 a explicitement voulu éviter.

**Contexte.** Signalé par l'outside voice Codex en `/plan-eng-review`, confirmé en
`/plan-design-review`. Décision : accepté pour ce lot.

**Dépend de.** Le retour des jeunes sur le lot 1. Si la rupture les gêne, elle
devient prioritaire.
