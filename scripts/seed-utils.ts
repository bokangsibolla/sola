import { v5 as uuidv5 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Same namespace as PostgreSQL's uuid_ns_url() -- ensures IDs match between SQL and TS
const UUID_NS_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

/** Generate a deterministic UUID from a key string. Matches uuid_generate_v5(uuid_ns_url(), key) in Postgres. */
export function did(key: string): string {
  return uuidv5(key, UUID_NS_URL);
}

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required for seeding (bypasses RLS).');
  console.error('Add it to your .env file. Find it in Supabase Dashboard → Settings → API.');
  process.exit(1);
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  serviceRoleKey,
);

/**
 * Upsert rows into a table. Uses ON CONFLICT on the specified column(s).
 * Logs progress. Chunks into batches of 500.
 */
export async function upsertBatch<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  conflictColumns: string,
): Promise<void> {
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictColumns, ignoreDuplicates: false });
    if (error) {
      console.error(`[${table}] batch ${i / BATCH + 1} FAILED:`, error.message);
      throw error;
    }
  }
  console.log(`  ✓ ${table}: ${rows.length} rows upserted`);
}
