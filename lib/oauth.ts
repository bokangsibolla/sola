import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const GOOGLE_WEB_CLIENT_ID =
  '234937383727-2oj58631smi815k534jn2k5lfdvlup06.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID =
  '234937383727-41lbcel6j3nrn4t58huag5ig11582bca.apps.googleusercontent.com';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://bfyewxgdfkmkviajmfzp.supabase.co';

// Lazy-load GoogleSignin so it doesn't crash Expo Go at import time
let _googleSignin: typeof import('@react-native-google-signin/google-signin').GoogleSignin | null = null;
let _googleConfigured = false;

function getGoogleSignin() {
  if (!_googleSignin) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@react-native-google-signin/google-signin');
      _googleSignin = mod.GoogleSignin;
    } catch {
      throw new Error(
        'Google Sign-In is not available in Expo Go. Please use a development build.',
      );
    }
  }
  if (!_googleConfigured && _googleSignin) {
    _googleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    });
    _googleConfigured = true;
  }
  return _googleSignin!;
}

// ─── Android auth proxy (fallback) ──────────────────────────────────────────
// Calls the `android-auth` edge function with NO custom headers, bypassing
// Android networking bug where ANY request with custom headers fails.
// After getting tokens from the proxy, writes the session directly to
// AsyncStorage — bypassing setSession()/refreshSession() which both make
// internal HTTP calls with custom headers that would also fail.

// Supabase stores sessions under this key pattern
const SUPABASE_STORAGE_KEY = 'sb-bfyewxgdfkmkviajmfzp-auth-token';

async function exchangeTokenViaProxy(
  idToken: string,
  provider: string,
): Promise<{ user: any; session: any; profile?: any }> {
  const proxyUrl =
    `${SUPABASE_URL}/functions/v1/android-auth` +
    `?id_token=${encodeURIComponent(idToken)}&provider=${provider}`;

  const response = await fetch(proxyUrl, { method: 'POST' });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Edge function auth failed (${response.status}): ${body.substring(0, 200)}`,
    );
  }

  const authData = await response.json();

  if (authData.error) {
    throw new Error(
      `Supabase could not verify the Google token: ${authData.error_description || authData.error}`,
    );
  }

  if (!authData.access_token || !authData.refresh_token) {
    throw new Error('Proxy auth returned no tokens');
  }

  // Try setSession first — works on devices where headers aren't blocked
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: authData.access_token,
    refresh_token: authData.refresh_token,
  });

  if (!sessionError) {
    // setSession worked — session is established normally
    return { user: authData.user, session: authData, profile: authData.profile || null };
  }

  // setSession failed (custom headers blocked on this device).
  // Write session directly to AsyncStorage so the Supabase client
  // picks it up on next getSession() without making any network calls.
  console.warn('[Sola] setSession failed, writing session directly to storage:', sessionError.message);

  const sessionData = {
    access_token: authData.access_token,
    token_type: authData.token_type || 'bearer',
    expires_in: authData.expires_in || 3600,
    expires_at: authData.expires_at || Math.floor(Date.now() / 1000) + (authData.expires_in || 3600),
    refresh_token: authData.refresh_token,
    user: authData.user,
  };

  await AsyncStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(sessionData));
  console.log('[Sola] Session written directly to AsyncStorage');

  // Force the Supabase client to re-read from storage.
  // getSession() reads from storage when its internal cache is empty/stale,
  // and does NOT make network calls if the token hasn't expired.
  const { data: { session: recovered } } = await supabase.auth.getSession();
  if (!recovered) {
    throw new Error('Session was written to storage but getSession() did not find it');
  }

  return { user: authData.user, session: authData, profile: authData.profile || null };
}

// ─── Google ──────────────────────────────────────────────────────────────────
// Uses the native OS credential picker on both platforms.
// Returns an idToken which is exchanged with Supabase via signInWithIdToken.

export async function signInWithGoogle(): Promise<{
  isNewUser: boolean;
  userId: string;
  userMetadata?: { firstName?: string; avatarUrl?: string };
}> {
  const GoogleSignin = getGoogleSignin();

  // Phase 1: Native Google Sign-In (Play Services / Credential Manager)
  let idToken: string;
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const response = await GoogleSignin.signIn();

    if (!response.data?.idToken) {
      throw new Error('No ID token returned from Google');
    }
    idToken = response.data.idToken;
  } catch (err: any) {
    // Native module not available (Expo Go)
    if (
      err.message?.includes('TurboModuleRegistry') ||
      err.message?.includes('could not be found') ||
      err.message?.includes('native binary')
    ) {
      throw new Error(
        'Google Sign-In requires a development build. It is not available in Expo Go.',
      );
    }
    // User cancelled the native picker
    if (
      err.code === 'SIGN_IN_CANCELLED' ||
      err.code === '12501' ||
      err.message?.includes('cancel')
    ) {
      throw new Error('Sign-in was cancelled');
    }
    // Play Services not available
    if (err.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error(
        'Google Play Services is required for Google sign-in. Please update or enable it.',
      );
    }
    // Other Google-specific error
    throw new Error(`Google sign-in failed: ${err.message ?? 'Unknown error'}`);
  }

  // Phase 2: Exchange ID token with Supabase
  // On Android, try direct signInWithIdToken first (uses XHR-based fetch which
  // bypasses the TurboModule header bug). Fall back to edge function proxy if
  // the direct call fails. Direct call is preferred because the Supabase client
  // manages the session naturally — no manual setSession() needed.
  try {
    let sessionData: { user: any; session: any };
    let proxyProfile: any = null; // Profile from proxy (avoids header-blocked query)

    if (Platform.OS === 'android') {
      // Try direct first — XHR-based fetch should handle custom headers
      const { data: directData, error: directError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (!directError && directData?.user) {
        console.log('[Sola] Direct signInWithIdToken succeeded');
        sessionData = directData;
      } else {
        // Fallback: edge function proxy + manual session storage
        console.warn('[Sola] Direct signInWithIdToken failed, using proxy:', directError?.message);
        const proxyResult = await exchangeTokenViaProxy(idToken, 'google');
        sessionData = proxyResult;
        proxyProfile = proxyResult.profile;
      }
    } else {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) {
        throw new Error(error.message || 'Supabase could not verify the Google token');
      }
      sessionData = data;
    }

    // Check if user has completed onboarding (not just profile existence,
    // because the handle_new_user trigger auto-creates a profile row).
    // On Android proxy path, the edge function already fetched the profile
    // so we use that to avoid a header-requiring client query.
    let profile: any = proxyProfile;
    if (!profile) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, onboarding_completed_at')
          .eq('id', sessionData.user.id)
          .maybeSingle();
        profile = data;
      } catch (err) {
        // Profile query failed (e.g. headers blocked on Android).
        // Treat as new user — worst case they see onboarding again.
        console.warn('[Sola] Profile check failed, treating as new user:', err);
      }
    }

    const isNewUser = !profile || !profile.onboarding_completed_at;

    // Extract metadata from Google for pre-populating onboarding
    const meta = sessionData.user.user_metadata;
    const userMetadata = meta
      ? {
          firstName: meta.given_name || meta.full_name?.split(' ')[0] || meta.name?.split(' ')[0],
          avatarUrl: meta.picture || meta.avatar_url,
        }
      : undefined;

    return { isNewUser, userId: sessionData.user.id, userMetadata };
  } catch (err: any) {
    // If it's already our error, rethrow
    if (err.message?.includes('Supabase could not verify')) throw err;
    if (err.message?.includes('Edge function')) throw err;
    if (err.message?.includes('Session setup failed')) throw err;
    if (err.message?.includes('Session was not established')) throw err;
    if (err.message?.includes('Session was written')) throw err;
    if (err.message?.includes('Proxy auth returned')) throw err;
    // Network error reaching Supabase
    const msg = err.message?.toLowerCase() ?? '';
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('unreachable')) {
      throw new Error(
        `Unable to connect to server after Google sign-in. Please check your connection and try again. (${err.message})`,
      );
    }
    throw err;
  }
}

// ─── Apple ────────────────────────────────────────────────────────────────────

export async function signInWithApple(): Promise<{
  isNewUser: boolean;
  userId: string;
  userMetadata?: { firstName?: string; avatarUrl?: string };
}> {
  try {
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    const idToken = credential.identityToken;
    if (!idToken) {
      throw new Error('No identity token returned from Apple');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: idToken,
      nonce: rawNonce,
    });

    if (error) {
      throw new Error(error.message || 'Failed to authenticate with Apple');
    }

    // Check if user has completed onboarding (not just profile existence,
    // because the handle_new_user trigger auto-creates a profile row)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, onboarding_completed_at')
      .eq('id', data.user.id)
      .maybeSingle();

    const isNewUser = !profile || !profile.onboarding_completed_at;

    // Extract metadata from Apple for pre-populating onboarding
    const meta = data.user.user_metadata;
    const userMetadata = meta
      ? {
          firstName: meta.given_name || meta.full_name?.split(' ')[0] || meta.name?.split(' ')[0],
          avatarUrl: meta.picture || meta.avatar_url,
        }
      : undefined;

    return { isNewUser, userId: data.user.id, userMetadata };
  } catch (err: any) {
    // Apple authentication cancelled by user
    if (err.code === 'ERR_REQUEST_CANCELED' || err.code === 'ERR_CANCELED') {
      throw new Error('Sign-in was cancelled');
    }
    throw err;
  }
}
