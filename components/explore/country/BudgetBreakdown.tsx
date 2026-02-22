import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import type { BudgetBreakdown as BudgetBreakdownType } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { extractLeadSentence } from './mappings';

interface Props {
  budget: BudgetBreakdownType;
  moneyMd?: string | null;
  cashVsCard?: string | null;
}

interface RowData {
  emoji: string;
  label: string;
  range: string;
  note: string;
}

function buildRows(budget: BudgetBreakdownType): RowData[] {
  return [
    {
      emoji: '\u{1F3E0}',
      label: 'Accommodation',
      range: `$${budget.accommodation.low}\u2013$${budget.accommodation.high}/night`,
      note: budget.accommodation.note,
    },
    {
      emoji: '\u{1F37D}\uFE0F',
      label: 'Food & Drink',
      range: `$${budget.food.low}\u2013$${budget.food.high}/day`,
      note: budget.food.note,
    },
    {
      emoji: '\u{1F695}',
      label: 'Transport',
      range: `$${budget.transport.low}\u2013$${budget.transport.high}/day`,
      note: budget.transport.note,
    },
    {
      emoji: '\u{1F3AF}',
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
      <View style={styles.rowLeft}>
        <SolaText style={styles.emoji}>{data.emoji}</SolaText>
        <View style={styles.rowText}>
          <View style={styles.rowTopLine}>
            <SolaText style={styles.rowLabel}>{data.label}</SolaText>
            <SolaText style={styles.rowRange}>{data.range}</SolaText>
          </View>
          <SolaText style={styles.rowNote}>{data.note}</SolaText>
        </View>
      </View>
    </View>
  );
}

export function BudgetBreakdown({ budget, moneyMd, cashVsCard }: Props) {
  const rows = buildRows(budget);
  const total = computeDailyTotal(budget);

  const moneyTip = cashVsCard
    || (moneyMd ? extractLeadSentence(moneyMd) : null);

  return (
    <View style={styles.section}>
      <SolaText style={styles.heading}>Budget</SolaText>

      {/* Daily total summary */}
      <View style={styles.summaryBar}>
        <SolaText style={styles.summaryLabel}>Daily budget</SolaText>
        <SolaText style={styles.summaryAmount}>${total.low}\u2013${total.high}</SolaText>
      </View>

      {/* Category rows */}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <BudgetRow key={row.label} data={row} isLast={index === rows.length - 1} />
        ))}
      </View>

      {/* Money tip */}
      {moneyTip && (
        <View style={styles.tipRow}>
          <SolaText style={styles.tipEmoji}>{'\u{1F4A1}'}</SolaText>
          <SolaText style={styles.tipText}>{moneyTip}</SolaText>
        </View>
      )}

      {/* Currency footer */}
      <SolaText style={styles.currencyNote}>
        Prices in {budget.accommodation.currency || 'USD'}
      </SolaText>
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

  // Daily total summary
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
  },
  summaryAmount: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },

  // Category card
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 18,
    marginRight: spacing.md,
    marginTop: 1,
  },
  rowText: {
    flex: 1,
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
    marginTop: spacing.xs,
  },

  // Money tip
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  tipEmoji: {
    fontSize: 14,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Currency footer
  currencyNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'right',
  },
});
