CREATE TABLE messages (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  from_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  read_at    INTEGER
);

CREATE INDEX idx_messages_to       ON messages(to_id, read_at);
CREATE INDEX idx_messages_convo    ON messages(from_id, to_id, created_at);
