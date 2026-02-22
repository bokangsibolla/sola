import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStore } from '@/state/onboardingStore';

const KEYS_TO_CLEAR = [
  '@sola:last_viewed_city',
  '@sola:community_last_visited_at',
  '@sola:has_seen_community_intro',
  '@sola:has_created_first_post',
  '@sola:has_seen_explore_modes',
  '@sola:has_seen_trip_prompt',
  'app_mode_override',
];

const KEYS_TO_CLEAR_ON_DELETE = [
  ...KEYS_TO_CLEAR,
  'sola_utm_attribution',
];

export async function clearLocalData(mode: 'logout' | 'delete') {
  const keys = mode === 'delete' ? KEYS_TO_CLEAR_ON_DELETE : KEYS_TO_CLEAR;
  await AsyncStorage.multiRemove(keys);
  onboardingStore.reset();
}
