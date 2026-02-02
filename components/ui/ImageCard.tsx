import { colors, radius, spacing, typography } from '@/constants/design';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
    resizeMode: 'cover',
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
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
