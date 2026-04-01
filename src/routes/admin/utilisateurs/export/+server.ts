import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

type UserRow = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  created_at: number;
};

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

export const GET: RequestHandler = async ({ platform, locals }) => {
  // Guard : admin uniquement
  if (!locals.session || locals.session.user.role !== 'admin') {
    redirect(303, '/auth/login');
  }

  const db = platform!.env.DB;
  const result = await db
    .prepare(
      "SELECT id, email, nom, prenom, role, created_at FROM users WHERE role != 'admin' ORDER BY role, nom, prenom"
    )
    .all<UserRow>();

  const header = 'Prénom,Nom,Email,Rôle,Inscrit le\n';
  const rows = result.results
    .map((u) => {
      const date = new Date(u.created_at * 1000).toLocaleDateString('fr-FR');
      return [
        escapeCSV(u.prenom),
        escapeCSV(u.nom),
        escapeCSV(u.email),
        escapeCSV(u.role),
        date,
      ].join(',');
    })
    .join('\n');

  const csv = '\uFEFF' + header + rows; // BOM UTF-8 pour Excel

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="brickodeurs-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
};
