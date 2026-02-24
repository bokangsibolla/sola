import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';
import type { City, CityArea } from '@/data/types';
import { QuickContextGrid } from './QuickContextGrid';
import { WomenShouldKnow } from './WomenShouldKnow';
import { ExperiencePillars } from './ExperiencePillars';
import { HowWomenUseCity } from './HowWomenUseCity';
import { AreaCardsRow } from './AreaCard';
import { VolunteerSection } from './VolunteerSection';
import { AwarenessAccordion } from './AwarenessAccordion';

interface OverviewTabProps {
  city: City;
  areas: CityArea[];
}

export function OverviewTab({ city, areas }: OverviewTabProps) {
  // Intro: use summary or shortBlurb
  const introText = city.summary || city.shortBlurb || null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Intro paragraph */}
      {introText && (
        <View style={styles.introSection}>
          <Text style={styles.introText} numberOfLines={4}>{introText}</Text>
        </View>
      )}

      {/* Quick context grid: solo level, budget, vibe, walkability, transit */}
      <QuickContextGrid city={city} />

      {/* Divider */}
      <View style={styles.divider} />

      {/* What brings women here (experience pillars) */}
      <ExperiencePillars city={city} />

      {/* How women use this city */}
      <HowWomenUseCity city={city} />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Neighborhoods */}
      <AreaCardsRow areas={areas} />

      {/* Volunteer opportunities */}
      <VolunteerSection cityId={city.id} />

      {/* Women should know */}
      <WomenShouldKnow city={city} />

      {/* Things to be aware of (accordion) */}
      <AwarenessAccordion city={city} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
  introSection: {
    marginBottom: spacing.xl,
  },
  introText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.xl,
  },
});
