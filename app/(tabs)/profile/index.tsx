import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { onboardingStore } from '@/state/onboardingStore';
import { getCollections, getSavedPlaces } from '@/data/api';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useAuth } from '@/state/AuthContext';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function ProfileScreen() {
  const router = useRouter();
  const [, setTick] = useState(0);

  // Re-read store every time tab is focused
  useFocusEffect(
    useCallback(() => {
      setTick((t) => t + 1);
    }, []),
  );

  const { userId } = useAuth();
  const data = onboardingStore.getData();
  const country = countries.find((c) => c.iso2 === data.countryIso2);
  const { data: collections, loading: loadingCol, error: errorCol, refetch: refetchCol } = useData(() => userId ? getCollections(userId) : Promise.resolve([]), [userId]);
  const { data: saved, loading: loadingSaved, error: errorSaved, refetch: refetchSaved } = useData(() => userId ? getSavedPlaces(userId) : Promise.resolve([]), [userId]);

  if (loadingCol || loadingSaved) return <LoadingScreen />;
  if (errorCol) return <ErrorScreen message={errorCol.message} onRetry={refetchCol} />;
  if (errorSaved) return <ErrorScreen message={errorSaved.message} onRetry={refetchSaved} />;

  return (
    <AppScreen>
      <AppHeader title="Profile" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + info */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {data.photoUri ? (
              <Image source={{ uri: data.photoUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={colors.textMuted} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{data.firstName || 'Traveler'}</Text>
          {country && (
            <Text style={styles.origin}>
              {country.flag ?? ''} {country.name}
            </Text>
          )}
          {data.bio ? <Text style={styles.bio}>{data.bio}</Text> : null}
        </View>

        {/* Interests */}
        {data.dayStyle.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {data.dayStyle.map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <Text style={styles.stats}>
          {(saved ?? []).length} {(saved ?? []).length === 1 ? 'place' : 'places'} saved
          {'  ·  '}
          {(collections ?? []).length} {(collections ?? []).length === 1 ? 'collection' : 'collections'}
        </Text>

        {/* Collections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections</Text>
          {(collections ?? []).length === 0 ? (
            <Text style={styles.emptyText}>
              Save places into collections as you explore.
            </Text>
          ) : (
            (collections ?? []).map((col) => {
              const placeCount = (saved ?? []).filter((s) => s.collectionId === col.id).length;
              return (
                <Pressable
                  key={col.id}
                  style={styles.collectionRow}
                  onPress={() => router.push(`/profile/collections/${col.id}`)}
                >
                  <Text style={styles.collectionEmoji}>{col.emoji}</Text>
                  <View style={styles.collectionText}>
                    <Text style={styles.collectionName}>{col.name}</Text>
                    <Text style={styles.collectionCount}>
                      {placeCount} {placeCount === 1 ? 'place' : 'places'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              );
            })
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Ionicons name="create-outline" size={18} color={colors.orange} />
            <Text style={styles.actionLabel}>Edit profile</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/profile/settings')}
          >
            <Ionicons name="settings-outline" size={18} color={colors.orange} />
            <Text style={styles.actionLabel}>Settings</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/home/dm')}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={colors.orange} />
            <Text style={styles.actionLabel}>Messages</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  origin: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  stats: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  collectionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  collectionText: {
    flex: 1,
  },
  collectionName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  collectionCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  actionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.orange,
  },
});
