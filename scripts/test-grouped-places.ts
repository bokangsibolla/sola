import { supabase } from './seed-utils';

// Copy of the toCamel function
function toCamel<T>(row: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out as T;
}

function rowsToCamel<T>(rows: Record<string, any>[]): T[] {
  return rows.map((r) => toCamel<T>(r));
}

interface Place {
  id: string;
  name: string;
  placeType: string;
  bestTimeOfDay?: string;
}

async function main() {
  // Get Bangkok city
  const { data: bangkok } = await supabase
    .from('cities')
    .select('id, name')
    .eq('slug', 'bangkok')
    .single();

  if (!bangkok) {
    console.log('Bangkok not found');
    return;
  }

  console.log(`Testing with: ${bangkok.name} (${bangkok.id})\n`);

  // Query places
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', bangkok.id)
    .eq('is_active', true);

  if (error) {
    console.log('Query error:', error);
    return;
  }

  const places = rowsToCamel<Place>(data ?? []);
  console.log(`Found ${places.length} places\n`);

  // Group them
  const accommodationTypes = ['hotel', 'hostel', 'homestay'];
  const activityTypes = ['tour', 'activity'];

  const result = {
    morning: [] as Place[],
    afternoon: [] as Place[],
    evening: [] as Place[],
    fullDay: [] as Place[],
    accommodations: [] as Place[],
  };

  for (const place of places) {
    if (accommodationTypes.includes(place.placeType)) {
      result.accommodations.push(place);
      continue;
    }

    if (activityTypes.includes(place.placeType)) {
      result.fullDay.push(place);
      continue;
    }

    if (place.placeType === 'landmark' && (!place.bestTimeOfDay || place.bestTimeOfDay === 'any')) {
      result.fullDay.push(place);
      continue;
    }

    switch (place.bestTimeOfDay) {
      case 'morning':
        result.morning.push(place);
        break;
      case 'afternoon':
        result.afternoon.push(place);
        break;
      case 'evening':
        result.evening.push(place);
        break;
      case 'any':
        result.fullDay.push(place);
        break;
      default:
        // Fallback based on place type
        if (['cafe', 'bakery', 'coworking'].includes(place.placeType)) {
          result.morning.push(place);
        } else if (['restaurant'].includes(place.placeType)) {
          result.afternoon.push(place);
        } else if (['bar', 'club', 'rooftop'].includes(place.placeType)) {
          result.evening.push(place);
        } else {
          result.fullDay.push(place);
        }
    }
  }

  console.log('Grouped places:');
  console.log(`  Morning: ${result.morning.length} (${result.morning.map(p => p.name).join(', ') || 'none'})`);
  console.log(`  Afternoon: ${result.afternoon.length} (${result.afternoon.map(p => p.name).join(', ') || 'none'})`);
  console.log(`  Evening: ${result.evening.length} (${result.evening.map(p => p.name).join(', ') || 'none'})`);
  console.log(`  Full Day: ${result.fullDay.length} (${result.fullDay.map(p => p.name).join(', ') || 'none'})`);
  console.log(`  Accommodations: ${result.accommodations.length} (${result.accommodations.map(p => p.name).join(', ') || 'none'})`);

  const hasPlaces = result.morning.length > 0 || result.afternoon.length > 0 ||
    result.evening.length > 0 || result.fullDay.length > 0 || result.accommodations.length > 0;

  console.log(`\nhasPlaces: ${hasPlaces}`);
}

main();
