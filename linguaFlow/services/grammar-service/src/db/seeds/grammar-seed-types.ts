/**
 * Shared types and utilities for grammar seed data files.
 * All language-specific grammar seed files should import from here.
 */

export interface GrammarNodeSeed {
  slug: string;
  name: string;
  nameInTarget: string;
  cefrLevel: string;
  category: string;
  shortDescription: string;
  fullExplanation: string;
  prerequisites: string[];
  examples: {
    target: string;
    native: string;
    highlightRange: [number, number];
    notes?: string;
  }[];
  order: number;
}

/**
 * Edges are derived from the prerequisites array in each node.
 * They map slug references to actual DB-generated UUIDs at seed time.
 */
export function buildGrammarEdges(nodes: GrammarNodeSeed[]): { fromSlug: string; toSlug: string }[] {
  const edges: { fromSlug: string; toSlug: string }[] = [];
  for (const node of nodes) {
    for (const prereqSlug of node.prerequisites) {
      edges.push({ fromSlug: prereqSlug, toSlug: node.slug });
    }
  }
  return edges;
}
