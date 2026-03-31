import bcrypt from 'bcryptjs';
import type { D1Database } from '@cloudflare/workers-types';
import { getUserById } from './db';

export type Session = {
  user: {
    id: string;
    email: string;
    role: string;
    nom: string;
    prenom: string;
  };
  token: string;
  expires_at: number;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(db: D1Database, userId: string): Promise<Session> {
  const user = await getUserById(db, userId);
  if (!user) throw new Error('Utilisateur introuvable');

  const token = crypto.randomUUID();
  const expires_at = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days

  await db
    .prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (lower(hex(randomblob(16))), ?, ?, ?)'
    )
    .bind(userId, token, expires_at)
    .run();

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
    },
    token,
    expires_at,
  };
}

export async function getSessionFromToken(db: D1Database, token: string): Promise<Session | null> {
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare(`
      SELECT s.token, s.expires_at, u.id, u.email, u.role, u.nom, u.prenom
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ?
    `)
    .bind(token, now)
    .first<{
      token: string; expires_at: number;
      id: string; email: string; role: string; nom: string; prenom: string;
    }>();

  if (!row) return null;

  return {
    user: { id: row.id, email: row.email, role: row.role, nom: row.nom, prenom: row.prenom },
    token: row.token,
    expires_at: row.expires_at,
  };
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}
