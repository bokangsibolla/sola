/**
 * QA Test Group 1: Tab Loading
 *
 * Verify all main tabs render without crashing.
 * Claude reads this file and executes each step via Playwright MCP tools.
 */

export const group = 'Tab Loading';

export const tests = [
  {
    id: 1,
    name: 'Home tab loads',
    steps: [
      { action: 'navigate', url: '/' },
      { action: 'waitFor', text: 'sola', timeout: 8000 },
      { action: 'snapshot', description: 'Home tab loaded' },
    ],
    passWhen: 'Sola logo visible, avatar button visible, content rendered (not blank)',
    likelyArea: 'app/(tabs)/home/index.tsx',
  },
  {
    id: 2,
    name: 'Discover tab loads',
    steps: [
      { action: 'clickTab', label: 'Discover' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'Discover tab loaded' },
    ],
    passWhen: 'Feed items visible, search bar present, hero grid rendered',
    likelyArea: 'app/(tabs)/discover/index.tsx',
  },
  {
    id: 3,
    name: 'Discussions tab loads',
    steps: [
      { action: 'clickTab', label: 'Discussions' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'Discussions tab loaded' },
    ],
    passWhen: 'Tab content renders without blank screen, thread cards or empty state visible',
    likelyArea: 'app/(tabs)/discussions/index.tsx',
  },
  {
    id: 4,
    name: 'Trips tab loads',
    steps: [
      { action: 'clickTab', label: 'Trips' },
      { action: 'waitFor', text: 'Test Trip to Portugal', timeout: 8000 },
      { action: 'snapshot', description: 'Trips tab loaded' },
    ],
    passWhen: '"Test Trip to Portugal" visible in trips list (seeded data)',
    likelyArea: 'app/(tabs)/trips/index.tsx',
  },
  {
    id: 5,
    name: 'Profile screen loads',
    steps: [
      { action: 'clickTab', label: 'Home' },
      { action: 'click', target: 'avatar button' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'click', target: 'Profile or View Profile menu item' },
      { action: 'waitFor', text: 'QA Tester', timeout: 5000 },
      { action: 'snapshot', description: 'Profile screen loaded' },
    ],
    passWhen: 'Test user name "QA Tester" and avatar visible',
    likelyArea: 'app/(tabs)/home/profile.tsx',
  },
];
