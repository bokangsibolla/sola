import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  variant?: 'default' | 'editorial';
}

export default function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  variant = 'default',
}: SectionHeaderProps) {
  const isEditorial = variant === 'editorial';

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isEditorial && styles.titleEditorial]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {onSeeAll && (
        <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.orange} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  titleEditorial: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
  },
  seeAllText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
