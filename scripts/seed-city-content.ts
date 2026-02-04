/**
 * City Editorial Content Seeding Script
 *
 * Adds city-level GeoContent with editorial paragraphs, subtitles, and bestFor.
 * These provide the "orientation" content for city pages.
 *
 * Usage:
 *   npx tsx scripts/seed-city-content.ts
 *   npx tsx scripts/seed-city-content.ts --dry-run
 */

import { supabase, did } from './seed-utils';
import 'dotenv/config';

interface CityContent {
  citySlug: string;
  cityId: string;
  countryId: string;
  title: string;
  subtitle: string;
  summary: string;
  bestFor: string;
  highlights?: string[];
}

const CITY_CONTENT: CityContent[] = [
  // Thailand
  {
    citySlug: 'bangkok',
    cityId: did('city-bkk'),
    countryId: did('country-th'),
    title: 'Bangkok',
    subtitle: 'Where chaos meets charm',
    summary: 'Bangkok rewards the curious. Street food stalls serve meals that rival fine dining, temples rise between skyscrapers, and rooftop bars offer respite from the heat below. It can feel overwhelming at first, but the city reveals itself to those who slow down and explore neighborhood by neighborhood.',
    bestFor: 'Food lovers, night owls, first-time solo travelers',
    highlights: ['World-class street food scene', 'Easy to navigate solo', 'Affordable luxury'],
  },
  {
    citySlug: 'chiang-mai',
    cityId: did('city-cnx'),
    countryId: did('country-th'),
    title: 'Chiang Mai',
    subtitle: 'The digital nomad capital',
    summary: 'Chiang Mai has perfected the art of slow travel. Ancient temples dot the old city, coffee shops double as workspaces, and the surrounding mountains offer weekend escapes. The expat community is welcoming, making it easy to find your people within days of arriving.',
    bestFor: 'Remote workers, wellness seekers, temple lovers',
    highlights: ['Excellent coworking scene', 'Affordable long-term stays', 'Cooking class capital'],
  },
  {
    citySlug: 'krabi',
    cityId: did('city-krabi'),
    countryId: did('country-th'),
    title: 'Krabi',
    subtitle: 'Gateway to island paradise',
    summary: 'Krabi is where limestone cliffs meet turquoise water. Use it as a base for island hopping to Railay Beach and the Phi Phi Islands, or settle into Ao Nang for a quieter beach experience. The pace here is slower, the sunsets are legendary.',
    bestFor: 'Beach lovers, rock climbers, island hoppers',
  },
  {
    citySlug: 'pai',
    cityId: did('city-pai'),
    countryId: did('country-th'),
    title: 'Pai',
    subtitle: 'Bohemian mountain escape',
    summary: 'Pai feels like a secret that got out. This mountain town draws artists, yogis, and travelers seeking something different. Rent a scooter to explore waterfalls and hot springs, then return to Walking Street for live music and craft cocktails.',
    bestFor: 'Nature lovers, yoga enthusiasts, creative spirits',
  },
  {
    citySlug: 'koh-phangan',
    cityId: did('city-kpg'),
    countryId: did('country-th'),
    title: 'Koh Phangan',
    subtitle: 'More than full moon parties',
    summary: 'Beyond its famous parties, Koh Phangan offers yoga retreats, secluded beaches, and jungle trails. The island has distinct personalities: party scene in Haad Rin, wellness community in Srithanu, and local Thai life in Thong Sala. Choose your vibe.',
    bestFor: 'Wellness retreats, beach time, solo travelers seeking community',
  },

  // Vietnam
  {
    citySlug: 'ho-chi-minh-city',
    cityId: did('city-sgn'),
    countryId: did('country-vn'),
    title: 'Ho Chi Minh City',
    subtitle: 'Saigon energy, local soul',
    summary: 'Ho Chi Minh City moves fast. Motorbikes weave through colonial architecture, rooftop bars overlook the river, and pho shops open before dawn. The city rewards early mornings and late nights equally. Start in District 1, but don\'t miss the local neighborhoods.',
    bestFor: 'History buffs, food explorers, urban adventurers',
  },
  {
    citySlug: 'hanoi',
    cityId: did('city-han'),
    countryId: did('country-vn'),
    title: 'Hanoi',
    subtitle: 'Ancient meets avant-garde',
    summary: 'Hanoi is Vietnam\'s cultural heart. The Old Quarter\'s narrow streets haven\'t changed for centuries, but coffee culture and art galleries add modern layers. Wake up to egg coffee, explore temples by day, and end with bia hoi on tiny plastic chairs.',
    bestFor: 'Culture seekers, coffee lovers, photography enthusiasts',
  },
  {
    citySlug: 'hoi-an',
    cityId: did('city-hoi'),
    countryId: did('country-vn'),
    title: 'Hoi An',
    subtitle: 'Lantern-lit magic',
    summary: 'Hoi An is impossibly photogenic. This UNESCO town glows at night with silk lanterns, and by day you can cycle to beaches or rice paddies. Get clothes tailored, take a cooking class, and rent a bike to escape the tourist center.',
    bestFor: 'Photographers, shoppers, cycling enthusiasts',
  },
  {
    citySlug: 'da-nang',
    cityId: did('city-dad'),
    countryId: did('country-vn'),
    title: 'Da Nang',
    subtitle: 'Beach city rising',
    summary: 'Da Nang is Vietnam\'s most liveable city. A long beach, excellent food scene, and proximity to both Hoi An and the mountains make it an ideal base. The city is investing in its future while keeping prices reasonable.',
    bestFor: 'Beach lovers, long-term stays, digital nomads',
  },
  {
    citySlug: 'da-lat',
    cityId: did('city-dlat'),
    countryId: did('country-vn'),
    title: 'Da Lat',
    subtitle: 'Cool mountain retreat',
    summary: 'Da Lat offers escape from Vietnam\'s heat. This former French hill station has pine forests, flower gardens, and strawberry farms. The coffee scene rivals any city, and the cooler temperatures make it perfect for hiking and exploring.',
    bestFor: 'Nature lovers, coffee enthusiasts, adventure seekers',
  },

  // Indonesia
  {
    citySlug: 'ubud',
    cityId: did('city-ubud'),
    countryId: did('country-id'),
    title: 'Ubud',
    subtitle: 'Bali\'s spiritual heart',
    summary: 'Ubud is where Bali\'s spiritual side lives. Rice terraces cascade down hillsides, yoga studios fill morning schedules, and art galleries showcase local talent. The town can feel crowded, but venture beyond the center to find the peace you\'re seeking.',
    bestFor: 'Yoga practitioners, wellness seekers, art lovers',
    highlights: ['World-class yoga studios', 'Sacred Monkey Forest', 'Rice terrace walks'],
  },
  {
    citySlug: 'canggu',
    cityId: did('city-canggu'),
    countryId: did('country-id'),
    title: 'Canggu',
    subtitle: 'Surf, work, repeat',
    summary: 'Canggu is Bali\'s most dynamic neighborhood. Surfers share waves with beginners, coworking spaces hum with laptops, and sunset draws everyone to beach clubs. It\'s grown fast and can feel overhyped, but the energy is undeniable.',
    bestFor: 'Surfers, digital nomads, nightlife seekers',
  },
  {
    citySlug: 'seminyak',
    cityId: did('city-seminyak'),
    countryId: did('country-id'),
    title: 'Seminyak',
    subtitle: 'Beach club sophistication',
    summary: 'Seminyak brings polish to Bali\'s beach scene. Upscale restaurants, boutique shopping, and sunset cocktails define the experience. It\'s more expensive than other Bali spots, but the quality matches the price.',
    bestFor: 'Beach club lovers, shoppers, food enthusiasts',
  },

  // Portugal
  {
    citySlug: 'lisbon',
    cityId: did('city-lisbon'),
    countryId: did('country-pt'),
    title: 'Lisbon',
    subtitle: 'Europe\'s sunniest capital',
    summary: 'Lisbon climbs seven hills facing the Atlantic. Trams rattle through cobblestone streets, pastéis de nata appear at every corner, and viewpoints reveal the city\'s faded grandeur. It\'s become popular with remote workers, but neighborhoods like Alfama keep their local character.',
    bestFor: 'First-time Europe travelers, foodies, history lovers',
    highlights: ['Incredible food scene', 'Walkable historic center', 'Great for solo dining'],
  },
  {
    citySlug: 'porto',
    cityId: did('city-porto'),
    countryId: did('country-pt'),
    title: 'Porto',
    subtitle: 'Gritty, gorgeous, genuine',
    summary: 'Porto has Lisbon\'s charm without the crowds. The Douro River reflects tile-covered buildings, port wine cellars welcome tasters, and the Ribeira waterfront buzzes at sunset. It\'s smaller and more manageable, perfect for a few focused days.',
    bestFor: 'Wine lovers, architecture enthusiasts, off-the-beaten-path seekers',
  },

  // Japan
  {
    citySlug: 'tokyo',
    cityId: did('city-tokyo'),
    countryId: did('country-jp'),
    title: 'Tokyo',
    subtitle: 'Future and tradition collide',
    summary: 'Tokyo is a city of neighborhoods, each with its own personality. Shibuya pulses with youth culture, Asakusa preserves old Edo, and Shinjuku never sleeps. The city is remarkably safe for solo travelers, and getting lost is half the fun.',
    bestFor: 'Culture lovers, foodies, first-time Japan visitors',
    highlights: ['Incredibly safe for solo travel', 'Best food city in the world', 'Efficient public transit'],
  },
  {
    citySlug: 'kyoto',
    cityId: did('city-kyoto'),
    countryId: did('country-jp'),
    title: 'Kyoto',
    subtitle: 'Japan\'s cultural soul',
    summary: 'Kyoto preserves Japan\'s imperial past. Temples and shrines number in the thousands, geishas still walk Gion\'s streets, and bamboo forests provide natural escapes. Visit early morning or late afternoon to experience the magic without crowds.',
    bestFor: 'Temple lovers, traditional culture seekers, photographers',
  },
  {
    citySlug: 'osaka',
    cityId: did('city-osaka'),
    countryId: did('country-jp'),
    title: 'Osaka',
    subtitle: 'Japan\'s kitchen',
    summary: 'Osaka is Japan at its most relaxed. The city lives for food—takoyaki, okonomiyaki, and kushikatsu define the experience. Dotonbori\'s neon lights draw crowds, but the real joy is finding neighborhood spots where locals eat.',
    bestFor: 'Food lovers, nightlife seekers, budget travelers',
  },

  // Malaysia
  {
    citySlug: 'kuala-lumpur',
    cityId: did('city-kl'),
    countryId: did('country-my'),
    title: 'Kuala Lumpur',
    subtitle: 'Where cultures converge',
    summary: 'Kuala Lumpur is Southeast Asia\'s most underrated city. Malay, Chinese, and Indian cultures blend in neighborhoods, food, and architecture. The Petronas Towers get the photos, but the real discoveries happen in Chinatown and Little India.',
    bestFor: 'Food lovers, budget travelers, culture explorers',
  },
  {
    citySlug: 'penang',
    cityId: did('city-penang'),
    countryId: did('country-my'),
    title: 'Penang',
    subtitle: 'Street food paradise',
    summary: 'Penang is Malaysia\'s food capital. George Town\'s UNESCO-listed streets hide hawker stalls serving char kway teow and assam laksa. Street art adds modern appeal, and the multicultural heritage creates unique fusion flavors.',
    bestFor: 'Food enthusiasts, street art lovers, cultural explorers',
  },
];

async function seedCityContent(dryRun: boolean) {
  console.log('🏙️ Seeding City Editorial Content');
  console.log('─'.repeat(50));

  if (dryRun) {
    console.log('⏭️  Dry run mode - no changes will be made\n');
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const city of CITY_CONTENT) {
    console.log(`Processing: ${city.title}`);

    // Check if content already exists
    const { data: existing } = await supabase
      .from('geo_content')
      .select('id')
      .eq('city_id', city.cityId)
      .eq('scope', 'city')
      .maybeSingle();

    if (existing) {
      console.log(`   ⏭️  Already exists`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`   🔍 Would create: ${city.subtitle}`);
      created++;
      continue;
    }

    const contentId = did(`geo-content:city:${city.citySlug}`);

    const { error } = await supabase.from('geo_content').upsert({
      id: contentId,
      scope: 'city',
      country_id: city.countryId,
      city_id: city.cityId,
      title: city.title,
      subtitle: city.subtitle,
      summary: city.summary,
      best_for: city.bestFor,
      highlights: city.highlights ?? [],
      safety_rating: 'generally_safe',
      solo_friendly: true,
      good_for_interests: [],
      top_things_to_do: [],
    }, { onConflict: 'id' });

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errors++;
    } else {
      console.log(`   ✅ Created`);
      created++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Total:   ${CITY_CONTENT.length}`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors:  ${errors}`);
  console.log('═'.repeat(50));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  await seedCityContent(dryRun);
}

main().catch(console.error);
