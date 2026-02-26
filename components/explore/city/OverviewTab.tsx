import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
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
    <View style={styles.content}>
      {/* Intro callout */}
      {introText && (
        <View style={styles.introCard}>
          <View style={styles.introAccent} />
          <View style={styles.introBody}>
            <Text style={styles.introText} numberOfLines={4}>{introText}</Text>
          </View>
        </View>
      )}

      {/* Quick context grid: solo level, budget, vibe, walkability, transit */}
      <QuickContextGrid city={city} />

      {/* What brings women here (experience pillars) */}
      <ExperiencePillars city={city} />

      {/* How women use this city */}
      <HowWomenUseCity city={city} />

      {/* Neighborhoods */}
      <AreaCardsRow areas={areas} />

      {/* Volunteer opportunities */}
      <VolunteerSection cityId={city.id} />

      {/* Women should know */}
      <WomenShouldKnow city={city} />

      {/* Things to be aware of (accordion) */}
      <AwarenessAccordion city={city} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
  introCard: {
    flexDirection: 'row',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  introAccent: {
    width: 3,
    backgroundColor: colors.orange,
  },
  introBody: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  introText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
