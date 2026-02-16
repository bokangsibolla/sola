import { StyleSheet, Text, View } from 'react-native';
import type { BudgetBreakdown as BudgetBreakdownType } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface Props {
  budget: BudgetBreakdownType;
  /** When true, renders without section heading/margin — for inline use inside accordions */
  headless?: boolean;
}

interface CellData {
  label: string;
  range: string;
  note: string;
}

function buildCells(budget: BudgetBreakdownType): CellData[] {
  return [
    {
      label: 'Stay',
      range: `$${budget.accommodation.low}\u2013$${budget.accommodation.high}/night`,
      note: budget.accommodation.note,
    },
    {
      label: 'Eat',
      range: `$${budget.food.low}\u2013$${budget.food.high}/day`,
      note: budget.food.note,
    },
    {
      label: 'Get around',
      range: `$${budget.transport.low}\u2013$${budget.transport.high}/day`,
      note: budget.transport.note,
    },
    {
      label: 'Do things',
      range: `$${budget.activities.low}\u2013$${budget.activities.high}`,
      note: budget.activities.note,
    },
  ];
}

function Cell({ data, isRight, isBottom }: { data: CellData; isRight: boolean; isBottom: boolean }) {
  return (
    <View
      style={[
        styles.cell,
        !isRight && styles.cellBorderRight,
        !isBottom && styles.cellBorderBottom,
      ]}
    >
      <Text style={styles.cellLabel}>{data.label}</Text>
      <Text style={styles.cellRange}>{data.range}</Text>
      <Text style={styles.cellNote} numberOfLines={1}>{data.note}</Text>
    </View>
  );
}

export function BudgetBreakdown({ budget, headless }: Props) {
  const cells = buildCells(budget);

  if (headless) {
    return (
      <View style={styles.grid}>
        <View style={styles.row}>
          <Cell data={cells[0]} isRight={false} isBottom={false} />
          <Cell data={cells[1]} isRight={true} isBottom={false} />
        </View>
        <View style={styles.row}>
          <Cell data={cells[2]} isRight={false} isBottom={true} />
          <Cell data={cells[3]} isRight={true} isBottom={true} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Budget</Text>
      <View style={styles.grid}>
        <View style={styles.row}>
          <Cell data={cells[0]} isRight={false} isBottom={false} />
          <Cell data={cells[1]} isRight={true} isBottom={false} />
        </View>
        <View style={styles.row}>
          <Cell data={cells[2]} isRight={false} isBottom={true} />
          <Cell data={cells[3]} isRight={true} isBottom={true} />
        </View>
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
  cellRange: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  cellNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});
