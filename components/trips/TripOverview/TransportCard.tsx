import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TripTransport, TripStop } from '@/data/trips/types';
import {
  TRANSPORT_TYPE_ICONS,
  TRANSPORT_TYPE_LABELS,
  formatTransportTimes,
} from '@/data/trips/helpers';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface TransportCardProps {
  transport: TripTransport;
  stops: TripStop[];
  onPress: () => void;
}

export const TransportCard: React.FC<TransportCardProps> = ({
  transport,
  stops,
  onPress,
}) => {
  const fromStop = stops.find((s) => s.stopOrder === transport.fromStopOrder);
  const toStop = stops.find((s) => s.stopOrder === transport.toStopOrder);
  const fromName = fromStop?.cityName ?? transport.departureLocation ?? '';
  const toName = toStop?.cityName ?? transport.arrivalLocation ?? '';
  const icon = TRANSPORT_TYPE_ICONS[transport.transportType];
  const typeLabel = TRANSPORT_TYPE_LABELS[transport.transportType];
  const times = formatTransportTimes(transport.departureAt, transport.arrivalAt);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && pressedState]}
      accessibilityRole="button"
    >
      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.content}>
        <Text style={styles.route} numberOfLines={1}>
          {fromName} {'\u2192'} {toName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{typeLabel}</Text>
          {transport.carrier && (
            <Text style={styles.meta}> · {transport.carrier}</Text>
          )}
          {times && <Text style={styles.meta}> · {times}</Text>}
        </View>
        {transport.reference && (
          <Text style={styles.ref}>Ref: {transport.reference}</Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
};

interface TransportPlaceholderProps {
  fromCityName: string;
  toCityName: string;
  onPress: () => void;
}

export const TransportPlaceholder: React.FC<TransportPlaceholderProps> = ({
  fromCityName,
  toCityName,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.placeholder, pressed && pressedState]}
    accessibilityRole="button"
  >
    <Ionicons name="add-circle-outline" size={18} color={colors.textMuted} />
    <Text style={styles.placeholderText}>
      {fromCityName} {'\u2192'} {toCityName}
    </Text>
    <Text style={styles.addText}>Add transport</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenX,
    backgroundColor: colors.neutralFill,
    marginHorizontal: spacing.screenX,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
    minHeight: 44,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  route: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  ref: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    marginHorizontal: spacing.screenX,
    marginVertical: spacing.xs,
  },
  placeholderText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  addText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
