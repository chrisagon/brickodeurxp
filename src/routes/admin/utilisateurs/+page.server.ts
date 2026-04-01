import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

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
  const result = await db
    .prepare(
      "SELECT id, email, nom, prenom, role, created_at FROM users WHERE role != 'admin' ORDER BY role, nom, prenom"
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
};
