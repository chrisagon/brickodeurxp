import { describe, it, expect } from 'vitest';
import { groupSkillsByCategory, uncategorizedSkills, groupSkillsByDomain } from '$lib/utils/skills';

/**
 * Test de non-régression du correctif N+1 de `jeune/passeport/+page.server.ts`.
 *
 * L'ancienne implémentation appelait `getSkillsByCategory(db, cat.id)` dans
 * une boucle. La nouvelle regroupe en mémoire le résultat de
 * `getSkillsByDomain`. Ces tests vérifient que la répartition est identique,
 * ordre compris — la régression la plus coûteuse serait une compétence qui
 * disparaît de son bloc.
 */

type S = { id: string; category_id: string | null; sort_order: number };

const skill = (id: string, category_id: string | null, sort_order = 0): S => ({
  id,
  category_id,
  sort_order,
});

/** Simule l'ancien comportement : une requête filtrée par catégorie. */
const oldWay = (all: S[], categoryId: string) => all.filter((s) => s.category_id === categoryId);

describe('groupSkillsByCategory', () => {
  it('regroupe par catégorie', () => {
    const all = [skill('a', 'cat1'), skill('b', 'cat2'), skill('c', 'cat1')];
    const g = groupSkillsByCategory(all);
    expect(g.get('cat1')!.map((s) => s.id)).toEqual(['a', 'c']);
    expect(g.get('cat2')!.map((s) => s.id)).toEqual(['b']);
  });

  it('produit exactement la même répartition que les requêtes par catégorie', () => {
    const all = [
      skill('a', 'cat1', 0),
      skill('b', 'cat2', 1),
      skill('c', 'cat1', 2),
      skill('d', null, 3),
      skill('e', 'cat3', 4),
      skill('f', 'cat2', 5),
    ];
    const grouped = groupSkillsByCategory(all);

    for (const catId of ['cat1', 'cat2', 'cat3']) {
      expect(grouped.get(catId) ?? []).toEqual(oldWay(all, catId));
    }
  });

  it("préserve l'ordre d'entrée, qui est celui du ORDER BY sort_order", () => {
    const all = [skill('z', 'cat1', 0), skill('a', 'cat1', 1), skill('m', 'cat1', 2)];
    expect(groupSkillsByCategory(all).get('cat1')!.map((s) => s.id)).toEqual(['z', 'a', 'm']);
  });

  it('exclut les compétences sans catégorie', () => {
    const all = [skill('a', 'cat1'), skill('b', null), skill('c', undefined as unknown as null)];
    const g = groupSkillsByCategory(all);
    expect(g.get('cat1')!.map((s) => s.id)).toEqual(['a']);
    expect([...g.values()].flat().map((s) => s.id)).toEqual(['a']);
  });

  it('traite la chaîne vide comme une absence de catégorie', () => {
    const g = groupSkillsByCategory([skill('a', ''), skill('b', 'cat1')]);
    expect(g.has('')).toBe(false);
    expect(g.get('cat1')!.map((s) => s.id)).toEqual(['b']);
  });

  describe('cas limites', () => {
    it('renvoie une Map vide sur un tableau vide', () => {
      expect(groupSkillsByCategory([]).size).toBe(0);
    });

    it("ne renvoie aucune entrée pour une catégorie sans compétence — l'appelant doit gérer l'absence", () => {
      const g = groupSkillsByCategory([skill('a', 'cat1')]);
      expect(g.get('cat2')).toBeUndefined();
      expect(g.get('cat2') ?? []).toEqual([]);
    });

    it('ne lève pas sur une entrée non tableau', () => {
      expect(() => groupSkillsByCategory(null as never)).not.toThrow();
      expect(groupSkillsByCategory(null as never).size).toBe(0);
    });
  });
});

describe('uncategorizedSkills', () => {
  it('ne renvoie que les compétences sans catégorie', () => {
    const all = [skill('a', 'cat1'), skill('b', null), skill('c', null)];
    expect(uncategorizedSkills(all).map((s) => s.id)).toEqual(['b', 'c']);
  });

  it("préserve l'ordre", () => {
    const all = [skill('z', null, 0), skill('a', 'cat1', 1), skill('m', null, 2)];
    expect(uncategorizedSkills(all).map((s) => s.id)).toEqual(['z', 'm']);
  });

  it('ne lève pas sur une entrée non tableau', () => {
    expect(() => uncategorizedSkills(undefined as never)).not.toThrow();
    expect(uncategorizedSkills(undefined as never)).toEqual([]);
  });
});

/**
 * Test de non-régression du correctif N+1 de `admin/projets/[id]`.
 *
 * L'ancienne implémentation appelait `getSkillsByDomain(db, domain.id)` dans
 * une boucle sur les domaines. La nouvelle charge toutes les compétences
 * actives en une requête (`getAllActiveSkills`) et les regroupe ici.
 */
describe('groupSkillsByDomain', () => {
  type D = { id: string; domain_id: string | null; sort_order: number };
  const s = (id: string, domain_id: string | null, sort_order = 0): D => ({
    id,
    domain_id,
    sort_order,
  });

  /** Simule l'ancien comportement : une requête filtrée par domaine. */
  const oldWay = (all: D[], domainId: string) => all.filter((x) => x.domain_id === domainId);

  it('regroupe par domaine', () => {
    const all = [s('a', 'brick'), s('b', 'codeur'), s('c', 'brick')];
    const g = groupSkillsByDomain(all);
    expect(g.get('brick')!.map((x) => x.id)).toEqual(['a', 'c']);
    expect(g.get('codeur')!.map((x) => x.id)).toEqual(['b']);
  });

  it('produit exactement la même répartition que les requêtes par domaine', () => {
    const all = [
      s('a', 'brick', 0),
      s('b', 'codeur', 1),
      s('c', 'brick', 2),
      s('d', null, 3),
      s('e', 'codeur', 4),
    ];
    const grouped = groupSkillsByDomain(all);
    for (const dom of ['brick', 'codeur']) {
      expect(grouped.get(dom) ?? []).toEqual(oldWay(all, dom));
    }
  });

  it("préserve l'ordre, qui est celui du ORDER BY sort_order", () => {
    const all = [s('z', 'brick', 0), s('a', 'brick', 1), s('m', 'brick', 2)];
    expect(groupSkillsByDomain(all).get('brick')!.map((x) => x.id)).toEqual(['z', 'a', 'm']);
  });

  it('ignore une compétence sans domaine', () => {
    const g = groupSkillsByDomain([s('a', 'brick'), s('b', null), s('c', '')]);
    expect([...g.values()].flat().map((x) => x.id)).toEqual(['a']);
  });

  it("ne renvoie rien pour un domaine sans compétence — l'appelant comble la Map", () => {
    const g = groupSkillsByDomain([s('a', 'brick')]);
    expect(g.get('codeur')).toBeUndefined();
    expect(g.get('codeur') ?? []).toEqual([]);
  });

  it('ne lève pas sur une entrée non tableau', () => {
    expect(() => groupSkillsByDomain(null as never)).not.toThrow();
    expect(groupSkillsByDomain(null as never).size).toBe(0);
  });
});

describe('partition — chaque compétence est dans une branche et une seule', () => {
  it('la somme des deux branches reconstitue exactement l\'entrée', () => {
    const all = [
      skill('a', 'cat1'),
      skill('b', null),
      skill('c', 'cat2'),
      skill('d', ''),
      skill('e', 'cat1'),
    ];
    const grouped = [...groupSkillsByCategory(all).values()].flat();
    const loose = uncategorizedSkills(all);

    expect(grouped.length + loose.length).toBe(all.length);
    const ids = [...grouped, ...loose].map((s) => s.id).sort();
    expect(ids).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
