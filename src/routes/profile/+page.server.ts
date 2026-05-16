import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getUserByEmail, updateUser } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) {
    redirect(303, '/auth/login');
  }
  return { user: locals.session.user };
};

export const actions: Actions = {
  default: async ({ request, locals, platform }) => {
    if (!locals.session) {
      redirect(303, '/auth/login');
    }

    const data = await request.formData();
    const prenom = String(data.get('prenom') ?? '').trim();
    const nom = String(data.get('nom') ?? '').trim();
    const email = String(data.get('email') ?? '').trim().toLowerCase();

    if (!prenom || !nom || !email) {
      return fail(400, { error: 'Tous les champs sont requis.' });
    }

    if (nom.length < 2 || prenom.length < 2) {
      return fail(400, { error: 'Le nom et le prénom doivent contenir au moins 2 caractères.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, { error: 'Format d\'email invalide.' });
    }

    const currentUser = locals.session.user;

    if (email !== currentUser.email) {
      const existing = await getUserByEmail(platform!.env.DB, email);
      if (existing && existing.id !== currentUser.id) {
        return fail(400, { error: 'Cet email est déjà utilisé par un autre compte.' });
      }
    }

    await updateUser(platform!.env.DB, currentUser.id, nom, prenom, email);

    redirect(303, '/');
  },
};
