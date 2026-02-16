import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import MenuButton from '@/components/MenuButton';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface Crumb {
  label: string;
  onPress?: () => void;
}

interface UniversalHeaderProps {
  crumbs: Array<Crumb>;
  unreadNotifications?: number;
  unreadMessages?: number;
}

const COLLAPSE_THRESHOLD = 3;

const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  crumbs,
  unreadNotifications = 0,
  unreadMessages = 0,
}) => {
  const [overflowVisible, setOverflowVisible] = useState(false);

  const shouldCollapse = crumbs.length > COLLAPSE_THRESHOLD;

  // If more than 3 crumbs, show: first + "…" + last 2
  const visibleCrumbs: Array<Crumb | 'ellipsis'> = shouldCollapse
    ? [crumbs[0], 'ellipsis', crumbs[crumbs.length - 2], crumbs[crumbs.length - 1]]
    : Array.from(crumbs);

  // Hidden crumbs collapsed into the ellipsis
  const hiddenCrumbs: Array<Crumb> = shouldCollapse
    ? crumbs.slice(1, crumbs.length - 2)
    : [];

  const handleHiddenCrumbPress = (crumb: Crumb) => {
    setOverflowVisible(false);
    crumb.onPress?.();
  };

  const renderCrumb = (item: Crumb | 'ellipsis', index: number) => {
    const isLast = item !== 'ellipsis' && index === visibleCrumbs.length - 1;

    if (item === 'ellipsis') {
      return (
        <React.Fragment key="ellipsis">
          <Text style={styles.separator}>/</Text>
          <Pressable
            onPress={() => setOverflowVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Show hidden breadcrumbs"
          >
            <Text style={styles.ellipsis}>…</Text>
          </Pressable>
        </React.Fragment>
      );
    }

    const crumb = item as Crumb;
    const isTappable = !isLast && crumb.onPress != null;

    return (
      <React.Fragment key={`${crumb.label}-${index}`}>
        {index > 0 && <Text style={styles.separator}>/</Text>}
        {isTappable ? (
          <Pressable onPress={crumb.onPress} hitSlop={4}>
            <Text style={styles.crumbActive} numberOfLines={1}>
              {crumb.label}
            </Text>
          </Pressable>
        ) : (
          <Text
            style={isLast ? styles.crumbCurrent : styles.crumbActive}
            numberOfLines={1}
          >
            {crumb.label}
          </Text>
        )}
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      {/* Row 1: Logo + actions */}
      <View style={styles.topRow}>
        <Image
          source={require('@/assets/images/sola-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <View style={styles.actions}>
          <Pressable
            hitSlop={12}
            style={styles.bellContainer}
            accessibilityRole="button"
            accessibilityLabel={
              unreadNotifications > 0
                ? `Notifications, ${unreadNotifications} unread`
                : 'Notifications'
            }
          >
            <Feather name="bell" size={22} color={colors.textPrimary} />
            {unreadNotifications > 0 && <View style={styles.badge} />}
          </Pressable>
          <MenuButton unreadCount={unreadMessages} />
        </View>
      </View>

      {/* Row 2: Breadcrumbs */}
      {crumbs.length > 0 && (
        <View style={styles.breadcrumbRow}>
          {visibleCrumbs.map((item, index) => renderCrumb(item, index))}
        </View>
      )}

      {/* Overflow bottom sheet for hidden crumbs */}
      <Modal
        visible={overflowVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOverflowVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOverflowVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Navigation</Text>
            {hiddenCrumbs.map((crumb, index) => (
              <Pressable
                key={`hidden-${crumb.label}-${index}`}
                style={styles.modalItem}
                onPress={() => handleHiddenCrumbPress(crumb)}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    crumb.onPress != null && styles.modalItemTextActive,
                  ]}
                >
                  {crumb.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export { UniversalHeader };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  logo: {
    height: 28,
    width: 80,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bellContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  crumbActive: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.orange,
    maxWidth: 140,
  },
  crumbCurrent: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    maxWidth: 160,
    flexShrink: 1,
  },
  separator: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  ellipsis: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modalItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  modalItemText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  modalItemTextActive: {
    color: colors.orange,
  },
});
