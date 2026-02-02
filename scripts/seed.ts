import 'dotenv/config';

async function main() {
  console.log('Seeding Sola database...\n');

  // Clear old seed data (reverse FK order) so fresh upserts don't hit stale unique constraints
  const { supabase } = await import('./seed-utils');
  // place_tags has no id column, delete via place_id
  const { error: ptErr } = await supabase.from('place_tags').delete().neq('place_id', '00000000-0000-0000-0000-000000000000');
  if (ptErr) console.warn(`  ⚠ Could not clear place_tags: ${ptErr.message}`);
  else console.log('  ✗ place_tags cleared');

  const tables = ['geo_content', 'place_media', 'places', 'tags', 'tag_groups', 'place_categories', 'city_areas', 'cities', 'countries'];
  for (const t of tables) {
    const { error } = await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.warn(`  ⚠ Could not clear ${t}: ${error.message}`);
    else console.log(`  ✗ ${t} cleared`);
  }
  console.log('');

  const { seedCountries } = await import('./content/countries');
  const { seedCities } = await import('./content/cities');
  const { seedCityAreas } = await import('./content/city-areas');
  const { seedPlaceCategories } = await import('./content/place-categories');
  const { seedTagGroups } = await import('./content/tag-groups');
  const { seedTags } = await import('./content/tags');
  const { seedPlaces } = await import('./content/places');
  const { seedPlaceMedia } = await import('./content/place-media');
  const { seedPlaceTags } = await import('./content/place-tags');
  const { seedGeoContent } = await import('./content/geo-content');

  await seedCountries();
  await seedCities();
  await seedCityAreas();
  await seedPlaceCategories();
  await seedTagGroups();
  await seedTags();
  await seedPlaces();
  await seedPlaceMedia();
  await seedPlaceTags();
  await seedGeoContent();

  console.log('\nDone!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
