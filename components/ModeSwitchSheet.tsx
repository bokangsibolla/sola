import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppMode } from '@/state/AppModeContext';
import { colors, spacing, radius, fonts } from '@/constants/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModeSwitchSheetProps {
  visible: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ModeSwitchSheet({ visible, onClose }: ModeSwitchSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode, activeTripInfo, setMode } = useAppMode();

  const isDiscover = mode === 'discover';
  const isTravelling = mode === 'travelling';

  const handleSelectDiscover = () => {
    setMode('discover');
    onClose();
  };

  const handleSelectTravelling = () => {
    if (activeTripInfo) {
      setMode('travelling');
      onClose();
    } else {
      onClose();
      router.push('/trips/new');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Mode</Text>

          {/* Exploring option */}
          <Pressable
            style={[styles.option, isDiscover && styles.optionActive]}
            onPress={handleSelectDiscover}
          >
            <View style={[styles.iconCircle, isDiscover && styles.iconCircleActive]}>
              <Feather
                name="compass"
                size={20}
                color={isDiscover ? colors.orange : colors.textSecondary}
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, isDiscover && styles.optionTitleActive]}>
                Exploring
              </Text>
              <Text style={styles.optionDescription}>
                Browse destinations, save places, plan ahead
              </Text>
            </View>
            {isDiscover && (
              <Feather name="check" size={20} color={colors.orange} />
            )}
          </Pressable>

          {/* Travelling option */}
          <Pressable
            style={[styles.option, isTravelling && activeTripInfo && styles.optionActive]}
            onPress={handleSelectTravelling}
          >
            <View
              style={[
                styles.iconCircle,
                isTravelling && activeTripInfo && styles.iconCircleActive,
              ]}
            >
              <Feather
                name={activeTripInfo ? 'navigation' : 'plus'}
                size={20}
                color={
                  isTravelling && activeTripInfo
                    ? colors.orange
                    : colors.textSecondary
                }
              />
            </View>
            <View style={styles.optionContent}>
              {activeTripInfo ? (
                <>
                  <Text
                    style={[
                      styles.optionTitle,
                      isTravelling && styles.optionTitleActive,
                    ]}
                  >
                    Travelling{' \u00B7 '}
                    {activeTripInfo.city.name}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {activeTripInfo.daysLeft === 1
                      ? '1 day left'
                      : `${activeTripInfo.daysLeft} days left`}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.optionTitle}>Start a trip</Text>
                  <Text style={styles.optionDescription}>
                    Plan your next destination
                  </Text>
                </>
              )}
            </View>
            {isTravelling && activeTripInfo && (
              <Feather name="check" size={20} color={colors.orange} />
            )}
            {!activeTripInfo && (
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
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
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
    marginBottom: spacing.sm,
    minHeight: 64,
    backgroundColor: colors.neutralFill,
  },
  optionActive: {
    backgroundColor: colors.orangeFill,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconCircleActive: {
    backgroundColor: colors.background,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  optionTitleActive: {
    color: colors.orange,
  },
  optionDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
