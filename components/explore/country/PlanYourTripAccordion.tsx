import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Country, PlaceWithCity } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { BudgetBreakdown } from './BudgetBreakdown';
import { PlaceHorizontalCard } from './PlaceHorizontalCard';
import { StructuredContent } from './StructuredContent';
import { extractLeadSentence } from './mappings';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItem {
  key: string;
  title: string;
  preview: string;
  content: string;
  showBudget?: boolean;
  places?: PlaceWithCity[];
  placesLabel?: string;
}

interface Props {
  country: Country;
  healthPlaces?: PlaceWithCity[];
}

function buildItems(country: Country, healthPlaces?: PlaceWithCity[]): AccordionItem[] {
  const items: AccordionItem[] = [];

  if (country.gettingThereMd) {
    items.push({
      key: 'getting-there',
      title: 'Getting there',
      preview: extractLeadSentence(country.gettingThereMd),
      content: country.gettingThereMd,
    });
  }

  if (country.soloInfrastructureMd) {
    items.push({
      key: 'getting-around',
      title: 'Getting around',
      preview: country.transportSummary || extractLeadSentence(country.soloInfrastructureMd),
      content: country.soloInfrastructureMd,
    });
  }

  if (country.simConnectivityMd) {
    items.push({
      key: 'internet',
      title: 'Internet & connectivity',
      preview: extractLeadSentence(country.simConnectivityMd),
      content: country.simConnectivityMd,
    });
  }

  if (country.moneyMd) {
    items.push({
      key: 'money',
      title: 'Money & payments',
      preview: extractLeadSentence(country.moneyMd),
      content: country.moneyMd,
      showBudget: !!country.budgetBreakdown,
    });
  }

  if (country.healthAccessMd) {
    items.push({
      key: 'health',
      title: 'Health & wellbeing',
      preview: extractLeadSentence(country.healthAccessMd),
      content: country.healthAccessMd,
      places: healthPlaces,
      placesLabel: 'Find nearby',
    });
  }

  if (country.safetyWomenMd) {
    items.push({
      key: 'safety',
      title: 'Safety for women',
      preview: extractLeadSentence(country.safetyWomenMd),
      content: country.safetyWomenMd,
    });
  }

  const cultureContent = country.cultureEtiquetteMd || country.culturalNote;
  if (cultureContent) {
    items.push({
      key: 'culture',
      title: 'Culture & social norms',
      preview: country.culturalNote || extractLeadSentence(cultureContent),
      content: cultureContent,
    });
  }

  if (country.legalContextMd) {
    items.push({
      key: 'legal',
      title: 'Legal context',
      preview: extractLeadSentence(country.legalContextMd),
      content: country.legalContextMd,
    });
  }

  return items;
}

function AccordionRow({ item, country }: { item: AccordionItem; country: Country }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

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
          <StructuredContent markdown={item.content} maxItems={6} />

          {item.showBudget && country.budgetBreakdown && (
            <View style={styles.budgetInline}>
              <BudgetBreakdown budget={country.budgetBreakdown} headless />
            </View>
          )}

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

export function PlanYourTripAccordion({ country, healthPlaces }: Props) {
  const items = buildItems(country, healthPlaces);

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Plan your trip</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <View key={item.key}>
            <AccordionRow item={item} country={country} />
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
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
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
  budgetInline: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  placesContainer: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.lg,
    paddingLeft: spacing.lg,
  },
  placesLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.lg,
  },
});
