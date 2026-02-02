import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'onboarding';

interface OnboardingData {
  onboardingCompleted: boolean;
  email: string;
  password: string;
  firstName: string;
  bio: string;
  photoUri: string | null;
  countryIso2: string;
  countryName: string;
  tripIntent: 'planning' | 'exploring' | '';
  dayStyle: string[];
  priorities: string[];
  tripDestination: string;
  tripDates: string;
  tripArriving: string;
  tripLeaving: string;
  tripNights: number;
  stayPreference: string;
  spendingStyle: string;
  tripFlexibleDates: boolean;
  privacyDefaults: {
    profileVisibility: 'private' | 'connections' | 'public';
    tripVisibility: 'private' | 'connections' | 'public';
    locationPrecision: 'city' | 'neighborhood' | 'exact';
  };
}

const defaults: OnboardingData = {
  onboardingCompleted: false,
  email: '',
  password: '',
  firstName: '',
  bio: '',
  photoUri: null,
  countryIso2: '',
  countryName: '',
  tripIntent: '',
  dayStyle: [],
  priorities: [],
  tripDestination: '',
  tripDates: '',
  tripArriving: '',
  tripLeaving: '',
  tripNights: 0,
  stayPreference: '',
  spendingStyle: '',
  tripFlexibleDates: false,
  privacyDefaults: {
    profileVisibility: 'private',
    tripVisibility: 'private',
    locationPrecision: 'city',
  },
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
    });
    persist();
  },
};
