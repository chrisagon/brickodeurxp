CREATE TABLE magic_login_tokens (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_magic_login_token ON magic_login_tokens(token);
