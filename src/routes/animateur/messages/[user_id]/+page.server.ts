import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getConversation, sendMessage, markConversationRead, getUserById } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
  const db = platform!.env.DB;
  const currentId = locals.session!.user.id;
  const otherId = params.user_id;

  const other = await getUserById(db, otherId);
  if (!other) error(404, 'Utilisateur introuvable.');

  // Marquer les messages reçus comme lus
  await markConversationRead(db, currentId, otherId);

  const messages = await getConversation(db, currentId, otherId);
  return { messages, other, currentId };
};

export const actions: Actions = {
  default: async ({ request, params, platform, locals }) => {
    const data = await request.formData();
    const content = String(data.get('content') ?? '').trim();

    if (!content) return fail(400, { error: 'Le message ne peut pas être vide.' });
    if (content.length > 2000) return fail(400, { error: 'Message trop long (max 2000 caractères).' });

    const db = platform!.env.DB;
    const fromId = locals.session!.user.id;
    const toId = params.user_id;

    // Vérifier que le destinataire existe
    const target = await getUserById(db, toId);
    if (!target) return fail(404, { error: 'Destinataire introuvable.' });

    await sendMessage(db, fromId, toId, content);
    return { sent: true };
  },
};
