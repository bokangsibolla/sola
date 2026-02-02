import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { mockTrips } from '@/data/mock';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const STATUS_COLORS = {
  planned: { bg: colors.blueFill, text: colors.blueSoft },
  active: { bg: colors.greenFill, text: colors.greenSoft },
  completed: { bg: colors.borderDefault, text: colors.textMuted },
};

export default function TripsScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <AppHeader
        title="Trips"
        subtitle="Your travel plans"
        rightComponent={
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/trips/new')}
          >
            <Ionicons name="add" size={22} color={colors.orange} />
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockTrips.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="airplane-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              No trips yet. Tap + to plan your first adventure.
            </Text>
          </View>
        ) : (
          mockTrips.map((trip) => {
            const country = countries.find((c) => c.iso2 === trip.countryIso2);
            const statusStyle = STATUS_COLORS[trip.status];
            return (
              <Pressable
                key={trip.id}
                style={styles.tripCard}
                onPress={() => router.push(`/trips/${trip.id}`)}
              >
                <View style={styles.tripHeader}>
                  <Text style={styles.tripFlag}>{country?.flag ?? ''}</Text>
                  <View style={styles.tripHeaderText}>
                    <Text style={styles.tripDestination}>{trip.destination}</Text>
                    <Text style={styles.tripDates}>
                      {trip.arriving} → {trip.leaving} · {trip.nights} nights
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {trip.status}
                    </Text>
                  </View>
                </View>
                {trip.notes ? (
                  <Text style={styles.tripNotes} numberOfLines={1}>{trip.notes}</Text>
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  tripCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripFlag: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  tripHeaderText: {
    flex: 1,
  },
  tripDestination: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  tripDates: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  tripNotes: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
