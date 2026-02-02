import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockCountryGuides } from '@/data/mock';
import { getEmergencyNumbers } from '@/data/safety';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function CountryGuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const guide = mockCountryGuides.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Guide not found</Text>
      </View>
    );
  }

  const emergency = getEmergencyNumbers(guide.iso2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: guide.heroImageUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{guide.name}</Text>
            <Text style={styles.heroTagline}>{guide.tagline}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick facts */}
          <View style={styles.factsGrid}>
            <Fact icon="shield-checkmark-outline" label="Safety" value={guide.safetyRating} />
            <Fact icon="calendar-outline" label="Best time" value={guide.bestMonths} />
            <Fact icon="cash-outline" label="Currency" value={guide.currency} />
            <Fact icon="language-outline" label="Language" value={guide.language} />
          </View>

          <Text style={styles.visaNote}>{guide.visaNote}</Text>

          {/* Highlights */}
          <Text style={styles.sectionTitle}>Highlights</Text>
          {guide.highlights.map((h, i) => (
            <View key={i} style={styles.highlightRow}>
              <Text style={styles.highlightBullet}>·</Text>
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}

          {/* Cities */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Cities</Text>
          {guide.cities.map((city) => (
            <Pressable
              key={city.slug}
              style={styles.cityCard}
              onPress={() => router.push(`/explore/place/${city.slug}`)}
            >
              <Image source={{ uri: city.heroImageUrl }} style={styles.cityImage} />
              <View style={styles.cityText}>
                <Text style={styles.cityName}>{city.name}</Text>
                <Text style={styles.cityTagline}>{city.tagline}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}

          {/* Emergency numbers */}
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

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon as any} size={18} color={colors.orange} />
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
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
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  fact: {
    width: '47%',
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
  visaNote: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
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
