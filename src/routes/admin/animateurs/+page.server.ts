import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getUserByEmail } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ platform }) => {
  const animateurs = await platform!.env.DB
    .prepare("SELECT id, email, nom, prenom, created_at FROM users WHERE role = 'animateur' ORDER BY nom, prenom")
    .all<{ id: string; email: string; nom: string; prenom: string; created_at: number }>();
  return { animateurs: animateurs.results };
};

export const actions: Actions = {
  createAnimateur: async ({ request, platform }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const nom = String(data.get('nom') ?? '').trim();
    const prenom = String(data.get('prenom') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (!email || !nom || !prenom || !password) {
      return fail(400, { error: 'Tous les champs sont requis.' });
    }
    if (password.length < 8) {
      return fail(400, { error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const db = platform!.env.DB;
    const existing = await getUserByEmail(db, email);
    if (existing) {
      return fail(400, { error: 'Cet email est déjà utilisé.' });
    }

    const password_hash = await hashPassword(password);
    await db
      .prepare('INSERT INTO users (id, email, password_hash, role, nom, prenom) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)')
      .bind(email, password_hash, 'animateur', nom, prenom)
      .run();

    return { success: true };
  },
};
