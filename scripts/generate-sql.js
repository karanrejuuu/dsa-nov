const fs = require('fs');
const path = require('path');

const problems = require(path.join(__dirname, '../src/data/dsa-120-problems.json'));
let sql = '-- DSA Quest Seed SQL (120 problems)\n-- Run this in your Supabase SQL Editor after running schema.sql\n\nINSERT INTO public.problems (id, title, slug, url, difficulty, node_order, node, node_key, day, order_in_day) VALUES\n';

const rows = problems.map((p) => {
  const title = p.title.replace(/'/g, "''");
  const node = p.node.replace(/'/g, "''");
  return `  (${p.id}, '${title}', '${p.slug}', '${p.url}', '${p.difficulty}', ${p.node_order}, '${node}', '${p.node_key}', ${p.day}, ${p.order_in_day})`;
});

sql += rows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, url = EXCLUDED.url, difficulty = EXCLUDED.difficulty, day = EXCLUDED.day, order_in_day = EXCLUDED.order_in_day;\n';

fs.writeFileSync(path.join(__dirname, '../supabase/seed.sql'), sql);
console.log('Successfully generated dsa-quest/supabase/seed.sql with 120 problems!');
