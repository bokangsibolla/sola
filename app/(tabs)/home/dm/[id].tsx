import { useState } from 'react';
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
import { getConversations, getMessages, getProfileById } from '@/data/api';
import type { Message } from '@/data/types';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const CURRENT_USER = 'profile-u1';

export default function DMThreadScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Resolve the other participant
  const conversations = getConversations();
  const convo = conversations.find((c) => c.id === conversationId);
  const otherId = convo?.participantIds.find((pid) => pid !== CURRENT_USER);
  const other = otherId ? getProfileById(otherId) : null;

  const initialMessages = conversationId ? getMessages(conversationId!) : [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId ?? 'new',
      senderId: CURRENT_USER,
      text: text.trim(),
      sentAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((prev) => [...prev, msg]);
    setText('');
  };

  const showMenu = () => {
    Alert.alert(undefined as any, undefined as any, [
      {
        text: 'Block',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Block user', `Are you sure you want to block ${other?.firstName ?? 'this user'}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Block', style: 'destructive', onPress: () => {} },
          ]),
      },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Report user', `Are you sure you want to report ${other?.firstName ?? 'this user'}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Report', style: 'destructive', onPress: () => {} },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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
        renderItem={({ item }) => {
          const isMe = item.senderId === CURRENT_USER;
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
