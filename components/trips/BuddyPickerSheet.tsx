import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getConnectedProfiles } from '@/data/trips/tripApi';
import type { Profile } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

// ── Props ────────────────────────────────────────────────────────────────────

interface BuddyPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  onToggle: (userId: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const BuddyPickerSheet: React.FC<BuddyPickerSheetProps> = ({
  visible,
  onClose,
  selectedUserIds,
  onToggle,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  // Reset search on close
  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setDebouncedSearch('');
    }
  }, [visible]);

  const { data: profiles, loading } = useData(
    () =>
      userId && visible
        ? getConnectedProfiles(userId, debouncedSearch || undefined)
        : Promise.resolve([]),
    ['buddyPicker', userId, debouncedSearch, visible],
  );

  const connections = profiles ?? [];
  const selectedSet = new Set(selectedUserIds);

  const renderProfile = ({ item }: { item: Profile }) => {
    const isSelected = selectedSet.has(item.id);

    return (
      <Pressable
        style={styles.profileRow}
        onPress={() => onToggle(item.id)}
      >
        <View style={styles.profileInfo}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={16} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.nameBlock}>
            <Text style={styles.profileName}>{item.firstName}</Text>
            {item.username && (
              <Text style={styles.profileUsername}>@{item.username}</Text>
            )}
          </View>
        </View>
        <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={14} color={colors.background} />
          )}
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    if (connections.length === 0 && !debouncedSearch) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No connections yet</Text>
          <Text style={styles.emptySubtitle}>
            Connect with travelers first
          </Text>
          <Pressable
            style={styles.emptyAction}
            onPress={() => {
              onClose();
              router.push('/(tabs)/travelers');
            }}
          >
            <Text style={styles.emptyActionText}>Find travelers</Text>
          </Pressable>
        </View>
      );
    }

    if (connections.length === 0 && debouncedSearch) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            No connections matching &apos;{debouncedSearch}&apos;
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add companions</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search connections..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Selected count */}
        {selectedUserIds.length > 0 && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>
              {selectedUserIds.length} selected
            </Text>
          </View>
        )}

        {/* List */}
        {loading && connections.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.orange} />
          </View>
        ) : (
          <FlatList
            data={connections}
            keyExtractor={(item) => item.id}
            renderItem={renderProfile}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </Modal>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenX,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    marginLeft: spacing.screenX,
    marginTop: spacing.sm,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.button,
  },
  selectedBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },

  // Profile rows
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  profileName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  profileUsername: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxxl,
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  emptyActionText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Loading
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
