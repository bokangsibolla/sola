export interface Conversation {
  id: string;
  withUserId: string;
  lastMessage: string;
  lastMessageAt: string;   // ISO datetime
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;       // 'me' or user id
  text: string;
  sentAt: string;         // ISO datetime
}

export const mockConversations: Conversation[] = [
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

export const mockMessages: Message[] = [
  // Conversation with Amara (c1)
  { id: 'm1', conversationId: 'c1', senderId: 'me', text: 'Hey! I saw you\'re in Lisbon. Any food recs?', sentAt: '2026-02-01T14:00:00Z' },
  { id: 'm2', conversationId: 'c1', senderId: 'u1', text: 'The Time Out Market is amazing, definitely go!', sentAt: '2026-02-01T14:30:00Z' },
  // Conversation with Sofia (c2)
  { id: 'm3', conversationId: 'c2', senderId: 'u3', text: 'Are you still planning the Bali trip?', sentAt: '2026-01-28T08:00:00Z' },
  { id: 'm4', conversationId: 'c2', senderId: 'me', text: 'Yes! Arriving mid-March', sentAt: '2026-01-28T09:00:00Z' },
  { id: 'm5', conversationId: 'c2', senderId: 'u3', text: 'See you in Ubud next month!', sentAt: '2026-01-28T09:15:00Z' },
  // Conversation with Priya (c3)
  { id: 'm6', conversationId: 'c3', senderId: 'me', text: 'Do you know any good coworking spaces in Chiang Mai?', sentAt: '2026-01-25T18:00:00Z' },
  { id: 'm7', conversationId: 'c3', senderId: 'u4', text: 'That coworking space in Chiang Mai is called Punspace', sentAt: '2026-01-25T18:45:00Z' },
];
