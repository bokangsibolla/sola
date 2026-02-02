import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { Country, City } from 'country-state-city';

// Get directory of current script for reliable path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'data');

// Use require for CommonJS package (iso-3166)
const require = createRequire(import.meta.url);
const iso3166 = require('iso-3166');

// Ensure output directory exists
fs.mkdirSync(outDir, { recursive: true });

console.log('Generating geo data...');
console.log(`Output directory: ${outDir}`);

// Helper to get iso3 from iso2 using iso-3166 mapping
function getIso3(iso2) {
  return iso3166.iso31661Alpha2ToAlpha3[iso2] || null;
}

// Countries with iso2 (alpha2) and iso3 (alpha3)
const countries = Country.getAllCountries()
  .map((c) => ({
    name: c.name,
    iso2: c.isoCode, // isoCode is the 2-letter code (alpha2)
    iso3: getIso3(c.isoCode), // Get iso3 from iso-3166 mapping
    phonecode: c.phonecode || null,
    currency: c.currency || null,
    flag: c.flag || null,
    latitude: c.latitude || null,
    longitude: c.longitude || null,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Write countries
const countriesPath = path.join(outDir, 'countries.json');
fs.writeFileSync(countriesPath, JSON.stringify(countries, null, 2));
console.log(`✓ Wrote ${countries.length} countries to data/countries.json`);

// Cities as flat array with countryIso2
const allCities = City.getAllCities();
const cities = allCities.map((city) => ({
  name: city.name,
  countryIso2: city.countryCode,
  region: city.stateCode || null,
  latitude: city.latitude || null,
  longitude: city.longitude || null,
}));

// Write all cities
const citiesPath = path.join(outDir, 'cities.json');
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2));
console.log(`✓ Wrote ${cities.length} cities to data/cities.json`);

// Generate top cities (most populous/common cities per country, limited)
// Strategy: Take first 50 cities per country, sorted by name
const topCitiesByCountry = {};
for (const city of cities) {
  const code = city.countryIso2;
  if (!topCitiesByCountry[code]) {
    topCitiesByCountry[code] = [];
  }
  if (topCitiesByCountry[code].length < 50) {
    topCitiesByCountry[code].push(city);
  }
}

// Flatten and sort top cities
const citiesTop = Object.values(topCitiesByCountry)
  .flat()
  .sort((a, b) => {
    const countryCompare = a.countryIso2.localeCompare(b.countryIso2);
    if (countryCompare !== 0) return countryCompare;
    return a.name.localeCompare(b.name);
  });

// Write top cities
const citiesTopPath = path.join(outDir, 'cities_top.json');
fs.writeFileSync(citiesTopPath, JSON.stringify(citiesTop, null, 2));
console.log(`✓ Wrote ${citiesTop.length} top cities to data/cities_top.json`);

console.log('\n✅ Geo data generation complete!');
