/**
 * QA Testing Agent — Configuration
 *
 * Test user credentials, base URL, and timing constants.
 * This file is READ by Claude during QA runs, not executed as Node.
 */

export const QA_CONFIG = {
  /** Expo web dev server */
  baseUrl: 'http://localhost:8082',

  /** Dedicated test account (seeded via 20260224_seed_qa_test_user.sql) */
  testUser: {
    email: 'sola-tester@test.com',
    password: 'SolaQA2026test',
    displayName: 'QA Tester',
  },

  /** Seeded data identifiers — used for assertions */
  seededData: {
    trip1: { title: 'Test Trip to Portugal', country: 'PT', city: 'Lisbon' },
    trip2: { title: 'Test Trip to Thailand', country: 'TH', city: null },
    communityThread: { title: 'Best cafes for solo women in Lisbon?' },
    connectedUser: { displayName: 'QA Friend' },
  },

  /** Prefixes for test-created data (cleaned up after each run) */
  testDataPrefix: 'QA_',

  /** Timing */
  timeouts: {
    /** Max wait for a page to render content (ms) */
    pageLoad: 8000,
    /** Max wait for navigation transition (ms) */
    navigation: 5000,
    /** Max wait for an action result (ms) */
    actionResult: 6000,
    /** Delay between rapid tab switches (ms) */
    tabSwitchDelay: 500,
  },

  /** Screenshot settings */
  screenshots: {
    /** Directory relative to project root */
    dir: 'qa/screenshots',
    /** Capture on pass too (for visual reference) */
    captureOnPass: false,
  },

  /** Report output */
  reports: {
    dir: 'qa/reports',
  },
};
