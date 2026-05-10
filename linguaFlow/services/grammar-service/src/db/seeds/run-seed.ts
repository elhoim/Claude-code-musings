import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema.js';
import { buildGrammarEdges } from './grammar-seed-types.js';
import { SPANISH_A1_GRAMMAR_NODES } from './spanish-a1-grammar.js';
import { FRENCH_A1_GRAMMAR_NODES } from './french-a1-grammar.js';
import { FLEMISH_A1_GRAMMAR_NODES } from './flemish-a1-grammar.js';
import { ENGLISH_A1_GRAMMAR_NODES } from './english-a1-grammar.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://linguaflow:linguaflow@localhost:5432/linguaflow_grammar';

async function seed() {
  console.log('Seeding grammar-service database...');

  const connection = postgres(DATABASE_URL);
  const db = drizzle(connection, { schema });

  // Seed all languages
  const languageSeeds = [
    { language: 'es', nodes: SPANISH_A1_GRAMMAR_NODES },
    { language: 'fr', nodes: FRENCH_A1_GRAMMAR_NODES },
    { language: 'nl-BE', nodes: FLEMISH_A1_GRAMMAR_NODES },
    { language: 'en', nodes: ENGLISH_A1_GRAMMAR_NODES },
  ];

  let totalNodes = 0;
  let totalEdges = 0;

  for (const { language, nodes } of languageSeeds) {
    console.log(`\n  Seeding language: ${language}`);
    const slugToId = new Map<string, string>();

    for (const nodeData of nodes) {
      const { prerequisites: _, ...fields } = nodeData;

      const [node] = await db
        .insert(schema.grammarNodes)
        .values({
          language,
          slug: fields.slug,
          name: fields.name,
          nameInTarget: fields.nameInTarget,
          cefrLevel: fields.cefrLevel,
          category: fields.category,
          shortDescription: fields.shortDescription,
          fullExplanation: fields.fullExplanation,
          prerequisites: nodeData.prerequisites,
          examples: fields.examples,
          order: fields.order,
        })
        .returning();

      slugToId.set(node.slug, node.id);
      console.log(`    Node: ${node.name} (${node.slug})`);
    }

    // Insert edges based on prerequisites
    const edgeDefs = buildGrammarEdges(nodes);

    for (const edge of edgeDefs) {
      const fromId = slugToId.get(edge.fromSlug);
      const toId = slugToId.get(edge.toSlug);

      if (!fromId || !toId) {
        console.warn(`    Skipping edge ${edge.fromSlug} → ${edge.toSlug}: missing node`);
        continue;
      }

      await db.insert(schema.grammarEdges).values({
        fromNodeId: fromId,
        toNodeId: toId,
        relationship: 'prerequisite',
      });

      console.log(`    Edge: ${edge.fromSlug} → ${edge.toSlug}`);
    }

    totalNodes += slugToId.size;
    totalEdges += edgeDefs.length;
  }

  console.log(`\nGrammar service seed complete! ${totalNodes} nodes, ${totalEdges} edges`);
  await connection.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
