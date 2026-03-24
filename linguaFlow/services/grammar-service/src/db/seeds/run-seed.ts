import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema.js';
import { SPANISH_A1_GRAMMAR_NODES, buildGrammarEdges } from './spanish-a1-grammar.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://linguaflow:linguaflow@localhost:5432/linguaflow_grammar';

async function seed() {
  console.log('Seeding grammar-service database...');

  const connection = postgres(DATABASE_URL);
  const db = drizzle(connection, { schema });

  // Insert grammar nodes
  const slugToId = new Map<string, string>();

  for (const nodeData of SPANISH_A1_GRAMMAR_NODES) {
    const { prerequisites: _, ...fields } = nodeData;

    const [node] = await db
      .insert(schema.grammarNodes)
      .values({
        language: 'es',
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
    console.log(`  Node: ${node.name} (${node.slug})`);
  }

  // Insert edges based on prerequisites
  const edgeDefs = buildGrammarEdges(SPANISH_A1_GRAMMAR_NODES);

  for (const edge of edgeDefs) {
    const fromId = slugToId.get(edge.fromSlug);
    const toId = slugToId.get(edge.toSlug);

    if (!fromId || !toId) {
      console.warn(`  Skipping edge ${edge.fromSlug} → ${edge.toSlug}: missing node`);
      continue;
    }

    await db.insert(schema.grammarEdges).values({
      fromNodeId: fromId,
      toNodeId: toId,
      relationship: 'prerequisite',
    });

    console.log(`  Edge: ${edge.fromSlug} → ${edge.toSlug}`);
  }

  console.log(`Grammar service seed complete! ${slugToId.size} nodes, ${edgeDefs.length} edges`);
  await connection.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
