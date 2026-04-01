import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
  const key = params.key;
  if (!key) throw error(400, 'Clé manquante');

  const object = await platform!.env.R2.get(`proofs/${key}`);
  if (!object) throw error(404, 'Fichier introuvable');

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'private, max-age=3600');

  return new Response(object.body, { headers });
};
