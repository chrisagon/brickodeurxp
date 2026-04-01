-- Seed local dev — comptes de test
-- Mots de passe : Admin1234! / Anim1234! / Jeune1234!
-- À NE PAS appliquer en production

INSERT OR IGNORE INTO users (id, email, password_hash, role, nom, prenom, created_at) VALUES
  ('user-admin-1',  'admin@test.fr',    '$2b$12$NJyfY9c7pWDlCdidPTZq9.Uh9ED766xA76VrggpTQbASTohJYPEzO', 'admin',     'Admin',    'Test',   unixepoch()),
  ('user-anim-1',   'anim@test.fr',     '$2b$12$rOqCqCNAwZJJHxADpk0E5.PFt6k107Xtn5HTtwax8mVX2jpTyef8W', 'animateur', 'Animateur','Test',   unixepoch()),
  ('user-jeune-1',  'jeune@test.fr',    '$2b$12$3vDGcKY/BCdGjULhzrOa9uR15VAYq7HNCsVp60nhiol.bGEu2v786', 'jeune',     'Jeune',    'Test',   unixepoch()),
  ('user-parent-1', 'parent@test.fr',   '$2b$12$3vDGcKY/BCdGjULhzrOa9uR15VAYq7HNCsVp60nhiol.bGEu2v786', 'parent',    'Parent',   'Test',   unixepoch());

-- Lien parent ↔ enfant
INSERT OR IGNORE INTO parent_child (parent_id, child_id) VALUES
  ('user-parent-1', 'user-jeune-1');

-- Quelques compétences de démo (sort_order = ordre d'affichage)
INSERT OR IGNORE INTO skills (id, domain_id, title, description, sort_order, active) VALUES
  ('skill-brick-1', 'dom-brick',   'Assembler un châssis',    'Construire un châssis stable avec pièces LEGO Technic',    1, 1),
  ('skill-brick-2', 'dom-brick',   'Monter un engrenage',     'Assembler un système d''engrenages fonctionnel',            2, 1),
  ('skill-brick-3', 'dom-brick',   'Créer une liaison pivot', 'Réaliser une liaison pivot avec les pièces LEGO',          3, 1),
  ('skill-brick-4', 'dom-brick',   'Robot autonome',          'Construire un robot capable d''éviter les obstacles',       4, 1),
  ('skill-brick-5', 'dom-brick',   'Robot FLL',               'Assembler un robot conforme aux règles FLL',                5, 1),
  ('skill-code-1',  'dom-codeur',  'Boucle repeat',           'Utiliser une boucle repeat dans Spike/EV3',                 1, 1),
  ('skill-code-2',  'dom-codeur',  'Capteur ultrason',        'Lire et utiliser la valeur d''un capteur ultrason',         2, 1),
  ('skill-code-3',  'dom-codeur',  'Variables',               'Déclarer et utiliser des variables dans un programme',      3, 1),
  ('skill-code-4',  'dom-codeur',  'Fonctions',               'Créer et appeler des fonctions personnalisées',             4, 1),
  ('skill-code-5',  'dom-codeur',  'Mission FLL',             'Programmer une mission FLL complète en autonomie',          5, 1);
