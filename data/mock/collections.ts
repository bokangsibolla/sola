import { Collection } from '../types';

export interface LegacyCollection {
  id: string;
  name: string;
  emoji: string;
  placeIds: string[];
  createdAt: string;
}

/** @deprecated Use mockCollectionsV2 instead */
export const mockCollections: LegacyCollection[] = [
  {
    id: 'col1',
    name: 'Lisbon eats',
    emoji: '🍜',
    placeIds: ['e1', 'e2'],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'col2',
    name: 'Japan temples',
    emoji: '⛩️',
    placeIds: ['p4', 'p5'],
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'col3',
    name: 'Dream stays',
    emoji: '🛏️',
    placeIds: ['s1', 's3', 's4'],
    createdAt: '2026-01-20T10:00:00Z',
  },
];

export const mockCollectionsV2: Collection[] = [
  {
    id: 'col-1',
    userId: 'profile-u1',
    name: 'Lisbon eats',
    emoji: '🍜',
    isPublic: true,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'col-2',
    userId: 'profile-u2',
    name: 'Japan temples',
    emoji: '⛩️',
    isPublic: true,
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'col-3',
    userId: 'profile-u5',
    name: 'Dream stays',
    emoji: '🛏️',
    isPublic: false,
    createdAt: '2026-01-20T10:00:00Z',
  },
];

export type { Collection } from '../types';
