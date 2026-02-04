import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

import { ACTIVITIES_TO_SEED } from './content/activities-to-seed';
import { ACCOMMODATIONS_TO_SEED } from './content/accommodations-to-seed';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkCoverage() {
  // Get all cities from database
  const { data: dbCities } = await supabase
    .from('cities')
    .select('slug, name, country:countries(name)');

  const dbCitySlugs = new Set(dbCities?.map(c => c.slug) || []);

  console.log(`Database has ${dbCitySlugs.size} cities\n`);

  // Get unique city slugs from content
  const activityCities = [...new Set(ACTIVITIES_TO_SEED.map(a => a.citySlug))];
  const accommodationCities = [...new Set(ACCOMMODATIONS_TO_SEED.map(a => a.citySlug))];
  const allContentCities = [...new Set([...activityCities, ...accommodationCities])];

  console.log('=== CITY COVERAGE CHECK ===\n');

  const missing: string[] = [];
  const found: string[] = [];

  for (const slug of allContentCities.sort()) {
    if (dbCitySlugs.has(slug)) {
      found.push(slug);
    } else {
      missing.push(slug);
    }
  }

  console.log(`✅ Found in DB: ${found.length} cities`);
  found.forEach(s => console.log(`   - ${s}`));

  if (missing.length > 0) {
    console.log(`\n❌ MISSING from DB: ${missing.length} cities`);
    missing.forEach(slug => {
      const entry = ACTIVITIES_TO_SEED.find(a => a.citySlug === slug) ||
                    ACCOMMODATIONS_TO_SEED.find(a => a.citySlug === slug);
      console.log(`   - ${slug} (${entry?.city}, ${entry?.country})`);
    });

    // Count how many places would be skipped
    const skippedActivities = ACTIVITIES_TO_SEED.filter(a => missing.includes(a.citySlug));
    const skippedAccommodations = ACCOMMODATIONS_TO_SEED.filter(a => missing.includes(a.citySlug));

    console.log(`\n⚠️  Would skip ${skippedActivities.length} activities and ${skippedAccommodations.length} accommodations due to missing cities`);
  } else {
    console.log('\n✅ All content cities exist in database!');
  }
}

checkCoverage().catch(console.error);
