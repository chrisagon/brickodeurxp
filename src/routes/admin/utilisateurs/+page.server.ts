import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { promoteUser } from '$lib/server/db';
import { isRole } from '$lib/utils/roles';

type UserRow = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'jeune' | 'animateur' | 'parent' | 'admin';
  created_at: number;
};

export const load: PageServerLoad = async ({ platform, locals }) => {
  const db = platform!.env.DB;
  // Les admins sont désormais chargés aussi. Sans eux, un membre promu
  // administrateur disparaissait de l'écran et la promotion semblait n'avoir
  // rien fait. Ils restent non supprimables et non promouvables.
  const result = await db
    .prepare(
      'SELECT id, email, nom, prenom, role, created_at FROM users ORDER BY role, nom, prenom'
    )
    .all<UserRow>();
  return { users: result.results, currentUserId: locals.session!.user.id };
};

export const actions: Actions = {
  deleteUser: async ({ request, platform, locals }) => {
    const data = await request.formData();
    const userId = String(data.get('user_id') ?? '').trim();

    if (!userId) return fail(400, { error: 'user_id requis.' });

    // Sécurité : ne jamais supprimer sa propre session
    if (userId === locals.session!.user.id) {
      return fail(400, { error: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const db = platform!.env.DB;

    // Vérifier que la cible n'est pas admin
    const target = await db
      .prepare('SELECT id, role FROM users WHERE id = ?')
      .bind(userId)
      .first<{ id: string; role: string }>();

    if (!target) return fail(404, { error: 'Utilisateur introuvable.' });
    if (target.role === 'admin') {
      return fail(403, { error: 'Les comptes administrateurs ne peuvent pas être supprimés ici.' });
    }

    await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

    return { success: true };
  },

  /**
   * Promotion de rôle. Irréversible depuis l'interface : la matrice de
   * `roles.ts` n'autorise que jeune→animateur, parent→animateur et
   * animateur→admin.
   */
  promoteUser: async ({ request, platform, locals }) => {
    const data = await request.formData();
    const userId = String(data.get('user_id') ?? '').trim();
    const newRole = String(data.get('new_role') ?? '').trim();

    if (!userId) return fail(400, { error: 'user_id requis.' });
    if (!isRole(newRole)) return fail(400, { error: 'Rôle cible invalide.' });

    // Même garde que deleteUser : jamais d'action sur son propre compte.
    // Un admin qui se promeut n'a aucun sens, et la réciproque protège
    // contre une rétrogradation accidentelle si la matrice évoluait.
    if (userId === locals.session!.user.id) {
      return fail(400, { error: 'Vous ne pouvez pas modifier votre propre rôle.' });
    }

    try {
      const { from, to } = await promoteUser(platform!.env.DB, userId, newRole);
      return { success: true, promoted: { from, to } };
    } catch (e) {
      // `promoteUser` lève sur utilisateur introuvable, transition refusée,
      // ou rôle modifié entre-temps. Aucun n'est une erreur serveur.
      return fail(400, { error: e instanceof Error ? e.message : 'Promotion impossible.' });
    }
  },
};
