import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';

const GOOGLE_IOS_CLIENT_ID =
  '234937383727-41lbcel6j3nrn4t58huag5ig11582bca.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID =
  '234937383727-2oj58631smi815k534jn2k5lfdvlup06.apps.googleusercontent.com';

// ─── Google ──────────────────────────────────────────────────────────────────
// iOS: expo-auth-session ID token flow (works reliably with iosClientId)
// Android: Supabase OAuth redirect flow (avoids expo-auth-session redirect issues)

export function useGoogleAuth() {
  // Hook must be called unconditionally; only used on iOS
  const [request, _response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  const signInWithGoogle = async (): Promise<{ isNewUser: boolean; userId: string }> => {
    if (Platform.OS === 'android') {
      return signInWithGoogleAndroid();
    }
    return signInWithGoogleIOS(promptAsync);
  };

  return { request, signInWithGoogle };
}

// iOS: ID token flow via expo-auth-session
async function signInWithGoogleIOS(
  promptAsync: () => Promise<any>,
): Promise<{ isNewUser: boolean; userId: string }> {
  try {
    const result = await promptAsync();

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Sign-in was cancelled');
    }

    if (result.type !== 'success') {
      throw new Error('Google sign-in failed. Please try again.');
    }

    const idToken = result.params.id_token;
    if (!idToken) {
      throw new Error('No ID token returned from Google');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      throw new Error(error.message || 'Failed to authenticate with Google');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    return { isNewUser: !profile, userId: data.user.id };
  } catch (err: any) {
    if (err.message?.includes('cancel')) {
      throw new Error('Sign-in was cancelled');
    }
    throw err;
  }
}

// Android: Supabase OAuth redirect flow
async function signInWithGoogleAndroid(): Promise<{ isNewUser: boolean; userId: string }> {
  try {
    const redirectTo = Linking.createURL('/auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      throw new Error(error?.message || 'Failed to start Google sign-in');
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
    );

    if (result.type !== 'success' || !result.url) {
      throw new Error('Sign-in was cancelled');
    }

    // Extract tokens from the redirect URL fragment
    const url = result.url;
    const params = new URLSearchParams(url.split('#')[1] || '');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      throw new Error('No session returned from Google sign-in');
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.user) {
      throw new Error(sessionError?.message || 'Failed to establish session');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', sessionData.user.id)
      .maybeSingle();

    return { isNewUser: !profile, userId: sessionData.user.id };
  } catch (err: any) {
    if (err.message?.includes('cancel')) {
      throw new Error('Sign-in was cancelled');
    }
    throw err;
  }
}

// ─── Apple ────────────────────────────────────────────────────────────────────

export async function signInWithApple(): Promise<{ isNewUser: boolean; userId: string }> {
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
