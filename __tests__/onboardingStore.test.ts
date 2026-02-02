jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
  __esModule: true,
}));

import { onboardingStore } from '../state/onboardingStore';

describe('onboardingStore', () => {
  beforeEach(async () => {
    onboardingStore.reset();
  });

  it('returns default values after reset', () => {
    expect(onboardingStore.get('onboardingCompleted')).toBe(false);
    expect(onboardingStore.get('firstName')).toBe('');
    expect(onboardingStore.get('email')).toBe('');
    expect(onboardingStore.get('dayStyle')).toEqual([]);
    expect(onboardingStore.get('photoUri')).toBeNull();
  });

  it('sets and gets a string value', () => {
    onboardingStore.set('firstName', 'Alice');
    expect(onboardingStore.get('firstName')).toBe('Alice');
  });

  it('sets and gets a boolean value', () => {
    onboardingStore.set('onboardingCompleted', true);
    expect(onboardingStore.get('onboardingCompleted')).toBe(true);
  });

  it('sets and gets an array value', () => {
    onboardingStore.set('dayStyle', ['food', 'culture']);
    expect(onboardingStore.get('dayStyle')).toEqual(['food', 'culture']);
  });

  it('getData returns a snapshot of all values', () => {
    onboardingStore.set('firstName', 'Bob');
    onboardingStore.set('bio', 'Traveler');
    const data = onboardingStore.getData();
    expect(data.firstName).toBe('Bob');
    expect(data.bio).toBe('Traveler');
  });

  it('getData returns a copy (mutations do not affect store)', () => {
    onboardingStore.set('firstName', 'Carol');
    const data = onboardingStore.getData();
    data.firstName = 'MUTATED';
    expect(onboardingStore.get('firstName')).toBe('Carol');
  });

  it('reset clears all values back to defaults', () => {
    onboardingStore.set('firstName', 'Dave');
    onboardingStore.set('onboardingCompleted', true);
    onboardingStore.set('dayStyle', ['nightlife']);
    onboardingStore.reset();
    expect(onboardingStore.get('firstName')).toBe('');
    expect(onboardingStore.get('onboardingCompleted')).toBe(false);
    expect(onboardingStore.get('dayStyle')).toEqual([]);
  });

  it('sets privacy defaults as a nested object', () => {
    const newPrivacy = {
      profileVisibility: 'public' as const,
      tripVisibility: 'connections' as const,
      locationPrecision: 'exact' as const,
    };
    onboardingStore.set('privacyDefaults', newPrivacy);
    expect(onboardingStore.get('privacyDefaults')).toEqual(newPrivacy);
  });

  it('hydrate loads data from AsyncStorage', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({ firstName: 'Hydrated', onboardingCompleted: true }),
    );
    await onboardingStore.hydrate();
    expect(onboardingStore.get('firstName')).toBe('Hydrated');
    expect(onboardingStore.get('onboardingCompleted')).toBe(true);
  });

  it('hydrate handles corrupt JSON gracefully', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.getItem.mockResolvedValueOnce('NOT VALID JSON{{{');
    await onboardingStore.hydrate();
    // Should keep whatever current state is (not crash)
    expect(onboardingStore.get('firstName')).toBeDefined();
  });
});
