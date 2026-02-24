import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useTogetherPost } from '@/data/together/useTogetherPost';
import { getImageUrl } from '@/lib/image';
import { colors, fonts, spacing, radius, typography, elevation } from '@/constants/design';
import type { TogetherRequestWithProfile } from '@/data/together/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Drink',
  culture: 'Culture',
  adventure: 'Adventure',
  nightlife: 'Nightlife',
  day_trip: 'Day Trip',
  wellness: 'Wellness',
  shopping: 'Shopping',
  other: 'Other',
};

const POST_TYPE_LABELS: Record<string, string> = {
  open_plan: 'Open Plan',
  looking_for: 'Looking For',
};

function formatDate(dateStr: string | null, timeStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let result = `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  if (timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    result += ` at ${h12}:${m} ${ampm}`;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Request Sheet (bottom modal)
// ---------------------------------------------------------------------------

interface RequestSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (note?: string) => Promise<void>;
}

const RequestSheet: React.FC<RequestSheetProps> = ({ visible, onClose, onSubmit }) => {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(note.trim() || undefined);
      setNote('');
      onClose();
    } catch {
      Alert.alert('Error', 'Could not send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={sheetStyles.overlay}>
        <Pressable style={sheetStyles.backdrop} onPress={handleClose} />
        <View style={[sheetStyles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={sheetStyles.handle} />
          <Text style={sheetStyles.title}>Add a note (optional)</Text>

          <TextInput
            style={sheetStyles.input}
            placeholder="Introduce yourself or mention your plans..."
            placeholderTextColor={colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            maxLength={120}
            textAlignVertical="top"
          />

          <Text style={sheetStyles.charCount}>{note.length}/120</Text>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[sheetStyles.submitButton, submitting && sheetStyles.submitButtonDisabled]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={sheetStyles.submitButtonText}>Send Request</Text>
            )}
          </Pressable>

          <Pressable onPress={handleClose} style={sheetStyles.cancelLink} hitSlop={12}>
            <Text style={sheetStyles.cancelLinkText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const sheetStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: 14,
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelLinkText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
});

// ---------------------------------------------------------------------------
// Request Card (owner view)
// ---------------------------------------------------------------------------

interface RequestCardProps {
  request: TogetherRequestWithProfile;
  onAccept: () => void;
  onDecline: () => void;
  loading: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onAccept, onDecline, loading }) => {
  const { requester } = request;

  return (
    <View style={reqStyles.card}>
      <View style={reqStyles.row}>
        {requester.avatarUrl ? (
          <Image
            source={{ uri: getImageUrl(requester.avatarUrl, { width: 80, height: 80 }) ?? undefined }}
            style={reqStyles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[reqStyles.avatar, reqStyles.avatarPlaceholder]}>
            <Ionicons name="person" size={18} color={colors.textMuted} />
          </View>
        )}
        <View style={reqStyles.info}>
          <Text style={reqStyles.name}>{requester.firstName}</Text>
          {requester.bio ? (
            <Text style={reqStyles.bio} numberOfLines={2}>{requester.bio}</Text>
          ) : null}
        </View>
      </View>

      {requester.travelStyleTags.length > 0 && (
        <View style={reqStyles.tagsRow}>
          {requester.travelStyleTags.slice(0, 3).map((tag) => (
            <View key={tag} style={reqStyles.tag}>
              <Text style={reqStyles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {request.note ? (
        <Text style={reqStyles.note}>"{request.note}"</Text>
      ) : null}

      <View style={reqStyles.actions}>
        <Pressable
          style={({ pressed }) => [reqStyles.acceptBtn, pressed && { opacity: 0.8 }, loading && { opacity: 0.4 }]}
          onPress={onAccept}
          disabled={loading}
        >
          <Text style={reqStyles.acceptBtnText}>Accept</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [reqStyles.declineBtn, pressed && { opacity: 0.8 }, loading && { opacity: 0.4 }]}
          onPress={onDecline}
          disabled={loading}
        >
          <Text style={reqStyles.declineBtnText}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );
};

const reqStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  bio: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  acceptBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSoft,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  acceptBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  declineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  declineBtnText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
});

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function TogetherPostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    post,
    loading,
    error,
    isOwner,
    requests,
    refetch,
    requestToJoin,
    cancelRequest,
    acceptRequest,
    declineRequest,
    closePost,
    deletePost,
  } = useTogetherPost(postId ?? '');

  const [sheetVisible, setSheetVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Actions ──────────────────────────────────────────────────────

  const handleRequestToJoin = useCallback(async (note?: string) => {
    await requestToJoin(note);
  }, [requestToJoin]);

  const handleCancelRequest = useCallback(async () => {
    if (!post?.userRequestId) return;
    setActionLoading(true);
    try {
      await cancelRequest(post.userRequestId);
    } catch {
      Alert.alert('Error', 'Could not cancel request.');
    } finally {
      setActionLoading(false);
    }
  }, [cancelRequest, post?.userRequestId]);

  const handleAccept = useCallback(async (requestId: string, requesterId: string) => {
    setActionLoading(true);
    try {
      await acceptRequest(requestId, requesterId);
    } catch {
      Alert.alert('Error', 'Could not accept request.');
    } finally {
      setActionLoading(false);
    }
  }, [acceptRequest]);

  const handleDecline = useCallback(async (requestId: string) => {
    setActionLoading(true);
    try {
      await declineRequest(requestId);
    } catch {
      Alert.alert('Error', 'Could not decline request.');
    } finally {
      setActionLoading(false);
    }
  }, [declineRequest]);

  const handleClosePost = useCallback(() => {
    Alert.alert(
      'Close this post?',
      'No new requests will be accepted. You can still see accepted companions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Post',
          onPress: async () => {
            setActionLoading(true);
            try {
              await closePost();
            } catch {
              Alert.alert('Error', 'Could not close post.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  }, [closePost]);

  const handleDeletePost = useCallback(() => {
    Alert.alert(
      'Delete this post?',
      'This cannot be undone. All requests will be cancelled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await deletePost();
              router.back();
            } catch {
              Alert.alert('Error', 'Could not delete post.');
              setActionLoading(false);
            }
          },
        },
      ],
    );
  }, [deletePost, router]);

  const handleOwnerOverflow = useCallback(() => {
    Alert.alert('', '', [
      {
        text: 'Delete Post',
        style: 'destructive',
        onPress: handleDeletePost,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleDeletePost]);

  // ── Loading / Error states ───────────────────────────────────────

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!post) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <NavigationHeader title="Activity" parentTitle="Back" />
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyText}>Post not found</Text>
        </View>
      </View>
    );
  }

  // ── Derived values ───────────────────────────────────────────────

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');
  const spotsLabel = `${post.acceptedCount} of ${post.maxCompanions} spot${post.maxCompanions !== 1 ? 's' : ''} filled`;
  const isClosed = post.status !== 'open';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <NavigationHeader
        title="Activity"
        parentTitle="Back"
        rightActions={
          isOwner ? (
            <Pressable onPress={handleOwnerOverflow} hitSlop={12}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 + spacing.lg },
        ]}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.pillsRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>
                {CATEGORY_LABELS[post.activityCategory] ?? post.activityCategory}
              </Text>
            </View>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>
                {POST_TYPE_LABELS[post.postType] ?? post.postType}
              </Text>
            </View>
            {isClosed && (
              <View style={styles.closedPill}>
                <Text style={styles.closedPillText}>Closed</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{post.title}</Text>
        </View>

        {/* Date / Time Row */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
          {post.isFlexible ? (
            <View style={styles.flexibleBadge}>
              <Text style={styles.flexibleBadgeText}>Flexible</Text>
            </View>
          ) : (
            <Text style={styles.infoText}>
              {formatDate(post.activityDate, post.startTime)}
            </Text>
          )}
        </View>

        {/* Location Row */}
        {(post.cityName || post.countryName) && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            <Text style={styles.infoText}>
              {[post.cityName, post.countryName].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}

        {/* Author Card (viewer only) */}
        {!isOwner && (
          <Pressable
            style={({ pressed }) => [styles.authorCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            onPress={() => router.push(`/travelers/user/${post.author.id}`)}
          >
            <View style={styles.authorRow}>
              {post.author.avatarUrl ? (
                <Image
                  source={{ uri: getImageUrl(post.author.avatarUrl, { width: 96, height: 96 }) ?? undefined }}
                  style={styles.authorAvatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.authorAvatar, styles.authorAvatarPlaceholder]}>
                  <Ionicons name="person" size={22} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.author.firstName}</Text>
                {post.author.bio ? (
                  <Text style={styles.authorBio} numberOfLines={2}>{post.author.bio}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
            {post.author.travelStyleTags.length > 0 && (
              <View style={styles.authorTags}>
                {post.author.travelStyleTags.slice(0, 4).map((tag) => (
                  <View key={tag} style={styles.styleTag}>
                    <Text style={styles.styleTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        )}

        {/* Description */}
        {post.description ? (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>{post.description}</Text>
          </View>
        ) : null}

        {/* Spots Info */}
        <View style={styles.section}>
          <View style={styles.spotsRow}>
            <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.spotsText}>{spotsLabel}</Text>
          </View>
        </View>

        {/* ── Owner-only sections ───────────────────────────────────── */}
        {isOwner && (
          <>
            {/* Pending Requests */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Requests</Text>
                {pendingRequests.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{pendingRequests.length}</Text>
                  </View>
                )}
              </View>

              {pendingRequests.length === 0 ? (
                <Text style={styles.emptySubtext}>No requests yet</Text>
              ) : (
                pendingRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onAccept={() => handleAccept(req.id, req.requesterId)}
                    onDecline={() => handleDecline(req.id)}
                    loading={actionLoading}
                  />
                ))
              )}
            </View>

            {/* Accepted */}
            {acceptedRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Going</Text>
                {acceptedRequests.map((req) => (
                  <Pressable
                    key={req.id}
                    style={({ pressed }) => [
                      styles.acceptedRow,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={() => router.push(`/travelers/user/${req.requesterId}`)}
                  >
                    {req.requester.avatarUrl ? (
                      <Image
                        source={{ uri: getImageUrl(req.requester.avatarUrl, { width: 80, height: 80 }) ?? undefined }}
                        style={styles.acceptedAvatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.acceptedAvatar, styles.acceptedAvatarPlaceholder]}>
                        <Ionicons name="person" size={16} color={colors.textMuted} />
                      </View>
                    )}
                    <Text style={styles.acceptedName}>{req.requester.firstName}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ── Bottom Sticky Bar ───────────────────────────────────────── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.lg },
          elevation.sm,
        ]}
      >
        {isOwner ? (
          /* Owner bar */
          post.status === 'open' ? (
            <Pressable
              style={({ pressed }) => [
                styles.closePostButton,
                pressed && { opacity: 0.8 },
                actionLoading && { opacity: 0.4 },
              ]}
              onPress={handleClosePost}
              disabled={actionLoading}
            >
              <Text style={styles.closePostButtonText}>Close Post</Text>
            </Pressable>
          ) : (
            <View style={styles.closedBar}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
              <Text style={styles.closedBarText}>This post is closed</Text>
            </View>
          )
        ) : (
          /* Viewer bar */
          <>
            {post.userRequestStatus === null && post.status === 'open' && (
              <Pressable
                style={({ pressed }) => [styles.requestButton, pressed && { opacity: 0.8 }]}
                onPress={() => setSheetVisible(true)}
              >
                <Text style={styles.requestButtonText}>Request to Join</Text>
              </Pressable>
            )}

            {post.userRequestStatus === 'pending' && (
              <View>
                <View style={styles.pendingBar}>
                  <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.pendingText}>Requested</Text>
                </View>
                <Pressable
                  onPress={handleCancelRequest}
                  disabled={actionLoading}
                  style={[styles.cancelLink, actionLoading && { opacity: 0.4 }]}
                  hitSlop={12}
                >
                  <Text style={styles.cancelLinkText}>Cancel request</Text>
                </Pressable>
              </View>
            )}

            {post.userRequestStatus === 'accepted' && (
              <View style={styles.acceptedBar}>
                <View style={styles.acceptedBarContent}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.greenSoft} />
                  <Text style={styles.acceptedBarText}>You're going!</Text>
                </View>
                <Pressable
                  onPress={() => router.push(`/travelers/dm/index`)}
                  hitSlop={12}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.openChatLink}>Open Chat</Text>
                </Pressable>
              </View>
            )}

            {post.userRequestStatus === 'declined' && (
              <View style={styles.pendingBar}>
                <Text style={styles.pendingText}>Request declined</Text>
              </View>
            )}

            {post.status !== 'open' && post.userRequestStatus === null && (
              <View style={styles.closedBar}>
                <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
                <Text style={styles.closedBarText}>This activity is no longer open</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Request Sheet */}
      <RequestSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSubmit={handleRequestToJoin}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // Hero
  heroSection: {
    marginBottom: spacing.xl,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryPill: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  categoryPillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
  typePill: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  typePillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  closedPill: {
    backgroundColor: colors.emergencyFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  closedPillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.emergency,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  flexibleBadge: {
    backgroundColor: colors.blueFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  flexibleBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.blueSoft,
  },

  // Author card
  authorCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  authorAvatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  authorBio: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
  },
  authorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  styleTag: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  styleTagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Description
  descriptionText: {
    ...typography.body,
    color: colors.textPrimary,
  },

  // Spots
  spotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spotsText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.orange,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },

  // Accepted list
  acceptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  acceptedAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
  },
  acceptedAvatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptedName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },

  // Viewer bottom: request
  requestButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 48,
  },
  requestButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Viewer bottom: pending
  pendingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 48,
  },
  pendingText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelLinkText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },

  // Viewer bottom: accepted
  acceptedBar: {
    backgroundColor: colors.greenFill,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  acceptedBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  acceptedBarText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.greenSoft,
  },
  openChatLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.greenSoft,
    textDecorationLine: 'underline',
  },

  // Owner bottom: close post
  closePostButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 48,
  },
  closePostButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },

  // Owner bottom: closed state
  closedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
  },
  closedBarText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
