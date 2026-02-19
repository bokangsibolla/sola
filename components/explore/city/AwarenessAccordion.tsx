import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City } from '@/data/types';
import { extractLeadSentence } from '@/components/explore/country/mappings';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItem {
  key: string;
  title: string;
  preview: string;
  bullets: string[];
}

function buildItems(city: City): AccordionItem[] {
  const items: AccordionItem[] = [];

  // From structured awareness JSONB
  if (city.awareness) {
    items.push({
      key: 'awareness',
      title: 'Things to be aware of',
      preview: city.awareness.summary,
      bullets: city.awareness.bullets,
    });
    return items;
  }

  // Fallback: build from markdown fields
  if (city.cultureEtiquetteMd) {
    const bullets = city.cultureEtiquetteMd
      .split('\n')
      .map((l) => l.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'))
      .slice(0, 4);

    if (bullets.length > 0) {
      items.push({
        key: 'culture',
        title: 'Culture & etiquette',
        preview: extractLeadSentence(city.cultureEtiquetteMd),
        bullets,
      });
    }
  }

  if (city.safetyWomenMd) {
    const bullets = city.safetyWomenMd
      .split('\n')
      .map((l) => l.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'))
      .slice(0, 4);

    if (bullets.length > 0) {
      items.push({
        key: 'safety',
        title: 'Safety awareness',
        preview: extractLeadSentence(city.safetyWomenMd),
        bullets,
      });
    }
  }

  return items;
}

function AccordionRow({ item }: { item: AccordionItem }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.row}>
      <Pressable onPress={toggle} style={styles.rowHeader} hitSlop={4}>
        <View style={styles.rowTitleGroup}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          {!expanded && (
            <Text style={styles.rowPreview} numberOfLines={1}>{item.preview}</Text>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </Pressable>

      {expanded && (
        <View style={styles.rowBody}>
          {item.bullets.map((bullet, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>{'\u2022'}</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface Props {
  city: City;
}

export function AwarenessAccordion({ city }: Props) {
  const items = buildItems(city);
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.headerEmoji}>⚡</Text>
        <Text style={styles.heading}>Things to be aware of</Text>
      </View>
      <View style={styles.card}>
        {items.map((item, index) => (
          <View key={item.key}>
            <AccordionRow item={item} />
            {index < items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  rowTitleGroup: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  rowPreview: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  rowBody: {
    marginTop: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bulletDot: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginRight: spacing.sm,
  },
  bulletText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.lg,
  },
});
