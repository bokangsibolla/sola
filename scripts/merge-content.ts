/**
 * Merge existing content with new CSV content, deduplicating by name
 * Creates unified content files ready for seeding
 *
 * Usage:
 *   npx tsx scripts/merge-content.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Import from both sources
import { ACTIVITIES_FROM_CSV } from './content/activities-from-csv';
import { ACCOMMODATIONS_FROM_CSV } from './content/accommodations-from-csv';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Normalize name for comparison
function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/['']/g, "'");
}

async function mergeContent() {
  // Get existing places from database
  const { data: existingPlaces, error } = await supabase
    .from('places')
    .select('name, place_type, slug, city_id')
    .in('place_type', ['hotel', 'hostel', 'homestay', 'activity', 'tour', 'landmark']);

  if (error) {
    console.error('Error fetching existing places:', error);
    return;
  }

  const existingNames = new Set(existingPlaces?.map(p => normalizeName(p.name)) || []);
  console.log(`Found ${existingNames.size} existing places in database\n`);

  // Check activities for duplicates
  console.log('=== ACTIVITIES ===');
  const newActivities = ACTIVITIES_FROM_CSV.filter(a => !existingNames.has(normalizeName(a.name)));
  const duplicateActivities = ACTIVITIES_FROM_CSV.filter(a => existingNames.has(normalizeName(a.name)));

  console.log(`Total in CSV: ${ACTIVITIES_FROM_CSV.length}`);
  console.log(`Already in DB: ${duplicateActivities.length}`);
  console.log(`New to add: ${newActivities.length}`);

  if (duplicateActivities.length > 0) {
    console.log('\nDuplicates (will skip):');
    duplicateActivities.forEach(a => console.log(`  - ${a.name} (${a.city})`));
  }

  // Check accommodations for duplicates
  console.log('\n=== ACCOMMODATIONS ===');
  const newAccommodations = ACCOMMODATIONS_FROM_CSV.filter(a => !existingNames.has(normalizeName(a.name)));
  const duplicateAccommodations = ACCOMMODATIONS_FROM_CSV.filter(a => existingNames.has(normalizeName(a.name)));

  console.log(`Total in CSV: ${ACCOMMODATIONS_FROM_CSV.length}`);
  console.log(`Already in DB: ${duplicateAccommodations.length}`);
  console.log(`New to add: ${newAccommodations.length}`);

  if (duplicateAccommodations.length > 0) {
    console.log('\nDuplicates (will skip):');
    duplicateAccommodations.forEach(a => console.log(`  - ${a.name} (${a.city})`));
  }

  // Write deduplicated files
  console.log('\n=== WRITING DEDUPLICATED FILES ===');

  // Activities
  const activitiesContent = generateActivitiesFile(newActivities);
  fs.writeFileSync(
    path.join(__dirname, 'content', 'activities-to-seed.ts'),
    activitiesContent
  );
  console.log(`Written: scripts/content/activities-to-seed.ts (${newActivities.length} activities)`);

  // Accommodations
  const accommodationsContent = generateAccommodationsFile(newAccommodations);
  fs.writeFileSync(
    path.join(__dirname, 'content', 'accommodations-to-seed.ts'),
    accommodationsContent
  );
  console.log(`Written: scripts/content/accommodations-to-seed.ts (${newAccommodations.length} accommodations)`);

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Activities to seed: ${newActivities.length}`);
  console.log(`Accommodations to seed: ${newAccommodations.length}`);
  console.log(`Total new places: ${newActivities.length + newAccommodations.length}`);

  // Show cities breakdown for new content
  const actCities = [...new Set(newActivities.map(a => `${a.city}, ${a.country}`))].sort();
  const accCities = [...new Set(newAccommodations.map(a => `${a.city}, ${a.country}`))].sort();

  console.log('\nNew activity cities:', actCities.length);
  console.log('New accommodation cities:', accCities.length);
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function generateActivitiesFile(activities: typeof ACTIVITIES_FROM_CSV): string {
  const entries: string[] = [];
  let currentCountry = '';

  // Sort by country, then city
  const sorted = [...activities].sort((a, b) => {
    const countryCompare = a.country.localeCompare(b.country);
    if (countryCompare !== 0) return countryCompare;
    return a.city.localeCompare(b.city);
  });

  for (const a of sorted) {
    if (a.country !== currentCountry) {
      currentCountry = a.country;
      entries.push(`  // ==========================================================================`);
      entries.push(`  // ${currentCountry.toUpperCase()}`);
      entries.push(`  // ==========================================================================`);
    }

    entries.push(`  {`);
    entries.push(`    name: '${escapeString(a.name)}',`);
    entries.push(`    googleMapsUrl: '${escapeString(a.googleMapsUrl)}',`);
    entries.push(`    googlePlaceId: ${a.googlePlaceId ? `'${a.googlePlaceId}'` : 'null'},`);
    entries.push(`    type: '${a.type}',`);
    entries.push(`    category: '${escapeString(a.category)}',`);
    entries.push(`    citySlug: '${escapeString(a.citySlug)}',`);
    entries.push(`    city: '${escapeString(a.city)}',`);
    entries.push(`    country: '${escapeString(a.country)}',`);
    entries.push(`    priceRange: '${a.priceRange}',`);
    entries.push(`    priceLevel: ${a.priceLevel},`);
    entries.push(`    priceEstimate: ${a.priceEstimate ? `'${escapeString(a.priceEstimate)}'` : 'null'},`);
    entries.push(`    bestTimeOfDay: '${a.bestTimeOfDay}',`);
    entries.push(`    estimatedDuration: '${escapeString(a.estimatedDuration)}',`);
    entries.push(`    physicalLevel: '${a.physicalLevel}',`);
    entries.push(`    googleRating: ${a.googleRating},`);
    entries.push(`    reviewCount: ${a.reviewCount},`);
    entries.push(`    whySelected: '${escapeString(a.whySelected)}',`);
    entries.push(`    highlights: [${a.highlights.map(h => `'${escapeString(h)}'`).join(', ')}],`);
    entries.push(`    considerations: [${a.considerations.map(c => `'${escapeString(c)}'`).join(', ')}],`);
    entries.push(`    soloTravelerReviews: '${escapeString(a.soloTravelerReviews)}',`);
    entries.push(`    bookingInfo: '${escapeString(a.bookingInfo)}',`);
    entries.push(`    sourcesChecked: [${a.sourcesChecked.map(s => `'${escapeString(s)}'`).join(', ')}],`);
    entries.push(`  },`);
  }

  const countries = [...new Set(sorted.map(a => a.country))];
  const cities = [...new Set(sorted.map(a => a.city))];

  return `/**
 * Sola Activities - Ready to Seed
 * Deduplicated against existing database content
 * Generated: ${new Date().toISOString()}
 *
 * Total: ${activities.length} NEW activities across ${cities.length} cities in ${countries.length} countries
 */

export interface ActivityEntry {
  name: string;
  googleMapsUrl: string;
  googlePlaceId: string | null;
  type: 'tour' | 'cooking_class' | 'landmark' | 'viewpoint' | 'day_trip' | 'adventure';
  category: string;
  citySlug: string;
  city: string;
  country: string;
  priceRange: '$' | '$$' | '$$$';
  priceLevel: 1 | 2 | 3;
  priceEstimate: string | null;
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'sunset' | 'any';
  estimatedDuration: string;
  physicalLevel: 'easy' | 'moderate';
  googleRating: number | null;
  reviewCount: number | null;
  whySelected: string;
  highlights: string[];
  considerations: string[];
  soloTravelerReviews: string;
  bookingInfo: string;
  sourcesChecked: string[];
}

export const ACTIVITIES_TO_SEED: ActivityEntry[] = [
${entries.join('\n')}
];
`;
}

function generateAccommodationsFile(accommodations: typeof ACCOMMODATIONS_FROM_CSV): string {
  const entries: string[] = [];
  let currentCountry = '';

  // Sort by country, then city
  const sorted = [...accommodations].sort((a, b) => {
    const countryCompare = a.country.localeCompare(b.country);
    if (countryCompare !== 0) return countryCompare;
    return a.city.localeCompare(b.city);
  });

  for (const a of sorted) {
    if (a.country !== currentCountry) {
      currentCountry = a.country;
      entries.push(`  // ==========================================================================`);
      entries.push(`  // ${currentCountry.toUpperCase()}`);
      entries.push(`  // ==========================================================================`);
    }

    entries.push(`  {`);
    entries.push(`    name: '${escapeString(a.name)}',`);
    entries.push(`    googleMapsUrl: '${escapeString(a.googleMapsUrl)}',`);
    entries.push(`    googlePlaceId: ${a.googlePlaceId ? `'${a.googlePlaceId}'` : 'null'},`);
    entries.push(`    type: '${a.type}',`);
    entries.push(`    originalType: '${escapeString(a.originalType)}',`);
    entries.push(`    citySlug: '${escapeString(a.citySlug)}',`);
    entries.push(`    city: '${escapeString(a.city)}',`);
    entries.push(`    country: '${escapeString(a.country)}',`);
    entries.push(`    priceRange: '${a.priceRange}',`);
    entries.push(`    priceLevel: ${a.priceLevel},`);
    entries.push(`    pricePerNight: ${a.pricePerNight ? `'${a.pricePerNight}'` : 'null'},`);
    entries.push(`    googleRating: ${a.googleRating},`);
    entries.push(`    reviewCount: ${a.reviewCount},`);
    entries.push(`    whySelected: '${escapeString(a.whySelected)}',`);
    entries.push(`    highlights: [${a.highlights.map(h => `'${escapeString(h)}'`).join(', ')}],`);
    entries.push(`    considerations: [${a.considerations.map(c => `'${escapeString(c)}'`).join(', ')}],`);
    entries.push(`    soloFemaleReviews: '${escapeString(a.soloFemaleReviews)}',`);
    entries.push(`    sourcesChecked: [${a.sourcesChecked.map(s => `'${escapeString(s)}'`).join(', ')}],`);
    entries.push(`  },`);
  }

  const countries = [...new Set(sorted.map(a => a.country))];
  const cities = [...new Set(sorted.map(a => a.city))];

  return `/**
 * Sola Accommodations - Ready to Seed
 * Deduplicated against existing database content
 * Generated: ${new Date().toISOString()}
 *
 * Total: ${accommodations.length} NEW accommodations across ${cities.length} cities in ${countries.length} countries
 */

export interface AccommodationEntry {
  name: string;
  googleMapsUrl: string;
  googlePlaceId: string | null;
  type: 'hostel' | 'hotel' | 'homestay';
  originalType: string;
  citySlug: string;
  city: string;
  country: string;
  priceRange: '$' | '$$' | '$$$';
  priceLevel: 1 | 2 | 3;
  pricePerNight: string | null;
  googleRating: number | null;
  reviewCount: number | null;
  whySelected: string;
  highlights: string[];
  considerations: string[];
  soloFemaleReviews: string;
  sourcesChecked: string[];
}

export const ACCOMMODATIONS_TO_SEED: AccommodationEntry[] = [
${entries.join('\n')}
];
`;
}

mergeContent().catch(console.error);
