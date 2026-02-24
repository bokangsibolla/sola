/** Map ISO2 country code to a human-readable continent/region name */
export const CONTINENT_MAP: Record<string, string> = {
  // Southeast Asia
  TH: 'Southeast Asia', VN: 'Southeast Asia', KH: 'Southeast Asia',
  LA: 'Southeast Asia', MM: 'Southeast Asia', MY: 'Southeast Asia',
  SG: 'Southeast Asia', ID: 'Southeast Asia', PH: 'Southeast Asia',
  BN: 'Southeast Asia', TL: 'Southeast Asia',
  // East Asia
  JP: 'East Asia', KR: 'East Asia', CN: 'East Asia',
  TW: 'East Asia', MN: 'East Asia', HK: 'East Asia', MO: 'East Asia',
  // South Asia
  IN: 'South Asia', LK: 'South Asia', NP: 'South Asia',
  BD: 'South Asia', PK: 'South Asia', MV: 'South Asia', BT: 'South Asia',
  // Middle East
  AE: 'Middle East', TR: 'Middle East', IL: 'Middle East',
  JO: 'Middle East', OM: 'Middle East', QA: 'Middle East',
  SA: 'Middle East', LB: 'Middle East', BH: 'Middle East', KW: 'Middle East',
  // Europe
  PT: 'Europe', ES: 'Europe', FR: 'Europe', IT: 'Europe',
  DE: 'Europe', GB: 'Europe', NL: 'Europe', BE: 'Europe',
  AT: 'Europe', CH: 'Europe', GR: 'Europe', HR: 'Europe',
  CZ: 'Europe', PL: 'Europe', SE: 'Europe', NO: 'Europe',
  DK: 'Europe', FI: 'Europe', IE: 'Europe', HU: 'Europe',
  RO: 'Europe', BG: 'Europe', SK: 'Europe', SI: 'Europe',
  EE: 'Europe', LV: 'Europe', LT: 'Europe', IS: 'Europe',
  MT: 'Europe', CY: 'Europe', LU: 'Europe', ME: 'Europe',
  RS: 'Europe', BA: 'Europe', MK: 'Europe', AL: 'Europe',
  XK: 'Europe', MD: 'Europe', UA: 'Europe', BY: 'Europe',
  // Africa
  ZA: 'Africa', NA: 'Africa', TZ: 'Africa', KE: 'Africa',
  MA: 'Africa', EG: 'Africa', ET: 'Africa', GH: 'Africa',
  NG: 'Africa', SN: 'Africa', RW: 'Africa', UG: 'Africa',
  MZ: 'Africa', MU: 'Africa', MG: 'Africa', BW: 'Africa',
  ZM: 'Africa', ZW: 'Africa', CM: 'Africa', CI: 'Africa',
  TN: 'Africa', DZ: 'Africa', AO: 'Africa', CV: 'Africa',
  SC: 'Africa', RE: 'Africa',
  // North America
  US: 'North America', CA: 'North America', MX: 'North America',
  // Central America & Caribbean
  CR: 'Central America', PA: 'Central America', GT: 'Central America',
  BZ: 'Central America', HN: 'Central America', SV: 'Central America',
  NI: 'Central America', CU: 'Caribbean', JM: 'Caribbean',
  DO: 'Caribbean', HT: 'Caribbean', PR: 'Caribbean',
  TT: 'Caribbean', BB: 'Caribbean', BS: 'Caribbean',
  // South America
  BR: 'South America', AR: 'South America', CL: 'South America',
  CO: 'South America', PE: 'South America', EC: 'South America',
  BO: 'South America', UY: 'South America', PY: 'South America',
  VE: 'South America', GY: 'South America', SR: 'South America',
  // Oceania
  AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania', PG: 'Oceania',
  WS: 'Oceania', TO: 'Oceania', VU: 'Oceania', NC: 'Oceania',
  PF: 'Oceania',
  // Central Asia
  GE: 'Central Asia', AM: 'Central Asia', AZ: 'Central Asia',
  KZ: 'Central Asia', UZ: 'Central Asia', KG: 'Central Asia',
  TJ: 'Central Asia', TM: 'Central Asia',
};

/** Preferred continent display order */
export const CONTINENT_ORDER = [
  'Southeast Asia', 'East Asia', 'South Asia', 'Middle East',
  'Europe', 'Africa', 'North America', 'Central America', 'Caribbean',
  'South America', 'Oceania', 'Central Asia',
];

/** Get continent for an ISO2 code. Falls back to 'Other'. */
export function getContinent(iso2: string): string {
  return CONTINENT_MAP[iso2?.toUpperCase()] ?? 'Other';
}

/**
 * Group an array of ISO2 codes by continent.
 * Returns entries sorted by CONTINENT_ORDER.
 */
export function groupByContinent(
  iso2Codes: string[],
): { continent: string; countries: string[] }[] {
  const map = new Map<string, string[]>();

  for (const iso of iso2Codes) {
    const continent = getContinent(iso);
    const list = map.get(continent);
    if (list) {
      list.push(iso);
    } else {
      map.set(continent, [iso]);
    }
  }

  return CONTINENT_ORDER
    .filter((c) => map.has(c))
    .map((c) => ({ continent: c, countries: map.get(c)! }))
    .concat(
      map.has('Other') ? [{ continent: 'Other', countries: map.get('Other')! }] : [],
    );
}
