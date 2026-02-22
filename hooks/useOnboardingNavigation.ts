/**
 * Hook for handling onboarding navigation with A/B testing support.
 * Provides methods to navigate between screens and track progress.
 */

import { useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { onboardingStore } from '@/state/onboardingStore';
import { getNextScreen } from '@/lib/onboardingConfig';
import { updateOnboardingSession } from '@/lib/onboardingConfig';

type OnboardingScreen =
  | 'profile'
  | 'verify-identity'
  | 'intent'
  | 'trip-details'
  | 'day-style'
  | 'stay-preference'
  | 'youre-in';

export function useOnboardingNavigation() {
  const router = useRouter();
  const posthog = usePostHog();

  /**
   * Navigate to the next screen in the onboarding flow.
   * Handles special cases like intent branching.
   */
  const navigateToNextScreen = useCallback(
    (
      currentScreen: OnboardingScreen,
      options?: {
        tripIntent?: 'planning' | 'exploring' | '';
        answeredQuestions?: string[];
        skippedQuestions?: string[];
      },
    ) => {
      const screensToShow = onboardingStore.get('screensToShow');
      const tripIntent = options?.tripIntent ?? onboardingStore.get('tripIntent');

      // Mark questions as answered/skipped
      if (options?.answeredQuestions) {
        onboardingStore.markQuestionsAnswered(options.answeredQuestions);
      }
      if (options?.skippedQuestions) {
        onboardingStore.markQuestionsSkipped(options.skippedQuestions);
      }

      // Update session in database (non-blocking)
      const sessionId = onboardingStore.get('abTestSessionId');
      if (sessionId) {
        updateOnboardingSession(sessionId, {
          questionsAnswered: onboardingStore.get('questionsAnswered'),
          questionsSkipped: onboardingStore.get('questionsSkipped'),
        });
      }

      // Calculate next screen
      let nextScreen: string | null;

      if (screensToShow.length > 0) {
        nextScreen = getNextScreen(currentScreen, screensToShow, tripIntent);
      } else {
        // Fallback to store helper if no config
        nextScreen = onboardingStore.getNextScreen(currentScreen);
      }

      // Track screen completion
      posthog.capture('onboarding_screen_completed', {
        screen: currentScreen,
        next_screen: nextScreen,
        questions_answered: options?.answeredQuestions ?? [],
        session_id: sessionId,
      });

      // Navigate
      if (nextScreen) {
        router.push(`/(onboarding)/${nextScreen}` as Href);
      }
    },
    [router, posthog],
  );

  /**
   * Skip the current screen and navigate to next.
   */
  const skipCurrentScreen = useCallback(
    (currentScreen: OnboardingScreen, skippedQuestions: string[]) => {
      const sessionId = onboardingStore.get('abTestSessionId');

      // Mark questions as skipped
      onboardingStore.markQuestionsSkipped(skippedQuestions);

      // Track skip event
      posthog.capture('onboarding_screen_skipped', {
        screen: currentScreen,
        skipped_questions: skippedQuestions,
        session_id: sessionId,
      });

      // Navigate to next
      navigateToNextScreen(currentScreen, { skippedQuestions });
    },
    [navigateToNextScreen, posthog],
  );

  /**
   * Check if current screen should be shown, redirect if not.
   * Returns true if screen should be shown, false if redirected.
   */
  const checkScreenAccess = useCallback(
    (screenName: OnboardingScreen): boolean => {
      if (!onboardingStore.shouldShowScreen(screenName)) {
        // Screen not in flow, skip to next
        const nextScreen = onboardingStore.getNextScreen(screenName);
        if (nextScreen) {
          router.replace(`/(onboarding)/${nextScreen}` as Href);
        }
        return false;
      }
      return true;
    },
    [router],
  );

  /**
   * Track when a screen is viewed.
   */
  const trackScreenView = useCallback(
    (screenName: OnboardingScreen) => {
      const sessionId = onboardingStore.get('abTestSessionId');
      posthog.capture('onboarding_screen_viewed', {
        screen: screenName,
        session_id: sessionId,
      });
    },
    [posthog],
  );

  return {
    navigateToNextScreen,
    skipCurrentScreen,
    checkScreenAccess,
    trackScreenView,
  };
}
