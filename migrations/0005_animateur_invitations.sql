CREATE TABLE animateur_invitations (
  id      TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email   TEXT NOT NULL,
  token   TEXT NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(32)))),
  invited_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL DEFAULT (unixepoch() + 7*24*3600),
  used_at    INTEGER
);

CREATE INDEX idx_animateur_inv_token ON animateur_invitations(token) WHERE used_at IS NULL;
