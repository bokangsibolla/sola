import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';

const GOOGLE_IOS_CLIENT_ID =
  '77400652458-m3uj46bcd7um2rgihm3bu7m5pqu38imd.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID =
  '77400652458-nll46gae96u8rq2givvkciuc3s5tvtf9.apps.googleusercontent.com';

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
    const result = await promptAsync();

    if (result.type !== 'success') {
      throw new Error('Google sign-in was cancelled');
    }

    const idToken = result.params.id_token;
    if (!idToken) {
      throw new Error('No ID token returned from Google');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;

    // Check if user has a profile already (existing vs new user)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    return { isNewUser: !profile, userId: data.user.id };
  };

  return { request, signInWithGoogle };
}

// ─── Apple ────────────────────────────────────────────────────────────────────

export async function signInWithApple(): Promise<{ isNewUser: boolean; userId: string }> {
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

  if (error) throw error;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  return { isNewUser: !profile, userId: data.user.id };
}
