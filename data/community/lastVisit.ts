// data/community/lastVisit.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@sola:community_last_visited_at';

export async function getCommunityLastVisit(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function setCommunityLastVisit(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, new Date().toISOString());
  } catch {
    // Non-critical
  }
}
