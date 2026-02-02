import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockTrips } from '@/data/mock';
import { countries } from '@/data/geo';
import { getEmergencyNumbers } from '@/data/safety';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const trip = mockTrips.find((t) => t.id === id);

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  const country = countries.find((c) => c.iso2 === trip.countryIso2);
  const emergency = getEmergencyNumbers(trip.countryIso2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.flag}>{country?.flag ?? ''}</Text>
        <Text style={styles.destination}>{trip.destination}</Text>
        <Text style={styles.dates}>{trip.arriving} → {trip.leaving}</Text>
        <Text style={styles.nights}>{trip.nights} nights</Text>

        {trip.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Places to visit</Text>
          {trip.places.length > 0 ? (
            trip.places.map((place, i) => (
              <View key={i} style={styles.placeRow}>
                <Ionicons name="location-outline" size={16} color={colors.orange} />
                <Text style={styles.placeText}>{place}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No places added yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency numbers</Text>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyRow}>
              <Text style={styles.emergencyLabel}>Police</Text>
              <Text style={styles.emergencyNumber}>{emergency.police}</Text>
            </View>
            <View style={styles.emergencyRow}>
              <Text style={styles.emergencyLabel}>Ambulance</Text>
              <Text style={styles.emergencyNumber}>{emergency.ambulance}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  flag: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  destination: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  dates: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  nights: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
    textAlign: 'center',
    marginTop: spacing.xs,
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
  notesText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  placeText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
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
