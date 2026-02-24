import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Country } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { StructuredContent } from './StructuredContent';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  country: Country;
}

function AccordionBlock({
  title,
  content,
  isLast,
}: {
  title: string;
  content: string;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.block, !isLast && styles.blockBorder]}>
      <Pressable onPress={toggle} style={styles.blockHeader} hitSlop={4}>
        <Text style={styles.blockTitle}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </Pressable>
      {expanded && (
        <View style={styles.blockBody}>
          <StructuredContent markdown={content} maxItems={5} />
        </View>
      )}
    </View>
  );
}

export function TravelFitSection({ country }: Props) {
  const hasBestFor = !!country.bestForMd;
  const hasMightStruggle = !!country.mightStruggleMd;

  if (!hasBestFor && !hasMightStruggle) return null;

  const blocks: { title: string; content: string }[] = [];
  if (hasBestFor) {
    blocks.push({ title: 'Who this country is best for', content: country.bestForMd! });
  }
  if (hasMightStruggle) {
    blocks.push({ title: 'Who might struggle here', content: country.mightStruggleMd! });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Travel fit</Text>
      <View style={styles.card}>
        {blocks.map((block, i) => (
          <AccordionBlock
            key={block.title}
            title={block.title}
            content={block.content}
            isLast={i === blocks.length - 1}
          />
        ))}
      </View>
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
    overflow: 'hidden',
  },
  block: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  blockBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,101,58,0.08)',
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
    flex: 1,
    marginRight: spacing.md,
  },
  blockBody: {
    marginTop: spacing.md,
  },
});
