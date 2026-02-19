import type { Place } from '../types';

/**
 * High-level category groupings for the Places tab.
 * Each maps to one or more Place['placeType'] values.
 */
export type PlaceCategoryKey =
  | 'accommodation'
  | 'tourism'
  | 'eat_drink'
  | 'nightlife'
  | 'wellness'
  | 'practical';

export interface PlaceCategoryDef {
  key: PlaceCategoryKey;
  label: string;
  emoji: string;
  placeTypes: Place['placeType'][];
}

export const PLACE_CATEGORIES: PlaceCategoryDef[] = [
  {
    key: 'accommodation',
    label: 'Stay',
    emoji: '🏠',
    placeTypes: ['hotel', 'hostel', 'homestay'],
  },
  {
    key: 'tourism',
    label: 'See & Do',
    emoji: '🎯',
    placeTypes: ['activity', 'landmark', 'tour'],
  },
  {
    key: 'eat_drink',
    label: 'Eat & Drink',
    emoji: '🍽️',
    placeTypes: ['restaurant', 'cafe', 'bakery'],
  },
  {
    key: 'nightlife',
    label: 'Nightlife',
    emoji: '🌙',
    placeTypes: ['bar', 'club', 'rooftop'],
  },
  {
    key: 'wellness',
    label: 'Wellness',
    emoji: '🧘‍♀️',
    placeTypes: ['wellness', 'spa', 'salon', 'gym'],
  },
  {
    key: 'practical',
    label: 'Practical',
    emoji: '🔑',
    placeTypes: ['coworking', 'transport', 'shop', 'laundry', 'pharmacy', 'clinic', 'hospital', 'atm', 'police'],
  },
];

/** Lookup: placeType → category key */
export const PLACE_TYPE_TO_CATEGORY: Record<Place['placeType'], PlaceCategoryKey> = {
  hotel: 'accommodation',
  hostel: 'accommodation',
  homestay: 'accommodation',
  activity: 'tourism',
  landmark: 'tourism',
  tour: 'tourism',
  restaurant: 'eat_drink',
  cafe: 'eat_drink',
  bakery: 'eat_drink',
  bar: 'nightlife',
  club: 'nightlife',
  rooftop: 'nightlife',
  wellness: 'wellness',
  spa: 'wellness',
  salon: 'wellness',
  gym: 'wellness',
  coworking: 'practical',
  transport: 'practical',
  shop: 'practical',
  laundry: 'practical',
  pharmacy: 'practical',
  clinic: 'practical',
  hospital: 'practical',
  atm: 'practical',
  police: 'practical',
};

/** Readable labels for each place type */
export const PLACE_TYPE_LABELS: Record<Place['placeType'], string> = {
  hotel: 'Hotels',
  hostel: 'Hostels',
  homestay: 'Homestays',
  activity: 'Activities',
  landmark: 'Landmarks',
  tour: 'Tours',
  restaurant: 'Restaurants',
  cafe: 'Cafes',
  bakery: 'Bakeries',
  bar: 'Bars',
  club: 'Clubs',
  rooftop: 'Rooftops',
  wellness: 'Wellness',
  spa: 'Spas',
  salon: 'Salons',
  gym: 'Gyms',
  coworking: 'Coworking',
  transport: 'Transport',
  shop: 'Shops',
  laundry: 'Laundry',
  pharmacy: 'Pharmacies',
  clinic: 'Clinics',
  hospital: 'Hospitals',
  atm: 'ATMs',
  police: 'Police',
};

/** Place with pre-joined image + area name for the Places tab */
export interface PlaceWithImage extends Place {
  imageUrl: string | null;
  areaName: string | null;
}

/** Category count for showing/hiding tabs */
export interface CategoryCount {
  key: PlaceCategoryKey;
  label: string;
  emoji: string;
  count: number;
}
