-- Ajout des colonnes d'impression sur les badges
ALTER TABLE badges ADD COLUMN printed_by TEXT REFERENCES users(id);
ALTER TABLE badges ADD COLUMN printed_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_badges_printed ON badges(printed_by);
