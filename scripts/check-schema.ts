/**
 * Quick schema check - verifies if verification columns exist
 */
import { supabase } from './seed-utils';
import 'dotenv/config';

async function main() {
  // Try to select verification columns
  const { data, error } = await supabase
    .from('places')
    .select('id, verification_status, curation_notes, curation_score')
    .limit(1);

  if (error) {
    console.log('❌ Schema columns missing:', error.message);
    console.log('\nYou need to run migrations. Options:');
    console.log('1. Run: npx supabase login && npx supabase db push --linked');
    console.log('2. Or manually run the SQL in Supabase Dashboard > SQL Editor');
  } else {
    console.log('✅ Schema is up to date - verification columns exist');
    console.log('Sample:', data);
  }
}

main();
