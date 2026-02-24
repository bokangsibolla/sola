/**
 * QA Test Group 7: Trip Detail Management
 *
 * Verify adding/removing places and accommodations within a trip.
 */

export const group = 'Trip Detail Management';

export const tests = [
  {
    id: 32,
    name: 'Add a place to trip',
    steps: [
      { action: 'clickTab', label: 'Discover' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'click', target: 'A city card' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'scroll', direction: 'down' },
      { action: 'click', target: 'A place card (restaurant, activity, or landmark)' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'click', target: '"Add to trip" or save/bookmark button' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'click', target: '"Test Trip to Portugal" in trip selector' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'After adding place to trip' },
    ],
    passWhen: 'Confirmation that place was added to trip (toast, checkmark, or state change)',
    likelyArea: 'data/trips/tripApi.ts, place detail screen',
    createsData: true,
  },
  {
    id: 33,
    name: 'Add accommodation to trip',
    steps: [
      { action: 'clickTab', label: 'Trips' },
      { action: 'click', target: '"Test Trip to Portugal" trip card' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'click', target: 'Add accommodation button or accommodations section' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'fillForm', fields: {
        name: 'QA_Accommodation_Test',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
      }},
      { action: 'click', target: 'Save or Add button' },
      { action: 'waitFor', text: 'QA_Accommodation', timeout: 5000 },
      { action: 'snapshot', description: 'Trip detail with added accommodation' },
    ],
    passWhen: '"QA_Accommodation_Test" appears in trip accommodations section',
    likelyArea: 'app/(tabs)/trips/[id]/index.tsx, data/trips/tripApi.ts',
    createsData: true,
  },
  {
    id: 34,
    name: 'Remove place from trip',
    steps: [
      { action: 'scroll', direction: 'up' },
      { action: 'click', target: 'Saved place in trip detail (the one added in test 32)' },
      { action: 'waitFor', timeout: 2000 },
      { action: 'click', target: 'Remove or delete option for the place' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'Trip detail after removing place' },
    ],
    passWhen: 'Previously added place is no longer listed in trip',
    likelyArea: 'app/(tabs)/trips/[id]/index.tsx, data/trips/tripApi.ts',
    cleansUpData: true,
  },
];
