/**
 * Parse the accommodations CSV and convert to TypeScript data file
 */
import * as fs from 'fs';
import * as path from 'path';

// Simple CSV parser that handles quoted fields
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < 5) continue; // Skip malformed rows

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });

    // Only include rows with valid data
    if (row['Accommodation Name'] && row['Country']) {
      results.push(row);
    }
  }

  return results;
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
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

// Extract Google Place ID from various URL formats
function extractGooglePlaceId(url: string): string | null {
  if (!url) return null;

  // Format: ?cid=123456
  const cidMatch = url.match(/[?&]cid=(\d+)/);
  if (cidMatch) return `cid:${cidMatch[1]}`;

  // Format: place_id or data containing place ID
  const placeIdMatch = url.match(/!1s([^!]+)/);
  if (placeIdMatch) return placeIdMatch[1];

  // Format: /place/Name/@lat,lng... with !1s
  const dataMatch = url.match(/0x[0-9a-f]+:0x[0-9a-f]+/i);
  if (dataMatch) return dataMatch[0];

  return null;
}

// Map price range to number
function mapPriceLevel(priceRange: string): number {
  if (priceRange === '$') return 1;
  if (priceRange === '$$') return 2;
  if (priceRange === '$$$') return 3;
  return 2; // default mid-range
}

// Map type to our place_type enum
function mapPlaceType(type: string): string {
  const typeMap: Record<string, string> = {
    'hostel': 'hostel',
    'hotel': 'hotel',
    'boutique_hotel': 'hotel',
    'resort': 'hotel',
    'guesthouse': 'homestay',
    'homestay': 'homestay',
    'aparthotel': 'hotel',
    'eco_lodge': 'homestay',
  };
  return typeMap[type.toLowerCase()] || 'hotel';
}

// Convert city slug
function toCitySlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-');
}

async function main() {
  const csvPath = '/Users/bokangsibolla/Downloads/sola_accommodations_complete.csv';
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  console.log(`Parsed ${rows.length} accommodations\n`);

  // Group by country for summary
  const byCountry: Record<string, number> = {};
  rows.forEach(row => {
    const country = row['Country'];
    byCountry[country] = (byCountry[country] || 0) + 1;
  });

  console.log('By country:');
  Object.entries(byCountry).sort((a, b) => b[1] - a[1]).forEach(([country, count]) => {
    console.log(`  ${country}: ${count}`);
  });
  console.log('');

  // Transform to our format
  const accommodations = rows.map(row => {
    const googleMapsUrl = row['Google Maps URL'] || '';
    const placeId = extractGooglePlaceId(googleMapsUrl);

    return {
      name: row['Accommodation Name'],
      googleMapsUrl,
      googlePlaceId: placeId,
      type: mapPlaceType(row['Type'] || 'hotel'),
      originalType: row['Type'] || 'hotel',
      citySlug: row['City Slug'] || toCitySlug(row['City']),
      city: row['City'],
      country: row['Country'],
      priceRange: row['Price Range'] || '$$',
      priceLevel: mapPriceLevel(row['Price Range']),
      pricePerNight: row['Price Per Night'] || null,
      googleRating: parseFloat(row['Google Rating']) || null,
      reviewCount: parseInt(row['Review Count']) || null,
      whySelected: row['Why Selected'],
      highlights: row['Highlights']?.split(';').map(s => s.trim()).filter(Boolean) || [],
      considerations: row['Considerations']?.split(';').map(s => s.trim()).filter(Boolean) || [],
      soloFemaleReviews: row['Solo Female Reviews'],
      sourcesChecked: row['Sources Checked']?.split(';').map(s => s.trim()).filter(Boolean) || [],
    };
  });

  // Generate TypeScript file
  const tsContent = `/**
 * Sola Accommodations Data
 * Generated from researched CSV file
 *
 * Total: ${accommodations.length} accommodations across ${Object.keys(byCountry).length} countries
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
  priceRange: string;
  priceLevel: number;
  pricePerNight: string | null;
  googleRating: number | null;
  reviewCount: number | null;
  whySelected: string;
  highlights: string[];
  considerations: string[];
  soloFemaleReviews: string;
  sourcesChecked: string[];
}

export const ACCOMMODATIONS: AccommodationEntry[] = ${JSON.stringify(accommodations, null, 2)};

// Grouped by country for easy access
export const ACCOMMODATIONS_BY_COUNTRY: Record<string, AccommodationEntry[]> = {
${Object.keys(byCountry).map(country => {
  const filtered = accommodations.filter(a => a.country === country);
  return `  '${country}': ACCOMMODATIONS.filter(a => a.country === '${country}'),`;
}).join('\n')}
};

// Grouped by city
export const ACCOMMODATIONS_BY_CITY: Record<string, AccommodationEntry[]> = {};
ACCOMMODATIONS.forEach(a => {
  if (!ACCOMMODATIONS_BY_CITY[a.citySlug]) {
    ACCOMMODATIONS_BY_CITY[a.citySlug] = [];
  }
  ACCOMMODATIONS_BY_CITY[a.citySlug].push(a);
});
`;

  const outputPath = path.join(__dirname, 'content', 'accommodations-researched.ts');
  fs.writeFileSync(outputPath, tsContent);
  console.log(`\nWrote ${outputPath}`);

  // Show sample
  console.log('\n=== SAMPLE ENTRY ===');
  console.log(JSON.stringify(accommodations[0], null, 2));
}

main().catch(console.error);
