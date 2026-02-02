import { Trip } from '../types';

export interface LegacyTrip {
  id: string;
  userId: string;
  destination: string;
  countryIso2: string;
  arriving: string;
  leaving: string;
  nights: number;
  status: 'planned' | 'active' | 'completed';
  places: string[];
  notes: string;
}

/** @deprecated Use mockTripsV2 instead */
export const mockTrips: LegacyTrip[] = [
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

export const mockTripsV2: Trip[] = [
  {
    id: 'trip-1',
    userId: 'profile-u1',
    destinationCityId: 'city-lisbon',
    destinationName: 'Lisbon',
    countryIso2: 'PT',
    arriving: '2026-03-15',
    leaving: '2026-03-22',
    nights: 7,
    status: 'planned',
    notes: 'Want to find a good fado bar',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'trip-2',
    userId: 'profile-u1',
    destinationCityId: 'city-kyoto',
    destinationName: 'Kyoto',
    countryIso2: 'JP',
    arriving: '2025-11-01',
    leaving: '2025-11-10',
    nights: 9,
    status: 'completed',
    notes: 'Best trip ever. Autumn colors were unreal.',
    createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'trip-3',
    userId: 'profile-u3',
    destinationCityId: 'city-ubud',
    destinationName: 'Ubud',
    countryIso2: 'ID',
    arriving: '2026-02-10',
    leaving: '2026-03-10',
    nights: 28,
    status: 'active',
    notes: 'Yoga retreat month',
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'trip-4',
    userId: 'profile-u4',
    destinationCityId: 'city-cnx',
    destinationName: 'Chiang Mai',
    countryIso2: 'TH',
    arriving: '2026-01-15',
    leaving: '2026-03-15',
    nights: 59,
    status: 'active',
    notes: 'Working remotely for two months',
    createdAt: '2025-12-20T00:00:00Z',
  },
];

export type { Trip } from '../types';
