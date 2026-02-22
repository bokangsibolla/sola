/**
 * One-time recovery script: re-inserts places wiped by seed.ts
 * Runs the INSERT statements from 20260210 + 20260211 migrations
 * via the Supabase REST API (service role key required).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required. Add it to your .env file.');
  process.exit(1);
}

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  serviceRoleKey,
);

async function runSqlFile(filePath: string, label: string) {
  console.log(`\n--- ${label} ---`);
  const sql = fs.readFileSync(filePath, 'utf-8');

  // Split by individual INSERT statements and run them one at a time
  // This avoids hitting request size limits on the REST API
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.toUpperCase().startsWith('INSERT'));

  console.log(`  Found ${statements.length} INSERT statements`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const { error } = await supabase.rpc('exec_sql', { query: stmt }).maybeSingle();

    if (error) {
      // If it's a "duplicate" or "already exists" error, that's fine
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        skipped++;
      } else {
        failed++;
        if (failed <= 5) {
          console.warn(`  ⚠ Statement ${i + 1} failed: ${error.message}`);
        }
      }
    } else {
      success++;
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  Progress: ${i + 1}/${statements.length} (${success} inserted, ${skipped} skipped)`);
    }
  }

  console.log(`  Done: ${success} inserted, ${skipped} already existed, ${failed} failed`);
}

async function main() {
  console.log('Recovering places data wiped by seed.ts...');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  // Run the two original migrations that had the places data
  await runSqlFile(
    path.join(migrationsDir, '20260210_add_ph_th_new_places.sql'),
    'PH/TH expansion (166 places, 12 cities)',
  );

  await runSqlFile(
    path.join(migrationsDir, '20260211_add_ai_researched_places.sql'),
    'AI-researched places (127 places, 4 cities, 2 countries)',
  );

  console.log('\n✓ Recovery complete!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
