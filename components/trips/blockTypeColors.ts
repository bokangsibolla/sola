import type { Place } from '@/data/types';

/** Colored dot for each place type — used in DayOverviewCard and trip planning views */
export const TYPE_DOT_COLOR: Partial<Record<Place['placeType'], string>> = {
  landmark: '#3B82F6',
  activity: '#2D8A4E',
  tour: '#8B5CF6',
  restaurant: '#D4940A',
  cafe: '#D4940A',
  bar: '#D4940A',
  rooftop: '#D4940A',
  hotel: '#E5653A',
  hostel: '#E5653A',
  homestay: '#E5653A',
  wellness: '#8B5CF6',
  spa: '#8B5CF6',
};

/** Human-readable label for each place type */
export const TYPE_LABEL: Partial<Record<Place['placeType'], string>> = {
  landmark: 'Landmark',
  activity: 'Activity',
  tour: 'Tour',
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  bar: 'Bar',
  rooftop: 'Rooftop',
  hotel: 'Stay',
  hostel: 'Stay',
  homestay: 'Stay',
  wellness: 'Wellness',
  spa: 'Spa',
  bakery: 'Bakery',
};
