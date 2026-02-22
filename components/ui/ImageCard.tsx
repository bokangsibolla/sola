import { colors, radius, spacing } from '@/constants/design';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';

interface ImageCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  onPress?: () => void;
  badge?: string;
}

export default function ImageCard({ title, subtitle, imageUrl, onPress, badge }: ImageCardProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={200} />
        {badge && (
          <View style={styles.badge}>
            <SolaText style={styles.badgeText}>{badge}</SolaText>
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <SolaText variant="body" style={styles.title}>{title}</SolaText>
        {subtitle && <SolaText variant="caption" color={colors.textSecondary}>{subtitle}</SolaText>}
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.borderDefault,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  textContainer: {
    gap: spacing.xs,
  },
  title: {
    fontWeight: '600',
  },
});
