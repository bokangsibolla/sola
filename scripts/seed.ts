import 'dotenv/config';

async function main() {
  const clean = process.argv.includes('--clean');

  console.log('Seeding Sola database...\n');

  if (clean) {
    // --clean flag: wipe all seed tables before re-inserting.
    // WARNING: This deletes ALL data including rows added by SQL migrations
    // (e.g. 20260210_add_ph_th_new_places, 20260211_add_ai_researched_places).
    // Only use this for a full database reset. Run recovery migrations after.
    console.log('  ⚠ --clean mode: deleting all rows from seed tables...');
    const { supabase } = await import('./seed-utils');

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
  } else {
    console.log('  ℹ Upserting seed data (existing rows will be updated, migration data preserved).');
    console.log('  ℹ Use --clean flag to wipe all tables first.\n');
  }

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
