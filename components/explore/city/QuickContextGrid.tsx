import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City } from '@/data/types';
import { mapSoloLevel } from '@/components/explore/country/mappings';
import { mapBudgetTier, mapWalkability, mapTransitEase } from './cityMappings';

interface Props {
  city: City;
}

interface CellData {
  label: string;
  value: string;
}

function buildCells(city: City): CellData[] {
  const cells: CellData[] = [];

  if (city.soloLevel) {
    cells.push({ label: 'Solo level', value: mapSoloLevel(city.soloLevel) });
  }

  if (city.budgetTier) {
    cells.push({ label: 'Budget', value: mapBudgetTier(city.budgetTier) });
  } else if (city.avgDailyBudgetUsd != null) {
    cells.push({ label: 'Avg daily budget', value: `~$${city.avgDailyBudgetUsd}/day` });
  }

  if (city.bestTimeToVisit || city.bestMonths) {
    cells.push({ label: 'Best time', value: city.bestTimeToVisit || city.bestMonths || '' });
  }

  if (city.vibe) {
    cells.push({ label: 'Vibe', value: city.vibe });
  }

  if (city.walkability) {
    cells.push({ label: 'Walkability', value: mapWalkability(city.walkability) });
  }

  if (city.transitEase) {
    cells.push({ label: 'Transit', value: mapTransitEase(city.transitEase) });
  }

  return cells;
}

function Cell({ data, isRight, isBottom }: { data: CellData; isRight: boolean; isBottom: boolean }) {
  return (
    <View style={[styles.cell, !isRight && styles.cellBorderRight, !isBottom && styles.cellBorderBottom]}>
      <Text style={styles.cellLabel}>{data.label}</Text>
      <Text style={styles.cellValue} numberOfLines={2}>{data.value}</Text>
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
      <Text style={styles.heading}>At a glance</Text>
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
    marginBottom: spacing.xl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  emptyCell: {
    flex: 1,
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(229,101,58,0.1)',
  },
  cellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,101,58,0.1)',
  },
  cellLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cellValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
