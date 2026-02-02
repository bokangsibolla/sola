export interface Trip {
  id: string;
  userId: string;
  destination: string;
  countryIso2: string;
  arriving: string;       // ISO date
  leaving: string;        // ISO date
  nights: number;
  status: 'planned' | 'active' | 'completed';
  places: string[];       // place slugs to visit
  notes: string;
}

export const mockTrips: Trip[] = [
  {
    id: 't1',
    userId: 'me',
    destination: 'Lisbon',
    countryIso2: 'PT',
    arriving: '2026-03-15',
    leaving: '2026-03-22',
    nights: 7,
    status: 'planned',
    places: ['alfama', 'belem', 'sintra'],
    notes: 'Want to find a good fado bar',
  },
  {
    id: 't2',
    userId: 'me',
    destination: 'Kyoto',
    countryIso2: 'JP',
    arriving: '2025-11-01',
    leaving: '2025-11-10',
    nights: 9,
    status: 'completed',
    places: ['fushimi-inari', 'arashiyama', 'kinkaku-ji'],
    notes: 'Best trip ever. Autumn colors were unreal.',
  },
];
