import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testGrouping() {
  const testCities = ['bangkok', 'hoi-an', 'ubud', 'tokyo'];

  for (const slug of testCities) {
    const { data: city } = await supabase
      .from('cities')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (!city) continue;

    const { data: places } = await supabase
      .from('places')
      .select('name, place_type, best_time_of_day')
      .eq('city_id', city.id)
      .eq('is_active', true);

    // Group using same logic as API
    const accommodationTypes = ['hotel', 'hostel', 'homestay'];
    const activityTypes = ['tour', 'activity'];

    const result = {
      morning: [] as string[],
      afternoon: [] as string[],
      evening: [] as string[],
      fullDay: [] as string[],
      accommodations: [] as string[],
    };

    for (const place of places || []) {
      if (accommodationTypes.includes(place.place_type)) {
        result.accommodations.push(place.name);
        continue;
      }

      if (activityTypes.includes(place.place_type)) {
        result.fullDay.push(place.name);
        continue;
      }

      if (place.place_type === 'landmark' && (!place.best_time_of_day || place.best_time_of_day === 'any')) {
        result.fullDay.push(place.name);
        continue;
      }

      switch (place.best_time_of_day) {
        case 'morning':
          result.morning.push(place.name);
          break;
        case 'afternoon':
          result.afternoon.push(place.name);
          break;
        case 'evening':
          result.evening.push(place.name);
          break;
        case 'any':
          result.fullDay.push(place.name);
          break;
        default:
          if (['cafe', 'bakery', 'coworking'].includes(place.place_type)) {
            result.morning.push(place.name);
          } else if (['restaurant'].includes(place.place_type)) {
            result.afternoon.push(place.name);
          } else if (['bar', 'club', 'rooftop'].includes(place.place_type)) {
            result.evening.push(place.name);
          } else {
            result.fullDay.push(place.name);
          }
      }
    }

    console.log(`\n=== ${city.name.toUpperCase()} ===`);
    console.log(`Morning (${result.morning.length}):`, result.morning.slice(0, 3).join(', ') || 'none');
    console.log(`Afternoon (${result.afternoon.length}):`, result.afternoon.slice(0, 3).join(', ') || 'none');
    console.log(`Evening (${result.evening.length}):`, result.evening.slice(0, 3).join(', ') || 'none');
    console.log(`Full Day (${result.fullDay.length}):`, result.fullDay.slice(0, 5).join(', ') || 'none');
    console.log(`Accommodations (${result.accommodations.length}):`, result.accommodations.slice(0, 3).join(', ') || 'none');
  }
}

testGrouping().catch(console.error);
