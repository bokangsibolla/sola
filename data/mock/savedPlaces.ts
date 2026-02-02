import { SavedPlace } from '../types';

const T = '2026-01-15T00:00:00Z';

export const mockSavedPlaces: SavedPlace[] = [
  { id: 'sp-1', userId: 'profile-u1', placeId: 'place-lisbon-timeout', collectionId: 'col-1', createdAt: T },
  { id: 'sp-2', userId: 'profile-u1', placeId: 'place-lisbon-fado', collectionId: 'col-1', createdAt: T },
  { id: 'sp-3', userId: 'profile-u1', placeId: 'place-lisbon-fabrica', collectionId: 'col-1', createdAt: T },
  { id: 'sp-4', userId: 'profile-u3', placeId: 'place-ubud-yoga', collectionId: null, createdAt: T },
  { id: 'sp-5', userId: 'profile-u3', placeId: 'place-ubud-purist', collectionId: 'col-3', createdAt: T },
  { id: 'sp-6', userId: 'profile-u4', placeId: 'place-cnx-punspace', collectionId: null, createdAt: T },
  { id: 'sp-7', userId: 'profile-u4', placeId: 'place-cnx-ristr8to', collectionId: null, createdAt: T },
  { id: 'sp-8', userId: 'profile-u2', placeId: 'place-kyoto-fushimi', collectionId: 'col-2', createdAt: T },
  { id: 'sp-9', userId: 'profile-u2', placeId: 'place-kyoto-arabica', collectionId: 'col-2', createdAt: T },
  { id: 'sp-10', userId: 'profile-u5', placeId: 'place-marrakech-riad', collectionId: 'col-3', createdAt: T },
  { id: 'sp-11', userId: 'profile-u5', placeId: 'place-marrakech-jardin', collectionId: null, createdAt: T },
  { id: 'sp-12', userId: 'profile-u6', placeId: 'place-tokyo-nui', collectionId: null, createdAt: T },
  { id: 'sp-13', userId: 'profile-u1', placeId: 'place-bkk-luka', collectionId: 'col-3', createdAt: T },
];
