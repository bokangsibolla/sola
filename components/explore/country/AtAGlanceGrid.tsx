import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import type { Country } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { mapSoloLevel } from './mappings';

interface Props {
  country: Country;
}

interface CellData {
  label: string;
  value: string;
}

function buildCells(country: Country): CellData[] {
  const cells: CellData[] = [];

  if (country.soloLevel) {
    cells.push({ label: 'Solo level', value: mapSoloLevel(country.soloLevel) });
  }

  if (country.avgDailyBudgetUsd != null) {
    cells.push({ label: 'Avg daily budget', value: `~$${country.avgDailyBudgetUsd}/day` });
  }

  if (country.internetQuality) {
    const internetMap: Record<string, string> = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
    };
    cells.push({ label: 'Internet', value: internetMap[country.internetQuality] ?? country.internetQuality });
  }

  if (country.cashVsCard) {
    cells.push({ label: 'Cash vs card', value: country.cashVsCard });
  }

  if (country.plugType) {
    cells.push({ label: 'Plug type', value: country.plugType });
  }

  if (country.bestMonths) {
    cells.push({ label: 'Best months', value: country.bestMonths });
  }

  return cells;
}

function Cell({
  data,
  isRight,
  isBottom,
}: {
  data: CellData;
  isRight: boolean;
  isBottom: boolean;
}) {
  return (
    <View
      style={[
        styles.cell,
        !isRight && styles.cellBorderRight,
        !isBottom && styles.cellBorderBottom,
      ]}
    >
      <SolaText style={styles.cellLabel}>{data.label}</SolaText>
      <SolaText style={styles.cellValue} numberOfLines={2}>{data.value}</SolaText>
    </View>
  );
}

export function AtAGlanceGrid({ country }: Props) {
  const cells = buildCells(country);

  if (cells.length === 0) return null;

  // Build rows of 2
  const rows: CellData[][] = [];
  for (let i = 0; i < cells.length; i += 2) {
    rows.push(cells.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {rows.map((row, rowIdx) => {
          const isBottomRow = rowIdx === rows.length - 1;
          return (
            <View key={rowIdx} style={styles.row}>
              <Cell data={row[0]} isRight={row.length < 2} isBottom={isBottomRow} />
              {row.length > 1 ? (
                <Cell data={row[1]} isRight={true} isBottom={isBottomRow} />
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
  container: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xl,
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
  cellLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cellValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
