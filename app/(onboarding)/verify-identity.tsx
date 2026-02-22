import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const POSE_PROMPTS = [
  'Look slightly to your left',
  'Look slightly to your right',
  'Tilt your head slightly',
  'Smile at the camera',
  'Look up briefly, then back at the camera',
];

function getRandomPose(): string {
  return POSE_PROMPTS[Math.floor(Math.random() * POSE_PROMPTS.length)];
}

export default function VerifyIdentityScreen() {
  const { navigateToNextScreen, skipCurrentScreen, trackScreenView } =
    useOnboardingNavigation();

  const [pose] = useState(getRandomPose);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  useEffect(() => {
    trackScreenView('verify-identity');
  }, [trackScreenView]);

  const takeSelfie = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera Access Required',
        'Please allow camera access in Settings to take a verification selfie.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (selfieUri) {
      onboardingStore.set('verificationSelfieUri', selfieUri);
    }
    navigateToNextScreen('verify-identity', {
      answeredQuestions: selfieUri ? ['verification_selfie'] : [],
      skippedQuestions: selfieUri ? [] : ['verification_selfie'],
    });
  }, [selfieUri, navigateToNextScreen]);

  const handleSkip = useCallback(() => {
    onboardingStore.set('verificationSelfieUri', null);
    skipCurrentScreen('verify-identity', ['verification_selfie']);
  }, [skipCurrentScreen]);

  return (
    <OnboardingScreen
      stage={2}
      screenName="verify-identity"
      headline="Verify your identity"
      subtitle="This helps keep our community safe. We'll review within 24\u201348 hours."
      ctaLabel={selfieUri ? 'Continue' : 'Take Selfie'}
      ctaDisabled={false}
      onCtaPress={selfieUri ? handleContinue : takeSelfie}
      onSkip={handleSkip}
    >
      <View style={styles.content}>
        <View style={styles.poseCard}>
          <Text style={styles.poseLabel}>POSE</Text>
          <Text style={styles.poseText}>{pose}</Text>
        </View>

        {selfieUri ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selfieUri }}
              style={styles.preview}
              contentFit="cover"
            />
            <Pressable style={styles.retakeButton} onPress={() => setSelfieUri(null)}>
              <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.cameraButton} onPress={takeSelfie}>
            <Ionicons name="camera-outline" size={32} color={colors.orange} />
            <Text style={styles.cameraButtonText}>Take Selfie</Text>
          </Pressable>
        )}

        <Text style={styles.disclaimer}>
          Accounts that can't be verified may be restricted from social features.
        </Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  poseCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  poseLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  poseText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  cameraButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },
  previewContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: radius.card,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  retakeText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  disclaimer: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
