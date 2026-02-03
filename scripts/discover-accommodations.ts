/**
 * Discover Accommodations using Google Places API
 *
 * Searches for hostels and hotels in each city and outputs
 * real Google Place IDs for the accommodations data file.
 *
 * Usage:
 *   npx tsx scripts/discover-accommodations.ts
 *   npx tsx scripts/discover-accommodations.ts --city bangkok
 *   npx tsx scripts/discover-accommodations.ts --output json
 *
 * Required environment variables:
 *   - GOOGLE_PLACES_API_KEY
 */

import 'dotenv/config';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

interface CityConfig {
  slug: string;
  name: string;
  country: string;
  searchQueries: string[];
}

const CITIES: CityConfig[] = [
  // Thailand
  {
    slug: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    searchQueries: [
      'female friendly hostel Bangkok Thailand',
      'boutique hotel solo traveler Bangkok',
      'best hostel Bangkok Khao San',
      'women friendly hotel Bangkok Silom',
    ],
  },
  {
    slug: 'chiang-mai',
    name: 'Chiang Mai',
    country: 'Thailand',
    searchQueries: [
      'female friendly hostel Chiang Mai Old City',
      'boutique guesthouse Chiang Mai',
      'solo traveler hostel Chiang Mai',
      'women friendly hotel Chiang Mai',
    ],
  },
  // Indonesia (Bali)
  {
    slug: 'ubud',
    name: 'Ubud',
    country: 'Bali Indonesia',
    searchQueries: [
      'female friendly hostel Ubud Bali',
      'boutique hotel solo traveler Ubud',
      'guesthouse Ubud center',
      'yoga retreat accommodation Ubud',
    ],
  },
  {
    slug: 'canggu',
    name: 'Canggu',
    country: 'Bali Indonesia',
    searchQueries: [
      'female friendly hostel Canggu Bali',
      'surf hostel Canggu',
      'boutique hotel Canggu',
      'solo traveler accommodation Canggu',
    ],
  },
  {
    slug: 'seminyak',
    name: 'Seminyak',
    country: 'Bali Indonesia',
    searchQueries: [
      'boutique hotel Seminyak Bali',
      'hostel Seminyak',
      'solo traveler hotel Seminyak',
    ],
  },
  // Japan
  {
    slug: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    searchQueries: [
      'female only hostel Tokyo',
      'capsule hotel women Tokyo',
      'solo traveler hostel Shinjuku',
      'boutique hotel Tokyo Shibuya',
    ],
  },
  {
    slug: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    searchQueries: [
      'female friendly hostel Kyoto',
      'traditional guesthouse Kyoto',
      'solo traveler hostel Kyoto station',
      'machiya hotel Kyoto',
    ],
  },
  {
    slug: 'osaka',
    name: 'Osaka',
    country: 'Japan',
    searchQueries: [
      'female friendly hostel Osaka',
      'capsule hotel women Osaka',
      'solo traveler accommodation Osaka Namba',
    ],
  },
  // Portugal
  {
    slug: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    searchQueries: [
      'best hostel Lisbon solo traveler',
      'female friendly hostel Lisbon',
      'boutique hotel Lisbon Baixa',
      'guesthouse Lisbon Alfama',
    ],
  },
  {
    slug: 'porto',
    name: 'Porto',
    country: 'Portugal',
    searchQueries: [
      'best hostel Porto solo traveler',
      'female friendly hostel Porto',
      'boutique hotel Porto Ribeira',
      'guesthouse Porto center',
    ],
  },
  // Vietnam
  {
    slug: 'ho-chi-minh-city',
    name: 'Ho Chi Minh City',
    country: 'Vietnam',
    searchQueries: [
      'female friendly hostel Ho Chi Minh City',
      'solo traveler hostel Saigon District 1',
      'boutique hotel Ho Chi Minh City',
    ],
  },
  {
    slug: 'hanoi',
    name: 'Hanoi',
    country: 'Vietnam',
    searchQueries: [
      'female friendly hostel Hanoi Old Quarter',
      'solo traveler hostel Hanoi',
      'boutique hotel Hanoi',
    ],
  },
  {
    slug: 'hoi-an',
    name: 'Hoi An',
    country: 'Vietnam',
    searchQueries: [
      'boutique hotel Hoi An Ancient Town',
      'hostel Hoi An solo traveler',
      'guesthouse Hoi An',
    ],
  },
  // Cambodia
  {
    slug: 'siem-reap',
    name: 'Siem Reap',
    country: 'Cambodia',
    searchQueries: [
      'female friendly hostel Siem Reap',
      'solo traveler hostel Siem Reap',
      'boutique hotel Siem Reap',
      'pool hostel Siem Reap',
    ],
  },
  {
    slug: 'phnom-penh',
    name: 'Phnom Penh',
    country: 'Cambodia',
    searchQueries: [
      'hostel Phnom Penh solo traveler',
      'boutique hotel Phnom Penh riverside',
    ],
  },
  // Philippines
  {
    slug: 'el-nido',
    name: 'El Nido',
    country: 'Philippines',
    searchQueries: [
      'hostel El Nido Palawan',
      'boutique hotel El Nido',
      'solo traveler accommodation El Nido',
    ],
  },
  {
    slug: 'siargao',
    name: 'Siargao',
    country: 'Philippines',
    searchQueries: [
      'hostel Siargao General Luna',
      'surf hostel Siargao',
      'boutique hotel Siargao',
    ],
  },
  {
    slug: 'cebu',
    name: 'Cebu',
    country: 'Philippines',
    searchQueries: [
      'hostel Cebu City solo traveler',
      'hotel Cebu IT Park',
    ],
  },
  // Malaysia
  {
    slug: 'kuala-lumpur',
    name: 'Kuala Lumpur',
    country: 'Malaysia',
    searchQueries: [
      'female friendly hostel Kuala Lumpur',
      'solo traveler hostel KL Bukit Bintang',
      'boutique hotel Kuala Lumpur',
    ],
  },
  {
    slug: 'penang',
    name: 'Penang',
    country: 'Malaysia',
    searchQueries: [
      'hostel Georgetown Penang',
      'boutique hotel Penang solo traveler',
    ],
  },
  // Singapore
  {
    slug: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    searchQueries: [
      'female friendly hostel Singapore',
      'capsule hotel Singapore',
      'solo traveler hostel Singapore',
    ],
  },
  // Morocco
  {
    slug: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    searchQueries: [
      'female friendly riad Marrakech',
      'solo traveler hostel Marrakech Medina',
      'women friendly hotel Marrakech',
    ],
  },
  {
    slug: 'fes',
    name: 'Fes',
    country: 'Morocco',
    searchQueries: [
      'riad Fes Medina solo traveler',
      'female friendly accommodation Fes',
    ],
  },
];

// ---------------------------------------------------------------------------
// Google Places API
// ---------------------------------------------------------------------------

interface GooglePlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  business_status?: string;
}

interface GoogleTextSearchResponse {
  results: GooglePlaceSearchResult[];
  status: string;
  next_page_token?: string;
}

async function searchPlaces(query: string): Promise<GooglePlaceSearchResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY is required');

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=lodging&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data: GoogleTextSearchResponse = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn(`   ⚠️  API status: ${data.status}`);
      return [];
    }

    return data.results ?? [];
  } catch (error) {
    console.warn(`   ⚠️  Search failed: ${error}`);
    return [];
  }
}

function inferType(types: string[] = [], name: string = ''): 'hotel' | 'hostel' | 'homestay' {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('hostel') || nameLower.includes('backpacker')) {
    return 'hostel';
  }
  if (nameLower.includes('guesthouse') || nameLower.includes('homestay') ||
      nameLower.includes('guest house') || nameLower.includes('riad')) {
    return 'homestay';
  }
  if (types.includes('lodging')) {
    if (nameLower.includes('capsule') || nameLower.includes('pod')) {
      return 'hostel';
    }
  }
  return 'hotel';
}

// ---------------------------------------------------------------------------
// Main Discovery
// ---------------------------------------------------------------------------

interface DiscoveredAccommodation {
  googlePlaceId: string;
  citySlug: string;
  type: 'hotel' | 'hostel' | 'homestay';
  name: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
}

async function discoverCity(city: CityConfig): Promise<DiscoveredAccommodation[]> {
  console.log(`\n📍 ${city.name}, ${city.country}`);
  console.log('─'.repeat(40));

  const seen = new Set<string>();
  const accommodations: DiscoveredAccommodation[] = [];

  for (const query of city.searchQueries) {
    console.log(`   🔍 "${query}"`);
    const results = await searchPlaces(query);

    for (const place of results) {
      // Skip duplicates
      if (seen.has(place.place_id)) continue;
      seen.add(place.place_id);

      // Skip places with low ratings or few reviews
      if (place.rating && place.rating < 3.5) continue;
      if (place.user_ratings_total && place.user_ratings_total < 10) continue;

      // Skip non-operational businesses
      if (place.business_status && place.business_status !== 'OPERATIONAL') continue;

      accommodations.push({
        googlePlaceId: place.place_id,
        citySlug: city.slug,
        type: inferType(place.types, place.name),
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
      });
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  // Sort by rating and review count
  accommodations.sort((a, b) => {
    const scoreA = (a.rating ?? 0) * Math.log10((a.reviewCount ?? 1) + 1);
    const scoreB = (b.rating ?? 0) * Math.log10((b.reviewCount ?? 1) + 1);
    return scoreB - scoreA;
  });

  // Take top 7 per city (mix of types)
  const hostels = accommodations.filter(a => a.type === 'hostel').slice(0, 4);
  const hotels = accommodations.filter(a => a.type === 'hotel').slice(0, 3);
  const homestays = accommodations.filter(a => a.type === 'homestay').slice(0, 2);

  const selected = [...hostels, ...hotels, ...homestays].slice(0, 7);

  console.log(`   ✓ Found ${accommodations.length} places, selected ${selected.length}`);

  return selected;
}

function generateTypeScript(accommodations: DiscoveredAccommodation[]): string {
  const byCity = new Map<string, DiscoveredAccommodation[]>();

  for (const acc of accommodations) {
    const list = byCity.get(acc.citySlug) ?? [];
    list.push(acc);
    byCity.set(acc.citySlug, list);
  }

  let output = `/**
 * Curated Accommodation List for Sola
 *
 * Auto-generated from Google Places API discovery.
 * Review and curate as needed.
 */

export interface AccommodationEntry {
  googlePlaceId: string;
  citySlug: string;
  type: 'hotel' | 'hostel' | 'homestay';
  name?: string;
  description?: string;
}

export const ACCOMMODATIONS: AccommodationEntry[] = [\n`;

  for (const [citySlug, places] of byCity) {
    output += `  // ${citySlug.toUpperCase().replace(/-/g, ' ')}\n`;

    for (const place of places) {
      output += `  {\n`;
      output += `    googlePlaceId: '${place.googlePlaceId}',\n`;
      output += `    citySlug: '${place.citySlug}',\n`;
      output += `    type: '${place.type}',\n`;
      output += `    name: '${place.name.replace(/'/g, "\\'")}',\n`;
      if (place.rating) {
        output += `    // Rating: ${place.rating} (${place.reviewCount} reviews)\n`;
      }
      output += `  },\n`;
    }
    output += `\n`;
  }

  output += `];\n`;

  return output;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const cityFilter = args.includes('--city') ? args[args.indexOf('--city') + 1] : undefined;
  const outputFormat = args.includes('--output') ? args[args.indexOf('--output') + 1] : 'typescript';

  console.log('🔍 Sola Accommodation Discovery');
  console.log('═'.repeat(50));

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY is required');
    console.error('   Add it to your .env file');
    process.exit(1);
  }

  let cities = CITIES;
  if (cityFilter) {
    cities = cities.filter(c => c.slug === cityFilter);
    if (cities.length === 0) {
      console.error(`❌ City not found: ${cityFilter}`);
      process.exit(1);
    }
  }

  console.log(`📍 Discovering accommodations in ${cities.length} cities...`);

  const allAccommodations: DiscoveredAccommodation[] = [];

  for (const city of cities) {
    const accommodations = await discoverCity(city);
    allAccommodations.push(...accommodations);

    // Rate limit between cities
    await new Promise(r => setTimeout(r, 1000));
  }

  // Output
  console.log('\n' + '═'.repeat(50));
  console.log('📊 DISCOVERY COMPLETE');
  console.log('═'.repeat(50));
  console.log(`Total accommodations discovered: ${allAccommodations.length}`);

  if (outputFormat === 'json') {
    console.log('\n📄 JSON Output:');
    console.log(JSON.stringify(allAccommodations, null, 2));
  } else {
    // Generate TypeScript
    const tsOutput = generateTypeScript(allAccommodations);

    // Write to file
    const fs = await import('fs');
    const outputPath = './scripts/content/accommodations.ts';
    fs.writeFileSync(outputPath, tsOutput);

    console.log(`\n✅ Written to ${outputPath}`);
    console.log(`   ${allAccommodations.length} accommodations across ${cities.length} cities`);
  }
}

main().catch(console.error);
