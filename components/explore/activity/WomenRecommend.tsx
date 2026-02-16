import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface WomenRecommendProps {
  text: string | null;
}

const WomenRecommend: React.FC<WomenRecommendProps> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text || text.trim().length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>FROM WOMEN WHO'VE DONE THIS</Text>
      <View style={styles.accentRow}>
        <View style={styles.accentBar} />
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
  accentRow: {
    flexDirection: 'row',
  },
  accentBar: {
    width: 2,
    backgroundColor: colors.orange,
    opacity: 0.3,
    borderRadius: 1,
    marginRight: spacing.md,
    marginTop: 2,
    marginBottom: 2,
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
