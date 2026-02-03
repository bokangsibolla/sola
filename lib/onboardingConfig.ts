/**
 * Onboarding A/B Testing Configuration
 *
 * Handles fetching config, calculating which questions to show based on probabilities,
 * and creating/updating onboarding sessions.
 */

import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OnboardingQuestionConfig {
  id: string;
  questionKey: string;
  screenName: string;
  isRequired: boolean;
  probability: number;
  orderIndex: number;
  isActive: boolean;
}

export interface OnboardingFlowResult {
  questionsToShow: string[];
  screensToShow: string[];
  profileOptionalFields: string[];
  configSnapshot: OnboardingQuestionConfig[];
}

export interface OnboardingSession {
  id: string;
  userId: string;
  configSnapshot: OnboardingQuestionConfig[];
  questionsShown: string[];
  questionsAnswered: string[];
  questionsSkipped: string[];
  startedAt: string;
  sessionCompletedAt: string | null;
}

// ---------------------------------------------------------------------------
// Default Config (fallback if fetch fails)
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: OnboardingQuestionConfig[] = [
  { id: '1', questionKey: 'first_name', screenName: 'profile', isRequired: true, probability: 1, orderIndex: 1, isActive: true },
  { id: '2', questionKey: 'country', screenName: 'profile', isRequired: true, probability: 1, orderIndex: 2, isActive: true },
  { id: '3', questionKey: 'bio', screenName: 'profile', isRequired: false, probability: 1, orderIndex: 3, isActive: true },
  { id: '4', questionKey: 'photo', screenName: 'profile', isRequired: false, probability: 1, orderIndex: 4, isActive: true },
  { id: '5', questionKey: 'trip_intent', screenName: 'intent', isRequired: false, probability: 1, orderIndex: 5, isActive: true },
  { id: '6', questionKey: 'trip_destination', screenName: 'trip-details', isRequired: false, probability: 1, orderIndex: 6, isActive: true },
  { id: '7', questionKey: 'trip_dates', screenName: 'trip-details', isRequired: false, probability: 1, orderIndex: 7, isActive: true },
  { id: '8', questionKey: 'day_style', screenName: 'day-style', isRequired: false, probability: 1, orderIndex: 8, isActive: true },
  { id: '9', questionKey: 'priorities', screenName: 'day-style', isRequired: false, probability: 1, orderIndex: 9, isActive: true },
  { id: '10', questionKey: 'stay_preference', screenName: 'stay-preference', isRequired: false, probability: 1, orderIndex: 10, isActive: true },
  { id: '11', questionKey: 'spending_style', screenName: 'stay-preference', isRequired: false, probability: 1, orderIndex: 11, isActive: true },
];

// Screen order for navigation (after profile)
const SCREEN_ORDER = ['profile', 'intent', 'trip-details', 'day-style', 'stay-preference', 'youre-in'];

// ---------------------------------------------------------------------------
// Seeded Random Number Generator
// ---------------------------------------------------------------------------

/**
 * Creates a seeded random number generator.
 * Same seed always produces same sequence of numbers.
 */
function createSeededRandom(seed: string): () => number {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash as initial state for LCG (Linear Congruential Generator)
  let state = Math.abs(hash) || 1;

  return () => {
    // LCG parameters (same as glibc)
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ---------------------------------------------------------------------------
// Config Fetching
// ---------------------------------------------------------------------------

/**
 * Fetch onboarding config from Supabase.
 * Returns default config if fetch fails (graceful fallback).
 */
export async function fetchOnboardingConfig(): Promise<OnboardingQuestionConfig[]> {
  try {
    const { data, error } = await supabase
      .from('onboarding_question_config')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) throw error;
    if (!data || data.length === 0) return DEFAULT_CONFIG;

    return data.map((row) => ({
      id: row.id,
      questionKey: row.question_key,
      screenName: row.screen_name,
      isRequired: row.is_required,
      probability: Number(row.probability),
      orderIndex: row.order_index,
      isActive: row.is_active,
    }));
  } catch {
    // Fallback to default config on any error
    return DEFAULT_CONFIG;
  }
}

// ---------------------------------------------------------------------------
// Flow Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate which questions/screens to show based on config and user ID.
 * Uses deterministic randomization so same user always gets same questions.
 */
export function calculateOnboardingFlow(
  config: OnboardingQuestionConfig[],
  userId: string,
): OnboardingFlowResult {
  const random = createSeededRandom(`${userId}-onboarding`);

  const questionsToShow: string[] = [];
  const profileOptionalFields: string[] = [];

  // Sort by order_index
  const sortedConfig = [...config].sort((a, b) => a.orderIndex - b.orderIndex);

  for (const item of sortedConfig) {
    // Required questions are always shown
    if (item.isRequired) {
      questionsToShow.push(item.questionKey);
      continue;
    }

    // For optional questions, use probability
    const rand = random();
    if (rand <= item.probability) {
      questionsToShow.push(item.questionKey);

      // Track profile optional fields separately
      if (item.screenName === 'profile') {
        profileOptionalFields.push(item.questionKey);
      }
    }
  }

  // Determine which screens to show based on selected questions
  const screensToShow = determineScreensToShow(questionsToShow, config);

  return {
    questionsToShow,
    screensToShow,
    profileOptionalFields,
    configSnapshot: sortedConfig,
  };
}

/**
 * Determine which screens to show based on selected questions.
 * A screen is shown if any of its questions are in questionsToShow.
 */
function determineScreensToShow(
  questionsToShow: string[],
  config: OnboardingQuestionConfig[],
): string[] {
  const screenSet = new Set<string>();

  // Profile and youre-in are always shown
  screenSet.add('profile');
  screenSet.add('youre-in');

  for (const questionKey of questionsToShow) {
    const item = config.find((c) => c.questionKey === questionKey);
    if (item) {
      screenSet.add(item.screenName);
    }
  }

  // Return in correct order
  return SCREEN_ORDER.filter((screen) => screenSet.has(screen));
}

/**
 * Get the next screen in the flow.
 * Returns null if there's no next screen.
 */
export function getNextScreen(
  currentScreen: string,
  screensToShow: string[],
  tripIntent?: 'planning' | 'exploring' | '',
): string | null {
  const currentIndex = screensToShow.indexOf(currentScreen);

  if (currentIndex === -1) {
    // Current screen not in list, go to first screen
    return screensToShow[0] || null;
  }

  // Special handling for intent -> trip-details (only for planning)
  if (currentScreen === 'intent') {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= screensToShow.length) return null;

    const nextScreen = screensToShow[nextIndex];

    // Skip trip-details if user is exploring, not planning
    if (nextScreen === 'trip-details' && tripIntent !== 'planning') {
      const skipIndex = nextIndex + 1;
      return skipIndex < screensToShow.length ? screensToShow[skipIndex] : null;
    }

    return nextScreen;
  }

  const nextIndex = currentIndex + 1;
  return nextIndex < screensToShow.length ? screensToShow[nextIndex] : null;
}

// ---------------------------------------------------------------------------
// Session Management
// ---------------------------------------------------------------------------

/**
 * Create a new onboarding session record.
 */
export async function createOnboardingSession(
  userId: string,
  flowResult: OnboardingFlowResult,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('onboarding_sessions')
      .insert({
        user_id: userId,
        config_snapshot: flowResult.configSnapshot,
        questions_shown: flowResult.questionsToShow,
        questions_answered: [],
        questions_skipped: [],
      })
      .select('id')
      .single();

    if (error) throw error;
    return data?.id ?? null;
  } catch {
    // Don't fail onboarding if session tracking fails
    return null;
  }
}

/**
 * Update an onboarding session with progress.
 */
export async function updateOnboardingSession(
  sessionId: string,
  updates: {
    questionsAnswered?: string[];
    questionsSkipped?: string[];
    sessionCompletedAt?: string;
  },
): Promise<void> {
  try {
    const updateData: Record<string, any> = {};

    if (updates.questionsAnswered) {
      updateData.questions_answered = updates.questionsAnswered;
    }
    if (updates.questionsSkipped) {
      updateData.questions_skipped = updates.questionsSkipped;
    }
    if (updates.sessionCompletedAt) {
      updateData.session_completed_at = updates.sessionCompletedAt;
    }

    await supabase
      .from('onboarding_sessions')
      .update(updateData)
      .eq('id', sessionId);
  } catch {
    // Silent fail - don't break onboarding for analytics
  }
}

/**
 * Mark a question as answered in the session.
 */
export async function markQuestionAnswered(
  sessionId: string,
  questionKey: string,
  currentAnswered: string[],
): Promise<string[]> {
  const updated = currentAnswered.includes(questionKey)
    ? currentAnswered
    : [...currentAnswered, questionKey];

  await updateOnboardingSession(sessionId, { questionsAnswered: updated });
  return updated;
}

/**
 * Mark a question as skipped in the session.
 */
export async function markQuestionSkipped(
  sessionId: string,
  questionKey: string,
  currentSkipped: string[],
): Promise<string[]> {
  const updated = currentSkipped.includes(questionKey)
    ? currentSkipped
    : [...currentSkipped, questionKey];

  await updateOnboardingSession(sessionId, { questionsSkipped: updated });
  return updated;
}

/**
 * Complete the onboarding session.
 */
export async function completeOnboardingSession(
  sessionId: string,
  questionsAnswered: string[],
  questionsSkipped: string[],
): Promise<void> {
  await updateOnboardingSession(sessionId, {
    questionsAnswered,
    questionsSkipped,
    sessionCompletedAt: new Date().toISOString(),
  });
}
