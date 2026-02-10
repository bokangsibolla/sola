/**
 * Currency conversion and formatting utilities.
 *
 * Rates are approximate (relative to 1 USD) for display purposes only —
 * budget estimates, not transactions. Updated periodically.
 */

const RATES_FROM_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ZAR: 18.5,
  THB: 35.2,
  JPY: 154,
  AUD: 1.55,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.25,
  BRL: 4.97,
  MXN: 17.15,
  INR: 83.1,
  KRW: 1330,
  SGD: 1.34,
  NZD: 1.63,
  SEK: 10.45,
  NOK: 10.55,
  DKK: 6.88,
  PLN: 4.02,
  PHP: 56.2,
  IDR: 15650,
  MYR: 4.72,
  VND: 24500,
  KZT: 460,
};

const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  ZAR: 'R',
  THB: '\u0E3F',
  JPY: '\u00A5',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  CNY: '\u00A5',
  BRL: 'R$',
  MXN: 'Mx$',
  INR: '\u20B9',
  KRW: '\u20A9',
  SGD: 'S$',
  NZD: 'NZ$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'z\u0142',
  PHP: '\u20B1',
  IDR: 'Rp',
  MYR: 'RM',
  VND: '\u20AB',
  KZT: '\u20B8',
};

/** Map ISO 3166-1 alpha-2 country codes to ISO 4217 currency codes */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD', GB: 'GBP', AU: 'AUD', DE: 'EUR', FR: 'EUR',
  BR: 'BRL', TH: 'THB', JP: 'JPY', ES: 'EUR', IT: 'EUR',
  CA: 'CAD', CH: 'CHF', CN: 'CNY', MX: 'MXN', IN: 'INR',
  KR: 'KRW', SG: 'SGD', NZ: 'NZD', SE: 'SEK', NO: 'NOK',
  DK: 'DKK', PL: 'PLN', PH: 'PHP', ID: 'IDR', MY: 'MYR',
  VN: 'VND', ZA: 'ZAR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', KZ: 'KZT',
  // Additional common countries
  AR: 'USD', CL: 'USD', CO: 'USD', PE: 'USD', // Latin America → show USD
  NG: 'USD', KE: 'USD', GH: 'USD', // Africa → show USD
  TW: 'USD', HK: 'USD', // East Asia → show USD
  RU: 'USD', UA: 'USD', // Eastern Europe → show USD
  TR: 'EUR', EG: 'USD', MA: 'EUR', // MENA → closest major
};

export function getCurrencyForCountry(countryIso2: string): string {
  return COUNTRY_TO_CURRENCY[countryIso2.toUpperCase()] || 'USD';
}

export function convertFromUSD(amountUSD: number, toCurrency: string): number {
  const rate = RATES_FROM_USD[toCurrency] || 1;
  return Math.round(amountUSD * rate);
}

export function getSymbol(currency: string): string {
  return SYMBOLS[currency] || currency + ' ';
}

export function formatCurrency(amountUSD: number, currency: string): string {
  const converted = convertFromUSD(amountUSD, currency);
  const symbol = getSymbol(currency);
  return `${symbol}${converted.toLocaleString()}`;
}

export function formatDailyBudget(amountUSD: number, currency: string): string {
  return `~${formatCurrency(amountUSD, currency)}/day`;
}

export function getSupportedCurrencies(): Array<{ code: string; symbol: string; label: string }> {
  const CURRENCY_LABELS: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    ZAR: 'South African Rand',
    THB: 'Thai Baht',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    BRL: 'Brazilian Real',
    MXN: 'Mexican Peso',
    INR: 'Indian Rupee',
    KRW: 'Korean Won',
    SGD: 'Singapore Dollar',
    NZD: 'New Zealand Dollar',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty',
    PHP: 'Philippine Peso',
    IDR: 'Indonesian Rupiah',
    MYR: 'Malaysian Ringgit',
    VND: 'Vietnamese Dong',
    KZT: 'Kazakh Tenge',
  };

  return Object.keys(RATES_FROM_USD)
    .sort()
    .map((code) => ({
      code,
      symbol: SYMBOLS[code] || code,
      label: CURRENCY_LABELS[code] || code,
    }));
}
