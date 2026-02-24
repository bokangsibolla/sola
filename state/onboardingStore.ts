import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingQuestionConfig } from '@/lib/onboardingConfig';

const STORAGE_KEY = 'onboarding';

interface OnboardingData {
  onboardingCompleted: boolean;
  email: string;
  firstName: string;
  username: string;
  bio: string;
  photoUri: string | null;
  countryIso2: string;
  countryName: string;
  dateOfBirth: string;
  tripIntent: 'planning' | 'exploring' | '';
  dayStyle: string[];
  priorities: string[];
  tripDestination: string;
  tripDates: string;
  tripArriving: string;
  tripLeaving: string;
  tripNights: number;
  preferredCurrency: string;
  stayPreference: string;
  spendingStyle: string;
  tripFlexibleDates: boolean;
  verificationSelfieUri: string | null;
  privacyDefaults: {
    profileVisibility: 'private' | 'connections' | 'public';
    tripVisibility: 'private' | 'connections' | 'public';
    locationPrecision: 'city' | 'neighborhood' | 'exact';
  };
  // A/B Testing fields
  abTestSessionId: string | null;
  questionsToShow: string[];
  screensToShow: string[];
  profileOptionalFields: string[];
  questionsAnswered: string[];
  questionsSkipped: string[];
  configSnapshot: OnboardingQuestionConfig[];
}

const defaults: OnboardingData = {
  onboardingCompleted: false,
  email: '',
  firstName: '',
  username: '',
  bio: '',
  photoUri: null,
  countryIso2: '',
  countryName: '',
  dateOfBirth: '',
  tripIntent: '',
  dayStyle: [],
  priorities: [],
  tripDestination: '',
  tripDates: '',
  tripArriving: '',
  tripLeaving: '',
  tripNights: 0,
  preferredCurrency: 'USD',
  stayPreference: '',
  spendingStyle: '',
  tripFlexibleDates: false,
  verificationSelfieUri: null,
  privacyDefaults: {
    profileVisibility: 'public',
    tripVisibility: 'public',
    locationPrecision: 'city',
  },
  // A/B Testing defaults
  abTestSessionId: null,
  questionsToShow: [],
  screensToShow: [],
  profileOptionalFields: [],
  questionsAnswered: [],
  questionsSkipped: [],
  configSnapshot: [],
};

// In-memory copy for synchronous reads. Hydrated before first render.
const store: OnboardingData = { ...defaults, privacyDefaults: { ...defaults.privacyDefaults } };

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store)).catch(() => {});
}

export const onboardingStore = {
  /** Hydrate in-memory store from disk. Call once before first render. */
  hydrate: async (): Promise<void> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingData>;
        Object.assign(store, parsed);
      }
    } catch {
      // First launch or corrupt data — keep defaults.
    }
  },

  get: <K extends keyof OnboardingData>(key: K): OnboardingData[K] => store[key],

  set: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    store[key] = value;
    persist();
  },

  getData: () => ({ ...store }),

  reset: () => {
    Object.assign(store, {
      ...defaults,
      privacyDefaults: { ...defaults.privacyDefaults },
      configSnapshot: [],
    });
    persist();
  },

  // A/B Testing helpers

  /** Check if a specific question should be shown */
  shouldShowQuestion: (questionKey: string): boolean => {
    // If no A/B config loaded, show everything
    if (store.questionsToShow.length === 0) return true;
    return store.questionsToShow.includes(questionKey);
  },

  /** Check if a specific screen should be shown */
  shouldShowScreen: (screenName: string): boolean => {
    // If no A/B config loaded, show everything
    if (store.screensToShow.length === 0) return true;
    return store.screensToShow.includes(screenName);
  },

  /** Get the next screen in the onboarding flow */
  getNextScreen: (currentScreen: string): string | null => {
    const screens = store.screensToShow;
    if (screens.length === 0) {
      // Fallback to default order if no A/B config
      const defaultOrder = ['profile', 'verify-identity', 'youre-in'];
      const idx = defaultOrder.indexOf(currentScreen);
      return idx >= 0 && idx < defaultOrder.length - 1 ? defaultOrder[idx + 1] : null;
    }

    const idx = screens.indexOf(currentScreen);
    if (idx === -1) return screens[0] || null;
    return idx < screens.length - 1 ? screens[idx + 1] : null;
  },

  /** Mark a question as answered */
  markQuestionAnswered: (questionKey: string) => {
    if (!store.questionsAnswered.includes(questionKey)) {
      store.questionsAnswered = [...store.questionsAnswered, questionKey];
      persist();
    }
  },

  /** Mark a question as skipped */
  markQuestionSkipped: (questionKey: string) => {
    if (!store.questionsSkipped.includes(questionKey)) {
      store.questionsSkipped = [...store.questionsSkipped, questionKey];
      persist();
    }
  },

  /** Mark multiple questions as answered */
  markQuestionsAnswered: (questionKeys: string[]) => {
    const newAnswered = questionKeys.filter((k) => !store.questionsAnswered.includes(k));
    if (newAnswered.length > 0) {
      store.questionsAnswered = [...store.questionsAnswered, ...newAnswered];
      persist();
    }
  },

  /** Mark multiple questions as skipped */
  markQuestionsSkipped: (questionKeys: string[]) => {
    const newSkipped = questionKeys.filter((k) => !store.questionsSkipped.includes(k));
    if (newSkipped.length > 0) {
      store.questionsSkipped = [...store.questionsSkipped, ...newSkipped];
      persist();
    }
  },

  /** Get progress as a fraction for progress indicator */
  getProgress: (currentScreen: string): { current: number; total: number } => {
    const screens = store.screensToShow;
    if (screens.length === 0) {
      // Fallback
      return { current: 1, total: 5 };
    }
    const idx = screens.indexOf(currentScreen);
    return { current: Math.max(1, idx + 1), total: screens.length };
  },
};
