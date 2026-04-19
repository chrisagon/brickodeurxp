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

export type Category = {
  id: string;
  domain_id: string;
  name: string;
  description: string;
  sort_order: number;
};

export type Skill = {
  id: string;
  domain_id: string;
  category_id: string | null;
  title: string;
  description: string;
  sort_order: number;
  active: number;
};

export type Badge = {
  id: string;
  jeune_id: string;
  category_id: string;
  request_id: string;
  awarded_at: number;
  level: 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';
  printed_by: string | null;
  printed_at: number | null;
};

export type BadgePrintRow = {
  id: string;
  awarded_at: number;
  level: 'blanc' | 'jaune' | 'orange' | 'rouge' | 'noir';
  jeune_prenom: string;
  jeune_nom: string;
  category_name: string;
  domain_name: string;
  domain_color: string;
  printed_by: string | null;
  printed_at: number | null;
  printer_prenom: string | null;
  printer_nom: string | null;
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
  jeune_comment: string | null;
  project_url: string | null;
  project_type: string | null;
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

export async function createDomain(
  db: D1Database,
  name: string,
  color: string,
  icon: string
): Promise<Domain> {
  const domain = await db
    .prepare('INSERT INTO domains (name, color, icon) VALUES (?, ?, ?) RETURNING id, name, color, icon')
    .bind(name, color, icon)
    .first<Domain>();
  if (!domain) throw new Error('Échec création domaine');
  return domain;
}

export async function updateDomain(
  db: D1Database,
  id: string,
  name: string,
  color: string,
  icon: string
): Promise<void> {
  await db
    .prepare('UPDATE domains SET name = ?, color = ?, icon = ? WHERE id = ?')
    .bind(name, color, icon, id)
    .run();
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategoriesByDomain(db: D1Database, domainId: string): Promise<Category[]> {
  const result = await db
    .prepare('SELECT id, domain_id, name, description, sort_order FROM categories WHERE domain_id = ? ORDER BY sort_order')
    .bind(domainId)
    .all<Category>();
  return result.results;
}

export async function createCategory(
  db: D1Database,
  domainId: string,
  name: string,
  description: string
): Promise<Category> {
  const maxOrder = await db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM categories WHERE domain_id = ?')
    .bind(domainId)
    .first<{ max_order: number }>();
  const nextOrder = (maxOrder?.max_order ?? -1) + 1;

  const cat = await db
    .prepare(
      'INSERT INTO categories (domain_id, name, description, sort_order) VALUES (?, ?, ?, ?) RETURNING id, domain_id, name, description, sort_order'
    )
    .bind(domainId, name, description, nextOrder)
    .first<Category>();

  if (!cat) throw new Error('Échec de la création de la catégorie');
  return cat;
}

export async function updateCategory(
  db: D1Database,
  id: string,
  name: string,
  description: string
): Promise<void> {
  await db
    .prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?')
    .bind(name, description, id)
    .run();
}

export async function deleteCategory(db: D1Database, id: string): Promise<void> {
  // Désassigner les compétences avant suppression
  await db.prepare('UPDATE skills SET category_id = NULL WHERE category_id = ?').bind(id).run();
  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
}

// ── Skills ────────────────────────────────────────────────────────────────────

export async function getSkillsByDomain(db: D1Database, domainId: string): Promise<Skill[]> {
  const result = await db
    .prepare('SELECT id, domain_id, category_id, title, description, sort_order, active FROM skills WHERE domain_id = ? AND active = 1 ORDER BY sort_order')
    .bind(domainId)
    .all<Skill>();
  return result.results;
}

export async function getAllSkillsByDomain(db: D1Database, domainId: string): Promise<Skill[]> {
  const result = await db
    .prepare('SELECT id, domain_id, category_id, title, description, sort_order, active FROM skills WHERE domain_id = ? ORDER BY sort_order')
    .bind(domainId)
    .all<Skill>();
  return result.results;
}

export async function getSkillsByCategory(db: D1Database, categoryId: string): Promise<Skill[]> {
  const result = await db
    .prepare('SELECT id, domain_id, category_id, title, description, sort_order, active FROM skills WHERE category_id = ? AND active = 1 ORDER BY sort_order')
    .bind(categoryId)
    .all<Skill>();
  return result.results;
}

export async function assignSkillToCategory(
  db: D1Database,
  skillId: string,
  categoryId: string | null
): Promise<void> {
  await db
    .prepare('UPDATE skills SET category_id = ? WHERE id = ?')
    .bind(categoryId, skillId)
    .run();
}

// ── Badges ────────────────────────────────────────────────────────────────────

export async function getBadgesByJeune(db: D1Database, jeuneId: string): Promise<Badge[]> {
  const result = await db
    .prepare('SELECT id, jeune_id, category_id, request_id, awarded_at, level, printed_by, printed_at FROM badges WHERE jeune_id = ? ORDER BY awarded_at DESC')
    .bind(jeuneId)
    .all<Badge>();
  return result.results;
}

export async function getCategoryBadge(
  db: D1Database,
  jeuneId: string,
  categoryId: string
): Promise<Badge | null> {
  const result = await db
    .prepare('SELECT id, jeune_id, category_id, request_id, awarded_at, level, printed_by, printed_at FROM badges WHERE jeune_id = ? AND category_id = ?')
    .bind(jeuneId, categoryId)
    .first<Badge>();
  return result ?? null;
}

export async function getBadgesForPrinting(db: D1Database): Promise<BadgePrintRow[]> {
  const result = await db
    .prepare(`
      SELECT
        b.id, b.awarded_at, b.level, b.printed_by, b.printed_at,
        j.prenom AS jeune_prenom, j.nom AS jeune_nom,
        c.name AS category_name,
        d.name AS domain_name, d.color AS domain_color,
        p.prenom AS printer_prenom, p.nom AS printer_nom
      FROM badges b
      JOIN users j ON j.id = b.jeune_id
      JOIN categories c ON c.id = b.category_id
      JOIN domains d ON d.id = c.domain_id
      LEFT JOIN users p ON p.id = b.printed_by
      ORDER BY b.printed_by IS NOT NULL, b.awarded_at DESC
    `)
    .all<BadgePrintRow>();
  return result.results;
}

export async function markBadgePrinted(
  db: D1Database,
  badgeId: string,
  printerId: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare('UPDATE badges SET printed_by = ?, printed_at = ? WHERE id = ?')
    .bind(printerId, now, badgeId)
    .run();
}

// ── Parent Invitations ────────────────────────────────────────────────────────

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

// ── Badge Requests ────────────────────────────────────────────────────────────

export type PendingRequestRow = {
  id: string;
  jeune_id: string;
  proof_url: string;
  proof_type: 'photo' | 'video';
  submitted_at: number;
  jeune_prenom: string;
  jeune_nom: string;
  skill_title: string;
  skill_id: string;
  category_id: string | null;
  category_name: string | null;
  domain_name: string;
  domain_color: string;
  domain_icon: string;
  jeune_comment: string | null;
  project_url: string | null;
  project_type: string | null;
};

export async function getPendingRequests(db: D1Database): Promise<PendingRequestRow[]> {
  const result = await db
    .prepare(`
      SELECT
        br.id, br.jeune_id, br.proof_url, br.proof_type, br.submitted_at,
        br.jeune_comment, br.project_url, br.project_type,
        u.prenom AS jeune_prenom, u.nom AS jeune_nom,
        s.title AS skill_title, s.id AS skill_id, s.category_id,
        c.name AS category_name,
        d.name AS domain_name, d.color AS domain_color, d.icon AS domain_icon
      FROM badge_requests br
      JOIN users u ON u.id = br.jeune_id
      JOIN skills s ON s.id = br.skill_id
      JOIN domains d ON d.id = s.domain_id
      LEFT JOIN categories c ON c.id = s.category_id
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
  proofType: 'photo' | 'video',
  jeuneComment: string | null = null,
  projectUrl: string | null = null,
  projectType: string | null = null
): Promise<string> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      'INSERT INTO badge_requests (id, jeune_id, skill_id, proof_url, proof_type, jeune_comment, project_url, project_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(id, jeuneId, skillId, proofUrl, proofType, jeuneComment, projectUrl, projectType)
    .run();
  return id;
}

export async function getRequestById(
  db: D1Database,
  requestId: string
): Promise<BadgeRequest | null> {
  const result = await db
    .prepare(
      'SELECT id, jeune_id, skill_id, status, proof_url, proof_type, submitted_at, reviewed_at, reviewer_id, reviewer_comment, jeune_comment, project_url, project_type FROM badge_requests WHERE id = ?'
    )
    .bind(requestId)
    .first<BadgeRequest>();
  return result ?? null;
}

const LEVEL_MAP: [number, Badge['level']][] = [
  [5, 'noir'], [4, 'rouge'], [3, 'orange'], [2, 'jaune'], [1, 'blanc'],
];

export async function approveRequest(
  db: D1Database,
  requestId: string,
  reviewerId: string,
  comment: string
): Promise<Badge | null> {
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

  const request = await getRequestById(db, requestId);
  if (!request) throw new Error('Demande introuvable après approbation');

  // Récupérer la catégorie de la compétence
  const skillRow = await db
    .prepare('SELECT category_id FROM skills WHERE id = ?')
    .bind(request.skill_id)
    .first<{ category_id: string | null }>();

  const categoryId = skillRow?.category_id ?? null;

  // Si la compétence n'a pas de catégorie → pas de badge
  if (!categoryId) return null;

  // Compter les compétences actives dans la catégorie
  const totalRow = await db
    .prepare('SELECT COUNT(*) AS count FROM skills WHERE category_id = ? AND active = 1')
    .bind(categoryId)
    .first<{ count: number }>();
  const totalSkills = totalRow?.count ?? 0;

  // Compter combien de compétences de cette catégorie sont approuvées pour ce jeune
  // (en utilisant DISTINCT skill_id pour éviter les doublons si plusieurs demandes)
  const approvedRow = await db
    .prepare(`
      SELECT COUNT(DISTINCT br.skill_id) AS count
      FROM badge_requests br
      JOIN skills s ON s.id = br.skill_id
      WHERE br.jeune_id = ? AND s.category_id = ? AND br.status = 'approved' AND s.active = 1
    `)
    .bind(request.jeune_id, categoryId)
    .first<{ count: number }>();
  const approvedSkills = approvedRow?.count ?? 0;

  // Si toutes les compétences de la catégorie sont validées → accorder le badge
  if (totalSkills === 0 || approvedSkills < totalSkills) return null;

  // Vérifier qu'un badge n'existe pas déjà pour cette catégorie
  const existingBadge = await getCategoryBadge(db, request.jeune_id, categoryId);
  if (existingBadge) return existingBadge;

  // Niveau : basé sur le nombre de badges de catégorie du jeune dans ce domaine
  const domainRow = await db
    .prepare('SELECT domain_id FROM categories WHERE id = ?')
    .bind(categoryId)
    .first<{ domain_id: string }>();

  const countRow = await db
    .prepare(`
      SELECT COUNT(*) AS count FROM badges b
      JOIN categories c ON c.id = b.category_id
      WHERE b.jeune_id = ? AND c.domain_id = ?
    `)
    .bind(request.jeune_id, domainRow?.domain_id ?? '')
    .first<{ count: number }>();

  const newCount = (countRow?.count ?? 0) + 1;
  const level = LEVEL_MAP.find(([t]) => newCount >= t)?.[1] ?? 'blanc';

  const badgeId = crypto.randomUUID();
  await db
    .prepare(
      'INSERT INTO badges (id, jeune_id, category_id, request_id, awarded_at, level) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(badgeId, request.jeune_id, categoryId, requestId, now, level)
    .run();

  return {
    id: badgeId,
    jeune_id: request.jeune_id,
    category_id: categoryId,
    request_id: requestId,
    awarded_at: now,
    level,
    printed_by: null,
    printed_at: null,
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
      'SELECT id, jeune_id, skill_id, status, proof_url, proof_type, submitted_at, reviewed_at, reviewer_id, reviewer_comment, jeune_comment, project_url, project_type FROM badge_requests WHERE jeune_id = ? ORDER BY submitted_at DESC'
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

  const proposal = await db
    .prepare('SELECT id, domain_id, title, description, status FROM skill_proposals WHERE id = ?')
    .bind(proposalId)
    .first<Pick<SkillProposal, 'id' | 'domain_id' | 'title' | 'description' | 'status'>>();

  if (!proposal) throw new Error('Proposition introuvable');
  if (proposal.status !== 'pending') throw new Error('Proposition déjà traitée');

  const maxOrder = await db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM skills WHERE domain_id = ?')
    .bind(proposal.domain_id)
    .first<{ max_order: number }>();

  const nextOrder = (maxOrder?.max_order ?? -1) + 1;

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


// ── Animateur Invitations ────────────────────────────────────────────────────

export type AnimateurInvitation = {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  created_at: number;
  expires_at: number;
  used_at: number | null;
};

export async function createAnimateurInvitation(
  db: D1Database,
  email: string,
  invitedBy: string
): Promise<AnimateurInvitation> {
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 7 * 24 * 3600;

  await db
    .prepare('UPDATE animateur_invitations SET used_at = ? WHERE email = ? AND used_at IS NULL')
    .bind(now, email)
    .run();

  const inv = await db
    .prepare(
      `INSERT INTO animateur_invitations (email, invited_by, expires_at)
       VALUES (?, ?, ?)
       RETURNING id, email, token, invited_by, created_at, expires_at, used_at`
    )
    .bind(email, invitedBy, expires)
    .first<AnimateurInvitation>();

  if (!inv) throw new Error("Échec de la création de l'invitation");
  return inv;
}

export async function getValidAnimateurInvitation(
  db: D1Database,
  token: string
): Promise<AnimateurInvitation | null> {
  const now = Math.floor(Date.now() / 1000);
  return db
    .prepare(
      'SELECT id, email, token, invited_by, created_at, expires_at, used_at FROM animateur_invitations WHERE token = ? AND used_at IS NULL AND expires_at > ?'
    )
    .bind(token, now)
    .first<AnimateurInvitation>();
}

export async function markAnimateurInvitationUsed(
  db: D1Database,
  token: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare('UPDATE animateur_invitations SET used_at = ? WHERE token = ?')
    .bind(now, token)
    .run();
}

export async function getPendingAnimateurInvitations(
  db: D1Database
): Promise<AnimateurInvitation[]> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(
      'SELECT id, email, token, invited_by, created_at, expires_at, used_at FROM animateur_invitations WHERE used_at IS NULL AND expires_at > ? ORDER BY created_at DESC'
    )
    .bind(now)
    .all<AnimateurInvitation>();
  return result.results;
}

// ── Messages ─────────────────────────────────────────────────────────────────

export type Message = {
  id: string;
  from_id: string;
  to_id: string;
  content: string;
  created_at: number;
  read_at: number | null;
};

export type MessageWithSender = Message & {
  sender_prenom: string;
  sender_nom: string;
};

export async function getConversation(
  db: D1Database,
  userId: string,
  otherId: string
): Promise<MessageWithSender[]> {
  const result = await db
    .prepare(
      `SELECT m.id, m.from_id, m.to_id, m.content, m.created_at, m.read_at,
              u.prenom AS sender_prenom, u.nom AS sender_nom
       FROM messages m
       JOIN users u ON u.id = m.from_id
       WHERE (m.from_id = ? AND m.to_id = ?)
          OR (m.from_id = ? AND m.to_id = ?)
       ORDER BY m.created_at ASC`
    )
    .bind(userId, otherId, otherId, userId)
    .all<MessageWithSender>();
  return result.results;
}

export async function sendMessage(
  db: D1Database,
  fromId: string,
  toId: string,
  content: string
): Promise<void> {
  await db
    .prepare('INSERT INTO messages (from_id, to_id, content) VALUES (?, ?, ?)')
    .bind(fromId, toId, content)
    .run();
}

export async function markConversationRead(
  db: D1Database,
  toId: string,
  fromId: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare('UPDATE messages SET read_at = ? WHERE to_id = ? AND from_id = ? AND read_at IS NULL')
    .bind(now, toId, fromId)
    .run();
}

export async function getUnreadCounts(
  db: D1Database,
  userId: string
): Promise<Record<string, number>> {
  const result = await db
    .prepare(
      `SELECT from_id, COUNT(*) AS cnt
       FROM messages
       WHERE to_id = ? AND read_at IS NULL
       GROUP BY from_id`
    )
    .bind(userId)
    .all<{ from_id: string; cnt: number }>();
  return Object.fromEntries(result.results.map((r) => [r.from_id, r.cnt]));
}

export async function getDirectoryUsers(
  db: D1Database,
  excludeId: string
): Promise<User[]> {
  const result = await db
    .prepare(
      `SELECT id, email, role, nom, prenom, created_at
       FROM users
       WHERE id != ? AND role IN ('jeune', 'animateur')
       ORDER BY role, nom, prenom`
    )
    .bind(excludeId)
    .all<User>();
  return result.results;
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export type Team = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: number;
};

export type TeamWithCount = Team & {
  member_count: number;
  creator_prenom: string;
  creator_nom: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  jeune_id: string;
  added_by: string;
  added_at: number;
  prenom: string;
  nom: string;
  email: string;
};

export async function createTeam(
  db: D1Database,
  name: string,
  description: string,
  createdBy: string
): Promise<Team> {
  const id = crypto.randomUUID();
  const team = await db
    .prepare(
      'INSERT INTO teams (id, name, description, created_by) VALUES (?, ?, ?, ?) RETURNING id, name, description, created_by, created_at'
    )
    .bind(id, name, description, createdBy)
    .first<Team>();
  if (!team) throw new Error("Échec de la création de l'équipe");
  return team;
}

export async function updateTeam(
  db: D1Database,
  id: string,
  name: string,
  description: string
): Promise<void> {
  await db
    .prepare('UPDATE teams SET name = ?, description = ? WHERE id = ?')
    .bind(name, description, id)
    .run();
}

export async function getTeamById(db: D1Database, id: string): Promise<Team | null> {
  const result = await db
    .prepare('SELECT id, name, description, created_by, created_at FROM teams WHERE id = ?')
    .bind(id)
    .first<Team>();
  return result ?? null;
}

export async function getAllTeams(db: D1Database): Promise<TeamWithCount[]> {
  const result = await db
    .prepare(
      `SELECT t.id, t.name, t.description, t.created_by, t.created_at,
              u.prenom AS creator_prenom, u.nom AS creator_nom,
              COUNT(tm.id) AS member_count
       FROM teams t
       JOIN users u ON u.id = t.created_by
       LEFT JOIN team_members tm ON tm.team_id = t.id
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    )
    .all<TeamWithCount>();
  return result.results;
}

export async function getTeamsByCreator(db: D1Database, createdBy: string): Promise<TeamWithCount[]> {
  const result = await db
    .prepare(
      `SELECT t.id, t.name, t.description, t.created_by, t.created_at,
              u.prenom AS creator_prenom, u.nom AS creator_nom,
              COUNT(tm.id) AS member_count
       FROM teams t
       JOIN users u ON u.id = t.created_by
       LEFT JOIN team_members tm ON tm.team_id = t.id
       WHERE t.created_by = ?
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    )
    .bind(createdBy)
    .all<TeamWithCount>();
  return result.results;
}

export async function getTeamMembers(db: D1Database, teamId: string): Promise<TeamMember[]> {
  const result = await db
    .prepare(
      `SELECT tm.id, tm.team_id, tm.jeune_id, tm.added_by, tm.added_at,
              u.prenom, u.nom, u.email
       FROM team_members tm
       JOIN users u ON u.id = tm.jeune_id
       WHERE tm.team_id = ?
       ORDER BY u.nom, u.prenom`
    )
    .bind(teamId)
    .all<TeamMember>();
  return result.results;
}

export async function getAllJeunes(db: D1Database): Promise<User[]> {
  const result = await db
    .prepare(
      `SELECT id, email, role, nom, prenom, created_at
       FROM users
       WHERE role = 'jeune'
       ORDER BY nom, prenom`
    )
    .all<User>();
  return result.results;
}

export async function getJeunesNotInTeam(db: D1Database, teamId: string): Promise<User[]> {
  const result = await db
    .prepare(
      `SELECT id, email, role, nom, prenom, created_at
       FROM users
       WHERE role = 'jeune'
         AND id NOT IN (SELECT jeune_id FROM team_members WHERE team_id = ?)
       ORDER BY nom, prenom`
    )
    .bind(teamId)
    .all<User>();
  return result.results;
}

export async function addJeuneToTeam(
  db: D1Database,
  teamId: string,
  jeuneId: string,
  addedBy: string
): Promise<void> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      'INSERT OR IGNORE INTO team_members (id, team_id, jeune_id, added_by) VALUES (?, ?, ?, ?)'
    )
    .bind(id, teamId, jeuneId, addedBy)
    .run();
}

export async function removeJeuneFromTeam(
  db: D1Database,
  teamId: string,
  jeuneId: string
): Promise<void> {
  await db
    .prepare('DELETE FROM team_members WHERE team_id = ? AND jeune_id = ?')
    .bind(teamId, jeuneId)
    .run();
}
