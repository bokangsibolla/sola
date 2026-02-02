import { did, upsertBatch } from '../seed-utils';

export async function seedTagGroups() {
  const tagGroups = [
    {
      id: did('tg-vibe'),
      slug: 'vibe',
      label: 'Vibe',
      scope: 'global',
      order_index: 1,
      is_active: true,
    },
    {
      id: did('tg-goodfor'),
      slug: 'good-for',
      label: 'Good for',
      scope: 'global',
      order_index: 2,
      is_active: true,
    },
    {
      id: did('tg-safety'),
      slug: 'safety-comfort',
      label: 'Safety & Comfort',
      scope: 'global',
      order_index: 3,
      is_active: true,
    },
    {
      id: did('tg-amenity'),
      slug: 'amenities',
      label: 'Amenities',
      scope: 'global',
      order_index: 4,
      is_active: true,
    },
    {
      id: did('tg-cuisine'),
      slug: 'cuisine',
      label: 'Cuisine & Diet',
      scope: 'global',
      order_index: 5,
      is_active: true,
    },
    {
      id: did('tg-music'),
      slug: 'music',
      label: 'Music',
      scope: 'global',
      order_index: 6,
      is_active: true,
    },
    {
      id: did('tg-physical'),
      slug: 'physical-level',
      label: 'Physical Level',
      scope: 'global',
      order_index: 7,
      is_active: true,
    },
  ];

  await upsertBatch('tag_groups', tagGroups, 'id');
  console.log(`✓ Seeded ${tagGroups.length} tag groups`);
}
