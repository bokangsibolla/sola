import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getConversations, getMessagesPaginated, getProfileById, sendMessage as apiSendMessage, blockUser, reportUser } from '@/data/api';
import { useData } from '@/hooks/useData';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import type { Message } from '@/data/types';
import { useAuth } from '@/state/AuthContext';
import { usePostHog } from 'posthog-react-native';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function DMThreadScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const { data: olderMessages, loading, error, fetchMore, hasMore, isFetchingMore, refetch } = usePaginatedData({
    queryKey: ['messages', conversationId ?? ''],
    fetcher: (page) => getMessagesPaginated(conversationId ?? '', page),
    enabled: !!conversationId,
  });

  // Resolve the other participant
  const { data: other } = useData(
    async () => {
      const conversations = await getConversations();
      const convo = conversations.find((c) => c.id === conversationId);
      const otherId = convo?.participantIds.find((pid) => pid !== userId);
      return otherId ? getProfileById(otherId) : null;
    },
    [conversationId, userId],
  );

  const posthog = usePostHog();
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  const handleRealtimeMessage = useCallback((msg: Message) => {
    setRealtimeMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  // olderMessages are newest-first from API; realtimeMessages are chronological (oldest first).
  // For inverted FlatList, data must be newest-first.
  const messages = useMemo(() => {
    const realtimeNewestFirst = [...realtimeMessages].reverse();
    const all = [...realtimeNewestFirst, ...olderMessages];
    const seen = new Set<string>();
    return all.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [olderMessages, realtimeMessages]);

  useRealtimeMessages(conversationId, userId, handleRealtimeMessage);

  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    const body = text.trim();
    if (!body || !conversationId || !userId) return;
    setSending(true);
    setText('');
    try {
      const msg = await apiSendMessage(conversationId, userId, body);
      setRealtimeMessages((prev) => [...prev, msg]);
      posthog.capture('message_sent', { conversation_id: conversationId });
    } catch {
      // Restore text on failure so user can retry
      setText(body);
    } finally {
      setSending(false);
    }
  };

  const otherId = other?.id;

  const handleBlock = async () => {
    if (!userId || !otherId) return;
    try {
      await blockUser(userId, otherId);
      Alert.alert('Blocked', `${other?.firstName ?? 'User'} has been blocked.`);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not block user. Please try again.');
    }
  };

  const handleReport = async (reason: string) => {
    if (!userId || !otherId) return;
    try {
      await reportUser(userId, otherId, reason);
      Alert.alert('Reported', 'Thank you. We will review this report.');
    } catch {
      Alert.alert('Error', 'Could not submit report. Please try again.');
    }
  };

  const showReportReasons = () => {
    Alert.alert('Why are you reporting?', undefined, [
      { text: 'Harassment', onPress: () => handleReport('harassment') },
      { text: 'Spam', onPress: () => handleReport('spam') },
      { text: 'Inappropriate content', onPress: () => handleReport('inappropriate') },
      { text: 'Makes me feel unsafe', onPress: () => handleReport('safety') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const showMenu = () => {
    Alert.alert('', '', [
      {
        text: 'Block',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Block user', `Are you sure you want to block ${other?.firstName ?? 'this user'}? You will no longer see their messages.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Block', style: 'destructive', onPress: handleBlock },
          ]),
      },
      {
        text: 'Report',
        style: 'destructive',
        onPress: showReportReasons,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerName}>{other?.firstName ?? 'Chat'}</Text>
        <Pressable onPress={showMenu} hitSlop={12}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messageList}
        inverted
        onEndReached={() => { if (hasMore) fetchMore(); }}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => {
          const isMe = item.senderId === userId;
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={sendMessage}
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={18} color={text.trim() ? colors.background : colors.textMuted} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.card,
    marginBottom: spacing.sm,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.orange,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.borderDefault,
  },
  bubbleText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: colors.background,
  },
  bubbleTextThem: {
    color: colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderDefault,
  },
});
