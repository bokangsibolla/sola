import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getVerificationStatus, submitVerificationSelfie } from '@/data/api';

const POSE_PROMPTS = [
  'look slightly to your right',
  'hold up your hand beside your face',
  'give a thumbs up',
  'wave at the camera',
];

function getRandomPose(): string {
  return POSE_PROMPTS[Math.floor(Math.random() * POSE_PROMPTS.length)];
}

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const { data: status, refetch } = useData(
    () => userId ? getVerificationStatus(userId) : Promise.resolve('unverified' as const),
    ['verificationStatus', userId],
  );

  const [pose] = useState(getRandomPose);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = useCallback(async () => {
    if (!userId || !selfieUri) return;
    setSubmitting(true);
    try {
      await submitVerificationSelfie(userId, selfieUri);
      refetch();
    } catch (error) {
      Sentry.captureException(error);
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [userId, selfieUri, refetch]);

  // Already verified
  if (status === 'verified') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.nav}>
          <ScreenHeader title="Verification" />
        </View>
        <View style={styles.statusContainer}>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={48} color={colors.greenSoft} />
          </View>
          <SolaText style={styles.statusTitle}>Verified</SolaText>
          <SolaText variant="body" color={colors.textSecondary} style={styles.statusMessage}>
            Your identity has been verified. Thank you for helping keep our community safe.
          </SolaText>
          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <SolaText style={styles.doneButtonText}>Done</SolaText>
          </Pressable>
        </View>
      </View>
    );
  }

  // Pending review
  if (status === 'pending') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.nav}>
          <ScreenHeader title="Verification" />
        </View>
        <View style={styles.statusContainer}>
          <View style={styles.pendingBadge}>
            <Ionicons name="time-outline" size={48} color={colors.orange} />
          </View>
          <SolaText style={styles.statusTitle}>Under Review</SolaText>
          <SolaText variant="body" color={colors.textSecondary} style={styles.statusMessage}>
            Your verification is being reviewed. This usually takes less than 24 hours.
          </SolaText>
          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <SolaText style={styles.doneButtonText}>Done</SolaText>
          </Pressable>
        </View>
      </View>
    );
  }

  // Rejected — allow retry
  const isRejected = status === 'rejected';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <ScreenHeader title="Verify Your Identity" />
      </View>

      <View style={styles.content}>
        <SolaText variant="body" color={colors.textSecondary} style={styles.description}>
          Take a quick selfie to verify your identity. This helps keep our community safe for everyone.
        </SolaText>

        {isRejected && (
          <View style={styles.rejectedBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.emergency} />
            <SolaText style={styles.rejectedText}>
              Your previous submission was not approved. Please try again with a clear, well-lit selfie.
            </SolaText>
          </View>
        )}

        <View style={styles.poseCard}>
          <SolaText style={styles.poseLabel}>POSE</SolaText>
          <SolaText style={styles.poseText}>Please {pose}</SolaText>
        </View>

        {selfieUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selfieUri }} style={styles.preview} contentFit="cover" />
            <Pressable style={styles.retakeButton} onPress={() => setSelfieUri(null)}>
              <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
              <SolaText style={styles.retakeText}>Retake</SolaText>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.cameraButton} onPress={takeSelfie}>
            <Ionicons name="camera-outline" size={32} color={colors.orange} />
            <SolaText style={styles.cameraButtonText}>Take Selfie</SolaText>
          </Pressable>
        )}

        {selfieUri && (
          <Pressable
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <SolaText style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </SolaText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxl,
  },
  description: {
    marginBottom: spacing.xxl,
  },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.emergencyFill,
    padding: spacing.lg,
    borderRadius: radius.card,
    marginBottom: spacing.xxl,
  },
  rejectedText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.emergency,
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
  submitButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.background,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX,
  },
  verifiedBadge: {
    marginBottom: spacing.lg,
  },
  pendingBadge: {
    marginBottom: spacing.lg,
  },
  statusTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusMessage: {
    textAlign: 'center' as const,
    maxWidth: 300,
    marginBottom: spacing.xxl,
  },
  doneButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.full,
  },
  doneButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },
});
