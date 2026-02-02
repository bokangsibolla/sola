import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { getTrips, getCountryByIso2 } from '@/data/api';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const STATUS_COLORS = {
  planned: { bg: colors.blueFill, text: colors.blueSoft },
  active: { bg: colors.greenFill, text: colors.greenSoft },
  completed: { bg: colors.borderSubtle, text: colors.textSecondary },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getFlag(iso2: string): string {
  const country = getCountryByIso2(iso2);
  if (!country) return '';
  // Convert ISO2 to flag emoji via regional indicator symbols
  return iso2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

export default function TripsScreen() {
  const router = useRouter();
  const trips = getTrips('me');

  return (
    <AppScreen>
      <AppHeader
        title="Trips"
        subtitle="Your upcoming adventures"
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
        {trips.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="airplane-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/trips/new')}
            >
              <Text style={styles.emptyButtonText}>Start planning your next adventure</Text>
            </Pressable>
          </View>
        ) : (
          trips.map((trip) => {
            const flag = getFlag(trip.countryIso2);
            const statusStyle = STATUS_COLORS[trip.status];
            return (
              <Pressable
                key={trip.id}
                style={styles.tripCard}
                onPress={() => router.push(`/trips/${trip.id}`)}
              >
                <View style={styles.tripHeader}>
                  <Text style={styles.tripFlag}>{flag}</Text>
                  <View style={styles.tripHeaderText}>
                    <Text style={styles.tripDestination}>{trip.destinationName}</Text>
                    <Text style={styles.tripDates}>
                      {formatDate(trip.arriving)} - {formatDate(trip.leaving)}
                    </Text>
                    <Text style={styles.tripNights}>{trip.nights} {trip.nights === 1 ? 'night' : 'nights'}</Text>
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
    gap: spacing.lg,
  },
  emptyTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  emptyButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  emptyButtonText: {
    ...typography.button,
    color: '#FFFFFF',
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
  tripNights: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
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
