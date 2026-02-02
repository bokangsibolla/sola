import { Conversation, Message } from '../types';

// Legacy types kept for backward compatibility
export interface LegacyConversation {
  id: string;
  withUserId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

/** @deprecated Use mockConversationsV2 instead */
export const mockConversations: LegacyConversation[] = [
  {
    id: 'c1',
    withUserId: 'u1',
    lastMessage: 'The Time Out Market is amazing, definitely go!',
    lastMessageAt: '2026-02-01T14:30:00Z',
    unreadCount: 1,
  },
  {
    id: 'c2',
    withUserId: 'u3',
    lastMessage: 'See you in Ubud next month!',
    lastMessageAt: '2026-01-28T09:15:00Z',
    unreadCount: 0,
  },
  {
    id: 'c3',
    withUserId: 'u4',
    lastMessage: 'That coworking space in Chiang Mai is called Punspace',
    lastMessageAt: '2026-01-25T18:45:00Z',
    unreadCount: 0,
  },
];

export const mockConversationsV2: Conversation[] = [
  {
    id: 'conv-1',
    participantIds: ['profile-u1', 'profile-u3'],
    lastMessage: 'The Time Out Market is amazing, definitely go!',
    lastMessageAt: '2026-02-01T14:30:00Z',
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    participantIds: ['profile-u1', 'profile-u3'],
    lastMessage: 'See you in Ubud next month!',
    lastMessageAt: '2026-01-28T09:15:00Z',
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    participantIds: ['profile-u1', 'profile-u4'],
    lastMessage: 'That coworking space in Chiang Mai is called Punspace',
    lastMessageAt: '2026-01-25T18:45:00Z',
    unreadCount: 0,
  },
];

/** @deprecated Use mockMessagesV2 instead */
export const mockMessages: { id: string; conversationId: string; senderId: string; text: string; sentAt: string }[] = [
  { id: 'm1', conversationId: 'c1', senderId: 'me', text: 'Hey! I saw you\'re in Lisbon. Any food recs?', sentAt: '2026-02-01T14:00:00Z' },
  { id: 'm2', conversationId: 'c1', senderId: 'u1', text: 'The Time Out Market is amazing, definitely go!', sentAt: '2026-02-01T14:30:00Z' },
  { id: 'm3', conversationId: 'c2', senderId: 'u3', text: 'Are you still planning the Bali trip?', sentAt: '2026-01-28T08:00:00Z' },
  { id: 'm4', conversationId: 'c2', senderId: 'me', text: 'Yes! Arriving mid-March', sentAt: '2026-01-28T09:00:00Z' },
  { id: 'm5', conversationId: 'c2', senderId: 'u3', text: 'See you in Ubud next month!', sentAt: '2026-01-28T09:15:00Z' },
  { id: 'm6', conversationId: 'c3', senderId: 'me', text: 'Do you know any good coworking spaces in Chiang Mai?', sentAt: '2026-01-25T18:00:00Z' },
  { id: 'm7', conversationId: 'c3', senderId: 'u4', text: 'That coworking space in Chiang Mai is called Punspace', sentAt: '2026-01-25T18:45:00Z' },
];

export const mockMessagesV2: Message[] = [
  { id: 'msg-1', conversationId: 'conv-1', senderId: 'profile-u1', text: 'Hey! I saw you\'re in Lisbon. Any food recs?', sentAt: '2026-02-01T14:00:00Z', readAt: '2026-02-01T14:05:00Z' },
  { id: 'msg-2', conversationId: 'conv-1', senderId: 'profile-u3', text: 'The Time Out Market is amazing, definitely go!', sentAt: '2026-02-01T14:30:00Z', readAt: null },
  { id: 'msg-3', conversationId: 'conv-2', senderId: 'profile-u3', text: 'Are you still planning the Bali trip?', sentAt: '2026-01-28T08:00:00Z', readAt: '2026-01-28T08:30:00Z' },
  { id: 'msg-4', conversationId: 'conv-2', senderId: 'profile-u1', text: 'Yes! Arriving mid-March', sentAt: '2026-01-28T09:00:00Z', readAt: '2026-01-28T09:10:00Z' },
  { id: 'msg-5', conversationId: 'conv-2', senderId: 'profile-u3', text: 'See you in Ubud next month!', sentAt: '2026-01-28T09:15:00Z', readAt: '2026-01-28T09:20:00Z' },
  { id: 'msg-6', conversationId: 'conv-3', senderId: 'profile-u1', text: 'Do you know any good coworking spaces in Chiang Mai?', sentAt: '2026-01-25T18:00:00Z', readAt: '2026-01-25T18:10:00Z' },
  { id: 'msg-7', conversationId: 'conv-3', senderId: 'profile-u4', text: 'That coworking space in Chiang Mai is called Punspace', sentAt: '2026-01-25T18:45:00Z', readAt: '2026-01-25T19:00:00Z' },
];

export type { Conversation, Message } from '../types';
