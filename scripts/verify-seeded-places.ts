import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function verify() {
  // Check recently seeded places (those with why_selected filled in)
  const { data: recentPlaces, count } = await supabase
    .from('places')
    .select('name, city_id, place_type, best_time_of_day, why_selected, is_active', { count: 'exact' })
    .not('why_selected', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  console.log('=== RECENTLY SEEDED PLACES (with why_selected) ===');
  console.log(`Total with why_selected: ${count}\n`);

  recentPlaces?.forEach(p => {
    console.log(`${p.name}`);
    console.log(`  Type: ${p.place_type}, Time: ${p.best_time_of_day || 'NULL'}, Active: ${p.is_active}`);
  });

  // Check time distribution for all seeded places
  const { data: allSeeded } = await supabase
    .from('places')
    .select('best_time_of_day, place_type')
    .not('why_selected', 'is', null);

  const timeCount: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, any: 0, null: 0 };
  allSeeded?.forEach(p => {
    const key = p.best_time_of_day || 'null';
    timeCount[key] = (timeCount[key] || 0) + 1;
  });

  console.log('\n=== TIME DISTRIBUTION FOR SEEDED PLACES ===');
  console.log(timeCount);

  // Check total counts
  const { count: totalActive } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalAll } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true });

  console.log('\n=== TOTAL COUNTS ===');
  console.log(`All places: ${totalAll}`);
  console.log(`Active places: ${totalActive}`);

  // Check Bangkok specifically for new places
  const { data: bangkokCity } = await supabase
    .from('cities')
    .select('id')
    .eq('slug', 'bangkok')
    .single();

  if (bangkokCity) {
    const { data: bangkokPlaces } = await supabase
      .from('places')
      .select('name, place_type, best_time_of_day, why_selected')
      .eq('city_id', bangkokCity.id);

    console.log('\n=== BANGKOK PLACES ===');
    bangkokPlaces?.forEach(p => {
      const hasWhy = p.why_selected ? '✓' : '✗';
      console.log(`${hasWhy} ${p.name} (${p.place_type}) - time: ${p.best_time_of_day || 'null'}`);
    });
  }
}

verify().catch(console.error);
