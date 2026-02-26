import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/design';
import type { Country } from '@/data/types';
import type { EmergencyNumbers } from '@/data/safety';
import { BudgetBreakdown } from './BudgetBreakdown';
import { BudgetTips } from './BudgetTips';
import { QuickReference } from './QuickReference';

interface Props {
  country: Country;
  emergency: EmergencyNumbers;
}

export function CountryBudgetTab({ country, emergency }: Props) {
  return (
    <View style={styles.content}>
      {/* Budget breakdown */}
      {country.budgetBreakdown && (
        <BudgetBreakdown
          budget={country.budgetBreakdown}
          moneyMd={country.moneyMd}
          cashVsCard={country.cashVsCard}
        />
      )}

      {/* Budget tips */}
      {country.budgetTips && country.budgetTips.length > 0 && (
        <BudgetTips tips={country.budgetTips} />
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Quick reference */}
      <QuickReference country={country} emergency={emergency} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.xl,
  },
});
