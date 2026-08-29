/**
 * Construction de la réponse HTTP pour un objet R2.
 *
 * Pourquoi ne pas utiliser `object.writeHttpMetadata(headers)` :
 * en production, la méthode s'exécute dans le même isolat que l'objet R2 et
 * fonctionne. En local, Miniflare simule R2 derrière un pont RPC, et l'argument
 * doit franchir ce pont en étant sérialisé par `devalue` — qui ne sait traiter
 * que des objets simples. Un `Headers` natif n'en est pas un :
 *
 *   DevalueError: Cannot stringify arbitrary non-POJOs
 *     at Proxy.writeHttpMetadata (miniflare/dist/src/index.js:78677)
 *
 * Le bug ne se voyait donc qu'en développement, ce qui lui a permis de
 * survivre. `object.httpMetadata` est un objet simple : il franchit le pont
 * sans problème, en local comme en production.
 */

/** Sous-ensemble de R2Object dont on a besoin. Volontairement lâche. */
export interface R2Meta {
  httpMetadata?: {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
  } | null;
  httpEtag?: string;
  size?: number;
}

/** Types MIME par extension, pour les objets stockés sans `contentType`. */
const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  heic: 'image/heic',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
};

/**
 * Déduit un type MIME depuis une clé d'objet.
 * `uploadProof` enregistre `file.type`, mais un navigateur peut l'envoyer vide
 * — auquel cas le fichier serait servi en `application/octet-stream` et
 * téléchargé au lieu d'être affiché.
 */
export function mimeFromKey(key: string): string {
  if (typeof key !== 'string') return 'application/octet-stream';
  const ext = key.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return MIME[ext] ?? 'application/octet-stream';
}

/**
 * Construit les en-têtes d'un objet R2, sans passer par `writeHttpMetadata`.
 *
 * @param object l'objet R2 (ou n'importe quoi de compatible)
 * @param key la clé, pour le repli de type MIME
 * @param cacheControl valeur de `cache-control`
 */
export function r2Headers(object: R2Meta, key: string, cacheControl = 'private, max-age=3600'): Headers {
  const headers = new Headers();
  const meta = object?.httpMetadata ?? {};

  headers.set('content-type', meta.contentType || mimeFromKey(key));
  if (meta.contentLanguage) headers.set('content-language', meta.contentLanguage);
  if (meta.contentDisposition) headers.set('content-disposition', meta.contentDisposition);
  if (meta.contentEncoding) headers.set('content-encoding', meta.contentEncoding);
  if (object?.httpEtag) headers.set('etag', object.httpEtag);
  headers.set('cache-control', meta.cacheControl || cacheControl);

  return headers;
}
