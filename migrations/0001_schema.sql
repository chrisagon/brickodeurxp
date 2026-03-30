CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'jeune'
    CHECK(role IN ('jeune','animateur','parent','admin')),
  nom TEXT NOT NULL DEFAULT '',
  prenom TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE parent_child (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(parent_id, child_id)
);

CREATE TABLE parent_invitations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  token TEXT UNIQUE NOT NULL,
  parent_email TEXT NOT NULL,
  child_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE domains (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL
);

CREATE TABLE skills (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE badge_requests (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  jeune_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','approved','rejected')),
  proof_url TEXT NOT NULL,
  proof_type TEXT NOT NULL CHECK(proof_type IN ('photo','video')),
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  reviewed_at INTEGER,
  reviewer_id TEXT REFERENCES users(id),
  reviewer_comment TEXT
);

CREATE TABLE badges (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  jeune_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL REFERENCES badge_requests(id) ON DELETE CASCADE,
  awarded_at INTEGER NOT NULL DEFAULT (unixepoch()),
  level TEXT NOT NULL CHECK(level IN ('blanc','jaune','orange','rouge','noir'))
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX idx_badge_requests_pending ON badge_requests(status) WHERE status = 'pending';
CREATE INDEX idx_badges_jeune_domain ON badges(jeune_id);
CREATE INDEX idx_skills_domain ON skills(domain_id, active);
