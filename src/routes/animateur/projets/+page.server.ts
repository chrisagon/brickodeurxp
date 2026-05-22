import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProjectsByTeam, createProject, getAllTeams, getTeamById } from '$lib/server/db';

function requireAnimateur(locals: App.Locals) {
  const role = locals.session?.user.role;
  if (role !== 'animateur' && role !== 'admin') {
    error(403, 'Accès non autorisé.');
  }
}

export const load: PageServerLoad = async ({ platform, locals }) => {
  requireAnimateur(locals);

  const db = platform!.env.DB;
  const user = locals.session!.user;

  try {
    // Récupérer les équipes actives selon le rôle
    let teams: { id: string; name: string }[] = [];
    let teamId = '';
    let noTeam = false;

    if (user.role === 'animateur') {
      // Récupérer l'équipe créée par l'animateur qui est active
      const teamRow = await db
        .prepare('SELECT id, name FROM teams WHERE created_by = ? AND archived = 0 AND end_date > ? LIMIT 1')
        .bind(user.id, Math.floor(Date.now() / 1000))
        .first<{ id: string; name: string }>();

      if (!teamRow) {
        noTeam = true;
      } else {
        teamId = teamRow.id;
        teams.push(teamRow);
      }

      // Récupérer les projets de cette équipe
      const projects = teamId ? await getProjectsByTeam(db, teamId) : [];
      return { projects, teams, teamId, isAdmin: false, noTeam };
    }

    // Pour les admins, afficher tous les projets avec toutes les équipes actives
    if (user.role === 'admin') {
      teams = await getAllTeams(db, true); // onlyActive = true
      const projects: any[] = [];

      for (const team of teams) {
        const teamProjects = await getProjectsByTeam(db, team.id);
        projects.push(...teamProjects);
      }

      return { projects, teams, teamId: '', isAdmin: true, noTeam: false };
    }

    return { projects: [], teams, teamId: '', isAdmin: false, noTeam: false };
  } catch (err) {
    console.error('Error loading projects:', err);
    error(500, 'Erreur lors du chargement des projets.');
  }
};

export const actions: Actions = {
  createProject: async ({ request, platform, locals }) => {
    requireAnimateur(locals);

    const db = platform!.env.DB;
    const user = locals.session!.user;

    const data = await request.formData();
    const name = (data.get('name') as string | null)?.trim() ?? '';
    const description = (data.get('description') as string | null)?.trim() ?? '';
    const startDateStr = data.get('startDate') as string | null;
    const endDateStr = data.get('endDate') as string | null;
    const teamId = data.get('team_id') as string | null;

    if (!name || !startDateStr || !endDateStr) {
      return { error: 'Veuillez remplir tous les champs obligatoires.' };
    }

    const startDate = Math.floor(new Date(startDateStr).getTime() / 1000);
    const endDate = Math.floor(new Date(endDateStr).getTime() / 1000);

    if (endDate <= startDate) {
      return { error: 'La date de fin doit être postérieure à la date de début.' };
    }

    // Valider que l'équipe est active si fournie
    if (teamId) {
      const teamActive = await db
        .prepare('SELECT 1 FROM teams WHERE id = ? AND archived = 0 AND end_date > ?')
        .bind(teamId, Math.floor(Date.now() / 1000))
        .first();

      if (!teamActive) {
        return { error: 'L\'équipe sélectionnée n\'est pas active.' };
      }
    }

    // Pour les animateurs: utiliser l'équipe sélectionnée ou leur équipe par défaut
    if (user.role === 'animateur') {
      // Si aucune équipe sélectionnée, utiliser leur équipe par défaut
      const selectedTeamId = teamId || await (async () => {
        const teamRow = await db
          .prepare('SELECT id FROM teams WHERE created_by = ? AND archived = 0 AND end_date > ? LIMIT 1')
          .bind(user.id, Math.floor(Date.now() / 1000))
          .first<{ id: string }>();
        return teamRow?.id ?? '';
      })();

      if (!selectedTeamId) {
        return { error: 'Aucune équipe active associée à votre compte.' };
      }

      try {
        await createProject(
          db,
          name,
          description,
          startDate,
          endDate,
          selectedTeamId,
          user.id
        );
        redirect(303, '/animateur/projets');
      } catch (e) {
        return { error: 'Erreur lors de la création du projet.' };
      }
    }

    // Pour les admins: utiliser l'équipe sélectionnée
    if (user.role === 'admin' && teamId) {
      try {
        await createProject(
          db,
          name,
          description,
          startDate,
          endDate,
          teamId,
          user.id
        );
        redirect(303, '/animateur/projets');
      } catch (e) {
        return { error: 'Erreur lors de la création du projet.' };
      }
    }

    return { error: 'Veuillez sélectionner une équipe.' };
  }
};
