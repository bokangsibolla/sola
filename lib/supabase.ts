import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://bfyewxgdfkmkviajmfzp.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeWV3eGdkZmtta3ZpYWptZnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjY1ODIsImV4cCI6MjA4NTYwMjU4Mn0.qzY2p1EP5tOsi2EcHGJScodkcMKCf-KaSb3IGFD6fgM';

// Using AsyncStorage instead of SecureStore to diagnose touch event issues
// on Android with New Architecture. SecureStore's native module calls may
// interfere with gesture handlers.
const AsyncStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

/**
 * Custom fetch wrapper that ensures the global fetch is used explicitly
 * and provides detailed error diagnostics for debugging Android release builds.
 */
const supabaseFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input as Request).url;
  try {
    const response = await fetch(url, init);
    return response;
  } catch (error: any) {
    // Enhance error with diagnostic details for debugging
    const detail = [
      `URL: ${url?.substring(0, 80)}`,
      `Method: ${init?.method ?? 'GET'}`,
      `Error: ${error?.message ?? String(error)}`,
      `Type: ${error?.name ?? 'unknown'}`,
      `Platform: ${Platform.OS}`,
    ].join(' | ');
    console.error('[Supabase fetch failed]', detail);

    // Re-throw with more context
    const enhanced = new TypeError(`${error?.message ?? 'Network request failed'} [${url?.substring(0, 60)}]`);
    throw enhanced;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // Tokens are manually parsed in app/auth/callback.tsx and lib/oauth.ts
    detectSessionInUrl: false,
  },
  global: {
    fetch: supabaseFetch,
  },
});

/**
 * Diagnostic: test raw network connectivity to Supabase.
 * Call this before auth to distinguish network issues from auth issues.
 * Returns an object with diagnostic info.
 */
export async function diagnoseNetwork(): Promise<{
  ok: boolean;
  fetchWorks: boolean;
  supabaseReachable: boolean;
  details: string;
}> {
  const result = {
    ok: false,
    fetchWorks: false,
    supabaseReachable: false,
    details: '',
  };

  // Test 1: Does fetch() exist?
  if (typeof fetch !== 'function') {
    result.details = 'fetch is not a function';
    return result;
  }

  // Test 2: Can we fetch anything at all? (Google's connectivity check endpoint)
  try {
    const r = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
    });
    result.fetchWorks = true;
  } catch (e: any) {
    result.details = `fetch failed entirely: ${e.message}`;
    return result;
  }

  // Test 3: Can we reach Supabase?
  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
      },
    });
    result.supabaseReachable = true;
    result.ok = true;
    result.details = `Supabase responded with ${r.status}`;
  } catch (e: any) {
    result.details = `fetch works but Supabase unreachable: ${e.message}`;
  }

  return result;
}
