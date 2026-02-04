import { supabase } from './seed-utils';

async function main() {
  // Check raw count
  const { count, error: countErr } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true });

  console.log(`Total places (raw count): ${count}`);
  if (countErr) console.log('Count error:', countErr);

  // Check active count
  const { count: activeCount, error: activeErr } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log(`Active places: ${activeCount}`);
  if (activeErr) console.log('Active count error:', activeErr);

  // Get sample places without filter
  const { data: places, error } = await supabase
    .from('places')
    .select('id, name, city_id, place_type, best_time_of_day, is_active')
    .limit(10);

  if (error) {
    console.log('Query error:', error);
    return;
  }

  console.log('\nSample places (no filter):\n');
  for (const place of places || []) {
    console.log(`  ${place.name}: active=${place.is_active}, type=${place.place_type}, time=${place.best_time_of_day || 'NULL'}`);
  }
}

main();
