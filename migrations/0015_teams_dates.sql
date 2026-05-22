-- Ajouter dates de début et de fin aux équipes + archivage
-- Permet de gérer des équipes temporelles (ex: équipe 2024-2025)

-- Ajouter les colonnes avec des valeurs par défaut constantes
ALTER TABLE teams ADD COLUMN start_date INTEGER NOT NULL DEFAULT 0;
ALTER TABLE teams ADD COLUMN end_date INTEGER NOT NULL DEFAULT 0;
ALTER TABLE teams ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;

-- Mise à jour des valeurs par défaut pour les nouvelles entrées
-- (les colonnes existantes garderont leur valeur par défaut de 0 jusqu'à mise à jour explicite)

-- Index pour filtrage efficace
CREATE INDEX IF NOT EXISTS idx_teams_end_date ON teams(end_date);
CREATE INDEX IF NOT EXISTS idx_teams_archived ON teams(archived);
