import { TeamMember, ActionItem } from './types';

// ─── Team Configuration ──────────────────────────────────────────────
// Edit this to change team members, roles, and colors.
// Colors are used for speaker indicators and avatars.

export const TEAM: TeamMember[] = [
  { id: 'aya', name: 'Aya', role: 'Communications', color: '#E5653A' },
  { id: 'sergio', name: 'Sergio', role: 'BD + Finance', color: '#3B82F6' },
  { id: 'bk', name: 'BK', role: 'Tech', color: '#2D8A4E' },
  { id: 'clem', name: 'Clem', role: 'Product', color: '#D4940A' },
];

// ─── Timer Configuration ─────────────────────────────────────────────

export const TIMER_DURATION = 10 * 60; // 10 minutes in seconds
export const SPEAKER_TIME = Math.floor(TIMER_DURATION / TEAM.length);
export const ALERT_TIMES = [300, 120, 0]; // seconds remaining: 5:00, 2:00, 0:00

// ─── Section Labels ──────────────────────────────────────────────────
// These define the input sections for each speaker.

export const SECTIONS = [
  { key: 'wins' as const, label: 'Wins since last standup', placeholder: 'What went well?' },
  { key: 'focus' as const, label: "Today's focus", placeholder: 'What are you working on today?' },
  { key: 'blockers' as const, label: 'Blockers / needs', placeholder: 'Anything blocking you?' },
  { key: 'decisions' as const, label: 'Decisions needed', placeholder: 'Any decisions needed?', optional: true },
  { key: 'links' as const, label: 'Links', placeholder: 'Paste a link...', optional: true },
];

// ─── Seed Tasks ──────────────────────────────────────────────────────
// Pre-loaded from the Feb 19 kickoff meeting.
// These only load if there are no existing tasks in localStorage.

export const SEED_TASKS: ActionItem[] = [
  {
    id: 'seed-01',
    title: 'Research gender studies faculties — identify top universities for outreach',
    ownerId: 'aya',
    priority: 'medium',
    dueDate: '2026-02-24',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-02',
    title: 'Create first LinkedIn post — tag academic institutions',
    ownerId: 'aya',
    priority: 'high',
    dueDate: '2026-02-21',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-03',
    title: 'Edit Sergio\'s partnership presentation — make it look premium',
    ownerId: 'aya',
    priority: 'medium',
    dueDate: '2026-02-21',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-04',
    title: 'Define Instagram ad strategy — goal, target audience, metrics',
    ownerId: 'aya',
    priority: 'high',
    dueDate: '2026-02-24',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-05',
    title: 'Daily community engagement — Facebook groups, Reddit, Quora (15 min/day)',
    ownerId: 'aya',
    priority: 'high',
    dueDate: '2026-03-08',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-06',
    title: 'Set up recurring standup invite — Mon-Fri 2:30 PM Manila',
    ownerId: 'sergio',
    priority: 'high',
    dueDate: '2026-02-19',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-07',
    title: 'Contact Ateneo University friend — propose case study collaboration',
    ownerId: 'sergio',
    priority: 'medium',
    dueDate: '2026-02-24',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-08',
    title: 'Build standup dashboard tool',
    ownerId: 'bk',
    priority: 'high',
    dueDate: '2026-02-19',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-09',
    title: 'Help Sergio write university case study proposal',
    ownerId: 'bk',
    priority: 'medium',
    dueDate: '2026-02-24',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-10',
    title: 'Set up meeting with Dennis — collect team needs first',
    ownerId: 'bk',
    priority: 'high',
    dueDate: '2026-02-22',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-11',
    title: 'Continue v1 app development + bug fixes',
    ownerId: 'bk',
    priority: 'high',
    dueDate: '2026-03-08',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-12',
    title: 'App testing — systematic walkthrough of all v1 flows',
    ownerId: 'clem',
    priority: 'high',
    dueDate: '2026-03-01',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-13',
    title: 'Content review — all city pages, country pages, collections',
    ownerId: 'clem',
    priority: 'medium',
    dueDate: '2026-02-24',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
  {
    id: 'seed-14',
    title: 'Send BK list of things to discuss with Dennis (AI workflow ideas)',
    ownerId: 'sergio',
    priority: 'medium',
    dueDate: '2026-02-21',
    completed: false,
    createdAt: '2026-02-19T00:00:00Z',
    standupId: 'seed',
  },
];
