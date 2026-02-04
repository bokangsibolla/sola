import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Deterministic ID generator
function did(input: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 32);
}

async function testSeed() {
  // Get Kampot city ID
  const { data: city, error: cityError } = await supabase
    .from('cities')
    .select('id, name')
    .eq('slug', 'kampot')
    .single();

  if (cityError || !city) {
    console.error('City error:', cityError);
    return;
  }

  console.log('Found city:', city.name, city.id);

  // Try to insert a test place
  const testPlace = {
    id: did('test:kayaking-green-cathedral:kampot'),
    city_id: city.id,
    slug: 'kayaking-the-green-cathedral',
    name: 'Kayaking the Green Cathedral TEST',
    place_type: 'activity',
    lat: 10.6,
    lng: 104.2,
    address: 'Kampot, Cambodia',
    price_level: 1,
    description: 'Test activity',
    is_active: true,
    // Rich curation data
    why_selected: 'This is a test',
    highlights: ['Test highlight 1', 'Test highlight 2'],
    considerations: ['Test consideration'],
    solo_female_reviews: 'Test reviews',
    best_time_of_day: 'morning',
    estimated_duration: '2-3 hours',
    physical_level: 'easy',
  };

  console.log('\nAttempting to insert test place...');
  console.log('Place data:', JSON.stringify(testPlace, null, 2));

  const { data, error } = await supabase
    .from('places')
    .upsert(testPlace, { onConflict: 'id' })
    .select();

  console.log('\nResult:');
  console.log('Data:', data);
  console.log('Error:', error);

  // Verify it was inserted
  const { data: verify, error: verifyError } = await supabase
    .from('places')
    .select('*')
    .eq('id', testPlace.id)
    .single();

  console.log('\nVerification:');
  console.log('Found:', verify ? verify.name : 'NOT FOUND');
  console.log('Error:', verifyError);

  // Clean up test place
  if (verify) {
    await supabase.from('places').delete().eq('id', testPlace.id);
    console.log('\nTest place cleaned up');
  }
}

testSeed().catch(console.error);
