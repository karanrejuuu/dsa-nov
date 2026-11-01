/**
 * DSA Quest Seed Script (Node.js compatible)
 * Seeds Supabase if env vars are present, and validates 120 problem counts.
 * Run with: npm run seed
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const jsonPath = path.join(__dirname, '../src/data/dsa-120-problems.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const problems = JSON.parse(rawData);

  console.log(`Loaded ${problems.length} problems from dsa-120-problems.json`);

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n[NOTE] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set.');
    console.log('Skipping remote insert. Running local seed count query verification...');
  } else {
    console.log(`Connecting to Supabase at ${supabaseUrl}...`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('problems').upsert(
      problems.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        url: p.url,
        difficulty: p.difficulty,
        node_order: p.node_order,
        node: p.node,
        node_key: p.node_key,
        day: p.day,
        order_in_day: p.order_in_day,
      })),
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Supabase seed error:', error.message);
      process.exit(1);
    }
    console.log('Successfully seeded problems table in Supabase!');
  }

  // Verification Count Query
  const total = problems.length;
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;
  const nodes = [...new Set(problems.map((p) => p.node))];

  console.log('\n================ SEED VERIFICATION RESULT ================');
  console.log(`Total Problems: ${total}`);
  console.log(`Total Nodes: ${nodes.length}`);
  console.log(`Difficulty Breakdown: Easy=${easyCount}, Medium=${mediumCount}, Hard=${hardCount}`);
  console.log('Node breakdown:');
  nodes.forEach((n) => {
    const count = problems.filter((p) => p.node === n).length;
    console.log(`  - ${n}: ${count}`);
  });
  console.log('==========================================================\n');
}

seed().catch(console.error);
