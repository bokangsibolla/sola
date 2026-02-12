import { Alert } from 'react-native';
import { router } from 'expo-router';

/**
 * Gate social features behind user verification.
 * Returns true if the user is verified; shows an alert and returns false otherwise.
 */
export function requireVerification(
  verificationStatus: string,
  featureName: string,
): boolean {
  if (verificationStatus === 'verified') return true;

  const message =
    verificationStatus === 'pending'
      ? 'Your verification is being reviewed. You\u2019ll be able to access this feature once approved.'
      : `Verify your identity to ${featureName}. This helps keep our community safe.`;

  Alert.alert(
    'Verification Required',
    message,
    verificationStatus === 'pending'
      ? [{ text: 'OK' }]
      : [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Verify',
            onPress: () => router.push('/(tabs)/home/verify' as any),
          },
        ],
  );

  return false;
}
