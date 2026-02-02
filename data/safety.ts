export interface EmergencyNumbers {
  police: string;
  ambulance: string;
  fire: string;
  general?: string;
}

export interface SafetyInfo {
  emergencyNumbers: EmergencyNumbers;
  embassyNote: string;
  walkability: string;
  transitNote: string;
}

export const emergencyNumbersByCountry: Record<string, EmergencyNumbers> = {
  // Europe
  AT: { police: '133', ambulance: '144', fire: '122', general: '112' },
  BE: { police: '101', ambulance: '112', fire: '112', general: '112' },
  CZ: { police: '158', ambulance: '155', fire: '150', general: '112' },
  DE: { police: '110', ambulance: '112', fire: '112', general: '112' },
  DK: { police: '112', ambulance: '112', fire: '112', general: '112' },
  ES: { police: '091', ambulance: '112', fire: '112', general: '112' },
  FI: { police: '112', ambulance: '112', fire: '112', general: '112' },
  FR: { police: '17', ambulance: '15', fire: '18', general: '112' },
  GB: { police: '999', ambulance: '999', fire: '999', general: '112' },
  GR: { police: '100', ambulance: '166', fire: '199', general: '112' },
  HR: { police: '192', ambulance: '194', fire: '193', general: '112' },
  HU: { police: '107', ambulance: '104', fire: '105', general: '112' },
  IE: { police: '999', ambulance: '999', fire: '999', general: '112' },
  IT: { police: '113', ambulance: '118', fire: '115', general: '112' },
  NL: { police: '112', ambulance: '112', fire: '112', general: '112' },
  NO: { police: '112', ambulance: '113', fire: '110' },
  PL: { police: '997', ambulance: '999', fire: '998', general: '112' },
  PT: { police: '112', ambulance: '112', fire: '112', general: '112' },
  RO: { police: '112', ambulance: '112', fire: '112', general: '112' },
  SE: { police: '112', ambulance: '112', fire: '112', general: '112' },
  CH: { police: '117', ambulance: '144', fire: '118' },

  // Asia
  CN: { police: '110', ambulance: '120', fire: '119' },
  ID: { police: '110', ambulance: '118', fire: '113' },
  IN: { police: '100', ambulance: '102', fire: '101', general: '112' },
  JP: { police: '110', ambulance: '119', fire: '119' },
  KR: { police: '112', ambulance: '119', fire: '119' },
  MY: { police: '999', ambulance: '999', fire: '994' },
  PH: { police: '117', ambulance: '911', fire: '911', general: '911' },
  SG: { police: '999', ambulance: '995', fire: '995' },
  TH: { police: '191', ambulance: '1669', fire: '199' },
  VN: { police: '113', ambulance: '115', fire: '114' },

  // Americas
  AR: { police: '101', ambulance: '107', fire: '100', general: '911' },
  BR: { police: '190', ambulance: '192', fire: '193' },
  CA: { police: '911', ambulance: '911', fire: '911', general: '911' },
  CL: { police: '133', ambulance: '131', fire: '132' },
  CO: { police: '112', ambulance: '125', fire: '119', general: '123' },
  MX: { police: '911', ambulance: '911', fire: '911', general: '911' },
  PE: { police: '105', ambulance: '116', fire: '116' },
  US: { police: '911', ambulance: '911', fire: '911', general: '911' },

  // Africa
  EG: { police: '122', ambulance: '123', fire: '180' },
  KE: { police: '999', ambulance: '999', fire: '999' },
  MA: { police: '19', ambulance: '15', fire: '15' },
  NG: { police: '112', ambulance: '112', fire: '112' },
  ZA: { police: '10111', ambulance: '10177', fire: '10111' },
  TZ: { police: '112', ambulance: '114', fire: '114' },

  // Oceania
  AU: { police: '000', ambulance: '000', fire: '000', general: '112' },
  NZ: { police: '111', ambulance: '111', fire: '111' },

  // Middle East
  AE: { police: '999', ambulance: '998', fire: '997' },
  IL: { police: '100', ambulance: '101', fire: '102' },
  JO: { police: '911', ambulance: '911', fire: '911' },
  TR: { police: '155', ambulance: '112', fire: '110', general: '112' },
};

export const defaultEmergency: EmergencyNumbers = {
  police: '112',
  ambulance: '112',
  fire: '112',
  general: '112',
};

export function getEmergencyNumbers(countryIso2: string): EmergencyNumbers {
  return emergencyNumbersByCountry[countryIso2] ?? defaultEmergency;
}

export const embassyLookupUrl = 'https://embassy-finder.com';
