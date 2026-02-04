import { supabase } from './seed-utils';

async function main() {
  // Get column info from places table
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'places' });

  if (error) {
    console.log('RPC error (likely function doesnt exist):', error.message);
    console.log('\nTrying alternative approach...\n');

    // Try a simple query without ordering
    const { data: places, error: placeErr } = await supabase
      .from('places')
      .select('id, name, place_type')
      .limit(1);

    if (placeErr) {
      console.log('Query error:', placeErr);
    } else {
      console.log('Sample place (basic columns work):', places?.[0]);
    }

    // Test curation_score column
    const { data: p2, error: e2 } = await supabase
      .from('places')
      .select('id, curation_score')
      .limit(1);

    if (e2) {
      console.log('\ncuration_score column error:', e2.message);
    } else {
      console.log('curation_score exists:', p2?.[0]?.curation_score);
    }

    // Test best_time_of_day column
    const { data: p3, error: e3 } = await supabase
      .from('places')
      .select('id, best_time_of_day')
      .limit(1);

    if (e3) {
      console.log('best_time_of_day column error:', e3.message);
    } else {
      console.log('best_time_of_day exists:', p3?.[0]?.best_time_of_day);
    }

    return;
  }

  console.log('Columns:', data);
}

main();
