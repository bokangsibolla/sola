import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/constants/design';
import { useIsWishlisted } from '@/data/wishlist/useWishlist';
import type { WishlistEntityType } from '@/data/wishlist/types';

interface BookmarkButtonProps {
  entityType: WishlistEntityType;
  entityId: string;
  size?: number;
  style?: object;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  entityType,
  entityId,
  size = 22,
  style,
}) => {
  const { wishlisted, toggle, loading } = useIsWishlisted(entityType, entityId);
  const [saving, setSaving] = useState(false);

  const handlePress = async () => {
    if (saving || loading) return;
    setSaving(true);
    try {
      await toggle();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={12}
      style={[styles.wrapper, style]}
      disabled={saving}
    >
      <Ionicons
        name={wishlisted ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={wishlisted ? colors.orange : colors.textSecondary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.xs,
  },
});
