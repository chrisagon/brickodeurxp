-- Ajoute le statut 'to_complete' à badge_requests.
-- SQLite ne permet pas d'ALTER une contrainte CHECK : reconstruction de la table.
-- Les FK sont désactivées pendant la reconstruction pour éviter que le DROP
-- ne cascade sur la table badges (badges.request_id ... ON DELETE CASCADE).

PRAGMA foreign_keys=OFF;

CREATE TABLE badge_requests_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  jeune_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','approved','rejected','to_complete')),
  proof_url TEXT NOT NULL,
  proof_type TEXT NOT NULL CHECK(proof_type IN ('photo','video')),
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  reviewed_at INTEGER,
  reviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewer_comment TEXT,
  jeune_comment TEXT,
  project_url TEXT,
  project_type TEXT
);

INSERT INTO badge_requests_new (
  id, jeune_id, skill_id, status, proof_url, proof_type,
  submitted_at, reviewed_at, reviewer_id, reviewer_comment,
  jeune_comment, project_url, project_type
)
SELECT
  id, jeune_id, skill_id, status, proof_url, proof_type,
  submitted_at, reviewed_at, reviewer_id, reviewer_comment,
  jeune_comment, project_url, project_type
FROM badge_requests;

DROP TABLE badge_requests;

ALTER TABLE badge_requests_new RENAME TO badge_requests;

CREATE INDEX IF NOT EXISTS idx_badge_requests_pending
  ON badge_requests(status) WHERE status = 'pending';

PRAGMA foreign_keys=ON;
