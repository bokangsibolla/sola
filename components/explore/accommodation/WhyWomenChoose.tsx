import React, { useCallback, useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface WhyWomenChooseProps {
  text: string | null;
}

const COLLAPSE_THRESHOLD = 200;
const COLLAPSED_LINES = 5;

const WhyWomenChoose: React.FC<WhyWomenChooseProps> = ({ text }) => {
  if (!text) return null;

  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > COLLAPSE_THRESHOLD;

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>WHY WOMEN CHOOSE THIS</Text>
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.textContainer}>
          <Text
            style={styles.text}
            numberOfLines={!expanded && isLong ? COLLAPSED_LINES : undefined}
          >
            {text}
          </Text>
          {isLong && (
            <Pressable onPress={toggleExpanded} hitSlop={8}>
              <Text style={styles.toggle}>
                {expanded ? 'Show less' : 'Read full overview'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

export { WhyWomenChoose };

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
    flexDirection: 'row',
  },
  accentBar: {
    width: 2,
    backgroundColor: colors.orange,
    opacity: 0.3,
    borderRadius: 1,
    marginRight: spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  toggle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.sm,
  },
});
