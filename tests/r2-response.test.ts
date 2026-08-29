import { describe, it, expect } from 'vitest';
import { r2Headers, mimeFromKey } from '$lib/server/r2-response';

/**
 * Non-régression du 500 en développement :
 *
 *   DevalueError: Cannot stringify arbitrary non-POJOs
 *     at Proxy.writeHttpMetadata (miniflare)
 *     at GET (src/routes/api/proofs/[...key]/+server.ts:12)
 *
 * `writeHttpMetadata` reçoit un `Headers`, que Miniflare doit sérialiser pour
 * franchir son pont RPC. `r2Headers` lit `httpMetadata` à la place, qui est un
 * objet simple.
 */

describe('mimeFromKey', () => {
  it('reconnaît les images', () => {
    expect(mimeFromKey('a/b/1788014801352.png')).toBe('image/png');
    expect(mimeFromKey('photo.JPG')).toBe('image/jpeg');
    expect(mimeFromKey('x.jpeg')).toBe('image/jpeg');
    expect(mimeFromKey('x.webp')).toBe('image/webp');
    expect(mimeFromKey('x.heic')).toBe('image/heic');
  });

  it('reconnaît les vidéos, qui sont un type de preuve accepté', () => {
    expect(mimeFromKey('x.mp4')).toBe('video/mp4');
    expect(mimeFromKey('x.mov')).toBe('video/quicktime');
    expect(mimeFromKey('x.webm')).toBe('video/webm');
  });

  it('ignore une chaîne de requête', () => {
    expect(mimeFromKey('x.png?v=2')).toBe('image/png');
  });

  it('retombe sur octet-stream pour une extension inconnue ou absente', () => {
    expect(mimeFromKey('x.xyz')).toBe('application/octet-stream');
    expect(mimeFromKey('sans-extension')).toBe('application/octet-stream');
  });

  it('ne lève pas sur une entrée non chaîne', () => {
    expect(() => mimeFromKey(null as never)).not.toThrow();
    expect(mimeFromKey(null as never)).toBe('application/octet-stream');
  });
});

describe('r2Headers', () => {
  it('utilise le contentType stocké par uploadProof', () => {
    const h = r2Headers({ httpMetadata: { contentType: 'image/png' } }, 'x.bin');
    expect(h.get('content-type')).toBe('image/png');
  });

  it("déduit le type depuis la clé quand le navigateur n'a pas envoyé file.type", () => {
    // `uploadProof` fait `httpMetadata: { contentType: file.type }`, et
    // `file.type` peut être vide. Sans repli, l'image serait téléchargée
    // au lieu d'être affichée.
    const h = r2Headers({ httpMetadata: { contentType: '' } }, 'proofs/a/b/1788.png');
    expect(h.get('content-type')).toBe('image/png');
  });

  it('déduit le type quand httpMetadata est absent', () => {
    expect(r2Headers({}, 'x.jpg').get('content-type')).toBe('image/jpeg');
    expect(r2Headers({ httpMetadata: null }, 'x.jpg').get('content-type')).toBe('image/jpeg');
  });

  it("pose l'etag quand il est présent", () => {
    expect(r2Headers({ httpEtag: '"abc"' }, 'x.png').get('etag')).toBe('"abc"');
  });

  it("n'invente pas d'etag quand il est absent", () => {
    expect(r2Headers({}, 'x.png').get('etag')).toBeNull();
  });

  it('applique le cache-control par défaut, privé', () => {
    expect(r2Headers({}, 'x.png').get('cache-control')).toBe('private, max-age=3600');
  });

  it('respecte un cacheControl stocké sur l\'objet', () => {
    const h = r2Headers({ httpMetadata: { cacheControl: 'public, max-age=60' } }, 'x.png');
    expect(h.get('cache-control')).toBe('public, max-age=60');
  });

  it('reporte les métadonnées optionnelles seulement si présentes', () => {
    const complet = r2Headers(
      {
        httpMetadata: {
          contentType: 'image/png',
          contentLanguage: 'fr',
          contentDisposition: 'inline',
          contentEncoding: 'gzip',
        },
      },
      'x.png'
    );
    expect(complet.get('content-language')).toBe('fr');
    expect(complet.get('content-disposition')).toBe('inline');
    expect(complet.get('content-encoding')).toBe('gzip');

    const minimal = r2Headers({ httpMetadata: { contentType: 'image/png' } }, 'x.png');
    expect(minimal.get('content-language')).toBeNull();
    expect(minimal.get('content-disposition')).toBeNull();
    expect(minimal.get('content-encoding')).toBeNull();
  });

  it('renvoie toujours un Headers exploitable, quelle que soit l\'entrée', () => {
    for (const o of [{}, { httpMetadata: null }, { httpMetadata: {} }]) {
      const h = r2Headers(o, 'x.png');
      expect(h).toBeInstanceOf(Headers);
      expect(h.get('content-type')).toBeTruthy();
    }
  });
});

describe('les routes R2 n\'appellent plus writeHttpMetadata', () => {
  it('ni pour les preuves, ni pour les projets', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const root = resolve(__dirname, '..');
    for (const p of [
      'src/routes/api/proofs/[...key]/+server.ts',
      'src/routes/api/projects/[...key]/+server.ts',
    ]) {
      const src = readFileSync(resolve(root, p), 'utf-8');
      // La mention en commentaire est attendue : elle documente le bug.
      const code = src.replace(/\/\/.*$/gm, '');
      expect(code).not.toContain('writeHttpMetadata');
    }
  });
});
