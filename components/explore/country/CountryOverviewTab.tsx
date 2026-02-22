import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City, Country } from '@/data/types';
import type { ThreadWithAuthor } from '@/data/community/types';
import { mapSoloLevel } from '@/components/explore/country/mappings';
import { CityHorizontalCard } from './CityHorizontalCard';
import { CommunityThreadRows } from './CommunityThreadRows';

interface Props {
  country: Country;
  cities: City[];
  communityData: { threads: ThreadWithAuthor[]; totalCount: number } | null;
}

// -- Quick Context Grid (matches city's QuickContextGrid) -----------------

interface CellData {
  emoji: string;
  label: string;
  value: string;
}

function buildCells(country: Country): CellData[] {
  const cells: CellData[] = [];
  if (country.soloLevel) cells.push({ emoji: '\u{1F6E1}\uFE0F', label: 'Solo level', value: mapSoloLevel(country.soloLevel) });
  if (country.avgDailyBudgetUsd) cells.push({ emoji: '\u{1F4B0}', label: 'Daily budget', value: `~$${country.avgDailyBudgetUsd}/day` });
  if (country.bestMonths) cells.push({ emoji: '\u{1F4C5}', label: 'Best time', value: country.bestMonths });
  if (country.vibeSummary) cells.push({ emoji: '\u2728', label: 'Vibe', value: country.vibeSummary });
  if (country.internetQuality) cells.push({ emoji: '\u{1F4F6}', label: 'Internet', value: country.internetQuality.charAt(0).toUpperCase() + country.internetQuality.slice(1) });
  if (country.cashVsCard) cells.push({ emoji: '\u{1F4B3}', label: 'Payments', value: country.cashVsCard });
  return cells;
}

function GridCell({ data, isRight, isBottom }: { data: CellData; isRight: boolean; isBottom: boolean }) {
  return (
    <View style={[cellStyles.cell, !isRight && cellStyles.borderRight, !isBottom && cellStyles.borderBottom]}>
      <Text style={cellStyles.emoji}>{data.emoji}</Text>
      <Text style={cellStyles.label}>{data.label}</Text>
      <Text style={cellStyles.value} numberOfLines={2}>{data.value}</Text>
    </View>
  );
}

// -- Main Component -------------------------------------------------------

export function CountryOverviewTab({ country, cities, communityData }: Props) {
  const router = useRouter();

  const introText = country.introMd
    ? country.introMd.replace(/^#+\s.*/gm, '').replace(/\*\*/g, '').trim()
    : country.summaryMd?.trim() ?? null;

  const cells = buildCells(country);
  const cellRows: CellData[][] = [];
  for (let i = 0; i < cells.length; i += 2) {
    cellRows.push(cells.slice(i, i + 2));
  }

  // Build "highlights" as experience pillars style
  const highlights = country.destinationHighlights ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Intro */}
      {introText && (
        <View style={styles.introSection}>
          <Text style={styles.introText}>{introText}</Text>
        </View>
      )}

      {/* At a glance grid -- matches city's QuickContextGrid */}
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

      {/* Divider */}
      <View style={styles.divider} />

      {/* What brings women here -- orangeFill cards like city's ExperiencePillars */}
      {highlights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>What brings women here</Text>
          <View style={styles.pillarGrid}>
            {highlights.slice(0, 4).map((h, i) => (
              <View key={i} style={styles.pillarCell}>
                <View style={styles.accentDot} />
                <Text style={styles.pillarTitle}>{h.label}</Text>
                <Text style={styles.pillarDesc}>{h.tagline}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Solo in [Country] -- orangeFill bullet card like city's HowWomenUseCity */}
      {country.bestForMd && (
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.headerEmoji}>{'\u{1F9ED}'}</Text>
            <Text style={styles.heading}>Solo in {country.name}</Text>
          </View>
          <View style={styles.bulletCard}>
            {country.bestForMd
              .split('\n')
              .map(l => l.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim())
              .filter(l => l.length > 0 && !l.startsWith('#'))
              .slice(0, 5)
              .map((bullet, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Cities -- horizontal scroll */}
      {cities.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.heading}>Cities</Text>
            {cities.length > 3 && (
              <Pressable hitSlop={8} onPress={() => {
                router.push({
                  pathname: '/(tabs)/discover/country/cities' as any,
                  params: { countryId: country.id, countryName: country.name, countrySlug: country.slug },
                });
              }}>
                <Text style={styles.seeAll}>All {cities.length} cities</Text>
              </Pressable>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            style={styles.horizontalScrollOuter}
          >
            {cities.map((city) => (
              <CityHorizontalCard key={city.slug} city={city} compact />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Women should know -- numbered list like city's WomenShouldKnow */}
      {country.mightStruggleMd && (
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.headerEmoji}>{'\u{1F4A1}'}</Text>
            <Text style={styles.heading}>Good to know</Text>
          </View>
          <View style={styles.numberedCard}>
            {country.mightStruggleMd
              .split('\n')
              .map(l => l.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim())
              .filter(l => l.length > 0 && !l.startsWith('#'))
              .slice(0, 5)
              .map((bullet, i) => (
                <View key={i} style={[styles.numberedRow, i < 4 && styles.numberedBorder]}>
                  <Text style={styles.numberedIdx}>{i + 1}</Text>
                  <Text style={styles.numberedText}>{bullet}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Community threads */}
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

// -- Cell styles (matches city QuickContextGrid exactly) ------------------

const cellStyles = StyleSheet.create({
  grid: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  emptyCell: {
    flex: 1,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  emoji: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});

// -- Main styles ----------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
  introSection: { marginBottom: spacing.xl },
  introText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23,
  },
  section: { marginBottom: spacing.xxl },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.xl,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Experience pillars (matches city ExperiencePillars)
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pillarCell: {
    width: '48%',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
    marginBottom: spacing.sm,
  },
  pillarTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  pillarDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xs,
  },

  // orangeFill bullet card (matches city HowWomenUseCity)
  bulletCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
    marginRight: spacing.sm,
    marginTop: 8,
  },
  bulletText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    flex: 1,
  },

  // Numbered card (matches city WomenShouldKnow)
  numberedCard: {
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  numberedRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-start',
  },
  numberedBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  numberedIdx: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
    width: 22,
    lineHeight: 22,
  },
  numberedText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },

  // Horizontal scroll
  horizontalScrollOuter: {
    marginHorizontal: -spacing.screenX,
    paddingLeft: spacing.screenX,
  },
  horizontalScroll: {
    paddingRight: spacing.screenX,
    paddingLeft: spacing.screenX,
  },
});
