import { did, upsertBatch } from '../seed-utils';

export async function seedPlaceCategories() {
  const categories = [
    {
      id: did('cat-stay'),
      slug: 'stay',
      name: 'Stay',
      parent_id: null,
      icon: 'bed-outline',
      order_index: 1,
      is_active: true,
    },
    {
      id: did('cat-eat'),
      slug: 'eat-drink',
      name: 'Eat & Drink',
      parent_id: null,
      icon: 'restaurant-outline',
      order_index: 2,
      is_active: true,
    },
    {
      id: did('cat-cafe'),
      slug: 'cafe',
      name: 'Cafe',
      parent_id: null,
      icon: 'cafe-outline',
      order_index: 3,
      is_active: true,
    },
    {
      id: did('cat-nightlife'),
      slug: 'nightlife',
      name: 'Nightlife',
      parent_id: null,
      icon: 'moon-outline',
      order_index: 4,
      is_active: true,
    },
    {
      id: did('cat-activity'),
      slug: 'activity',
      name: 'Tourism & Activities',
      parent_id: null,
      icon: 'compass-outline',
      order_index: 5,
      is_active: true,
    },
    {
      id: did('cat-coworking'),
      slug: 'coworking',
      name: 'Coworking',
      parent_id: null,
      icon: 'laptop-outline',
      order_index: 6,
      is_active: true,
    },
    {
      id: did('cat-wellness'),
      slug: 'wellness',
      name: 'Wellness & Beauty',
      parent_id: null,
      icon: 'leaf-outline',
      order_index: 7,
      is_active: true,
    },
    {
      id: did('cat-landmark'),
      slug: 'landmark',
      name: 'Landmark',
      parent_id: null,
      icon: 'flag-outline',
      order_index: 8,
      is_active: true,
    },
    {
      id: did('cat-practical'),
      slug: 'practical',
      name: 'Practical & Daily Life',
      parent_id: null,
      icon: 'briefcase-outline',
      order_index: 9,
      is_active: true,
    },
  ];

  await upsertBatch('place_categories', categories, 'id');
  console.log(`✓ Seeded ${categories.length} place categories`);
}
