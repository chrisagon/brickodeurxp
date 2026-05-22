-- Ajouter la colonne updated_by pour suivre qui a modifié la tâche en dernier

ALTER TABLE project_tasks ADD COLUMN updated_by TEXT REFERENCES users(id);

-- Mettre à jour les tâches existantes avec le créateur du projet comme updated_by
UPDATE project_tasks SET updated_by = projects.created_by
FROM projects WHERE project_tasks.project_id = projects.id;

CREATE INDEX IF NOT EXISTS idx_project_tasks_updated_by ON project_tasks(updated_by);
