import { PlaceSignal } from '../types';

const T = '2026-01-15T00:00:00Z';

export const mockPlaceSignals: PlaceSignal[] = [
  { id: 'ps-1', userId: 'profile-u1', placeId: 'place-lisbon-timeout', signalType: 'liked', rating: null, note: null, createdAt: T },
  { id: 'ps-2', userId: 'profile-u1', placeId: 'place-lisbon-fado', signalType: 'visited', rating: 5, note: 'Best night of the trip', createdAt: T },
  { id: 'ps-3', userId: 'profile-u1', placeId: 'place-lisbon-fabrica', signalType: 'liked', rating: null, note: null, createdAt: T },
  { id: 'ps-4', userId: 'profile-u3', placeId: 'place-ubud-yoga', signalType: 'visited', rating: 5, note: null, createdAt: T },
  { id: 'ps-5', userId: 'profile-u3', placeId: 'place-ubud-seniman', signalType: 'liked', rating: null, note: null, createdAt: T },
  { id: 'ps-6', userId: 'profile-u4', placeId: 'place-cnx-punspace', signalType: 'visited', rating: 4, note: 'Great wifi, good community', createdAt: T },
  { id: 'ps-7', userId: 'profile-u4', placeId: 'place-cnx-ristr8to', signalType: 'liked', rating: null, note: null, createdAt: T },
  { id: 'ps-8', userId: 'profile-u4', placeId: 'place-cnx-khao', signalType: 'visited', rating: 5, note: 'The best khao soi', createdAt: T },
  { id: 'ps-9', userId: 'profile-u2', placeId: 'place-kyoto-fushimi', signalType: 'visited', rating: 5, note: 'Go at dawn!', createdAt: T },
  { id: 'ps-10', userId: 'profile-u2', placeId: 'place-kyoto-arabica', signalType: 'liked', rating: null, note: null, createdAt: T },
  { id: 'ps-11', userId: 'profile-u6', placeId: 'place-tokyo-nui', signalType: 'visited', rating: 4, note: null, createdAt: T },
  { id: 'ps-12', userId: 'profile-u6', placeId: 'place-tokyo-tsukiji', signalType: 'liked', rating: null, note: null, createdAt: T },
  { id: 'ps-13', userId: 'profile-u5', placeId: 'place-marrakech-jardin', signalType: 'visited', rating: 4, note: null, createdAt: T },
];
