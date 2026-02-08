import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { getCountryBySlug, getCitiesByCountry } from '@/data/api';
import type { City, Country } from '@/data/types';
import type { ThreadWithAuthor } from '@/data/community/types';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { getEmergencyNumbers } from '@/data/safety';
import { getCountryThreadPreviews } from '@/data/community/communityApi';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------

const SAFETY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  very_safe: { label: 'Very Safe', color: colors.greenSoft, bg: colors.greenFill },
  generally_safe: { label: 'Generally Safe', color: colors.greenSoft, bg: colors.greenFill },
  use_caution: { label: 'Use Caution', color: colors.orange, bg: colors.orangeFill },
  exercise_caution: { label: 'Exercise Caution', color: colors.orange, bg: colors.orangeFill },
};

const ENGLISH_MAP: Record<string, string> = { high: 'Widely spoken', moderate: 'Moderate', low: 'Limited' };
const INTERNET_MAP: Record<string, string> = { excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor' };

/**
 * Parse raw markdown into a lead sentence + bullet list.
 */
function parsePracticalContent(md: string): { lead: string; bullets: string[] } {
  const cleaned = md
    .replace(/^#+\s.*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s*/gm, '')
    .trim();

  const sentences = cleaned
    .split(/[.!?]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  const lead = sentences[0] ? sentences[0] + '.' : cleaned.slice(0, 120);
  const bullets = sentences.slice(1).filter(s => s.length > 10 && s.length < 150);

  return { lead, bullets };
}

// ---------------------------------------------------------------------------
// City Card (kept from original)
// ---------------------------------------------------------------------------

function CityCard({ city }: { city: City }) {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <Pressable
      onPress={() => {
        posthog.capture('city_tapped', { city_slug: city.slug, city_name: city.name });
        router.push(`/(tabs)/explore/city/${city.slug}` as any);
      }}
      style={({ pressed }) => [styles.cityCard, pressed && styles.cityCardPressed]}
    >
      {city.heroImageUrl ? (
        <Image source={{ uri: city.heroImageUrl }} style={styles.cityImage} contentFit="cover" transition={200} pointerEvents="none" />
      ) : (
        <View style={[styles.cityImage, styles.cityImagePlaceholder]} pointerEvents="none" />
      )}

      <View style={styles.cityBody} pointerEvents="none">
        <View style={styles.cityHeader}>
          <Text style={styles.cityName}>{city.name}</Text>
          <View style={styles.cityArrow}>
            <Ionicons name="arrow-forward" size={16} color={colors.orange} />
          </View>
        </View>
        {city.subtitle && (
          <Text style={styles.cityPurpose} numberOfLines={2}>
            {city.subtitle}
          </Text>
        )}
        {city.bestFor && (
          <View style={styles.cityBestFor}>
            <Text style={styles.cityBestForValue}>{city.bestFor}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Emergency Row (kept from original)
// ---------------------------------------------------------------------------

function EmergencyRow({ label, number }: { label: string; number: string }) {
  return (
    <View style={styles.emergencyRow}>
      <Text style={styles.emergencyLabel}>{label}</Text>
      <Text style={styles.emergencyNumber}>{number}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Thread Preview Section (inline community discussions)
// ---------------------------------------------------------------------------

function ThreadPreviewSection({
  threads,
  totalCount,
  countryId,
  countryName,
}: {
  threads: ThreadWithAuthor[];
  totalCount: number;
  countryId: string;
  countryName: string;
}) {
  const router = useRouter();

  if (threads.length === 0) return null;

  return (
    <View style={styles.threadSection}>
      <View style={styles.threadSectionHeader}>
        <Text style={styles.sectionLabel}>FROM THE COMMUNITY</Text>
        {totalCount > threads.length && (
          <Pressable
            onPress={() => router.push({
              pathname: '/(tabs)/community',
              params: { countryId, countryName },
            } as any)}
            hitSlop={8}
          >
            <Text style={styles.seeAllLink}>See all</Text>
          </Pressable>
        )}
      </View>
      {threads.map((thread) => (
        <Pressable
          key={thread.id}
          onPress={() => router.push(`/(tabs)/community/thread/${thread.id}` as any)}
          style={({ pressed }) => [styles.threadCard, pressed && styles.threadCardPressed]}
        >
          <Feather name="message-circle" size={16} color={colors.textMuted} style={styles.threadIcon} />
          <View style={styles.threadCardBody}>
            <Text style={styles.threadTitle} numberOfLines={2}>{thread.title}</Text>
            <Text style={styles.threadMeta}>
              {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
              {thread.topicLabel ? `  \u00B7  ${thread.topicLabel}` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.borderDefault} />
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function CountryGuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  useEffect(() => {
    if (slug) {
      posthog.capture('country_guide_viewed', { country_slug: slug });
    }
  }, [slug, posthog]);

  const { data: country, loading: countryLoading, error, refetch } = useData(
    () => slug ? getCountryBySlug(slug) : Promise.resolve(null),
    [slug],
  );

  // Fetch cities
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    async function fetchCities() {
      if (!country?.id) {
        setCities([]);
        setCitiesLoading(false);
        return;
      }

      setCitiesLoading(true);
      try {
        const result = await getCitiesByCountry(country.id);
        setCities(result ?? []);
      } catch (err) {
        Sentry.captureException(err);
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    }

    fetchCities();
  }, [country?.id]);

  // Community thread previews
  const { data: threadData } = useData(
    () => country?.id ? getCountryThreadPreviews(country.id, 3) : Promise.resolve(null),
    ['countryThreadPreviews', country?.id],
  );

  // Wait for both country and cities to load
  if (countryLoading || (country && citiesLoading)) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!country) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Guide not found</Text>
      </View>
    );
  }

  const emergency = getEmergencyNumbers(country.iso2);
  const heroImage = country.heroImageUrl;
  const safety = country.safetyRating ? SAFETY_LABELS[country.safetyRating] : null;

  // At a glance facts
  const essentials = [
    { label: 'Best time', value: country.bestMonths },
    { label: 'Currency', value: country.currency },
    { label: 'Language', value: country.language },
    { label: 'English', value: country.englishFriendliness ? ENGLISH_MAP[country.englishFriendliness] : null },
    { label: 'Internet', value: country.internetQuality ? INTERNET_MAP[country.internetQuality] : null },
  ].filter((f) => f.value) as { label: string; value: string }[];

  // Practical info cards
  const practicalSections = [
    { title: 'Getting There', content: country.gettingThereMd },
    { title: 'Visa & Entry', content: [country.visaEntryMd, country.visaNote].filter(Boolean).join('\n\n') || null },
    { title: 'Money & Payments', content: country.moneyMd },
    { title: 'SIM & Internet', content: country.simConnectivityMd },
    { title: 'Culture & Etiquette', content: country.cultureEtiquetteMd },
  ].filter((s) => s.content) as { title: string; content: string }[];

  // Safety women markdown parsed
  const safetyParsed = country.safetyWomenMd ? parsePracticalContent(country.safetyWomenMd) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.push('/(tabs)/explore' as any)}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          <Text style={styles.backLabel}>Explore</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Hero with LinearGradient */}
        <View style={styles.heroContainer}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" transition={200} pointerEvents="none" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.neutralFill }]} pointerEvents="none" />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroOverlay} pointerEvents="none">
            <Text style={styles.heroName}>{country.name}</Text>
            {country.subtitle && <Text style={styles.heroTagline}>{country.subtitle}</Text>}
          </View>
        </View>

        <View style={styles.content}>
          {/* 2. Cities — primary navigation */}
          <View style={styles.citiesSection}>
            <View style={styles.citiesSectionHeader}>
              <Text style={styles.sectionTitle}>
                {cities.length > 0 ? 'Where do you want to go?' : 'Cities coming soon'}
              </Text>
              {cities.length > 0 && (
                <Text style={styles.sectionHint}>
                  {cities.length} {cities.length === 1 ? 'city' : 'cities'}
                </Text>
              )}
            </View>
            <Text style={styles.sectionSubtitle}>
              {cities.length > 0
                ? 'Pick your base and discover what to do there'
                : 'We are adding cities to this country'}
            </Text>
            {cities.map((city) => (
              <CityCard key={city.slug} city={city} />
            ))}
          </View>

          {/* 3. At a Glance — essentials */}
          {essentials.length > 0 && (
            <View style={styles.essentialsSection}>
              <Text style={styles.sectionLabel}>AT A GLANCE</Text>
              {essentials.map((fact, i) => (
                <View
                  key={fact.label}
                  style={[
                    styles.essentialRow,
                    i < essentials.length - 1 && styles.essentialRowBorder,
                  ]}
                >
                  <Text style={styles.essentialLabel}>{fact.label}</Text>
                  <Text style={styles.essentialValue}>{fact.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 4. Safety section */}
          {(safety || safetyParsed) && (
            <View style={styles.safetySection}>
              <Text style={styles.sectionLabel}>SAFETY</Text>
              {safety && (
                <View style={[styles.safetyBadge, { backgroundColor: safety.bg }]}>
                  <Text style={[styles.safetyBadgeText, { color: safety.color }]}>
                    {safety.label}
                  </Text>
                </View>
              )}
              {safetyParsed && (
                <>
                  <Text style={styles.safetyLead}>{safetyParsed.lead}</Text>
                  {safetyParsed.bullets.slice(0, 4).map((bullet, i) => (
                    <View key={i} style={styles.safetyBulletRow}>
                      <View style={styles.safetyBulletDot} />
                      <Text style={styles.safetyBulletText}>
                        {bullet.endsWith('.') ? bullet : bullet + '.'}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {/* 5. Practical info cards */}
          {practicalSections.length > 0 && (
            <View style={styles.practicalSection}>
              {practicalSections.map((section) => {
                const parsed = parsePracticalContent(section.content);
                return (
                  <View key={section.title} style={styles.practicalCard}>
                    <Text style={styles.practicalCardTitle}>{section.title}</Text>
                    <Text style={styles.practicalCardLead}>{parsed.lead}</Text>
                    {parsed.bullets.slice(0, 4).map((bullet, i) => (
                      <View key={i} style={styles.practicalBulletRow}>
                        <View style={styles.practicalAccent} />
                        <Text style={styles.practicalBulletText}>
                          {bullet.endsWith('.') ? bullet : bullet + '.'}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}

          {/* 6. Country thread previews */}
          {threadData && threadData.threads.length > 0 && (
            <ThreadPreviewSection
              threads={threadData.threads}
              totalCount={threadData.totalCount}
              countryId={country.id}
              countryName={country.name}
            />
          )}

          {/* 7. Emergency contacts */}
          <View style={styles.emergencySection}>
            <Text style={styles.sectionLabel}>EMERGENCY</Text>
            <View style={styles.emergencyCard}>
              <EmergencyRow label="Police" number={emergency.police} />
              <EmergencyRow label="Ambulance" number={emergency.ambulance} />
              <EmergencyRow label="Fire" number={emergency.fire} />
              {emergency.general && <EmergencyRow label="General" number={emergency.general} />}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Hero
  heroContainer: {
    position: 'relative',
    height: 240,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroName: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 36,
  },
  heroTagline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  // Section labels (reused)
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  // Cities section
  citiesSection: {
    marginBottom: spacing.xl,
  },
  citiesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  // City cards
  cityCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  cityCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cityImage: {
    width: '100%',
    height: 120,
  },
  cityImagePlaceholder: {
    backgroundColor: colors.borderSubtle,
  },
  cityBody: {
    padding: spacing.md,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
  },
  cityArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityPurpose: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  cityBestFor: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  cityBestForValue: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },

  // Essentials (At a Glance)
  essentialsSection: {
    marginBottom: spacing.xl,
  },
  essentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  essentialRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  essentialLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  essentialValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Safety section
  safetySection: {
    marginBottom: spacing.xl,
  },
  safetyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  safetyBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  safetyLead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  safetyBulletRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  safetyBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
    marginTop: 7,
    marginRight: spacing.sm,
  },
  safetyBulletText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },

  // Practical info cards
  practicalSection: {
    marginBottom: spacing.xl,
  },
  practicalCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  practicalCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  practicalCardLead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  practicalBulletRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  practicalAccent: {
    width: 2,
    backgroundColor: colors.orange,
    opacity: 0.3,
    borderRadius: 1,
    marginRight: spacing.md,
    marginTop: 2,
    marginBottom: 2,
  },
  practicalBulletText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },

  // Thread previews
  threadSection: {
    marginBottom: spacing.xl,
  },
  threadSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  seeAllLink: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  threadCardPressed: {
    opacity: 0.7,
  },
  threadIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  threadCardBody: {
    flex: 1,
    marginRight: spacing.sm,
  },
  threadTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  threadMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Emergency
  emergencySection: {
    marginTop: spacing.xl,
  },
  emergencyCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  emergencyLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  emergencyNumber: {
    ...typography.label,
    color: colors.orange,
  },
});
