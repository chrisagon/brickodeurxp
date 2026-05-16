-- Gestion des projets et tâches KANBAN
-- Un projet est créé par un animateur et contient des tâches.
-- Les tâches peuvent être assignées à plusieurs jeunes.

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date INTEGER NOT NULL,
  end_date INTEGER NOT NULL,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT 'todo' CHECK(state IN ('todo', 'in_progress', 'done', 'delivered')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS task_assignments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  jeune_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by TEXT NOT NULL REFERENCES users(id),
  assigned_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(task_id, jeune_id)
);

CREATE TABLE IF NOT EXISTS task_skills (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  UNIQUE(task_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_jeune ON task_assignments(jeune_id);
CREATE INDEX IF NOT EXISTS idx_task_skills_task ON task_skills(task_id);
