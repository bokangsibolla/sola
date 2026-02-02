import { TagGroup, Tag } from '../types';

export const mockTagGroups: TagGroup[] = [
  { id: 'tg-vibe', slug: 'vibe', label: 'Vibe', scope: 'global', orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tg-goodfor', slug: 'good-for', label: 'Good for', scope: 'global', orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tg-safety', slug: 'safety-comfort', label: 'Safety & comfort', scope: 'global', orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tg-amenity', slug: 'amenities', label: 'Amenities', scope: 'global', orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];

export const mockTags: Tag[] = [
  // Vibe
  { id: 'tag-chill', tagGroupId: 'tg-vibe', slug: 'chill', label: 'Chill', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-lively', tagGroupId: 'tg-vibe', slug: 'lively', label: 'Lively', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-quiet', tagGroupId: 'tg-vibe', slug: 'quiet', label: 'Quiet', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-aesthetic', tagGroupId: 'tg-vibe', slug: 'aesthetic', label: 'Aesthetic', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-local', tagGroupId: 'tg-vibe', slug: 'local-feel', label: 'Local feel', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 5, isActive: true, createdAt: '2026-01-01T00:00:00Z' },

  // Good for
  { id: 'tag-solo', tagGroupId: 'tg-goodfor', slug: 'solo-friendly', label: 'Solo-friendly', filterGroup: 'good_for', scope: 'global', tagType: 'place', icon: null, orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-workcafe', tagGroupId: 'tg-goodfor', slug: 'work-friendly', label: 'Work-friendly', filterGroup: 'good_for', scope: 'global', tagType: 'place', icon: null, orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-social', tagGroupId: 'tg-goodfor', slug: 'meeting-people', label: 'Meeting people', filterGroup: 'good_for', scope: 'global', tagType: 'place', icon: null, orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-datenight', tagGroupId: 'tg-goodfor', slug: 'date-night', label: 'Date night', filterGroup: 'good_for', scope: 'global', tagType: 'place', icon: null, orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },

  // Safety & comfort
  { id: 'tag-womenonly', tagGroupId: 'tg-safety', slug: 'women-only-option', label: 'Women-only option', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-welllit', tagGroupId: 'tg-safety', slug: 'well-lit-at-night', label: 'Well-lit at night', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-staffhelpful', tagGroupId: 'tg-safety', slug: 'helpful-staff', label: 'Helpful staff', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-lockers', tagGroupId: 'tg-safety', slug: 'lockers-available', label: 'Lockers available', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },

  // Amenities
  { id: 'tag-wifi', tagGroupId: 'tg-amenity', slug: 'fast-wifi', label: 'Fast wifi', filterGroup: 'amenity', scope: 'global', tagType: 'place', icon: null, orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-ac', tagGroupId: 'tg-amenity', slug: 'ac', label: 'A/C', filterGroup: 'amenity', scope: 'global', tagType: 'place', icon: null, orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-pool', tagGroupId: 'tg-amenity', slug: 'pool', label: 'Pool', filterGroup: 'amenity', scope: 'global', tagType: 'place', icon: null, orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-poweroutlets', tagGroupId: 'tg-amenity', slug: 'power-outlets', label: 'Power outlets', filterGroup: 'amenity', scope: 'global', tagType: 'place', icon: null, orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-breakfast', tagGroupId: 'tg-amenity', slug: 'breakfast-included', label: 'Breakfast included', filterGroup: 'amenity', scope: 'global', tagType: 'place', icon: null, orderIndex: 5, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];
