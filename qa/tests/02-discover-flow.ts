/**
 * QA Test Group 2: Discover Flow
 *
 * Verify discovery feed, city/country pages, and search.
 */

export const group = 'Discover Flow';

export const tests = [
  {
    id: 6,
    name: 'Hero grid renders',
    steps: [
      { action: 'clickTab', label: 'Discover' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'Check hero grid at top of discover feed' },
    ],
    passWhen: 'City cards and collection card visible with images, hero grid has 3 items (1 large + 2 small)',
    likelyArea: 'components/explore/HeroGrid.tsx',
  },
  {
    id: 7,
    name: 'Tap a city card',
    steps: [
      { action: 'click', target: 'First city card in hero grid or feed' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'City page after tapping card' },
    ],
    passWhen: 'City page opens, city name visible in header, hero image loads',
    likelyArea: 'app/(tabs)/discover/city/[slug].tsx',
  },
  {
    id: 8,
    name: 'City page sections render',
    steps: [
      { action: 'scroll', direction: 'down' },
      { action: 'snapshot', description: 'City page sections below fold' },
    ],
    passWhen: 'Experiences, places, or community threads sections present',
    likelyArea: 'app/(tabs)/discover/city/[slug].tsx',
  },
  {
    id: 9,
    name: 'Tap a country from city page',
    steps: [
      { action: 'click', target: 'Country name link or breadcrumb on city page' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'Country page after navigating from city' },
    ],
    passWhen: 'Country page opens, country name visible, signals row visible',
    likelyArea: 'app/(tabs)/discover/country/[slug].tsx',
  },
  {
    id: 10,
    name: 'Country page sections render',
    steps: [
      { action: 'scroll', direction: 'down' },
      { action: 'snapshot', description: 'Country page sections below fold' },
      { action: 'scroll', direction: 'down' },
      { action: 'snapshot', description: 'Country page further sections' },
    ],
    passWhen: 'Budget breakdown, Know Before You Go accordion, cities section all render',
    likelyArea: 'components/explore/country/',
  },
  {
    id: 11,
    name: 'Search opens',
    steps: [
      { action: 'navigateBack' },
      { action: 'navigateBack' },
      { action: 'clickTab', label: 'Discover' },
      { action: 'click', target: 'Search bar' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'Search screen' },
    ],
    passWhen: 'Search screen opens with Recent, Browse By, Popular Destinations, Try Searching For sections',
    likelyArea: 'app/(tabs)/discover/search.tsx',
  },
  {
    id: 12,
    name: 'Search returns results',
    steps: [
      { action: 'type', target: 'Search input', text: 'Bangkok' },
      { action: 'waitFor', text: 'Bangkok', timeout: 5000 },
      { action: 'snapshot', description: 'Search results for Bangkok' },
    ],
    passWhen: 'Search results appear containing "Bangkok"',
    likelyArea: 'app/(tabs)/discover/search.tsx',
  },
];
