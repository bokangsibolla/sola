import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City, Country } from '@/data/types';
import type { ThreadWithAuthor } from '@/data/community/types';
import { mapSoloLevel } from '@/components/explore/country/mappings';
import { DestinationCard } from './DestinationCard';
import { VolunteerCountrySection } from './VolunteerCountrySection';
import { CommunityThreadRows } from './CommunityThreadRows';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  country: Country;
  cities: City[];
  communityData: { threads: ThreadWithAuthor[]; totalCount: number } | null;
  onSwitchTab?: (index: number) => void;
}

// -- At a glance grid -------------------------------------------------------

interface CellData {
  label: string;
  value: string;
}

function buildCells(country: Country): CellData[] {
  const cells: CellData[] = [];
  if (country.soloLevel) cells.push({ label: 'Solo level', value: mapSoloLevel(country.soloLevel) });
  if (country.avgDailyBudgetUsd) cells.push({ label: 'Daily budget', value: `~$${country.avgDailyBudgetUsd}/day` });
  if (country.bestMonths) cells.push({ label: 'Best time', value: country.bestMonths });
  if (country.vibeSummary) cells.push({ label: 'Vibe', value: country.vibeSummary });
  if (country.internetQuality) cells.push({ label: 'Internet', value: country.internetQuality.charAt(0).toUpperCase() + country.internetQuality.slice(1) });
  if (country.cashVsCard) cells.push({ label: 'Payments', value: country.cashVsCard });
  return cells;
}

function GridCell({ data, isRight, isBottom }: { data: CellData; isRight: boolean; isBottom: boolean }) {
  return (
    <View style={[cellStyles.cell, !isRight && cellStyles.borderRight, !isBottom && cellStyles.borderBottom]}>
      <Text style={cellStyles.label}>{data.label}</Text>
      <Text style={cellStyles.value} numberOfLines={2}>{data.value}</Text>
    </View>
  );
}

// -- Expandable intro -------------------------------------------------------

function IntroCallout({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 120;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={introStyles.card}>
      <View style={introStyles.accent} />
      <View style={introStyles.body}>
        <Text style={introStyles.text} numberOfLines={expanded ? undefined : 3}>
          {text}
        </Text>
        {isLong && (
          <Pressable onPress={toggle} hitSlop={8}>
            <Text style={introStyles.toggle}>
              {expanded ? 'Show less' : 'Read more'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// -- Collapsible bullet list ------------------------------------------------

const COLLAPSED_COUNT = 3;

function CollapsibleBullets({ items, variant }: { items: string[]; variant: 'warm' | 'neutral' }) {
  const [expanded, setExpanded] = useState(false);
  const needsExpand = items.length > COLLAPSED_COUNT;
  const visible = expanded ? items : items.slice(0, COLLAPSED_COUNT);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const isWarm = variant === 'warm';

  return (
    <View>
      <View style={[bulletStyles.card, bulletStyles.cardWarm]}>
        {visible.map((bullet, i) => (
          <View key={i} style={[bulletStyles.row, i < visible.length - 1 && bulletStyles.rowBorder]}>
            {isWarm ? (
              <View style={bulletStyles.dot} />
            ) : (
              <View style={bulletStyles.indexBadge}>
                <Text style={bulletStyles.indexText}>{i + 1}</Text>
              </View>
            )}
            <Text style={bulletStyles.text}>{bullet}</Text>
          </View>
        ))}
      </View>
      {needsExpand && (
        <Pressable onPress={toggle} hitSlop={8} style={bulletStyles.toggleBtn}>
          <Text style={bulletStyles.toggleText}>
            {expanded ? 'Show less' : `Show all ${items.length}`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// -- Main Component ---------------------------------------------------------

export function CountryOverviewTab({ country, cities, communityData, onSwitchTab }: Props) {

  const introText = country.introMd
    ? country.introMd.replace(/^#+\s.*/gm, '').replace(/\*\*/g, '').trim()
    : country.summaryMd?.trim() ?? null;

  const cells = buildCells(country);
  const cellRows: CellData[][] = [];
  for (let i = 0; i < cells.length; i += 2) {
    cellRows.push(cells.slice(i, i + 2));
  }

  const highlights = country.destinationHighlights ?? [];

  const soloItems = country.bestForMd
    ? country.bestForMd
        .split('\n')
        .map(l => l.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim())
        .filter(l => l.length > 0 && !l.startsWith('#'))
        .slice(0, 6)
    : [];

  const knowItems = country.mightStruggleMd
    ? country.mightStruggleMd
        .split('\n')
        .map(l => l.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim())
        .filter(l => l.length > 0 && !l.startsWith('#'))
        .slice(0, 6)
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Intro — warm callout with left accent bar */}
      {introText && <IntroCallout text={introText} />}

      {/* At a glance — warm grid */}
      {cells.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>At a glance</Text>
          <View style={cellStyles.grid}>
            {cellRows.map((row, rowIdx) => {
              const isBottomRow = rowIdx === cellRows.length - 1;
              return (
                <View key={rowIdx} style={cellStyles.row}>
                  <GridCell data={row[0]} isRight={row.length < 2} isBottom={isBottomRow} />
                  {row.length > 1 ? (
                    <GridCell data={row[1]} isRight isBottom={isBottomRow} />
                  ) : (
                    <View style={cellStyles.emptyCell} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* What brings women here */}
      {highlights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>What brings women here</Text>
          <View style={styles.pillarGrid}>
            {highlights.slice(0, 4).map((h, i) => (
              <View key={i} style={styles.pillarCell}>
                <Text style={styles.pillarTitle}>{h.label}</Text>
                <Text style={styles.pillarDesc}>{h.tagline}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Solo in [Country] — warm collapsible */}
      {soloItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Solo in {country.name}</Text>
          <CollapsibleBullets items={soloItems} variant="warm" />
        </View>
      )}

      {/* Where to go */}
      {cities.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.heading}>Where to go</Text>
            {cities.length > 3 && (
              <Pressable hitSlop={8} onPress={() => onSwitchTab?.(1)}>
                <Text style={styles.seeAll}>All {cities.length}</Text>
              </Pressable>
            )}
          </View>
          {cities.slice(0, 3).map((city, i) => (
            <DestinationCard key={city.slug} city={city} showBorder={i < 2} />
          ))}
        </View>
      )}

      {/* Good to know — warm collapsible */}
      {knowItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Good to know</Text>
          <CollapsibleBullets items={knowItems} variant="neutral" />
        </View>
      )}

      {/* Volunteer opportunities */}
      <VolunteerCountrySection countryId={country.id} countryName={country.name} />

      {/* Community threads — warm card */}
      {communityData && communityData.threads.length > 0 && (
        <View style={styles.section}>
          <CommunityThreadRows
            threads={communityData.threads}
            totalCount={communityData.totalCount}
            countryId={country.id}
            countryName={country.name}
          />
        </View>
      )}
    </ScrollView>
  );
}

// -- Intro styles -----------------------------------------------------------

const introStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  accent: {
    width: 3,
    backgroundColor: colors.orange,
  },
  body: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  toggle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.xs,
  },
});

// -- Cell styles (warm grid) ------------------------------------------------

const cellStyles = StyleSheet.create({
  grid: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyCell: {
    flex: 1,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(229,101,58,0.1)',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,101,58,0.1)',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 19,
  },
});

// -- Bullet styles ----------------------------------------------------------

const bulletStyles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  cardWarm: {
    backgroundColor: colors.orangeFill,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,101,58,0.08)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.orange,
    marginRight: spacing.sm,
    marginTop: 7,
  },
  indexBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(229,101,58,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  indexText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.orange,
    lineHeight: 14,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  toggleBtn: {
    marginTop: spacing.sm,
  },
  toggleText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});

// -- Main styles ------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
  section: { marginBottom: spacing.xl },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Experience pillars
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pillarCell: {
    width: '48%',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pillarTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  pillarDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
});
