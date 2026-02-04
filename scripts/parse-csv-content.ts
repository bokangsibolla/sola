/**
 * Parse CSV files and convert to TypeScript format for activities and accommodations
 *
 * Usage:
 *   npx tsx scripts/parse-csv-content.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// CSV parsing (handles quoted fields with commas)
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx]?.trim() || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

// Helper functions
function extractPlaceId(url: string): string | null {
  if (!url) return null;
  const cidMatch = url.match(/[?&]cid=(\d+)/);
  if (cidMatch) return `cid:${cidMatch[1]}`;
  const dataMatch = url.match(/0x[0-9a-f]+:0x[0-9a-f]+/i);
  if (dataMatch) return dataMatch[0];
  return null;
}

function priceRangeToLevel(range: string): 1 | 2 | 3 {
  if (range === '$') return 1;
  if (range === '$$') return 2;
  return 3;
}

function parseBestTime(time: string): string {
  const lower = time.toLowerCase().trim();
  if (lower === 'morning') return 'morning';
  if (lower === 'afternoon') return 'afternoon';
  if (lower === 'evening') return 'evening';
  if (lower === 'sunset') return 'sunset';
  return 'any';
}

function parsePhysicalLevel(level: string): string {
  const lower = level.toLowerCase().trim();
  if (lower === 'moderate') return 'moderate';
  return 'easy';
}

function parseActivityType(type: string): string {
  const lower = type.toLowerCase().trim();
  const validTypes = ['tour', 'cooking_class', 'landmark', 'viewpoint', 'day_trip', 'adventure'];
  if (validTypes.includes(lower)) return lower;
  // Map common variations
  if (lower.includes('cook')) return 'cooking_class';
  if (lower.includes('hike') || lower.includes('kayak') || lower.includes('dive')) return 'adventure';
  if (lower.includes('temple') || lower.includes('palace') || lower.includes('museum')) return 'landmark';
  if (lower.includes('view') || lower.includes('sunset')) return 'viewpoint';
  if (lower.includes('day') || lower.includes('trip')) return 'day_trip';
  return 'tour';
}

function parseAccommodationType(type: string): { type: string; originalType: string } {
  const lower = type.toLowerCase().trim();

  // Map to the 3 main types
  if (lower.includes('hostel') || lower.includes('backpacker')) {
    return { type: 'hostel', originalType: lower };
  }
  if (lower.includes('homestay') || lower.includes('home stay') || lower.includes('bnb')) {
    return { type: 'homestay', originalType: lower };
  }
  // Everything else is hotel
  return { type: 'hotel', originalType: lower };
}

function parseHighlights(text: string): string[] {
  if (!text) return [];
  return text.split(';').map(h => h.trim()).filter(h => h.length > 0);
}

function parseSources(text: string): string[] {
  if (!text) return [];
  return text.split(';').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// Convert activities CSV to TypeScript
function convertActivities(rows: Record<string, string>[]): string {
  const entries: string[] = [];
  let currentCountry = '';

  // Sort by country, then city
  rows.sort((a, b) => {
    const countryCompare = a.Country.localeCompare(b.Country);
    if (countryCompare !== 0) return countryCompare;
    return a.City.localeCompare(b.City);
  });

  for (const row of rows) {
    if (row.Country !== currentCountry) {
      currentCountry = row.Country;
      entries.push(`  // ==========================================================================`);
      entries.push(`  // ${currentCountry.toUpperCase()}`);
      entries.push(`  // ==========================================================================`);
    }

    const placeId = extractPlaceId(row['Google Maps URL']);
    const highlights = parseHighlights(row.Highlights);
    const considerations = parseHighlights(row.Considerations);
    const sources = parseSources(row['Sources Checked']);

    entries.push(`  {`);
    entries.push(`    name: '${escapeString(row['Activity Name'])}',`);
    entries.push(`    googleMapsUrl: '${escapeString(row['Google Maps URL'])}',`);
    entries.push(`    googlePlaceId: ${placeId ? `'${placeId}'` : 'null'},`);
    entries.push(`    type: '${parseActivityType(row.Type)}',`);
    entries.push(`    category: '${escapeString(row.Category)}',`);
    entries.push(`    citySlug: '${escapeString(row['City Slug'])}',`);
    entries.push(`    city: '${escapeString(row.City)}',`);
    entries.push(`    country: '${escapeString(row.Country)}',`);
    entries.push(`    priceRange: '${row['Price Range'] || '$'}',`);
    entries.push(`    priceLevel: ${priceRangeToLevel(row['Price Range'])},`);
    entries.push(`    priceEstimate: ${row['Price Estimate'] ? `'${escapeString(row['Price Estimate'])}'` : 'null'},`);
    entries.push(`    bestTimeOfDay: '${parseBestTime(row['Best Time'])}',`);
    entries.push(`    estimatedDuration: '${escapeString(row.Duration || '2-3 hours')}',`);
    entries.push(`    physicalLevel: '${parsePhysicalLevel(row['Physical Level'])}',`);
    entries.push(`    googleRating: ${row['Google Rating'] ? parseFloat(row['Google Rating']) : 'null'},`);
    entries.push(`    reviewCount: ${row['Review Count'] ? parseInt(row['Review Count']) : 'null'},`);
    entries.push(`    whySelected: '${escapeString(row['Why Selected'])}',`);
    entries.push(`    highlights: [${highlights.map(h => `'${escapeString(h)}'`).join(', ')}],`);
    entries.push(`    considerations: [${considerations.map(c => `'${escapeString(c)}'`).join(', ')}],`);
    entries.push(`    soloTravelerReviews: '${escapeString(row['Solo Traveler Reviews'])}',`);
    entries.push(`    bookingInfo: '${escapeString(row['Booking Info'])}',`);
    entries.push(`    sourcesChecked: [${sources.map(s => `'${escapeString(s)}'`).join(', ')}],`);
    entries.push(`  },`);
  }

  return entries.join('\n');
}

// Convert accommodations CSV to TypeScript
function convertAccommodations(rows: Record<string, string>[]): string {
  const entries: string[] = [];
  let currentCountry = '';

  // Sort by country, then city
  rows.sort((a, b) => {
    const countryCompare = a.Country.localeCompare(b.Country);
    if (countryCompare !== 0) return countryCompare;
    return a.City.localeCompare(b.City);
  });

  for (const row of rows) {
    if (row.Country !== currentCountry) {
      currentCountry = row.Country;
      entries.push(`  // ==========================================================================`);
      entries.push(`  // ${currentCountry.toUpperCase()}`);
      entries.push(`  // ==========================================================================`);
    }

    const placeId = extractPlaceId(row['Google Maps URL']);
    const typeInfo = parseAccommodationType(row.Type);
    const highlights = parseHighlights(row.Highlights);
    const considerations = parseHighlights(row.Considerations);
    const sources = parseSources(row['Sources Checked']);

    // Clean price per night (remove $ and non-numeric)
    let pricePerNight = row['Price Per Night']?.replace(/[^0-9]/g, '') || null;
    if (pricePerNight === '') pricePerNight = null;

    entries.push(`  {`);
    entries.push(`    name: '${escapeString(row['Accommodation Name'])}',`);
    entries.push(`    googleMapsUrl: '${escapeString(row['Google Maps URL'])}',`);
    entries.push(`    googlePlaceId: ${placeId ? `'${placeId}'` : 'null'},`);
    entries.push(`    type: '${typeInfo.type}',`);
    entries.push(`    originalType: '${typeInfo.originalType}',`);
    entries.push(`    citySlug: '${escapeString(row['City Slug'])}',`);
    entries.push(`    city: '${escapeString(row.City)}',`);
    entries.push(`    country: '${escapeString(row.Country)}',`);
    entries.push(`    priceRange: '${row['Price Range'] || '$'}',`);
    entries.push(`    priceLevel: ${priceRangeToLevel(row['Price Range'])},`);
    entries.push(`    pricePerNight: ${pricePerNight ? `'${pricePerNight}'` : 'null'},`);
    entries.push(`    googleRating: ${row['Google Rating'] ? parseFloat(row['Google Rating']) : 'null'},`);
    entries.push(`    reviewCount: ${row['Review Count'] ? parseInt(row['Review Count']) : 'null'},`);
    entries.push(`    whySelected: '${escapeString(row['Why Selected'])}',`);
    entries.push(`    highlights: [${highlights.map(h => `'${escapeString(h)}'`).join(', ')}],`);
    entries.push(`    considerations: [${considerations.map(c => `'${escapeString(c)}'`).join(', ')}],`);
    entries.push(`    soloFemaleReviews: '${escapeString(row['Solo Traveler Reviews'])}',`);
    entries.push(`    sourcesChecked: [${sources.map(s => `'${escapeString(s)}'`).join(', ')}],`);
    entries.push(`  },`);
  }

  return entries.join('\n');
}

// Main execution
async function main() {
  const activitiesPath = '/Users/bokangsibolla/Downloads/sola_activities_final.csv';
  const accommodationsPath = '/Users/bokangsibolla/Downloads/sola_accommodations_final.csv';

  // Parse activities
  if (fs.existsSync(activitiesPath)) {
    console.log('Parsing activities CSV...');
    const activitiesContent = fs.readFileSync(activitiesPath, 'utf-8');
    const activitiesRows = parseCSV(activitiesContent);
    console.log(`Found ${activitiesRows.length} activities`);

    const activitiesTS = convertActivities(activitiesRows);
    const outputPath = path.join(__dirname, 'content', 'activities-from-csv.ts');

    const fullContent = `/**
 * Sola Activities Data (Expanded)
 * Parsed from CSV: ${new Date().toISOString()}
 *
 * Total: ${activitiesRows.length} activities
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

export const ACTIVITIES_FROM_CSV: ActivityEntry[] = [
${activitiesTS}
];

// Get unique cities and countries
const cities = [...new Set(ACTIVITIES_FROM_CSV.map(a => a.city))];
const countries = [...new Set(ACTIVITIES_FROM_CSV.map(a => a.country))];
console.log(\`Activities: \${ACTIVITIES_FROM_CSV.length} across \${cities.length} cities in \${countries.length} countries\`);
`;

    fs.writeFileSync(outputPath, fullContent);
    console.log(`Written to: ${outputPath}`);

    // Show summary
    const cities = [...new Set(activitiesRows.map(r => r.City))];
    const countries = [...new Set(activitiesRows.map(r => r.Country))];
    console.log(`Activities: ${activitiesRows.length} across ${cities.length} cities in ${countries.length} countries`);
  }

  // Parse accommodations
  if (fs.existsSync(accommodationsPath)) {
    console.log('\nParsing accommodations CSV...');
    const accommodationsContent = fs.readFileSync(accommodationsPath, 'utf-8');
    const accommodationsRows = parseCSV(accommodationsContent);
    console.log(`Found ${accommodationsRows.length} accommodations`);

    const accommodationsTS = convertAccommodations(accommodationsRows);
    const outputPath = path.join(__dirname, 'content', 'accommodations-from-csv.ts');

    const fullContent = `/**
 * Sola Accommodations Data (Expanded)
 * Parsed from CSV: ${new Date().toISOString()}
 *
 * Total: ${accommodationsRows.length} accommodations
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

export const ACCOMMODATIONS_FROM_CSV: AccommodationEntry[] = [
${accommodationsTS}
];

// Get unique cities and countries
const cities = [...new Set(ACCOMMODATIONS_FROM_CSV.map(a => a.city))];
const countries = [...new Set(ACCOMMODATIONS_FROM_CSV.map(a => a.country))];
console.log(\`Accommodations: \${ACCOMMODATIONS_FROM_CSV.length} across \${cities.length} cities in \${countries.length} countries\`);
`;

    fs.writeFileSync(outputPath, fullContent);
    console.log(`Written to: ${outputPath}`);

    // Show summary
    const cities = [...new Set(accommodationsRows.map(r => r.City))];
    const countries = [...new Set(accommodationsRows.map(r => r.Country))];
    console.log(`Accommodations: ${accommodationsRows.length} across ${cities.length} cities in ${countries.length} countries`);
  }
}

main().catch(console.error);
