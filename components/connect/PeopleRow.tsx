import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import { getFlag } from '@/data/trips/helpers';
import type { Profile } from '@/data/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PeopleRowProps {
  title: string;
  travelers: Profile[];
  onTravelerPress: (id: string) => void;
  maxVisible?: number;
}

// ---------------------------------------------------------------------------
// MiniProfileCard (internal)
// ---------------------------------------------------------------------------

interface MiniProfileCardProps {
  profile: Profile;
  onPress: () => void;
}

const CARD_WIDTH = 90;
const AVATAR_SIZE = 48;

const MiniProfileCard: React.FC<MiniProfileCardProps> = ({ profile, onPress }) => {
  const flag = profile.homeCountryIso2 ? getFlag(profile.homeCountryIso2) : '';
  const tagLine = profile.travelStyle
    ? `${flag} ${profile.travelStyle}`
    : flag || undefined;

  return (
    <Pressable
      style={({ pressed }) => [styles.miniCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      {profile.avatarUrl ? (
        <Image
          source={{ uri: getImageUrl(profile.avatarUrl, { width: 96, height: 96 }) ?? undefined }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Feather name="user" size={20} color={colors.textMuted} />
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {profile.firstName}
      </Text>
      {tagLine ? (
        <Text style={styles.tagLine} numberOfLines={1}>
          {tagLine}
        </Text>
      ) : null}
    </Pressable>
  );
};

// ---------------------------------------------------------------------------
// OverflowCard (internal)
// ---------------------------------------------------------------------------

interface OverflowCardProps {
  count: number;
  onPress: () => void;
}

const OverflowCard: React.FC<OverflowCardProps> = ({ count, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.overflowCard, pressed && styles.pressed]}
    onPress={onPress}
  >
    <Text style={styles.overflowCount}>+{count}</Text>
    <Text style={styles.overflowLabel}>more</Text>
  </Pressable>
);

// ---------------------------------------------------------------------------
// PeopleRow
// ---------------------------------------------------------------------------

export const PeopleRow: React.FC<PeopleRowProps> = ({
  title,
  travelers,
  onTravelerPress,
  maxVisible = 8,
}) => {
  const visibleTravelers = travelers.slice(0, maxVisible);
  const overflowCount = Math.max(0, travelers.length - maxVisible);

  const renderItem = ({ item }: { item: Profile }) => (
    <MiniProfileCard
      profile={item}
      onPress={() => onTravelerPress(item.id)}
    />
  );

  const keyExtractor = (item: Profile) => item.id;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={visibleTravelers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          overflowCount > 0
            ? () => (
                <OverflowCard
                  count={overflowCount}
                  onPress={() => {
                    // Press the first overflow traveler to navigate to full list
                    if (travelers.length > maxVisible) {
                      onTravelerPress(travelers[maxVisible].id);
                    }
                  }}
                />
              )
            : undefined
        }
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.screenX,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  miniCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.card,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: [...pressedState.transform],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  tagLine: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  overflowCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
    minHeight: AVATAR_SIZE + spacing.sm * 2 + 20,
  },
  overflowCount: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  overflowLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
