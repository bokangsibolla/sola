import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ThreadWithAuthor } from '@/data/community/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface Props {
  threads: ThreadWithAuthor[];
  totalCount: number;
  countryId: string;
  countryName: string;
}

export function CommunityThreadRows({ threads, totalCount, countryId, countryName }: Props) {
  const router = useRouter();

  if (threads.length === 0) return null;

  const showSeeAll = totalCount > threads.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Women are asking</Text>
        {showSeeAll && (
          <Pressable
            onPress={() => router.push({
              pathname: '/(tabs)/discussions',
              params: { countryId, countryName },
            } as any)}
            hitSlop={8}
          >
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.card}>
        {threads.map((thread, index) => {
          const isLast = index === threads.length - 1;
          const meta = [
            `${thread.replyCount} ${thread.replyCount === 1 ? 'reply' : 'replies'}`,
            thread.topicLabel,
          ].filter(Boolean).join('  \u00B7  ');

          return (
            <Pressable
              key={thread.id}
              onPress={() => router.push(`/(tabs)/discussions/thread/${thread.id}` as any)}
              style={({ pressed }) => [
                styles.row,
                !isLast && styles.rowBorder,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.rowBody}>
                <Text style={styles.threadTitle} numberOfLines={2}>{thread.title}</Text>
                <Text style={styles.threadMeta}>{meta}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.orange} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  card: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,101,58,0.08)',
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowBody: {
    flex: 1,
    marginRight: spacing.sm,
  },
  threadTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  threadMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
