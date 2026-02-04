import { supabase } from './seed-utils';
import 'dotenv/config';

async function main() {
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, iso2')
    .eq('is_active', true)
    .order('order_index');

  const { data: cities } = await supabase
    .from('cities')
    .select('name, slug, country_id')
    .eq('is_active', true)
    .order('order_index');

  console.log('=== ALL SOLA DESTINATIONS ===\n');

  const countryMap = new Map(countries?.map(c => [c.id, c]) || []);
  const byCountry: Record<string, string[]> = {};

  cities?.forEach(city => {
    const country = countryMap.get(city.country_id);
    const countryName = country?.name || 'Unknown';
    if (!byCountry[countryName]) byCountry[countryName] = [];
    byCountry[countryName].push(city.name);
  });

  Object.entries(byCountry).forEach(([country, cityList]) => {
    console.log(`**${country}**: ${cityList.join(', ')}`);
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Countries: ${countries?.length || 0}`);
  console.log(`Cities: ${cities?.length || 0}`);
}

main();
