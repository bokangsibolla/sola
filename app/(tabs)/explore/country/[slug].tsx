import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { getCountryBySlug, getCitiesByCountry } from '@/data/api';
import type { City } from '@/data/types';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import MarkdownContent from '@/components/MarkdownContent';
import CollapsibleSection from '@/components/CollapsibleSection';
import { getEmergencyNumbers } from '@/data/safety';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import type { Country } from '@/data/types';

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------

const SOLO_LEVEL_LABELS: Record<string, string> = {
  beginner: 'First-time solo travelers',
  intermediate: 'Travelers with some experience',
  expert: 'Experienced solo adventurers',
};

const SAFETY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  very_safe: { label: 'Very Safe', color: colors.greenSoft, bg: colors.greenFill },
  generally_safe: { label: 'Generally Safe', color: colors.greenSoft, bg: colors.greenFill },
  use_caution: { label: 'Use Caution', color: colors.orange, bg: colors.orangeFill },
  exercise_caution: { label: 'Exercise Caution', color: colors.orange, bg: colors.orangeFill },
};

const ENGLISH_MAP: Record<string, string> = { high: 'Widely spoken', moderate: 'Moderate', low: 'Limited' };
const INTERNET_MAP: Record<string, string> = { excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor' };

// ---------------------------------------------------------------------------
// Who This Is For Section
// ---------------------------------------------------------------------------

function WhoThisIsFor({ content }: { content: Country }) {
  const personas: string[] = [];

  // Add solo level persona
  if (content.soloLevel && SOLO_LEVEL_LABELS[content.soloLevel]) {
    personas.push(SOLO_LEVEL_LABELS[content.soloLevel]);
  }

  // Add interest-based personas
  if (content.goodForInterests && content.goodForInterests.length > 0) {
    content.goodForInterests.forEach((interest) => {
      personas.push(interest);
    });
  }

  if (personas.length === 0) return null;

  return (
    <View style={styles.whoSection}>
      <Text style={styles.whoTitle}>Who this is for</Text>
      {personas.slice(0, 4).map((persona, i) => (
        <View key={i} style={styles.personaRow}>
          <Text style={styles.personaCheck}>✓</Text>
          <Text style={styles.personaText}>{persona}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Safety Context Section
// ---------------------------------------------------------------------------

function SafetyContext({ content }: { content: Country }) {
  const safety = content.safetyRating ? SAFETY_LABELS[content.safetyRating] : null;

  if (!safety && !content.safetyWomenMd) return null;

  return (
    <View style={styles.safetySection}>
      <View style={styles.safetyHeader}>
        <Ionicons name="shield-checkmark" size={20} color={colors.greenSoft} />
        <Text style={styles.safetyTitle}>Safety for solo women</Text>
      </View>

      {safety && (
        <View style={[styles.safetyBadge, { backgroundColor: safety.bg }]}>
          <Text style={[styles.safetyBadgeText, { color: safety.color }]}>
            {safety.label}
          </Text>
        </View>
      )}

      {content.safetyWomenMd && (
        <Text style={styles.safetyText} numberOfLines={3}>
          {content.safetyWomenMd.replace(/[#*_]/g, '').slice(0, 200)}
          {content.safetyWomenMd.length > 200 ? '...' : ''}
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Enhanced City Card
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
        {/* Full-width image */}
        {city.heroImageUrl ? (
          <Image source={{ uri: city.heroImageUrl }} style={styles.cityImage} contentFit="cover" transition={200} pointerEvents="none" />
        ) : (
          <View style={[styles.cityImage, styles.cityImagePlaceholder]} pointerEvents="none" />
        )}

        {/* Content below image */}
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
          <View style={styles.cityExploreRow}>
            <Text style={styles.cityExploreHint}>Plan your days here</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.orange} />
          </View>
        </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Portrait Section
// ---------------------------------------------------------------------------

function PortraitSection({ portraitMd }: { portraitMd: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.portraitSection}>
      <Text style={styles.portraitTitle}>The experience</Text>
      <View style={!expanded ? styles.portraitCollapsed : undefined}>
        <MarkdownContent>{portraitMd}</MarkdownContent>
      </View>
      {!expanded && <View style={styles.portraitFade} />}
      <Pressable onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.readMore}>{expanded ? 'Read less' : 'Read more'}</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Emergency Row
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

  // Fetch cities directly with useState/useEffect to avoid caching issues
  const [cities, setCities] = useState<any[]>([]);
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
        console.error('Error fetching cities:', err);
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    }

    fetchCities();
  }, [country?.id]);

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

  // Quick facts for reference section
  const quickFacts = [
    { icon: 'calendar-outline', label: 'Best time', value: country.bestMonths },
    { icon: 'cash-outline', label: 'Currency', value: country.currency },
    { icon: 'language-outline', label: 'Language', value: country.language },
    { icon: 'chatbubble-outline', label: 'English', value: country.englishFriendliness ? ENGLISH_MAP[country.englishFriendliness] : null },
    { icon: 'wifi-outline', label: 'Internet', value: country.internetQuality ? INTERNET_MAP[country.internetQuality] : null },
  ].filter((f) => f.value);

  // Collapsible practical sections (moved down)
  const collapsibleSections = [
    { title: 'Getting there', icon: 'airplane-outline', content: country.gettingThereMd },
    { title: 'Visa & entry', icon: 'document-text-outline', content: [country.visaEntryMd, country.visaNote].filter(Boolean).join('\n\n') || null },
    { title: 'Money & payments', icon: 'card-outline', content: country.moneyMd },
    { title: 'SIM & internet', icon: 'wifi-outline', content: country.simConnectivityMd },
    { title: 'Culture & etiquette', icon: 'people-outline', content: country.cultureEtiquetteMd },
  ].filter((s) => s.content);

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
        {/* 1. Hero with vibe statement */}
        <View style={styles.hero} pointerEvents="none">
          {heroImage && <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" transition={200} pointerEvents="none" />}
          <View style={styles.heroOverlay} pointerEvents="none">
            <Text style={styles.heroName}>{country.name}</Text>
            {country.subtitle && <Text style={styles.heroTagline}>{country.subtitle}</Text>}
          </View>
        </View>

        <View style={styles.content}>
          {/* 1. CITIES FIRST - Primary navigation ("Where do you want to go?") */}
          <View style={styles.citiesSection}>
            <View style={styles.citiesSectionHeader}>
              <Text style={styles.sectionTitle}>
                {citiesLoading ? 'Loading cities...' : cities.length > 0 ? 'Where do you want to go?' : 'Cities coming soon'}
              </Text>
              {cities.length > 0 && (
                <Text style={styles.sectionHint}>
                  {cities.length} {cities.length === 1 ? 'city' : 'cities'}
                </Text>
              )}
            </View>
            <Text style={styles.sectionSubtitle}>
              {citiesLoading
                ? 'Finding cities in this country...'
                : cities.length > 0
                  ? 'Pick your base and discover what to do there'
                  : 'We are adding cities to this country'}
            </Text>
            {cities.map((city) => (
              <CityCard key={city.slug} city={city} />
            ))}
          </View>

          {/* 2. Who this is for (brief orientation) */}
          <WhoThisIsFor content={country} />

          {/* 3. Safety context */}
          <SafetyContext content={country} />

          {/* 4. The experience (brief editorial) */}
          {country.portraitMd && <PortraitSection portraitMd={country.portraitMd} />}

          {/* 5. Quick facts (reference) */}
          {quickFacts.length > 0 && (
            <View style={styles.quickFactsSection}>
              <Text style={styles.sectionTitle}>Quick facts</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.factsScroll}
                style={styles.factsContainer}
              >
                {quickFacts.map((fact) => (
                  <View key={fact.label} style={styles.factCard}>
                    <Ionicons name={fact.icon as any} size={18} color={colors.orange} />
                    <Text style={styles.factLabel}>{fact.label}</Text>
                    <Text style={styles.factValue} numberOfLines={2}>{fact.value}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 6. Practical info (collapsible, secondary) */}
          {collapsibleSections.length > 0 && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Plan your trip</Text>
                <View style={styles.dividerLine} />
              </View>

              {collapsibleSections.map((section) => (
                <CollapsibleSection key={section.title} title={section.title} icon={section.icon}>
                  <MarkdownContent>{section.content!}</MarkdownContent>
                </CollapsibleSection>
              ))}
            </>
          )}

          {/* Community discussions link */}
          {country?.id && (
            <View style={styles.communitySection}>
              <View style={styles.communitySectionHeader}>
                <Text style={styles.sectionTitle}>Community</Text>
                <Pressable
                  onPress={() => router.push({
                    pathname: '/(tabs)/community',
                    params: { countryId: country.id, countryName: country.name },
                  } as any)}
                  style={({ pressed }) => pressed && { opacity: 0.7 }}
                >
                  <Text style={styles.communitySeeAll}>See all</Text>
                </Pressable>
              </View>
              <Text style={styles.communitySubtitle}>
                Questions and tips from solo women travelers
              </Text>
              <Pressable
                onPress={() => router.push({
                  pathname: '/(tabs)/community',
                  params: { countryId: country.id, countryName: country.name },
                } as any)}
                style={({ pressed }) => [styles.communityCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
              >
                <Feather name="message-circle" size={20} color={colors.orange} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.communityCardTitle}>
                    Discussions about {country.name}
                  </Text>
                  <Text style={styles.communityCardSubtitle}>
                    Ask questions, share experiences, get advice
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          )}

          {/* 9. Emergency contacts (footer) */}
          <View style={styles.emergencySection}>
            <Text style={styles.sectionTitle}>Emergency numbers</Text>
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
  hero: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroName: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  heroTagline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  // Who this is for
  whoSection: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  whoTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  personaCheck: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.greenSoft,
  },
  personaText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Portrait / "The experience"
  portraitSection: {
    marginBottom: spacing.xl,
  },
  portraitTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  portraitCollapsed: {
    maxHeight: 96,
    overflow: 'hidden',
  },
  portraitFade: {
    height: 24,
    marginTop: -24,
    backgroundColor: 'transparent',
  },
  readMore: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.sm,
  },

  // Safety context
  safetySection: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.greenFill,
    borderRadius: radius.card,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  safetyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  safetyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  safetyBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  safetyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
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

  // Enhanced city cards - MEDIUM treatment (between country/place)
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
  cityBestForLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cityBestForValue: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
  cityExploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  cityExploreHint: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },

  // Experiences / Highlights
  experiencesSection: {
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  highlightsList: {
    gap: spacing.md,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  highlightNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightNumberText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.orange,
  },
  highlightItemText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Quick facts
  quickFactsSection: {
    marginBottom: spacing.xl,
  },
  factsContainer: {
    marginHorizontal: -spacing.lg,
    marginTop: spacing.sm,
  },
  factsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  factCard: {
    width: 100,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: 4,
  },
  factLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  factValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  dividerText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    marginTop: spacing.sm,
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
  communitySection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  communitySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  communitySeeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  communitySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  communityCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  communityCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
