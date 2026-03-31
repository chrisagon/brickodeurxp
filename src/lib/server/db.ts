import type { D1Database } from '@cloudflare/workers-types';

export type User = {
  id: string;
  email: string;
  role: 'jeune' | 'animateur' | 'parent' | 'admin';
  nom: string;
  prenom: string;
  created_at: number;
};

export type Domain = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Skill = {
  id: string;
  domain_id: string;
  title: string;
  description: string;
  sort_order: number;
  active: number;
};

export type Badge = {
  id: string;
  jeune_id: string;
  skill_id: string;
  request_id: string;
  awarded_at: number;
  level: 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';
};

export type BadgeRequest = {
  id: string;
  jeune_id: string;
  skill_id: string;
  status: 'pending' | 'approved' | 'rejected';
  proof_url: string;
  proof_type: 'photo' | 'video';
  submitted_at: number;
  reviewed_at: number | null;
  reviewer_id: string | null;
  reviewer_comment: string | null;
};

export type DbSession = {
  id: string;
  user_id: string;
  token: string;
  expires_at: number;
};

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT id, email, role, nom, prenom, created_at FROM users WHERE email = ?')
    .bind(email)
    .first<User>();
  return result ?? null;
}

export async function getUserByEmailWithPassword(
  db: D1Database,
  email: string
): Promise<(User & { password_hash: string | null }) | null> {
  const result = await db
    .prepare('SELECT id, email, password_hash, role, nom, prenom, created_at FROM users WHERE email = ?')
    .bind(email)
    .first<User & { password_hash: string | null }>();
  return result ?? null;
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT id, email, role, nom, prenom, created_at FROM users WHERE id = ?')
    .bind(id)
    .first<User>();
  return result ?? null;
}

export async function getAllDomains(db: D1Database): Promise<Domain[]> {
  const result = await db.prepare('SELECT id, name, color, icon FROM domains ORDER BY name').all<Domain>();
  return result.results;
}

export async function getSkillsByDomain(db: D1Database, domainId: string): Promise<Skill[]> {
  const result = await db
    .prepare('SELECT id, domain_id, title, description, sort_order, active FROM skills WHERE domain_id = ? AND active = 1 ORDER BY sort_order')
    .bind(domainId)
    .all<Skill>();
  return result.results;
}

export async function getBadgesByJeune(db: D1Database, jeuneId: string): Promise<Badge[]> {
  const result = await db
    .prepare('SELECT id, jeune_id, skill_id, request_id, awarded_at, level FROM badges WHERE jeune_id = ? ORDER BY awarded_at DESC')
    .bind(jeuneId)
    .all<Badge>();
  return result.results;
}

export async function createParentInvitation(
  db: D1Database,
  parentEmail: string,
  childId: string
): Promise<string> {
  const token = crypto.randomUUID();
  const expires_at = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days

  await db
    .prepare(
      'INSERT INTO parent_invitations (token, parent_email, child_id, expires_at) VALUES (?, ?, ?, ?)'
    )
    .bind(token, parentEmail, childId, expires_at)
    .run();

  return token;
}

export async function getValidInvitation(
  db: D1Database,
  token: string
): Promise<{ parent_email: string; child_id: string } | null> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(
      'SELECT parent_email, child_id FROM parent_invitations WHERE token = ? AND expires_at > ? AND used = 0'
    )
    .bind(token, now)
    .first<{ parent_email: string; child_id: string }>();
  return result ?? null;
}

export async function markInvitationUsed(db: D1Database, token: string): Promise<void> {
  await db
    .prepare('UPDATE parent_invitations SET used = 1 WHERE token = ?')
    .bind(token)
    .run();
}

export async function linkParentChild(
  db: D1Database,
  parentId: string,
  childId: string
): Promise<void> {
  await db
    .prepare(
      'INSERT OR IGNORE INTO parent_child (parent_id, child_id) VALUES (?, ?)'
    )
    .bind(parentId, childId)
    .run();
}
