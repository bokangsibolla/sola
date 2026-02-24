import { StyleSheet, Text, View } from 'react-native';
import type { BudgetBreakdown as BudgetBreakdownType } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { extractLeadSentence } from './mappings';

interface Props {
  budget: BudgetBreakdownType;
  moneyMd?: string | null;
  cashVsCard?: string | null;
  /** When true, hide the heading and section wrapper — used for inline embedding. */
  headless?: boolean;
}

interface RowData {
  label: string;
  range: string;
  note: string;
}

function buildRows(budget: BudgetBreakdownType): RowData[] {
  return [
    {
      label: 'Accommodation',
      range: `$${budget.accommodation.low}\u2013$${budget.accommodation.high}/night`,
      note: budget.accommodation.note,
    },
    {
      label: 'Food & Drink',
      range: `$${budget.food.low}\u2013$${budget.food.high}/day`,
      note: budget.food.note,
    },
    {
      label: 'Transport',
      range: `$${budget.transport.low}\u2013$${budget.transport.high}/day`,
      note: budget.transport.note,
    },
    {
      label: 'Activities',
      range: `$${budget.activities.low}\u2013$${budget.activities.high}`,
      note: budget.activities.note,
    },
  ];
}

function computeDailyTotal(budget: BudgetBreakdownType): { low: number; high: number } {
  return {
    low: budget.accommodation.low + budget.food.low + budget.transport.low + budget.activities.low,
    high: budget.accommodation.high + budget.food.high + budget.transport.high + budget.activities.high,
  };
}

function BudgetRow({ data, isLast }: { data: RowData; isLast: boolean }) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowTopLine}>
        <Text style={styles.rowLabel}>{data.label}</Text>
        <Text style={styles.rowRange}>{data.range}</Text>
      </View>
      <Text style={styles.rowNote}>{data.note}</Text>
    </View>
  );
}

export function BudgetBreakdown({ budget, moneyMd, cashVsCard, headless }: Props) {
  const rows = buildRows(budget);
  const total = computeDailyTotal(budget);

  const moneyTip = cashVsCard
    || (moneyMd ? extractLeadSentence(moneyMd) : null);

  return (
    <View style={headless ? undefined : styles.section}>
      {!headless && <Text style={styles.heading}>Budget</Text>}

      {/* Daily total — warm highlight */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Daily budget</Text>
        <Text style={styles.summaryAmount}>{`$${total.low}\u2013$${total.high}`}</Text>
      </View>

      {/* Category rows */}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <BudgetRow key={row.label} data={row} isLast={index === rows.length - 1} />
        ))}
      </View>

      {/* Money tip — warm callout */}
      {!headless && moneyTip && (
        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>Tip</Text>
          <Text style={styles.tipText}>{moneyTip}</Text>
        </View>
      )}

      {/* Currency footer */}
      <Text style={styles.currencyNote}>
        Prices in {budget.accommodation.currency || 'USD'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Daily total — warm highlight card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  summaryAmount: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.orange,
  },

  // Category card
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowTopLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  rowRange: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  rowNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },

  // Money tip — warm callout
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tipLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.orange,
    marginRight: spacing.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },

  // Currency footer
  currencyNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
