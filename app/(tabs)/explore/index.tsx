import { useState, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { mockCountryGuides } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return mockCountryGuides;
    const q = search.toLowerCase();
    return mockCountryGuides.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.cities.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <AppScreen>
      <AppHeader title="Explore" subtitle="Country guides and travel inspiration" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries or cities..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Country guide cards */}
        {filtered.map((guide) => (
          <Pressable
            key={guide.slug}
            style={styles.guideCard}
            onPress={() => router.push(`/explore/country/${guide.slug}`)}
          >
            <Image source={{ uri: guide.heroImageUrl }} style={styles.guideImage} />
            <View style={styles.guideOverlay}>
              <Text style={styles.guideName}>{guide.name}</Text>
              <Text style={styles.guideTagline}>{guide.tagline}</Text>
              <View style={styles.guideMeta}>
                {guide.soloFriendly && (
                  <View style={styles.guideBadge}>
                    <Text style={styles.guideBadgeText}>Solo-friendly</Text>
                  </View>
                )}
                <View style={styles.guideBadge}>
                  <Text style={styles.guideBadgeText}>{guide.safetyRating}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}

        {filtered.length === 0 && (
          <Text style={styles.noResults}>No guides found for "{search}"</Text>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  guideCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    height: 200,
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  guideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  guideName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  guideTagline: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  guideMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
  },
  guideBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  guideBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  noResults: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
