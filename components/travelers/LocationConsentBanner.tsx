import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';

interface LocationConsentBannerProps {
  onEnable: () => void;
  onDismiss: () => void;
  loading: boolean;
}

export default function LocationConsentBanner({
  onEnable,
  onDismiss,
  loading,
}: LocationConsentBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <Feather name="map-pin" size={20} color={colors.orange} />
      </View>
      <View style={styles.textWrap}>
        <SolaText style={styles.title}>Find travelers near you</SolaText>
        <SolaText style={styles.description}>
          Share your approximate location to see women in your area. Only your city is shown — never your exact position.
        </SolaText>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.enableButton, loading && { opacity: 0.6 }]}
          onPress={onEnable}
          disabled={loading}
        >
          <SolaText style={styles.enableButtonText}>
            {loading ? 'Finding...' : 'Enable'}
          </SolaText>
        </Pressable>
        <Pressable onPress={onDismiss} hitSlop={8}>
          <SolaText style={styles.dismissText}>Not now</SolaText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  textWrap: {
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  enableButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
  },
  enableButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.background,
  },
  dismissText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
