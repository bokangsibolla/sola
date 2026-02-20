import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/design';

// This screen handles the OAuth redirect from sola://auth/callback
// It shows a loading spinner briefly while the auth state updates
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The Supabase auth listener in _layout.tsx will pick up the session change
    // and navigate to the appropriate screen. Just wait briefly then go home.
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.orange} />
    </View>
  );
}
