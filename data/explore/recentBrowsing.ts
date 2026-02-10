// data/explore/recentBrowsing.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@sola:last_viewed_city';

export interface RecentCity {
  citySlug: string;
  cityName: string;
  heroImageUrl: string | null;
  viewedAt: number; // epoch ms
}

export async function getRecentCity(): Promise<RecentCity | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: RecentCity = JSON.parse(raw);
    // Expire after 14 days
    if (Date.now() - parsed.viewedAt > 14 * 24 * 60 * 60 * 1000) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function setRecentCity(city: RecentCity): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(city));
  } catch {
    // Non-critical
  }
}
