export type NotificationType =
  | 'community_reply'
  | 'connection_request'
  | 'connection_accepted'
  | 'new_message'
  | 'admin_announcement'
  | 'verification_approved'
  | 'verification_rejected';

export type NotificationTargetType = 'thread' | 'conversation' | 'profile';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  targetType: NotificationTargetType | null;
  targetId: string | null;
  actorId: string | null;
  isRead: boolean;
  createdAt: string;
  // Joined from profiles
  actor: {
    firstName: string;
    avatarUrl: string | null;
  } | null;
}

export type NotificationGroup = 'today' | 'thisWeek' | 'earlier';

export interface GroupedNotifications {
  today: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
}
