-- Migration 0009: Refonte badges par catégories
-- Un badge = toutes les compétences d'une catégorie validées

-- 1. Nouvelle table categories (couche entre domain et skills)
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_categories_domain ON categories(domain_id);

-- 2. Lier les compétences aux catégories
ALTER TABLE skills ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;

-- 3. Recréer la table badges (badge = catégorie, pas compétence individuelle)
DROP TABLE IF EXISTS badges;
CREATE TABLE badges (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  jeune_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL REFERENCES badge_requests(id) ON DELETE CASCADE,
  awarded_at INTEGER NOT NULL DEFAULT (unixepoch()),
  level TEXT NOT NULL CHECK(level IN ('blanc','jaune','orange','rouge','noir')),
  printed_by TEXT REFERENCES users(id),
  printed_at INTEGER
);
CREATE INDEX idx_badges_jeune ON badges(jeune_id);
CREATE INDEX idx_badges_printed ON badges(printed_by);
