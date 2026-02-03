import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { getCountryBySlug, getCountryContent, getCitiesByCountry, getCityContent } from '@/data/api';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import MarkdownContent from '@/components/MarkdownContent';
import CollapsibleSection from '@/components/CollapsibleSection';
import { getEmergencyNumbers } from '@/data/safety';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const ENGLISH_MAP: Record<string, string> = { high: 'Widely spoken', moderate: 'Moderate', low: 'Limited' };
const INTERNET_MAP: Record<string, string> = { excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor' };
const SOLO_MAP: Record<string, string> = { beginner: 'Great for beginners', intermediate: 'Some experience helps', expert: 'For experienced travellers' };

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

  const { data: country, loading: countryLoading, error, refetch } = useData(() => getCountryBySlug(slug), [slug]);
  const { data: contentData } = useData(
    () => (country ? getCountryContent(country.id) : Promise.resolve(null)),
    [country?.id],
  );
  const { data: citiesData } = useData(
    () => (country ? getCitiesByCountry(country.id) : Promise.resolve(null)),
    [country?.id],
  );

  const content = contentData ?? undefined;
  const cities = citiesData ?? [];

  if (countryLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!country) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Guide not found</Text>
      </View>
    );
  }

  const emergency = getEmergencyNumbers(country.iso2);
  const heroImage = country.heroImageUrl ?? content?.heroImageUrl;

  const quickFacts = [
    { icon: 'calendar-outline', label: 'Best time', value: content?.bestMonths },
    { icon: 'cash-outline', label: 'Currency', value: content?.currency },
    { icon: 'language-outline', label: 'Language', value: content?.language },
    { icon: 'chatbubble-outline', label: 'English', value: content?.englishFriendliness ? ENGLISH_MAP[content.englishFriendliness] : null },
    { icon: 'wifi-outline', label: 'Internet', value: content?.internetQuality ? INTERNET_MAP[content.internetQuality] : null },
    { icon: 'compass-outline', label: 'Solo level', value: content?.soloLevel ? SOLO_MAP[content.soloLevel] : null },
  ].filter((f) => f.value);

  const collapsibleSections = [
    { title: 'What to know', icon: 'information-circle-outline', content: content?.safetyWomenMd },
    { title: 'Getting there', icon: 'airplane-outline', content: content?.gettingThereMd },
    { title: 'Visa & entry', icon: 'document-text-outline', content: [content?.visaEntryMd, content?.visaNote].filter(Boolean).join('\n\n') || null },
    { title: 'Money & payments', icon: 'card-outline', content: content?.moneyMd },
    { title: 'SIM & internet', icon: 'wifi-outline', content: content?.simConnectivityMd },
    { title: 'Culture & etiquette', icon: 'people-outline', content: content?.cultureEtiquetteMd },
    { title: 'Getting around', icon: 'bus-outline', content: content?.transportMd },
  ].filter((s) => s.content);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* A. Hero */}
        <View style={styles.hero}>
          {heroImage && <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" transition={200} />}
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{country.name}</Text>
            {content?.subtitle ? <Text style={styles.heroTagline}>{content.subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.content}>
          {/* B. Quick facts — horizontal scroll cards */}
          {quickFacts.length > 0 && (
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
          )}

          {/* C. "Why we love it" — editorial portrait with Read more */}
          {content?.portraitMd && (
            <PortraitSection portraitMd={content.portraitMd} />
          )}

          {/* D. Highlights */}
          {content?.highlights && content.highlights.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Highlights</Text>
              {content.highlights.map((h, i) => (
                <View key={i} style={styles.highlightRow}>
                  <Text style={styles.highlightBullet}>·</Text>
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </>
          )}

          {/* E. Cities to explore */}
          {cities.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Cities to explore</Text>
              {cities.map((city) => (
                <CityCard key={city.slug} city={city} />
              ))}
            </>
          )}

          {/* F. "Plan your trip" divider */}
          {collapsibleSections.length > 0 && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Plan your trip</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* G. Collapsible practical sections */}
              {collapsibleSections.map((section) => (
                <CollapsibleSection key={section.title} title={section.title} icon={section.icon}>
                  <MarkdownContent>{section.content!}</MarkdownContent>
                </CollapsibleSection>
              ))}
            </>
          )}

          {/* H. Things to do */}
          {content?.topThingsToDo && content.topThingsToDo.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Things to do</Text>
              {content.topThingsToDo.map((item, i) => (
                <View key={i} style={styles.highlightRow}>
                  <Text style={styles.highlightBullet}>{i + 1}.</Text>
                  <Text style={styles.highlightText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          {/* I. Emergency numbers */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Emergency numbers</Text>
          <View style={styles.emergencyCard}>
            <EmergencyRow label="Police" number={emergency.police} />
            <EmergencyRow label="Ambulance" number={emergency.ambulance} />
            <EmergencyRow label="Fire" number={emergency.fire} />
            {emergency.general && <EmergencyRow label="General" number={emergency.general} />}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PortraitSection({ portraitMd }: { portraitMd: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.portraitSection}>
      <Text style={styles.portraitTitle}>Why we love it</Text>
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

function CityCard({ city }: { city: any }) {
  const router = useRouter();
  const posthog = usePostHog();
  const { data: cityContent } = useData(() => getCityContent(city.id), [city.id]);
  return (
    <Pressable
      style={styles.cityCard}
      onPress={() => {
        posthog.capture('city_tapped', { city_slug: city.slug, city_name: city.name });
        router.push(`/explore/place/${city.slug}`);
      }}
    >
      {city.heroImageUrl && (
        <Image source={{ uri: city.heroImageUrl }} style={styles.cityImage} contentFit="cover" transition={200} />
      )}
      <View style={styles.cityText}>
        <Text style={styles.cityName}>{city.name}</Text>
        {cityContent?.subtitle ? (
          <Text style={styles.cityTagline}>{cityContent.subtitle}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function EmergencyRow({ label, number }: { label: string; number: string }) {
  return (
    <View style={styles.emergencyRow}>
      <Text style={styles.emergencyLabel}>{label}</Text>
      <Text style={styles.emergencyNumber}>{number}</Text>
    </View>
  );
}

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

  // Quick facts cards
  factsContainer: {
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.lg,
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

  // Portrait / "Why we love it"
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

  // Section title
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  highlightBullet: {
    ...typography.body,
    color: colors.orange,
  },
  highlightText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
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

  // City cards
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cityImage: {
    width: 72,
    height: 72,
  },
  cityText: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cityTagline: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Emergency
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
