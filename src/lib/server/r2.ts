import type { R2Bucket } from '@cloudflare/workers-types';

export function getProofKey(jeuneId: string, skillId: string, filename: string): string {
  const ext = filename.split('.').pop() ?? 'bin';
  return `proofs/${jeuneId}/${skillId}/${Date.now()}.${ext}`;
}

export function getProofType(file: File): 'photo' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'photo';
}

export async function uploadProof(bucket: R2Bucket, key: string, file: File): Promise<void> {
  const buffer = await file.arrayBuffer();
  await bucket.put(key, buffer, {
    httpMetadata: { contentType: file.type },
  });
}
