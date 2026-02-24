import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Country } from '@/data/types';
import type { PlaceWithCity } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { PlaceHorizontalCard } from './PlaceHorizontalCard';
import { extractLeadSentence } from './mappings';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItem {
  key: string;
  title: string;
  preview: string;
  content: string;
  places?: PlaceWithCity[];
  placesLabel?: string;
}

interface Props {
  country: Country;
  healthPlaces?: PlaceWithCity[];
}

function buildItems(country: Country, healthPlaces?: PlaceWithCity[]): AccordionItem[] {
  const items: AccordionItem[] = [];

  // Getting around
  const transportContent = country.soloInfrastructureMd;
  if (transportContent) {
    items.push({
      key: 'transport',
      title: 'Getting around',
      preview: country.transportSummary || extractLeadSentence(transportContent),
      content: transportContent,
    });
  }

  // Health & safety
  const healthContent = country.healthAccessMd;
  if (healthContent) {
    items.push({
      key: 'health',
      title: 'Health & safety',
      preview: extractLeadSentence(healthContent),
      content: healthContent,
      places: healthPlaces,
      placesLabel: 'Nearby facilities',
    });
  }

  // Culture & etiquette
  const cultureContent = country.cultureEtiquetteMd || country.sovereigntyMd;
  if (cultureContent) {
    items.push({
      key: 'culture',
      title: 'Culture & etiquette',
      preview: country.culturalNote || extractLeadSentence(cultureContent),
      content: cultureContent,
    });
  }

  // Safety for women
  if (country.safetyWomenMd) {
    items.push({
      key: 'safety',
      title: 'Safety for women',
      preview: extractLeadSentence(country.safetyWomenMd),
      content: country.safetyWomenMd,
    });
  }

  return items;
}

function cleanMarkdown(md: string): string {
  return md
    .replace(/^#+\s.*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitParagraphs(md: string): string[] {
  const cleaned = cleanMarkdown(md);
  return cleaned
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.length > 0);
}

function AccordionRow({ item }: { item: AccordionItem }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const paragraphs = splitParagraphs(item.content);
  const hasPlaces = item.places && item.places.length > 0;

  return (
    <View style={styles.row}>
      <Pressable onPress={toggle} style={styles.rowHeader} hitSlop={4}>
        <View style={styles.rowTitleGroup}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          {!expanded && (
            <Text style={styles.rowPreview} numberOfLines={1}>
              {item.preview}
            </Text>
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
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))}

          {hasPlaces && (
            <View style={styles.placesContainer}>
              {item.placesLabel && (
                <Text style={styles.placesLabel}>{item.placesLabel}</Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {item.places!.map((place) => (
                  <PlaceHorizontalCard key={place.id} place={place} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function KnowBeforeYouGoAccordion({ country, healthPlaces }: Props) {
  const items = buildItems(country, healthPlaces);

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Know before you go</Text>
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
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xxl,
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
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  placesContainer: {
    marginTop: spacing.sm,
    marginHorizontal: -spacing.lg,
    paddingLeft: spacing.lg,
  },
  placesLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(229,101,58,0.08)',
    marginHorizontal: spacing.lg,
  },
});
