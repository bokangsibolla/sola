import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getProfileById, uploadAvatar } from '@/data/api';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

const DISMISS_KEY = '@sola:dismissed_avatar_nudge';
const DISMISS_EXPIRY_KEY = '@sola:avatar_nudge_expiry';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function AvatarNudge() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(true); // default hidden until loaded
  const [uploading, setUploading] = useState(false);

  const { data: profile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    ['profile', userId],
  );

  useEffect(() => {
    AsyncStorage.multiGet([DISMISS_KEY, DISMISS_EXPIRY_KEY]).then(([[, d], [, exp]]) => {
      // Permanently dismissed after successful upload
      if (d === 'permanent') {
        setDismissed(true);
        return;
      }
      // Temporarily dismissed — check 7-day expiry
      if (d === 'true' && exp) {
        const expiry = parseInt(exp, 10);
        if (Date.now() < expiry) {
          setDismissed(true);
          return;
        }
      }
      setDismissed(false);
    });
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    const expiry = String(Date.now() + SEVEN_DAYS_MS);
    AsyncStorage.multiSet([
      [DISMISS_KEY, 'true'],
      [DISMISS_EXPIRY_KEY, expiry],
    ]);
  }, []);

  const pickImage = useCallback(async () => {
    if (!userId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() || 'avatar.jpg';
      await uploadAvatar(userId, asset.uri, fileName);
      queryClient.invalidateQueries({ queryKey: ['useData', userId] });
      setDismissed(true);
      // Permanently dismiss after successful upload
      AsyncStorage.setItem(DISMISS_KEY, 'permanent');
    } catch {
      // Silently fail — user can retry
    } finally {
      setUploading(false);
    }
  }, [userId, queryClient]);

  // Hide if dismissed, profile not loaded, or user already has an avatar
  if (dismissed || !profile || profile.avatarUrl) return null;

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={pickImage}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel="Add a profile photo"
      >
        <View style={styles.iconContainer}>
          <Ionicons name="camera" size={24} color={colors.orange} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Add a profile photo</Text>
          <Text style={styles.subtitle}>
            Other travelers are more likely to connect when they can see who you are
          </Text>
        </View>

        <Pressable onPress={dismiss} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
    marginTop: -spacing.xs,
    marginRight: -spacing.xs,
  },
});
