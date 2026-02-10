/**
 * UTM attribution capture for Sola.
 *
 * Captures UTM parameters from deep links at app open.
 * Stores them temporarily in AsyncStorage, then persists
 * to Supabase user_attribution table on signup.
 *
 * First-touch only: once stored, attribution is immutable.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

const ATTRIBUTION_STORAGE_KEY = 'sola_utm_attribution';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

/**
 * Extract UTM parameters from a URL string.
 */
function extractUtmParams(url: string): UtmParams | null {
  try {
    const parsed = Linking.parse(url);
    const params = parsed.queryParams ?? {};

    const utm: UtmParams = {};
    if (params.utm_source) utm.utm_source = String(params.utm_source);
    if (params.utm_medium) utm.utm_medium = String(params.utm_medium);
    if (params.utm_campaign) utm.utm_campaign = String(params.utm_campaign);
    if (params.utm_term) utm.utm_term = String(params.utm_term);
    if (params.utm_content) utm.utm_content = String(params.utm_content);
    if (params.referrer) utm.referrer = String(params.referrer);

    // Only return if at least one UTM param is present
    return Object.keys(utm).length > 0 ? utm : null;
  } catch {
    return null;
  }
}

/**
 * Capture UTM params from the initial deep link URL.
 * Call this early in app startup (e.g., in _layout.tsx).
 * Stores params in AsyncStorage for later persistence.
 */
export async function captureAttribution(): Promise<void> {
  try {
    // Check if we already have stored attribution
    const existing = await AsyncStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (existing) return; // first-touch only

    const initialUrl = await Linking.getInitialURL();
    if (!initialUrl) return;

    const utm = extractUtmParams(initialUrl);
    if (!utm) return;

    await AsyncStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // Silent fail — attribution is best-effort
  }
}

/**
 * Get stored UTM params (if any).
 */
export async function getStoredAttribution(): Promise<UtmParams | null> {
  try {
    const stored = await AsyncStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Persist attribution to Supabase user_attribution table.
 * Call this after successful signup/login.
 * First-touch: only inserts if no row exists for this user.
 */
export async function persistAttribution(userId: string): Promise<void> {
  try {
    const utm = await getStoredAttribution();

    // Insert attribution row (even if no UTMs — records the first_seen_at)
    const { error } = await supabase
      .from('user_attribution')
      .upsert(
        {
          user_id: userId,
          utm_source: utm?.utm_source ?? null,
          utm_medium: utm?.utm_medium ?? null,
          utm_campaign: utm?.utm_campaign ?? null,
          utm_term: utm?.utm_term ?? null,
          utm_content: utm?.utm_content ?? null,
          referrer: utm?.referrer ?? null,
        },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );

    if (error) {
      // Ignore constraint violations (user already has attribution)
      if (error.code !== '23505') {
        console.warn('Attribution persist failed:', error.message);
      }
    }
  } catch {
    // Silent fail
  }
}

/**
 * Get UTM params formatted for PostHog $set_once properties.
 */
export async function getAttributionForPostHog(): Promise<Record<string, string> | null> {
  const utm = await getStoredAttribution();
  if (!utm) return null;

  const props: Record<string, string> = {};
  if (utm.utm_source) props['$initial_utm_source'] = utm.utm_source;
  if (utm.utm_medium) props['$initial_utm_medium'] = utm.utm_medium;
  if (utm.utm_campaign) props['$initial_utm_campaign'] = utm.utm_campaign;
  if (utm.utm_term) props['$initial_utm_term'] = utm.utm_term;
  if (utm.utm_content) props['$initial_utm_content'] = utm.utm_content;
  if (utm.referrer) props['initial_referrer'] = utm.referrer;

  return Object.keys(props).length > 0 ? props : null;
}
