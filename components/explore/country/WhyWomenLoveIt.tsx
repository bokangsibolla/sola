import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import type { Country } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { StructuredContent } from './StructuredContent';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  country: Country;
}

export function WhyWomenLoveIt({ country }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Short: introMd or summaryMd
  const shortText = country.introMd || country.summaryMd;
  // Full: whyWeLoveMd, summaryMd, or portraitMd
  const fullText = country.whyWeLoveMd || country.summaryMd || country.portraitMd;

  if (!shortText && !fullText) return null;

  const hasMore = fullText && shortText && fullText !== shortText;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const displayText = expanded && fullText ? fullText : (shortText || fullText || '');

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Why women love it</Text>
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.cardBody}>
          <StructuredContent markdown={displayText} maxItems={expanded ? 8 : 4} />
        </View>
      </View>
      {hasMore && !expanded && (
        <Pressable onPress={toggle} hitSlop={8}>
          <Text style={styles.readMore}>Read full overview</Text>
        </Pressable>
      )}
      {expanded && hasMore && (
        <Pressable onPress={toggle} hitSlop={8}>
          <Text style={styles.readMore}>Show less</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.orange,
  },
  cardBody: {
    flex: 1,
    padding: spacing.lg,
  },
  readMore: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
    marginTop: spacing.xs,
  },
});
