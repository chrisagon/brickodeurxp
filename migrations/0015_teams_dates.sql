-- Ajouter dates de début et de fin aux équipes + archivage
-- Permet de gérer des équipes temporelles (ex: équipe 2024-2025)

ALTER TABLE teams ADD COLUMN start_date INTEGER NOT NULL DEFAULT (unixepoch());
ALTER TABLE teams ADD COLUMN end_date INTEGER NOT NULL DEFAULT (unixepoch() + 31536000); -- 1 an par défaut
ALTER TABLE teams ADD COLUMN archived INTEGER NOT NULL DEFAULT 0; -- 0 = actif, 1 = archivé

-- Index pour filtrage efficace
CREATE INDEX IF NOT EXISTS idx_teams_end_date ON teams(end_date);
CREATE INDEX IF NOT EXISTS idx_teams_archived ON teams(archived);
