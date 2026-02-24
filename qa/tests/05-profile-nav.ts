/**
 * QA Test Group 5: Profile & Navigation
 *
 * Verify avatar menu, profile editing, settings, and navigation stability.
 */

export const group = 'Profile & Navigation';

export const tests = [
  {
    id: 23,
    name: 'Avatar button opens menu',
    steps: [
      { action: 'clickTab', label: 'Home' },
      { action: 'click', target: 'Avatar button (top right)' },
      { action: 'waitFor', timeout: 2000 },
      { action: 'snapshot', description: 'Menu sheet after tapping avatar' },
    ],
    passWhen: 'MenuSheet slides up with profile/settings/messages options',
    likelyArea: 'components/AvatarButton.tsx, components/MenuSheet.tsx',
  },
  {
    id: 24,
    name: 'Edit profile loads',
    steps: [
      { action: 'click', target: 'Edit Profile menu item' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'Edit profile screen' },
    ],
    passWhen: 'Edit profile form visible with name, bio, and other fields',
    likelyArea: 'app/(tabs)/home/edit-profile.tsx',
  },
  {
    id: 25,
    name: 'Settings/delete account screen',
    steps: [
      { action: 'navigateBack' },
      { action: 'click', target: 'Avatar button (top right)' },
      { action: 'waitFor', timeout: 2000 },
      { action: 'click', target: 'Settings menu item' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'click', target: 'Delete Account option' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'Delete account screen' },
    ],
    passWhen: 'Delete account screen renders with warning text',
    likelyArea: 'app/(tabs)/home/delete-account.tsx',
  },
  {
    id: 26,
    name: 'Back navigation works',
    steps: [
      { action: 'navigateBack' },
      { action: 'waitFor', timeout: 2000 },
      { action: 'navigateBack' },
      { action: 'waitFor', timeout: 2000 },
      { action: 'snapshot', description: 'Back at home after navigating back twice' },
    ],
    passWhen: 'Successfully returns to previous screens, lands back on home tab',
    likelyArea: 'app/(tabs)/home/_layout.tsx',
  },
  {
    id: 27,
    name: 'Tab switching is stable',
    steps: [
      { action: 'clickTab', label: 'Discover' },
      { action: 'wait', ms: 500 },
      { action: 'clickTab', label: 'Trips' },
      { action: 'wait', ms: 500 },
      { action: 'clickTab', label: 'Discussions' },
      { action: 'wait', ms: 500 },
      { action: 'clickTab', label: 'Home' },
      { action: 'wait', ms: 500 },
      { action: 'clickTab', label: 'Discover' },
      { action: 'wait', ms: 500 },
      { action: 'clickTab', label: 'Trips' },
      { action: 'snapshot', description: 'After rapid tab switching' },
    ],
    passWhen: 'No crash, no blank screen, content still renders on final tab',
    likelyArea: 'app/(tabs)/_layout.tsx, components/TabBar.tsx',
  },
];
