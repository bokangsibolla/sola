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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getProfileById, getVerificationStatus, submitVerificationSelfie } from '@/data/api';

const POSE_PROMPTS = [
  'look slightly to your left',
  'look slightly to your right',
  'tilt your head slightly',
  'smile at the camera',
  'look up briefly, then back at the camera',
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

  const { data: profile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
    ['profile', userId],
  );

  const avatarUrl = profile?.avatarUrl;

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
          <Text style={styles.statusTitle}>Verified</Text>
          <Text style={styles.statusMessage}>
            Your identity has been verified. Thank you for helping keep our community safe.
          </Text>
          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
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
          <Text style={styles.statusTitle}>Under Review</Text>
          <Text style={styles.statusMessage}>
            Your verification is being reviewed. This usually takes less than 24 hours.
          </Text>
          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
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
        <Text style={styles.description}>
          We'll match a live selfie to your profile photo to confirm you're a real person. No ID or passport needed.
        </Text>

        {isRejected && (
          <View style={styles.rejectedBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.emergency} />
            <Text style={styles.rejectedText}>
              Your previous selfie couldn't be matched. Try again with good lighting and a clear view of your face.
            </Text>
          </View>
        )}

        {avatarUrl ? (
          <View style={styles.matchRow}>
            <View style={styles.matchPhotoContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.matchPhoto} contentFit="cover" />
              <Text style={styles.matchPhotoLabel}>Profile photo</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
            <View style={styles.matchPhotoContainer}>
              {selfieUri ? (
                <Image source={{ uri: selfieUri }} style={styles.matchPhoto} contentFit="cover" />
              ) : (
                <View style={[styles.matchPhoto, styles.matchPhotoEmpty]}>
                  <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
                </View>
              )}
              <Text style={styles.matchPhotoLabel}>Live selfie</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.poseCard}>
          <Text style={styles.poseLabel}>POSE</Text>
          <Text style={styles.poseText}>Please {pose}</Text>
        </View>

        {selfieUri ? (
          <View style={styles.selfieActions}>
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

        {selfieUri && (
          <Pressable
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Text>
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
    ...typography.body,
    color: colors.textSecondary,
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
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  matchPhotoContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  matchPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  matchPhotoEmpty: {
    backgroundColor: colors.neutralFill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderDefault,
  },
  matchPhotoLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  selfieActions: {
    alignItems: 'center',
    marginBottom: spacing.md,
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
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
