export interface Collection {
  id: string;
  name: string;
  emoji: string;
  placeIds: string[];     // IDs from guide PlaceEntry
  createdAt: string;
}

export const mockCollections: Collection[] = [
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
