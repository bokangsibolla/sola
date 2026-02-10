import { usePreferences } from '@/state/PreferencesContext';
import { convertFromUSD, getSymbol, formatCurrency, formatDailyBudget } from '@/lib/currency';

export function useCurrency() {
  const { currency, setCurrency } = usePreferences();
  const symbol = getSymbol(currency);

  return {
    currency,
    symbol,
    setCurrency,
    format: (usdAmount: number) => formatCurrency(usdAmount, currency),
    formatDaily: (usdAmount: number) => formatDailyBudget(usdAmount, currency),
    convert: (usdAmount: number) => convertFromUSD(usdAmount, currency),
  };
}
