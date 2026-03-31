import { describe, it, expect } from 'vitest';
import {
  FLEMISH_A1_GRAMMAR_NODES,
  buildGrammarEdges,
} from '../src/db/seeds/flemish-a1-grammar';

const REQUIRED_FIELDS = [
  'slug',
  'name',
  'nameInTarget',
  'cefrLevel',
  'category',
  'shortDescription',
  'examples',
] as const;

describe('FLEMISH_A1_GRAMMAR_NODES', () => {
  it('has exactly 16 nodes', () => {
    expect(FLEMISH_A1_GRAMMAR_NODES).toHaveLength(16);
  });

  describe('each node has all required fields', () => {
    FLEMISH_A1_GRAMMAR_NODES.forEach((node, index) => {
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
    const slugs = FLEMISH_A1_GRAMMAR_NODES.map((n) => n.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  describe('prerequisites reference valid slugs (no dangling references)', () => {
    const allSlugs = new Set(FLEMISH_A1_GRAMMAR_NODES.map((n) => n.slug));

    FLEMISH_A1_GRAMMAR_NODES.forEach((node) => {
      node.prerequisites.forEach((prereq) => {
        it(`node "${node.slug}" prerequisite "${prereq}" exists in the node list`, () => {
          expect(allSlugs.has(prereq)).toBe(true);
        });
      });
    });
  });

  describe('each node has at least 2 examples', () => {
    FLEMISH_A1_GRAMMAR_NODES.forEach((node) => {
      it(`node "${node.slug}" has >= 2 examples`, () => {
        expect(node.examples.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});

describe('buildGrammarEdges', () => {
  const edges = buildGrammarEdges(FLEMISH_A1_GRAMMAR_NODES);

  it('produces the correct number of edges', () => {
    const expectedEdgeCount = FLEMISH_A1_GRAMMAR_NODES.reduce(
      (sum, node) => sum + node.prerequisites.length,
      0,
    );
    expect(edges).toHaveLength(expectedEdgeCount);
  });

  it('every edge has fromSlug and toSlug', () => {
    edges.forEach((edge) => {
      expect(edge).toHaveProperty('fromSlug');
      expect(edge).toHaveProperty('toSlug');
      expect(typeof edge.fromSlug).toBe('string');
      expect(typeof edge.toSlug).toBe('string');
    });
  });

  it('all fromSlug and toSlug values are valid node slugs', () => {
    const allSlugs = new Set(FLEMISH_A1_GRAMMAR_NODES.map((n) => n.slug));
    edges.forEach((edge) => {
      expect(allSlugs.has(edge.fromSlug)).toBe(true);
      expect(allSlugs.has(edge.toSlug)).toBe(true);
    });
  });
});
