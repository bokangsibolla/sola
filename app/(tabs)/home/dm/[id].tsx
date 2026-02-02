import { useState } from 'react';
import {
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
import { mockConversations, mockMessages, mockUsers, type Message } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function DMThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = mockUsers.find((u) => u.id === id);
  const convo = mockConversations.find((c) => c.withUserId === id);
  const [messages, setMessages] = useState<Message[]>(
    convo ? mockMessages.filter((m) => m.conversationId === convo.id) : [],
  );
  const [text, setText] = useState('');

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      conversationId: convo?.id ?? 'new',
      senderId: 'me',
      text: text.trim(),
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setText('');
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
        <Text style={styles.headerName}>{user?.firstName ?? 'Chat'}</Text>
        <Pressable onPress={() => user && router.push(`/home/user/${user.id}`)} hitSlop={12}>
          <Ionicons name="person-circle-outline" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMe = item.senderId === 'me';
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
