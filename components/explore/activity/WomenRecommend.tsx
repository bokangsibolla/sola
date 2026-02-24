import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface WomenRecommendProps {
  text: string | null;
  /** Override the section label. Defaults to "FROM WOMEN WHO'VE DONE THIS" */
  label?: string;
}

const WomenRecommend: React.FC<WomenRecommendProps> = ({
  text,
  label = "FROM WOMEN WHO'VE DONE THIS",
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!text || text.trim().length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={18}
          color={colors.orange}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text
            style={styles.quoteText}
            numberOfLines={expanded ? undefined : 5}
          >
            {text}
          </Text>
          {text.length > 200 && (
            <Pressable onPress={() => setExpanded(!expanded)} hitSlop={8}>
              <Text style={styles.toggle}>
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

export { WomenRecommend };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  icon: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  quoteText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  toggle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
    marginTop: spacing.sm,
  },
});
