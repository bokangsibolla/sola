import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';

interface PendingConnectionsBannerProps {
  count: number;
  onPress: () => void;
}

export default function PendingConnectionsBanner({ count, onPress }: PendingConnectionsBannerProps) {
  if (count === 0) return null;

  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Feather name="users" size={16} color={colors.orange} />
      </View>
      <SolaText style={styles.text}>
        {count === 1
          ? '1 traveler wants to connect'
          : `${count} travelers want to connect`}
      </SolaText>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
