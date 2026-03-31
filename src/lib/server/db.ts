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

export type PendingRequestRow = {
  id: string;
  proof_url: string;
  proof_type: 'photo' | 'video';
  submitted_at: number;
  jeune_prenom: string;
  jeune_nom: string;
  skill_title: string;
  skill_id: string;
  domain_name: string;
  domain_color: string;
  domain_icon: string;
};

export async function getPendingRequests(db: D1Database): Promise<PendingRequestRow[]> {
  const result = await db
    .prepare(`
      SELECT
        br.id, br.proof_url, br.proof_type, br.submitted_at,
        u.prenom AS jeune_prenom, u.nom AS jeune_nom,
        s.title AS skill_title, s.id AS skill_id,
        d.name AS domain_name, d.color AS domain_color, d.icon AS domain_icon
      FROM badge_requests br
      JOIN users u ON u.id = br.jeune_id
      JOIN skills s ON s.id = br.skill_id
      JOIN domains d ON d.id = s.domain_id
      WHERE br.status = 'pending'
      ORDER BY br.submitted_at ASC
    `)
    .all<PendingRequestRow>();
  return result.results;
}

export async function createBadgeRequest(
  db: D1Database,
  jeuneId: string,
  skillId: string,
  proofUrl: string,
  proofType: 'photo' | 'video'
): Promise<string> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      'INSERT INTO badge_requests (id, jeune_id, skill_id, proof_url, proof_type) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(id, jeuneId, skillId, proofUrl, proofType)
    .run();
  return id;
}

export async function getRequestById(
  db: D1Database,
  requestId: string
): Promise<BadgeRequest | null> {
  const result = await db
    .prepare(
      'SELECT id, jeune_id, skill_id, status, proof_url, proof_type, submitted_at, reviewed_at, reviewer_id, reviewer_comment FROM badge_requests WHERE id = ?'
    )
    .bind(requestId)
    .first<BadgeRequest>();
  return result ?? null;
}

export async function approveRequest(
  db: D1Database,
  requestId: string,
  reviewerId: string,
  comment: string
): Promise<Badge> {
  const now = Math.floor(Date.now() / 1000);

  // UPDATE atomique — n'agit que si status='pending'
  const updateResult = await db
    .prepare(
      'UPDATE badge_requests SET status = ?, reviewer_id = ?, reviewer_comment = ?, reviewed_at = ? WHERE id = ? AND status = ?'
    )
    .bind('approved', reviewerId, comment || null, now, requestId, 'pending')
    .run();

  if (updateResult.meta.changes === 0) {
    const existing = await getRequestById(db, requestId);
    if (!existing) throw new Error('Demande introuvable');
    throw new Error('Demande déjà traitée');
  }

  // Lire les données nécessaires pour créer le badge
  const request = await getRequestById(db, requestId);
  if (!request) throw new Error('Demande introuvable après approbation');

  const domainRow = await db
    .prepare('SELECT d.id FROM domains d JOIN skills s ON s.domain_id = d.id WHERE s.id = ?')
    .bind(request.skill_id)
    .first<{ id: string }>();
  if (!domainRow) throw new Error('Domaine introuvable pour skill_id: ' + request.skill_id);

  const countRow = await db
    .prepare(`
      SELECT COUNT(*) AS count FROM badges b
      JOIN skills s ON s.id = b.skill_id
      WHERE b.jeune_id = ? AND s.domain_id = ?
    `)
    .bind(request.jeune_id, domainRow.id)
    .first<{ count: number }>();

  const newCount = (countRow?.count ?? 0) + 1;

  const LEVEL_MAP: [number, Badge['level']][] = [
    [5, 'noir'], [4, 'rouge'], [3, 'orange'], [2, 'jaune'], [1, 'blanc'],
  ];
  const level = LEVEL_MAP.find(([t]) => newCount >= t)?.[1] ?? 'blanc';

  const badgeId = crypto.randomUUID();
  await db
    .prepare(
      'INSERT INTO badges (id, jeune_id, skill_id, request_id, awarded_at, level) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(badgeId, request.jeune_id, request.skill_id, requestId, now, level)
    .run();

  return {
    id: badgeId,
    jeune_id: request.jeune_id,
    skill_id: request.skill_id,
    request_id: requestId,
    awarded_at: now,
    level,
  };
}

export async function rejectRequest(
  db: D1Database,
  requestId: string,
  reviewerId: string,
  comment: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const updateResult = await db
    .prepare(
      'UPDATE badge_requests SET status = ?, reviewer_id = ?, reviewer_comment = ?, reviewed_at = ? WHERE id = ? AND status = ?'
    )
    .bind('rejected', reviewerId, comment || null, now, requestId, 'pending')
    .run();

  if (updateResult.meta.changes === 0) {
    const existing = await getRequestById(db, requestId);
    if (!existing) throw new Error('Demande introuvable');
    throw new Error('Demande déjà traitée');
  }
}

export async function getBadgeRequestsByJeune(
  db: D1Database,
  jeuneId: string
): Promise<BadgeRequest[]> {
  const result = await db
    .prepare(
      'SELECT id, jeune_id, skill_id, status, proof_url, proof_type, submitted_at, reviewed_at, reviewer_id, reviewer_comment FROM badge_requests WHERE jeune_id = ? ORDER BY submitted_at DESC'
    )
    .bind(jeuneId)
    .all<BadgeRequest>();
  return result.results;
}

export async function getChildrenByParent(db: D1Database, parentId: string): Promise<User[]> {
  const result = await db
    .prepare(
      'SELECT u.id, u.email, u.role, u.nom, u.prenom, u.created_at FROM users u JOIN parent_child pc ON pc.child_id = u.id WHERE pc.parent_id = ?'
    )
    .bind(parentId)
    .all<User>();
  return result.results;
}

export async function getParentsByChild(db: D1Database, childId: string): Promise<User[]> {
  const result = await db
    .prepare(
      'SELECT u.id, u.email, u.role, u.nom, u.prenom, u.created_at FROM users u JOIN parent_child pc ON pc.parent_id = u.id WHERE pc.child_id = ?'
    )
    .bind(childId)
    .all<User>();
  return result.results;
}

// ── Skill Proposals ──────────────────────────────────────────────────────────

export type SkillProposal = {
  id: string;
  domain_id: string;
  title: string;
  description: string;
  proposed_by: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id: string | null;
  reviewer_note: string | null;
  created_at: number;
  reviewed_at: number | null;
};

export type SkillProposalWithMeta = SkillProposal & {
  proposer_prenom: string;
  proposer_nom: string;
  domain_name: string;
};

export async function createSkillProposal(
  db: D1Database,
  proposedBy: string,
  domainId: string,
  title: string,
  description: string
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO skill_proposals (domain_id, title, description, proposed_by) VALUES (?, ?, ?, ?)'
    )
    .bind(domainId, title, description, proposedBy)
    .run();
}

export async function getPendingProposals(db: D1Database): Promise<SkillProposalWithMeta[]> {
  const result = await db
    .prepare(
      `SELECT sp.id, sp.domain_id, sp.title, sp.description, sp.proposed_by,
              sp.status, sp.reviewer_id, sp.reviewer_note, sp.created_at, sp.reviewed_at,
              u.prenom AS proposer_prenom, u.nom AS proposer_nom,
              d.name AS domain_name
       FROM skill_proposals sp
       JOIN users u ON u.id = sp.proposed_by
       JOIN domains d ON d.id = sp.domain_id
       WHERE sp.status = 'pending'
       ORDER BY sp.created_at ASC`
    )
    .all<SkillProposalWithMeta>();
  return result.results;
}

export async function getProposalById(
  db: D1Database,
  proposalId: string
): Promise<SkillProposalWithMeta | null> {
  return db
    .prepare(
      `SELECT sp.id, sp.domain_id, sp.title, sp.description, sp.proposed_by,
              sp.status, sp.reviewer_id, sp.reviewer_note, sp.created_at, sp.reviewed_at,
              u.prenom AS proposer_prenom, u.nom AS proposer_nom,
              d.name AS domain_name
       FROM skill_proposals sp
       JOIN users u ON u.id = sp.proposed_by
       JOIN domains d ON d.id = sp.domain_id
       WHERE sp.id = ?`
    )
    .bind(proposalId)
    .first<SkillProposalWithMeta>();
}

export async function approveProposal(
  db: D1Database,
  proposalId: string,
  reviewerId: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  // Récupérer la proposition
  const proposal = await db
    .prepare('SELECT id, domain_id, title, description, status FROM skill_proposals WHERE id = ?')
    .bind(proposalId)
    .first<Pick<SkillProposal, 'id' | 'domain_id' | 'title' | 'description' | 'status'>>();

  if (!proposal) throw new Error('Proposition introuvable');
  if (proposal.status !== 'pending') throw new Error('Proposition déjà traitée');

  // Calcul du prochain sort_order
  const maxOrder = await db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM skills WHERE domain_id = ?')
    .bind(proposal.domain_id)
    .first<{ max_order: number }>();

  const nextOrder = (maxOrder?.max_order ?? -1) + 1;

  // Atomique : créer la compétence + marquer approuvée
  await db.batch([
    db
      .prepare(
        'INSERT INTO skills (domain_id, title, description, sort_order) VALUES (?, ?, ?, ?)'
      )
      .bind(proposal.domain_id, proposal.title, proposal.description, nextOrder),
    db
      .prepare(
        'UPDATE skill_proposals SET status = ?, reviewer_id = ?, reviewed_at = ? WHERE id = ? AND status = ?'
      )
      .bind('approved', reviewerId, now, proposalId, 'pending'),
  ]);
}

export async function rejectProposal(
  db: D1Database,
  proposalId: string,
  reviewerId: string,
  note: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(
      'UPDATE skill_proposals SET status = ?, reviewer_id = ?, reviewer_note = ?, reviewed_at = ? WHERE id = ? AND status = ?'
    )
    .bind('rejected', reviewerId, note || null, now, proposalId, 'pending')
    .run();

  if (result.meta.changes === 0) {
    const p = await getProposalById(db, proposalId);
    if (!p) throw new Error('Proposition introuvable');
    throw new Error('Proposition déjà traitée');
  }
}
