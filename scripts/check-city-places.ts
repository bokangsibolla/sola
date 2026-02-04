import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
  // Check several cities to see place counts and time distribution
  const citySlugs = ['bangkok', 'lisbon', 'tokyo', 'chiang-mai', 'hoi-an', 'ubud', 'siargao', 'marrakech'];

  console.log('=== PLACES PER CITY (Time-based grouping) ===\n');

  for (const slug of citySlugs) {
    const { data: city } = await supabase
      .from('cities')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (!city) {
      console.log(`${slug}: City not found`);
      continue;
    }

    const { data: places } = await supabase
      .from('places')
      .select('name, place_type, best_time_of_day')
      .eq('city_id', city.id)
      .eq('is_active', true);

    const byTime: Record<string, number> = {};
    places?.forEach(p => {
      const time = p.best_time_of_day || 'unset';
      byTime[time] = (byTime[time] || 0) + 1;
    });

    const accommodations = places?.filter(p => ['hotel', 'hostel', 'homestay'].includes(p.place_type)).length || 0;
    const activities = places?.filter(p => ['activity', 'tour', 'landmark'].includes(p.place_type)).length || 0;

    console.log(`${city.name}: ${places?.length || 0} places`);
    console.log(`  Accommodations: ${accommodations}, Activities: ${activities}`);
    console.log(`  By time: morning=${byTime.morning || 0}, afternoon=${byTime.afternoon || 0}, evening=${byTime.evening || 0}, any=${byTime.any || 0}`);
    console.log('');
  }

  // Overall summary
  const { count: totalPlaces } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: allPlaces } = await supabase
    .from('places')
    .select('place_type, best_time_of_day')
    .eq('is_active', true);

  const typeCount: Record<string, number> = {};
  allPlaces?.forEach(p => {
    typeCount[p.place_type] = (typeCount[p.place_type] || 0) + 1;
  });

  console.log('=== OVERALL SUMMARY ===');
  console.log(`Total active places: ${totalPlaces}`);
  console.log('By type:', typeCount);
}

check().catch(console.error);
