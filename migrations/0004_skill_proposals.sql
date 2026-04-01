CREATE TABLE skill_proposals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  proposed_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','approved','rejected')),
  reviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewer_note TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  reviewed_at INTEGER
);

CREATE INDEX idx_skill_proposals_pending ON skill_proposals(status) WHERE status = 'pending';
