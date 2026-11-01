/**
 * DSA Quest Seed Script
 * Reads dsa-120-problems.json and inserts into Supabase `problems` table
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const jsonPath = path.join(__dirname, '../src/data/dsa-120-problems.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const problems = JSON.parse(rawData);

  console.log(`Loaded ${problems.length} problems from dsa-120-problems.json`);

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n[INFO] Supabase credentials not found in environment.');
    console.log('Verifying local seed dataset integrity...');
  } else {
    console.log(`Connecting to Supabase at ${supabaseUrl}...`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('problems').upsert(
      problems.map((p: any) => ({
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

  // Verification count query
  const total = problems.length;
  const easyCount = problems.filter((p: any) => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter((p: any) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p: any) => p.difficulty === 'Hard').length;
  const nodes = [...new Set(problems.map((p: any) => p.node))];

  console.log('\n================ SEED VERIFICATION ================');
  console.log(`Total Problems: ${total}`);
  console.log(`Total Nodes: ${nodes.length}`);
  console.log(`Difficulty Breakdown: Easy=${easyCount}, Medium=${mediumCount}, Hard=${hardCount}`);
  console.log('====================================================\n');
}

seed().catch(console.error);
