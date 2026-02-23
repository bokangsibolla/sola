import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
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

// ─── Android auth proxy ─────────────────────────────────────────────────────
// Calls the `android-auth` edge function with NO custom headers, bypassing
// Android New Arch networking bug. The edge function proxies the token exchange
// to Supabase Auth server-side where networking works perfectly.

async function exchangeTokenViaProxy(
  idToken: string,
  provider: string,
): Promise<{ user: any; session: any }> {
  // Use a headerless POST — send token as query param to avoid needing
  // Content-Type header (which may also fail on broken Android networking)
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

  // Set the session in the Supabase client so AuthContext picks it up
  if (authData.access_token && authData.refresh_token) {
    await supabase.auth.setSession({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
    });
  }

  return { user: authData.user, session: authData };
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
  // On Android, use the edge function proxy (zero custom headers needed)
  // to bypass New Architecture TurboModule networking bug.
  // On iOS, use the direct Supabase client.
  try {
    let sessionData: { user: any; session: any };

    if (Platform.OS === 'android') {
      sessionData = await exchangeTokenViaProxy(idToken, 'google');
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
    // because the handle_new_user trigger auto-creates a profile row)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, onboarding_completed_at')
      .eq('id', sessionData.user.id)
      .maybeSingle();

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
