import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';

const GOOGLE_IOS_CLIENT_ID =
  '234937383727-41lbcel6j3nrn4t58huag5ig11582bca.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID =
  '234937383727-2oj58631smi815k534jn2k5lfdvlup06.apps.googleusercontent.com';

// ─── Google ───────────────────────────────────────────────────────────────────

export function useGoogleAuth() {
  const redirectUri = makeRedirectUri({ scheme: 'sola' });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  const signInWithGoogle = async (): Promise<{ isNewUser: boolean; userId: string }> => {
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

      // Check if user has a profile already (existing vs new user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      return { isNewUser: !profile, userId: data.user.id };
    } catch (err: any) {
      // Re-throw with consistent error format
      if (err.message?.includes('cancel')) {
        throw new Error('Sign-in was cancelled');
      }
      throw err;
    }
  };

  return { request, signInWithGoogle };
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
