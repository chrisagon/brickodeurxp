-- Rendre team_id nullable pour permettre les projets non assignés à une équipe

-- Créer une nouvelle table sans contrainte NOT NULL
CREATE TABLE projects_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date INTEGER NOT NULL,
  end_date INTEGER NOT NULL,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Copier les données
INSERT INTO projects_new SELECT * FROM projects;

-- Supprimer l'ancienne table
DROP TABLE projects;

-- Renommer la nouvelle table
ALTER TABLE projects_new RENAME TO projects;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
