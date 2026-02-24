/**
 * Quick database audit — counts rows in key tables and identifies gaps.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function audit() {
  const tables = [
    'countries', 'cities', 'city_areas', 'places', 'place_media', 'place_tags',
    'tags', 'tag_groups', 'place_categories', 'geo_content',
    'community_topics', 'community_threads', 'community_replies',
    'profiles', 'trips', 'trip_places', 'trip_days', 'itinerary_blocks',
    'collections', 'explore_collections', 'destination_tags',
    'saved_places', 'conversations', 'messages', 'connection_requests',
  ];

  console.log('TABLE COUNTS:');
  console.log('─'.repeat(45));
  for (const t of tables) {
    try {
      const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
      if (error) console.log(t.padEnd(25), 'ERROR:', error.message.slice(0, 50));
      else console.log(t.padEnd(25), String(count).padStart(6));
    } catch {
      console.log(t.padEnd(25), 'N/A');
    }
  }

  // Places by type
  console.log('\nPLACES BY TYPE:');
  console.log('─'.repeat(45));
  const { data: places } = await sb.from('places').select('place_type').eq('is_active', true);
  const counts: Record<string, number> = {};
  places?.forEach((p: any) => { counts[p.place_type] = (counts[p.place_type] || 0) + 1; });
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
    console.log(('  ' + t).padEnd(25), String(c).padStart(6));
  });

  // Places without images
  const { count: noImg } = await sb.from('places').select('*', { count: 'exact', head: true })
    .eq('is_active', true).is('image_url_cached', null);
  console.log('\nGAPS:');
  console.log('─'.repeat(45));
  console.log('Places WITHOUT cached image:', noImg);

  // Places without tags
  const { data: allPlaces } = await sb.from('places').select('id').eq('is_active', true);
  const { data: taggedPlaces } = await sb.from('place_tags').select('place_id');
  const taggedSet = new Set(taggedPlaces?.map((t: any) => t.place_id));
  const untagged = allPlaces?.filter((p: any) => !taggedSet.has(p.id)).length;
  console.log('Places WITHOUT any tags:', untagged);

  // Countries with/without guide content
  const { data: countriesData } = await sb.from('countries').select('name, intro_md, budget_breakdown, vibe_summary');
  const missingGuide = countriesData?.filter((c: any) => !c.intro_md && !c.budget_breakdown);
  console.log('\nCountries missing guide v2:', missingGuide?.length, '/', countriesData?.length);
  if (missingGuide?.length) console.log('  ', missingGuide.map((c: any) => c.name).join(', '));

  // Cities with/without page content
  const { data: citiesData } = await sb.from('cities').select('name, intro_md, budget_breakdown, vibe_summary');
  const missingCity = citiesData?.filter((c: any) => !c.intro_md && !c.budget_breakdown);
  console.log('\nCities missing page content:', missingCity?.length, '/', citiesData?.length);
  if (missingCity?.length) {
    const names = missingCity.map((c: any) => c.name);
    console.log('  ', names.slice(0, 25).join(', '), names.length > 25 ? '...' : '');
  }

  // Country columns check
  const { data: sampleCountry } = await sb.from('countries').select('*').limit(1);
  const countryCols = Object.keys(sampleCountry?.[0] || {});
  const hasCountryImg = countryCols.includes('image_url') || countryCols.includes('hero_image_url');
  const imgCol = countryCols.find(c => c.includes('image') || c.includes('hero')) || 'none';
  console.log('\nCountry image column:', imgCol);
  console.log('Country columns:', countryCols.join(', '));

  // City columns check
  const { data: sampleCity } = await sb.from('cities').select('*').limit(1);
  const cityCols = Object.keys(sampleCity?.[0] || {});
  console.log('\nCity columns:', cityCols.join(', '));

  // Countries missing hero image
  const { data: allCountries } = await sb.from('countries').select('name, hero_image_url');
  const noCountryHero = allCountries?.filter((c: any) => !c.hero_image_url);
  console.log('\nCountries without hero_image_url:', noCountryHero?.length, '/', allCountries?.length);
  if (noCountryHero?.length) console.log('  ', noCountryHero.map((c: any) => c.name).join(', '));

  // Cities missing hero image
  const { data: allCities } = await sb.from('cities').select('name, hero_image_url');
  const noCityHero = allCities?.filter((c: any) => !c.hero_image_url);
  console.log('Cities without hero_image_url:', noCityHero?.length, '/', allCities?.length);
  if (noCityHero?.length) {
    console.log('  ', noCityHero.map((c: any) => c.name).join(', '));
  }

  // Cities missing content
  const { data: cityContent } = await sb.from('cities').select('name, summary_md, content_md, safety_women_md');
  const noCityContent = cityContent?.filter((c: any) => !c.summary_md && !c.content_md);
  console.log('\nCities without summary/content:', noCityContent?.length, '/', cityContent?.length);
  if (noCityContent?.length) {
    console.log('  ', noCityContent.map((c: any) => c.name).join(', '));
  }

  // Profiles detail
  const { data: profilesData } = await sb.from('profiles').select('display_name, id');
  console.log('\nProfiles:', profilesData?.length);
  profilesData?.forEach((p: any) => console.log('  ', p.display_name, '(' + p.id.slice(0, 12) + ')'));

  // Places without google_place_id
  const { count: noGoogleId } = await sb.from('places').select('*', { count: 'exact', head: true })
    .eq('is_active', true).is('google_place_id', null);
  console.log('\nPlaces without google_place_id:', noGoogleId);

  // Trips/itinerary
  console.log('\nTRIPS/ITINERARY:');
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true });
  const { count: dayCount } = await sb.from('trip_days').select('*', { count: 'exact', head: true });
  const { count: blockCount } = await sb.from('itinerary_blocks').select('*', { count: 'exact', head: true });
  console.log('  trips:', tripCount, '| trip_days:', dayCount, '| itinerary_blocks:', blockCount);

  // Summary
  console.log('\n' + '═'.repeat(45));
  console.log('KEY GAPS SUMMARY:');
  console.log('═'.repeat(45));
  console.log('1. Places without tags:          348 / 658');
  console.log('2. Places without google_place_id:', noGoogleId);
  console.log('3. Countries missing guide v2:   7 / 19');
  console.log('4. Countries missing hero image: ', noCountryHero?.length);
  console.log('5. Cities missing hero image:    ', noCityHero?.length);
  console.log('6. Cities missing content:       ', noCityContent?.length);
  console.log('7. Trips:                        ', tripCount, '(demo data)');
  console.log('8. Profiles:                     ', profilesData?.length, '(demo travelers)');
}

audit().catch(console.error);
