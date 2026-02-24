/**
 * QA Test Group 3: Trips Flow
 *
 * Verify trip listing, creation, and deletion.
 */

export const group = 'Trips Flow';

export const tests = [
  {
    id: 13,
    name: 'Trips list shows seeded trips',
    steps: [
      { action: 'clickTab', label: 'Trips' },
      { action: 'waitFor', text: 'Test Trip to Portugal', timeout: 8000 },
      { action: 'snapshot', description: 'Trips list with seeded data' },
    ],
    passWhen: '"Test Trip to Portugal" visible in trips list',
    likelyArea: 'app/(tabs)/trips/index.tsx',
  },
  {
    id: 14,
    name: 'Tap into a trip',
    steps: [
      { action: 'click', target: '"Test Trip to Portugal" trip card' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'Trip detail page' },
    ],
    passWhen: 'Trip detail opens, destination info visible, Portugal/Lisbon shown',
    likelyArea: 'app/(tabs)/trips/[id]/index.tsx',
  },
  {
    id: 15,
    name: 'Create trip flow starts',
    steps: [
      { action: 'navigateBack' },
      { action: 'click', target: 'Create trip button (+ or "Plan a trip")' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'Create trip form/modal' },
    ],
    passWhen: 'Trip creation form or modal appears with input fields',
    likelyArea: 'app/(tabs)/trips/new.tsx',
  },
  {
    id: 16,
    name: 'Fill and save trip',
    steps: [
      { action: 'fillForm', fields: {
        destination: 'Japan',
        title: 'QA_Trip_20260224',
      }},
      { action: 'click', target: 'Save or Create button' },
      { action: 'waitFor', text: 'QA_Trip', timeout: 5000 },
      { action: 'snapshot', description: 'Trip list after creating QA trip' },
    ],
    passWhen: 'New trip "QA_Trip_20260224" appears in trips list',
    likelyArea: 'app/(tabs)/trips/new.tsx, data/trips/tripApi.ts',
    createsData: true,
  },
  {
    id: 17,
    name: 'Delete/remove trip',
    steps: [
      { action: 'click', target: '"QA_Trip_20260224" trip card' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'click', target: 'Settings or menu icon' },
      { action: 'click', target: 'Delete trip option' },
      { action: 'click', target: 'Confirm delete' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'Trips list after deletion' },
    ],
    passWhen: '"QA_Trip_20260224" no longer in trips list',
    likelyArea: 'app/(tabs)/trips/[id]/settings.tsx, data/trips/tripApi.ts',
    cleansUpData: true,
  },
];
