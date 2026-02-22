import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';

const GOOGLE_WEB_CLIENT_ID =
  '234937383727-2oj58631smi815k534jn2k5lfdvlup06.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID =
  '234937383727-41lbcel6j3nrn4t58huag5ig11582bca.apps.googleusercontent.com';

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

// ─── Google ──────────────────────────────────────────────────────────────────
// Uses the native OS credential picker on both platforms.
// Returns an idToken which is exchanged with Supabase via signInWithIdToken.

export async function signInWithGoogle(): Promise<{
  isNewUser: boolean;
  userId: string;
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
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      // Supabase auth error (invalid token, provider not configured, etc.)
      throw new Error(error.message || 'Supabase could not verify the Google token');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    return { isNewUser: !profile, userId: data.user.id };
  } catch (err: any) {
    // If it's already our error (from the `if (error)` above), rethrow
    if (err.message?.includes('Supabase could not verify')) throw err;
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    return { isNewUser: !profile, userId: data.user.id };
  } catch (err: any) {
    // Apple authentication cancelled by user
    if (err.code === 'ERR_REQUEST_CANCELED' || err.code === 'ERR_CANCELED') {
      throw new Error('Sign-in was cancelled');
    }
    throw err;
  }
}
