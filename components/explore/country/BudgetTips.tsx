import { StyleSheet, Text, View } from 'react-native';
import type { BudgetTip } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface BudgetTipsProps {
  tips: BudgetTip[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  accommodation: '\u{1F3E0}',
  transport: '\u{1F695}',
  food: '\u{1F37D}\uFE0F',
  activities: '\u{1F3AF}',
  general: '\u{1F4A1}',
};

function TipRow({ tip, isLast }: { tip: BudgetTip; isLast: boolean }) {
  return (
    <View style={[styles.tipRow, !isLast && styles.tipRowBorder]}>
      <Text style={styles.tipEmoji}>{CATEGORY_EMOJI[tip.category] || '\u{1F4A1}'}</Text>
      <View style={styles.tipContent}>
        <Text style={styles.tipText}>{tip.tip}</Text>
        {tip.level === 'insider' && (
          <View style={styles.insiderBadge}>
            <Text style={styles.insiderText}>INSIDER</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function BudgetTips({ tips }: BudgetTipsProps) {
  if (!tips || tips.length === 0) return null;

  const sorted = Array.from(tips).sort((a, b) => {
    if (a.level === 'essential' && b.level === 'insider') return -1;
    if (a.level === 'insider' && b.level === 'essential') return 1;
    return 0;
  });

  const saveTips = sorted.filter(t => t.type === 'save');
  const skimpTips = sorted.filter(t => t.type === 'dont_skimp');

  return (
    <View style={styles.section}>
      {saveTips.length > 0 && (
        <>
          <Text style={styles.groupTitle}>How to save</Text>
          <View style={styles.card}>
            {saveTips.map((t, i) => (
              <TipRow key={`save-${i}`} tip={t} isLast={i === saveTips.length - 1} />
            ))}
          </View>
        </>
      )}

      {skimpTips.length > 0 && (
        <>
          <Text style={[styles.groupTitle, saveTips.length > 0 && { marginTop: spacing.xl }]}>
            {"Don\u2019t cheap out on"}
          </Text>
          <View style={styles.card}>
            {skimpTips.map((t, i) => (
              <TipRow key={`skimp-${i}`} tip={t} isLast={i === skimpTips.length - 1} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  groupTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tipRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tipEmoji: {
    fontSize: 16,
    marginRight: spacing.md,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  insiderBadge: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  insiderText: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
    color: colors.orange,
    letterSpacing: 0.5,
  },
});
