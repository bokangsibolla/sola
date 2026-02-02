import { PlaceCategory } from '../types';

export const mockPlaceCategories: PlaceCategory[] = [
  { id: 'cat-stay', slug: 'stay', name: 'Stay', parentId: null, icon: 'bed-outline', orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-eat', slug: 'eat-drink', name: 'Eat & Drink', parentId: null, icon: 'restaurant-outline', orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-cafe', slug: 'cafe', name: 'Cafe', parentId: null, icon: 'cafe-outline', orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-activity', slug: 'activity', name: 'Activity', parentId: null, icon: 'compass-outline', orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-coworking', slug: 'coworking', name: 'Coworking', parentId: null, icon: 'laptop-outline', orderIndex: 5, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-nightlife', slug: 'nightlife', name: 'Nightlife', parentId: null, icon: 'moon-outline', orderIndex: 6, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-wellness', slug: 'wellness', name: 'Wellness', parentId: null, icon: 'leaf-outline', orderIndex: 7, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-landmark', slug: 'landmark', name: 'Landmark', parentId: null, icon: 'flag-outline', orderIndex: 8, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];
