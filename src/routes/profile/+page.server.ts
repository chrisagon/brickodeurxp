import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
  getUserByEmail,
  updateUser,
  getUserPasswordHash,
  updateUserPassword
} from '$lib/server/db';
import { hashPassword, verifyPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) {
    redirect(303, '/auth/login');
  }
  return { user: locals.session.user };
};

export const actions: Actions = {
  updateProfile: async ({ request, locals, platform }) => {
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

  updatePassword: async ({ request, locals, platform }) => {
    if (!locals.session) {
      redirect(303, '/auth/login');
    }

    const data = await request.formData();
    const currentPassword = String(data.get('currentPassword') ?? '');
    const newPassword = String(data.get('newPassword') ?? '');
    const confirmPassword = String(data.get('confirmPassword') ?? '');

    if (!newPassword || !confirmPassword) {
      return fail(400, { passwordError: 'Veuillez renseigner le nouveau mot de passe.' });
    }

    if (newPassword.length < 8) {
      return fail(400, { passwordError: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    if (newPassword !== confirmPassword) {
      return fail(400, { passwordError: 'Les mots de passe ne correspondent pas.' });
    }

    const db = platform!.env.DB;
    const currentHash = await getUserPasswordHash(db, locals.session.user.id);

    // Si un mot de passe existe déjà, exiger et vérifier l'actuel.
    if (currentHash) {
      if (!currentPassword) {
        return fail(400, { passwordError: 'Veuillez saisir votre mot de passe actuel.' });
      }
      const valid = await verifyPassword(currentPassword, currentHash);
      if (!valid) {
        return fail(400, { passwordError: 'Mot de passe actuel incorrect.' });
      }
    }

    const newHash = await hashPassword(newPassword);
    await updateUserPassword(db, locals.session.user.id, newHash);

    return { passwordSuccess: true };
  }
};
