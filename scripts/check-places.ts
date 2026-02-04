import { supabase } from './seed-utils';

async function main() {
  // Get cities with place counts
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, slug, country_id')
    .eq('is_active', true);

  console.log('Cities with place counts:\n');
  for (const city of cities || []) {
    const { count } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', city.id)
      .eq('is_active', true);
    if (count && count > 0) {
      console.log(`  ${city.name} (${city.slug}): ${count} places`);
    }
  }

  console.log('\n--- Country to city mapping ---\n');

  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, slug')
    .eq('is_active', true);

  for (const country of countries || []) {
    const countryCities = cities?.filter(c => c.country_id === country.id) || [];
    console.log(`${country.name} (${country.slug}): ${countryCities.length} cities`);
    countryCities.slice(0, 3).forEach(c => console.log(`  - ${c.name} (${c.slug})`));
    if (countryCities.length > 3) console.log(`  ... and ${countryCities.length - 3} more`);
  }
}

main();
