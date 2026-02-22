import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City } from '@/data/types';
import { mapSoloLevel } from '@/components/explore/country/mappings';
import { mapBudgetTier, mapWalkability, mapTransitEase } from './cityMappings';

interface Props {
  city: City;
}

interface CellData {
  emoji: string;
  label: string;
  value: string;
}

function buildCells(city: City): CellData[] {
  const cells: CellData[] = [];

  if (city.soloLevel) {
    cells.push({ emoji: '🛡️', label: 'Solo level', value: mapSoloLevel(city.soloLevel) });
  }

  if (city.budgetTier) {
    cells.push({ emoji: '💰', label: 'Budget', value: mapBudgetTier(city.budgetTier) });
  } else if (city.avgDailyBudgetUsd != null) {
    cells.push({ emoji: '💰', label: 'Avg daily budget', value: `~$${city.avgDailyBudgetUsd}/day` });
  }

  if (city.bestTimeToVisit || city.bestMonths) {
    cells.push({ emoji: '📅', label: 'Best time', value: city.bestTimeToVisit || city.bestMonths || '' });
  }

  if (city.vibe) {
    cells.push({ emoji: '✨', label: 'Vibe', value: city.vibe });
  }

  if (city.walkability) {
    cells.push({ emoji: '🚶‍♀️', label: 'Walkability', value: mapWalkability(city.walkability) });
  }

  if (city.transitEase) {
    cells.push({ emoji: '🚇', label: 'Transit', value: mapTransitEase(city.transitEase) });
  }

  return cells;
}

function Cell({ data, isRight, isBottom }: { data: CellData; isRight: boolean; isBottom: boolean }) {
  return (
    <View style={[styles.cell, !isRight && styles.cellBorderRight, !isBottom && styles.cellBorderBottom]}>
      <SolaText style={styles.cellEmoji}>{data.emoji}</SolaText>
      <SolaText style={styles.cellLabel}>{data.label}</SolaText>
      <SolaText style={styles.cellValue} numberOfLines={2}>{data.value}</SolaText>
    </View>
  );
}

export function QuickContextGrid({ city }: Props) {
  const cells = buildCells(city);
  if (cells.length === 0) return null;

  const rows: CellData[][] = [];
  for (let i = 0; i < cells.length; i += 2) {
    rows.push(cells.slice(i, i + 2));
  }

  return (
    <View style={styles.section}>
      <SolaText style={styles.heading}>At a glance</SolaText>
      <View style={styles.grid}>
        {rows.map((row, rowIdx) => {
          const isBottomRow = rowIdx === rows.length - 1;
          return (
            <View key={rowIdx} style={styles.row}>
              <Cell data={row[0]} isRight={row.length < 2} isBottom={isBottomRow} />
              {row.length > 1 ? (
                <Cell data={row[1]} isRight isBottom={isBottomRow} />
              ) : (
                <View style={styles.emptyCell} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
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
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  cellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  cellEmoji: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  cellLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cellValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
