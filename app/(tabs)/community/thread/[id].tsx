import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { useThread } from '@/data/community/useThread';
import { castVote, createReply, reportContent } from '@/data/community/communityApi';
import { useAuth } from '@/state/AuthContext';
import { formatTimeAgo } from '@/utils/timeAgo';
import type { ReplyWithAuthor } from '@/data/community/types';

// ---------------------------------------------------------------------------
// Reply Card
// ---------------------------------------------------------------------------

function ReplyCard({
  reply,
  userId,
  onVote,
  onReport,
}: {
  reply: ReplyWithAuthor;
  userId: string;
  onVote: (replyId: string) => void;
  onReport: (replyId: string, authorId: string) => void;
}) {
  const router = useRouter();

  const isHelpful = reply.userVote === 'up';

  return (
    <View style={styles.replyCard}>
      <View style={styles.replyHeader}>
        <Pressable
          style={styles.authorPressable}
          onPress={() => router.push(`/home/user/${reply.author.id}` as any)}
        >
          {reply.author.avatarUrl ? (
            <Image source={{ uri: reply.author.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{reply.author.firstName?.charAt(0) ?? '?'}</Text>
            </View>
          )}
          <Text style={styles.replyAuthorName}>{reply.author.firstName}</Text>
        </Pressable>
        <Text style={styles.replyTime}>{formatTimeAgo(reply.createdAt)}</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => onReport(reply.id, reply.authorId)}
          hitSlop={8}
        >
          <Feather name="more-horizontal" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.replyBody}>{reply.body}</Text>

      {/* Helpful button */}
      <Pressable
        onPress={() => onVote(reply.id)}
        hitSlop={6}
        style={({ pressed }) => [styles.helpfulButton, pressed && styles.pressed]}
      >
        <Feather
          name="arrow-up"
          size={14}
          color={isHelpful ? colors.orange : colors.textMuted}
        />
        <Text style={[styles.helpfulText, isHelpful && styles.helpfulTextActive]}>
          {reply.voteScore}
        </Text>
        <Text style={[styles.helpfulText, isHelpful && styles.helpfulTextActive]}>
          helpful
        </Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ThreadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { thread, replies, loading, refresh } = useThread(id);

  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = useCallback(async () => {
    if (!userId || !replyText.trim() || !id) return;
    setSubmitting(true);
    try {
      await createReply(userId, { threadId: id, body: replyText.trim() });
      setReplyText('');
      refresh();
    } catch {
      Alert.alert('Error', 'Could not post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [userId, replyText, id, refresh]);

  const handleVoteThread = useCallback(async () => {
    if (!userId || !thread) return;
    try {
      await castVote(userId, 'thread', thread.id, 'up');
      refresh();
    } catch {
      // ignore
    }
  }, [userId, thread, refresh]);

  const handleVoteReply = useCallback(async (replyId: string) => {
    if (!userId) return;
    try {
      await castVote(userId, 'reply', replyId, 'up');
      refresh();
    } catch {
      // ignore
    }
  }, [userId, refresh]);

  const handleReportThread = useCallback(() => {
    if (!userId || !thread) return;
    Alert.alert('Report', 'Why are you reporting this?', [
      { text: 'Spam', onPress: () => reportContent(userId, 'thread', thread.id, 'spam') },
      { text: 'Harassment', onPress: () => reportContent(userId, 'thread', thread.id, 'harassment') },
      { text: 'Inappropriate', onPress: () => reportContent(userId, 'thread', thread.id, 'inappropriate') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [userId, thread]);

  const handleReportReply = useCallback((replyId: string, _authorId: string) => {
    if (!userId) return;
    Alert.alert('Report', 'Why are you reporting this?', [
      { text: 'Spam', onPress: () => reportContent(userId, 'reply', replyId, 'spam') },
      { text: 'Harassment', onPress: () => reportContent(userId, 'reply', replyId, 'harassment') },
      { text: 'Inappropriate', onPress: () => reportContent(userId, 'reply', replyId, 'inappropriate') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator style={styles.loader} color={colors.orange} />
      </View>
    );
  }

  if (!thread) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Thread not found</Text>
        </View>
      </View>
    );
  }

  const isThreadHelpful = thread.userVote === 'up';

  const ThreadHeader = (
    <View style={styles.threadHeaderContainer}>
      {/* Meta badges */}
      <View style={styles.metaRow}>
        {thread.topicLabel && (
          <Text style={styles.topicBadge}>{thread.topicLabel}</Text>
        )}
        {(thread.cityName || thread.countryName) && (
          <Text style={styles.placeBadge}>
            {thread.cityName ?? thread.countryName}
          </Text>
        )}
      </View>

      {/* Title */}
      <Text style={styles.threadTitle}>{thread.title}</Text>

      {/* Author row */}
      <View style={styles.authorRow}>
        {thread.authorType === 'system' ? (
          <>
            <View style={[styles.avatar, styles.avatarSolaTeam]}>
              <Text style={styles.avatarSolaTeamInitial}>S</Text>
            </View>
            <Text style={styles.authorName}>Sola Team</Text>
            <Text style={styles.teamBadge}>TEAM</Text>
          </>
        ) : (
          <Pressable
            style={styles.authorPressable}
            onPress={() => router.push(`/home/user/${thread.author.id}` as any)}
          >
            {thread.author.avatarUrl ? (
              <Image source={{ uri: thread.author.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{thread.author.firstName?.charAt(0) ?? '?'}</Text>
              </View>
            )}
            <Text style={styles.authorName}>{thread.author.firstName}</Text>
          </Pressable>
        )}
        <Text style={styles.threadTime}>{formatTimeAgo(thread.createdAt)}</Text>
      </View>

      {/* Body */}
      <Text style={styles.threadBody}>{thread.body}</Text>

      {/* Actions row */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleVoteThread}
          hitSlop={6}
          style={({ pressed }) => [styles.helpfulButton, pressed && styles.pressed]}
        >
          <Feather
            name="arrow-up"
            size={16}
            color={isThreadHelpful ? colors.orange : colors.textMuted}
          />
          <Text style={[styles.helpfulText, isThreadHelpful && styles.helpfulTextActive]}>
            {thread.voteScore}
          </Text>
          <Text style={[styles.helpfulText, isThreadHelpful && styles.helpfulTextActive]}>
            helpful
          </Text>
        </Pressable>
        <Pressable onPress={handleReportThread} hitSlop={8}>
          <Feather name="flag" size={15} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Answers header */}
      <Text style={styles.repliesHeader}>
        {thread.replyCount} {thread.replyCount === 1 ? 'answer' : 'answers'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Discussion</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Replies list */}
      <FlatList
        data={replies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReplyCard
            reply={item}
            userId={userId ?? ''}
            onVote={handleVoteReply}
            onReport={handleReportReply}
          />
        )}
        ListHeaderComponent={ThreadHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Reply input */}
      <View style={[styles.replyInputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          style={styles.replyInput}
          placeholder="Write an answer..."
          placeholderTextColor={colors.textMuted}
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={2000}
        />
        <Pressable
          onPress={handleSubmitReply}
          disabled={!replyText.trim() || submitting}
          style={({ pressed }) => [
            styles.sendButton,
            (!replyText.trim() || submitting) && styles.sendButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="send" size={18} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { marginTop: 60 },

  // Header bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.sm,
  },
  backButton: { padding: spacing.xs },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  listContent: { paddingHorizontal: spacing.screenX, paddingBottom: 20 },

  // Thread header
  threadHeaderContainer: { paddingBottom: spacing.lg },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  topicBadge: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  placeBadge: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  threadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  authorPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSolaTeam: {
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSolaTeamInitial: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.orange,
  },
  avatarInitial: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary },
  authorName: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  teamBadge: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
    color: colors.orange,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  threadTime: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  threadBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },

  // Helpful button
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: spacing.xs,
  },
  helpfulText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  helpfulTextActive: {
    color: colors.orange,
  },

  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

  repliesHeader: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },

  // Reply card
  replyCard: {
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.borderDefault,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  replyAuthorName: { fontFamily: fonts.medium, fontSize: 13, color: colors.textPrimary },
  replyTime: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  replyBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.textPrimary },

  // Reply input
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    gap: spacing.sm,
  },
  replyInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
});
