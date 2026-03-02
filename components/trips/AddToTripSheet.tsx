import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTrips } from '@/data/trips/useTrips';
import { useTripItinerary } from '@/data/trips/useItinerary';
import { createBlock } from '@/data/trips/itineraryApi';
import { getCityById } from '@/data/api';
import { useData } from '@/hooks/useData';
import { getFlag, formatDateShort } from '@/data/trips/helpers';
import type { TripWithStops } from '@/data/trips/types';
import type { TripDayWithBlocks } from '@/data/trips/itineraryTypes';
import { colors, fonts, radius, spacing } from '@/constants/design';

// ── Props ─────────────────────────────────────────────────────────────────

interface AddToTripSheetProps {
  visible: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
  placeType: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function toBlockType(placeType: string): 'place' | 'meal' | 'accommodation' | 'activity' {
  const MEAL_TYPES = ['restaurant', 'cafe', 'bar', 'rooftop'];
  const ACCOM_TYPES = ['hotel', 'hostel', 'homestay', 'guesthouse', 'resort', 'villa', 'airbnb'];
  const ACTIVITY_TYPES = ['activity', 'tour', 'wellness', 'spa'];
  if (MEAL_TYPES.includes(placeType)) return 'meal';
  if (ACCOM_TYPES.includes(placeType)) return 'accommodation';
  if (ACTIVITY_TYPES.includes(placeType)) return 'activity';
  return 'place';
}

// ── Component ─────────────────────────────────────────────────────────────

export const AddToTripSheet: React.FC<AddToTripSheetProps> = ({
  visible,
  onClose,
  placeId,
  placeName,
  placeType,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { trips, loading: tripsLoading } = useTrips();

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  // All available trips (current + upcoming)
  const availableTrips = useMemo(() => {
    const list: TripWithStops[] = [];
    if (trips.current) list.push(trips.current);
    list.push(...trips.upcoming);
    return list;
  }, [trips]);

  // Auto-select if only one trip
  useEffect(() => {
    if (visible && availableTrips.length === 1) {
      setSelectedTripId(availableTrips[0].id);
    }
  }, [visible, availableTrips]);

  // Reset state when sheet opens
  useEffect(() => {
    if (visible) {
      setSelectedTripId(availableTrips.length === 1 ? availableTrips[0].id : null);
      setAdding(false);
      setSuccess(false);
    }
  }, [visible, availableTrips]);

  // Fetch itinerary for selected trip
  const { itinerary } = useTripItinerary(selectedTripId ?? undefined);
  const days = itinerary?.days ?? [];

  // Add to a specific day
  const handleAddToDay = async (day: TripDayWithBlocks) => {
    if (adding) return;
    setAdding(true);
    try {
      const lastBlock = day.blocks[day.blocks.length - 1];
      await createBlock({
        tripId: day.tripId,
        tripDayId: day.id,
        blockType: toBlockType(placeType),
        placeId,
        titleOverride: placeName,
        orderIndex: lastBlock ? lastBlock.orderIndex + 1 : 0,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch {
      Alert.alert('Error', 'Could not add to trip. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleCreateTrip = () => {
    onClose();
    router.push('/(tabs)/trips/new');
  };

  // ── No trips state ────────────────────────────────────────────────────

  if (visible && !tripsLoading && availableTrips.length === 0) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
          <SheetHeader onClose={onClose} title="Add to trip" />
          <View style={styles.noTripsState}>
            <Ionicons name="airplane-outline" size={40} color={colors.textMuted} />
            <Text style={styles.noTripsTitle}>No upcoming trips</Text>
            <Text style={styles.noTripsSubtitle}>
              Create a trip first, then add places to your itinerary
            </Text>
            <Pressable
              style={({ pressed }) => [styles.createButton, pressed && { opacity: 0.9 }]}
              onPress={handleCreateTrip}
            >
              <Text style={styles.createButtonText}>Create a trip</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────

  if (success) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.successState}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={28} color={colors.background} />
            </View>
            <Text style={styles.successTitle}>Added to trip</Text>
            <Text style={styles.successSubtitle}>{placeName}</Text>
          </View>
        </View>
      </Modal>
    );
  }

  // ── Trip picker (multiple trips) ──────────────────────────────────────

  if (!selectedTripId) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
          <SheetHeader onClose={onClose} title="Choose a trip" />
          <Text style={styles.placeName}>{placeName}</Text>
          {tripsLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.orange} />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + spacing.xl },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {availableTrips.map((trip) => (
                <TripOption
                  key={trip.id}
                  trip={trip}
                  onPress={() => setSelectedTripId(trip.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    );
  }

  // ── Day picker ────────────────────────────────────────────────────────

  const selectedTrip = availableTrips.find((t) => t.id === selectedTripId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <SheetHeader
          onClose={onClose}
          title="Pick a day"
          onBack={availableTrips.length > 1 ? () => setSelectedTripId(null) : undefined}
        />
        <Text style={styles.placeName}>{placeName}</Text>
        {selectedTrip && (
          <Text style={styles.tripLabel}>
            {getFlag(selectedTrip.countryIso2)} {selectedTrip.title || selectedTrip.destinationName}
          </Text>
        )}

        {days.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + spacing.xl },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {days.map((day) => (
              <DayOption
                key={day.id}
                day={day}
                disabled={adding}
                onPress={() => handleAddToDay(day)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────

const SheetHeader: React.FC<{
  title: string;
  onClose: () => void;
  onBack?: () => void;
}> = ({ title, onClose, onBack }) => (
  <View style={styles.header}>
    {onBack ? (
      <Pressable onPress={onBack} hitSlop={12} style={styles.headerButton}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>
    ) : (
      <View style={styles.headerButton} />
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    <Pressable onPress={onClose} hitSlop={12} style={styles.headerButton}>
      <Ionicons name="close" size={24} color={colors.textPrimary} />
    </Pressable>
  </View>
);

const TripOption: React.FC<{
  trip: TripWithStops;
  onPress: () => void;
}> = ({ trip, onPress }) => {
  const firstStop = trip.stops[0];
  const { data: city } = useData(
    () => (firstStop?.cityId ? getCityById(firstStop.cityId) : Promise.resolve(null)),
    [firstStop?.cityId],
  );
  const heroUrl = city?.heroImageUrl ?? trip.coverImageUrl ?? null;
  const dateText = trip.arriving && trip.leaving
    ? `${formatDateShort(trip.arriving)} – ${formatDateShort(trip.leaving)}`
    : 'Flexible dates';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tripOption, pressed && { opacity: 0.8 }]}
    >
      {heroUrl ? (
        <Image source={{ uri: heroUrl }} style={styles.tripThumb} contentFit="cover" />
      ) : (
        <View style={[styles.tripThumb, styles.tripThumbPlaceholder]}>
          <Text style={styles.tripThumbFlag}>{getFlag(trip.countryIso2)}</Text>
        </View>
      )}
      <View style={styles.tripInfo}>
        <Text style={styles.tripTitle} numberOfLines={1}>
          {trip.title || trip.destinationName}
        </Text>
        <Text style={styles.tripDate}>{dateText}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
};

const DayOption: React.FC<{
  day: TripDayWithBlocks;
  disabled: boolean;
  onPress: () => void;
}> = ({ day, disabled, onPress }) => {
  const dateLabel = day.date
    ? new Date(day.date + 'T12:00:00').toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : null;
  const stopCount = day.blocks.length;
  const stopsText = stopCount === 0
    ? 'No stops yet'
    : `${stopCount} ${stopCount === 1 ? 'stop' : 'stops'}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.dayOption,
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.5 },
      ]}
    >
      <View style={styles.dayBadge}>
        <Text style={styles.dayBadgeText}>{day.dayIndex}</Text>
      </View>
      <View style={styles.dayInfo}>
        <Text style={styles.dayLabel}>Day {day.dayIndex}</Text>
        <Text style={styles.dayMeta}>
          {dateLabel ? `${dateLabel} · ${stopsText}` : stopsText}
        </Text>
      </View>
      <Ionicons name="add-circle-outline" size={22} color={colors.orange} />
    </Pressable>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xs,
  },
  tripLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxxl,
  },

  // Trip option
  tripOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  tripThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
  },
  tripThumbPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripThumbFlag: {
    fontSize: 24,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  tripDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Day option
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dayMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },

  // No trips
  noTripsState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX,
    paddingBottom: 80,
  },
  noTripsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  noTripsSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  createButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  createButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Success
  successState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  successSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
