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

const store: OnboardingData = {
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

export const onboardingStore = {
  get: <K extends keyof OnboardingData>(key: K): OnboardingData[K] => store[key],
  set: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    store[key] = value;
  },
  getData: () => ({ ...store }),
  reset: () => {
    Object.assign(store, {
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
    });
  },
};
