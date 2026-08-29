import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { r2Headers } from '$lib/server/r2-response';

export const GET: RequestHandler = async ({ params, platform }) => {
  const key = params.key;
  if (!key) throw error(400, 'Clé manquante');

  const object = await platform!.env.R2.get(`projects/${key}`);
  if (!object) throw error(404, 'Fichier introuvable');

  // Ne pas utiliser object.writeHttpMetadata : elle échoue sous Miniflare,
  // qui sérialise l'argument à travers un pont RPC. Voir r2-response.ts.
  return new Response(object.body as unknown as BodyInit, {
    headers: r2Headers(object, key),
  });
};
