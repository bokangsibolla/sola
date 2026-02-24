import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { CityEvent } from '@/data/types';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EVENT_TYPE_LABELS: Record<CityEvent['eventType'], string> = {
  festival: 'Festival',
  holiday: 'Holiday',
  seasonal: 'Seasonal',
  parade: 'Parade',
  conference: 'Conference',
  sports: 'Sports',
};

interface EventCardProps {
  event: CityEvent;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const dateLabel = event.specificDates
    ? event.specificDates
    : event.startMonth === event.endMonth
      ? MONTH_LABELS[event.startMonth - 1]
      : `${MONTH_LABELS[event.startMonth - 1]}\u2013${MONTH_LABELS[event.endMonth - 1]}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.cardPressed : undefined,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {event.heroImageUrl ? (
        <Image
          source={{ uri: event.heroImageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={styles.placeholderIcon}>
            {event.eventType === 'festival' ? '\uD83C\uDF89' : '\uD83C\uDF1F'}
          </Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{event.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{EVENT_TYPE_LABELS[event.eventType]}</Text>
          </View>
          {event.isFree && (
            <Text style={styles.freeLabel}>Free</Text>
          )}
        </View>
        {event.description && (
          <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
        )}
        {event.soloTip && (
          <View style={styles.soloTipContainer}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.greenSoft} />
            <Text style={styles.soloTipText} numberOfLines={2}>{event.soloTip}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardImage: {
    width: 88,
    minHeight: 88,
  },
  cardImagePlaceholder: {
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  typePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.blueFill,
  },
  typeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.blueSoft,
  },
  freeLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.greenSoft,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  soloTipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.greenFill,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  soloTipText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.greenSoft,
    flex: 1,
  },
});
