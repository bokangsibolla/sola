import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
  // Get existing places count by type
  const { data: places, error } = await supabase
    .from('places')
    .select('name, place_type, slug, city_id')
    .in('place_type', ['hotel', 'hostel', 'homestay', 'activity', 'tour', 'landmark']);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== EXISTING IN DATABASE ===');
  console.log('Total places:', places?.length || 0);

  const byType: Record<string, number> = {};
  places?.forEach(p => {
    byType[p.place_type] = (byType[p.place_type] || 0) + 1;
  });
  console.log('By type:', byType);

  // List existing names for dedup check
  console.log('\n=== EXISTING PLACE NAMES ===');
  const names = places?.map(p => p.name).sort() || [];
  names.forEach(n => console.log('-', n));
}

check();
