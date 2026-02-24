/**
 * QA Test Group 4: Community Flow
 *
 * Verify community threads, detail, Sola Team badge, and posting.
 */

export const group = 'Community Flow';

export const tests = [
  {
    id: 18,
    name: 'Community feed loads',
    steps: [
      { action: 'clickTab', label: 'Discussions' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'Community feed' },
    ],
    passWhen: 'Thread cards visible with titles and author names',
    likelyArea: 'app/(tabs)/discussions/index.tsx',
  },
  {
    id: 19,
    name: 'Tap a thread',
    steps: [
      { action: 'click', target: 'First thread card in feed' },
      { action: 'waitFor', timeout: 5000 },
      { action: 'snapshot', description: 'Thread detail page' },
    ],
    passWhen: 'Thread detail opens, thread body and replies visible',
    likelyArea: 'app/(tabs)/discussions/thread/[id].tsx',
  },
  {
    id: 20,
    name: 'Sola Team badge renders',
    steps: [
      { action: 'navigateBack' },
      { action: 'snapshot', description: 'Look for Sola Team thread in feed' },
      { action: 'note', text: 'Find a thread with "Sola Team" author and verify orange TEAM badge' },
    ],
    passWhen: 'System threads show "Sola Team" name with orange TEAM badge pill',
    likelyArea: 'components/community/ThreadCard.tsx',
  },
  {
    id: 21,
    name: 'New post flow',
    steps: [
      { action: 'click', target: 'Compose/new post button (+ or pencil icon)' },
      { action: 'waitFor', timeout: 3000 },
      { action: 'snapshot', description: 'Thread composer' },
    ],
    passWhen: 'Composer opens with title and body input fields',
    likelyArea: 'app/(tabs)/discussions/new.tsx',
  },
  {
    id: 22,
    name: 'Post a thread',
    steps: [
      { action: 'fillForm', fields: {
        title: 'QA_Thread_20260224',
        body: 'This is an automated QA test post. Please ignore.',
      }},
      { action: 'click', target: 'Post/Submit button' },
      { action: 'waitFor', text: 'QA_Thread', timeout: 5000 },
      { action: 'snapshot', description: 'Feed with QA test post' },
    ],
    passWhen: '"QA_Thread_20260224" appears in community feed',
    likelyArea: 'app/(tabs)/discussions/new.tsx, data/community/communityApi.ts',
    createsData: true,
  },
];
