import { describe, it, expect } from 'vitest';
import type { GrammarNodeSeed } from '../../src/db/seeds/grammar-seed-types';
import { buildGrammarEdges } from '../../src/db/seeds/grammar-seed-types';

const REQUIRED_FIELDS = [
  'slug',
  'name',
  'nameInTarget',
  'cefrLevel',
  'category',
  'shortDescription',
  'examples',
] as const;

export function describeGrammarSeedData(
  label: string,
  nodes: GrammarNodeSeed[],
  expectedCount: number = 16,
) {
  describe(label, () => {
    it(`has exactly ${expectedCount} nodes`, () => {
      expect(nodes).toHaveLength(expectedCount);
    });

    describe('each node has all required fields', () => {
      nodes.forEach((node, index) => {
        REQUIRED_FIELDS.forEach((field) => {
          it(`node ${index} ("${node.slug}") has field "${field}"`, () => {
            expect(node).toHaveProperty(field);
            const value = node[field];
            if (typeof value === 'string') {
              expect(value.length).toBeGreaterThan(0);
            }
          });
        });
      });
    });

    it('all slugs are unique', () => {
      const slugs = nodes.map((n) => n.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    describe('prerequisites reference valid slugs', () => {
      const allSlugs = new Set(nodes.map((n) => n.slug));

      nodes.forEach((node) => {
        node.prerequisites.forEach((prereq) => {
          it(`node "${node.slug}" prerequisite "${prereq}" exists`, () => {
            expect(allSlugs.has(prereq)).toBe(true);
          });
        });
      });
    });

    describe('each node has at least 2 examples', () => {
      nodes.forEach((node) => {
        it(`node "${node.slug}" has >= 2 examples`, () => {
          expect(node.examples.length).toBeGreaterThanOrEqual(2);
        });
      });
    });
  });

  describe(`${label} edges`, () => {
    const edges = buildGrammarEdges(nodes);

    it('produces the correct number of edges', () => {
      const expectedEdgeCount = nodes.reduce(
        (sum, node) => sum + node.prerequisites.length,
        0,
      );
      expect(edges).toHaveLength(expectedEdgeCount);
    });

    it('every edge has fromSlug and toSlug', () => {
      edges.forEach((edge) => {
        expect(edge).toHaveProperty('fromSlug');
        expect(edge).toHaveProperty('toSlug');
      });
    });

    it('all edge slugs are valid node slugs', () => {
      const allSlugs = new Set(nodes.map((n) => n.slug));
      edges.forEach((edge) => {
        expect(allSlugs.has(edge.fromSlug)).toBe(true);
        expect(allSlugs.has(edge.toSlug)).toBe(true);
      });
    });
  });
}
