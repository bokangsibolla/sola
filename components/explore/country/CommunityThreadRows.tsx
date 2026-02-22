import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ThreadWithAuthor } from '@/data/community/types';
import { colors, fonts, spacing } from '@/constants/design';

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
        <SolaText style={styles.heading}>What Solo Women Are Asking</SolaText>
        {showSeeAll && (
          <Pressable
            onPress={() => router.push({
              pathname: '/(tabs)/connect',
              params: { countryId, countryName },
            } as any)}
            hitSlop={8}
          >
            <SolaText style={styles.seeAll}>See all</SolaText>
          </Pressable>
        )}
      </View>
      {threads.map((thread, index) => {
        const isLast = index === threads.length - 1;
        const meta = [
          `${thread.replyCount} ${thread.replyCount === 1 ? 'reply' : 'replies'}`,
          thread.topicLabel,
        ].filter(Boolean).join('  \u00B7  ');

        return (
          <Pressable
            key={thread.id}
            onPress={() => router.push(`/(tabs)/connect/thread/${thread.id}` as any)}
            style={({ pressed }) => [
              styles.row,
              !isLast && styles.rowBorder,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.rowBody}>
              <SolaText style={styles.threadTitle} numberOfLines={2}>{thread.title}</SolaText>
              <SolaText style={styles.threadMeta}>{meta}</SolaText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.borderDefault} />
          </Pressable>
        );
      })}
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
    marginBottom: spacing.lg,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
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
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  threadMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
