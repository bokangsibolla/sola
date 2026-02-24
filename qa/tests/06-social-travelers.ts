/**
 * QA Test Group 6: Social — Travelers
 *
 * Verify traveler profiles, connections, blocking, and reporting.
 */

export const group = 'Social — Travelers';

export const tests = [
  {
    id: 28,
    name: 'View traveler profile',
    steps: [
      { action: 'clickTab', label: 'Travelers' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'click', target: 'First traveler card in feed' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'Traveler profile page' },
    ],
    passWhen: 'Traveler profile loads with name, bio, and any stats or trip info',
    likelyArea: 'app/(tabs)/travelers/user/[id].tsx',
  },
  {
    id: 29,
    name: 'Add/connect with traveler',
    steps: [
      { action: 'click', target: 'Connect button on traveler profile' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'After tapping connect' },
    ],
    passWhen: 'Connection request sent confirmation visible (button changes state or toast shown)',
    likelyArea: 'app/(tabs)/travelers/user/[id].tsx, data/api.ts sendConnectionRequest',
  },
  {
    id: 30,
    name: 'Block a user',
    steps: [
      { action: 'click', target: 'Menu/more options on traveler profile (three dots or similar)' },
      { action: 'waitFor', timeout: 2000 },
      { action: 'click', target: 'Block option' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'After blocking user' },
    ],
    passWhen: 'User blocked state shown (button changes, or blocked confirmation)',
    likelyArea: 'app/(tabs)/travelers/user/[id].tsx, data/api.ts blockUserFull',
    note: 'May need to unblock after test to clean up',
  },
  {
    id: 31,
    name: 'Report a user',
    steps: [
      { action: 'navigateBack' },
      { action: 'click', target: 'A different traveler card (not the blocked one)' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'click', target: 'Menu/more options on traveler profile' },
      { action: 'click', target: 'Report option' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'Report form or confirmation' },
    ],
    passWhen: 'Report form appears with reason selection, or report confirmation shown',
    likelyArea: 'app/(tabs)/travelers/user/[id].tsx, data/api.ts reportUser',
  },
];
