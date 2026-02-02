# Sola Frontend Rebuild — Structured Mock Data + Complete Screens

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild every post-login screen so it consumes mock data structured exactly like the Supabase schema. When we later connect Supabase, the swap is data-source only — no screen rewrites. Every screen should be fully navigable, tappable, and feel like a real product with SEA-focused content.

**Architecture:** All mock data lives in `data/mock/` as typed arrays that mirror Supabase tables 1:1. A thin `data/api.ts` layer exposes query-like functions (e.g., `getPlacesByCity(cityId)`) that screens call. Screens never import mock arrays directly — they always go through the API layer. This means swapping to Supabase later = rewrite `data/api.ts` only.

**Tech Stack:** Expo 54, React Native 0.81, expo-router 6, existing design system (`constants/design.ts`, `AppScreen`, `AppHeader`), Ionicons.

**Scope:** Frontend only, all mock data, SEA focus (Thailand, Vietnam, Indonesia, Philippines, Japan, Portugal — the 3 existing + 3 new). One screen at a time, each fully working before moving to the next.

---

## What exists vs what we build

### Current state (prototype)
- Flat mock data that doesn't match Supabase schema
- Place/city/country data tangled in a single `guides.ts` blob
- No tags, signals, areas, or verification concepts
- No save functionality
- Profile edit and settings are stubs
- DMs don't persist (component state only)
- Trips can't be edited or have places attached

### Target state (this plan)
- Mock data structured as normalized tables matching Supabase schema exactly
- API layer that screens consume (future Supabase swap point)
- Every screen fully functional with mock data
- Save/unsave places works (in-memory state)
- Tags and signals visible on place cards
- Verification badges shown where appropriate
- City areas (neighborhoods) browsable
- Profile edit works
- Settings are editable
- Trips have date pickers and attached places
- DMs persist in mock store during session

---

## Conventions

- **Commit after every task** (not every step)
- **Files use the existing design system** — `AppScreen`, `AppHeader`, design tokens from `constants/design.ts`
- **No new npm packages** unless absolutely necessary
- **TypeScript strict** — all data typed, no `any`
- **SEA content** — Thailand, Vietnam, Indonesia, Philippines as primary launch countries. Keep existing Portugal/Japan/Morocco as secondary.

---

## Task 1: Structured mock data — types and schema-aligned arrays

**Goal:** Replace all existing mock data with normalized tables that mirror the Supabase schema. This is the foundation everything else builds on.

**Files:**
- Create: `data/types.ts` (all Supabase-aligned types)
- Create: `data/mock/countries.ts`
- Create: `data/mock/cities.ts`
- Create: `data/mock/cityAreas.ts`
- Create: `data/mock/placeCategories.ts`
- Create: `data/mock/places.ts`
- Create: `data/mock/placeMedia.ts`
- Create: `data/mock/tags.ts`
- Create: `data/mock/placeTags.ts`
- Create: `data/mock/placeSignals.ts`
- Create: `data/mock/profiles.ts`
- Create: `data/mock/savedPlaces.ts`
- Create: `data/mock/geoContent.ts`
- Modify: `data/mock/trips.ts` (restructure to match schema)
- Modify: `data/mock/messages.ts` (keep as-is, add types)
- Modify: `data/mock/collections.ts` (restructure)
- Delete: `data/mock/users.ts` (replaced by profiles.ts)
- Delete: `data/mock/guides.ts` (replaced by normalized tables)
- Update: `data/mock/index.ts` (re-export new structure)

**Step 1: Create `data/types.ts`**

All types mirror Supabase columns exactly. Use `string` for UUIDs (will be real UUIDs from Supabase later).

```typescript
// === GEOGRAPHY ===

export interface Country {
  id: string;
  slug: string;
  name: string;
  iso2: string;
  iso3: string | null;
  currencyCode: string | null;
  isActive: boolean;
  orderIndex: number;
  heroImageUrl: string | null;   // for display (from geo_content or editorial)
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  countryId: string;
  slug: string;
  name: string;
  timezone: string;
  centerLat: number | null;
  centerLng: number | null;
  isActive: boolean;
  orderIndex: number;
  heroImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CityArea {
  id: string;
  cityId: string;
  slug: string;
  name: string;
  areaKind: 'neighborhood' | 'beach' | 'island' | 'district';
  isPrimary: boolean;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// === PLACES ===

export interface PlaceCategory {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  icon: string | null;       // Ionicon name
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface Place {
  id: string;
  cityId: string;
  cityAreaId: string | null;
  slug: string;
  name: string;
  placeType: 'hotel' | 'hostel' | 'restaurant' | 'cafe' | 'bar' | 'activity' | 'coworking' | 'landmark' | 'transport' | 'shop';
  primaryCategoryId: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  googlePlaceId: string | null;
  phone: string | null;
  website: string | null;
  priceLevel: number | null;  // 1-4
  hoursText: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceMedia {
  id: string;
  placeId: string;
  url: string;
  mediaType: 'image' | 'video';
  caption: string | null;
  source: 'editorial' | 'google' | 'user';
  orderIndex: number;
  createdAt: string;
}

// === TAGS & SIGNALS ===

export interface TagGroup {
  id: string;
  slug: string;
  label: string;
  scope: 'global' | 'city' | 'country';
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface Tag {
  id: string;
  tagGroupId: string | null;
  slug: string;
  label: string;
  filterGroup: 'vibe' | 'good_for' | 'amenity' | 'safety' | 'cuisine' | 'style';
  scope: 'global';
  tagType: 'place' | 'profile';
  icon: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface PlaceTag {
  placeId: string;
  tagId: string;
  weight: number;
  source: 'editorial' | 'model' | 'user';
  createdAt: string;
}

export interface PlaceSignal {
  id: string;
  userId: string | null;
  placeId: string;
  signalType: 'liked' | 'disliked' | 'visited' | 'rated' | 'hidden';
  rating: number | null;   // 1-5
  note: string | null;
  createdAt: string;
}

// === USERS ===

export interface Profile {
  id: string;
  username: string | null;
  firstName: string;
  bio: string | null;
  avatarUrl: string | null;
  homeCountryIso2: string;
  homeCountryName: string;
  homeCityId: string | null;
  currentCityId: string | null;
  currentCityName: string | null;
  interests: string[];          // tag slugs for now, will be profile_tags join
  travelStyle: string | null;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPlace {
  id: string;
  userId: string;
  placeId: string;
  collectionId: string | null;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  isPublic: boolean;
  createdAt: string;
}

// === GEO CONTENT ===

export interface GeoContent {
  id: string;
  scope: 'country' | 'city';
  countryId: string | null;
  cityId: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  contentMd: string | null;
  heroImageUrl: string | null;
  safetyRating: 'very_safe' | 'generally_safe' | 'use_caution' | 'exercise_caution';
  soloFriendly: boolean;
  bestMonths: string | null;
  currency: string | null;
  language: string | null;
  visaNote: string | null;
  highlights: string[];
  updatedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// === TRIPS ===

export interface Trip {
  id: string;
  userId: string;
  destinationCityId: string;
  destinationName: string;
  countryIso2: string;
  arriving: string;
  leaving: string;
  nights: number;
  status: 'planned' | 'active' | 'completed';
  notes: string | null;
  createdAt: string;
}

export interface TripPlace {
  tripId: string;
  placeId: string;
  dayNumber: number | null;
  notes: string | null;
}

// === MESSAGES ===

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
  readAt: string | null;
}
```

**Step 2: Create `data/mock/countries.ts`**

SEA focus: Thailand, Vietnam, Indonesia, Philippines + existing Portugal, Japan, Morocco.

```typescript
import { Country } from '../types';

export const mockCountries: Country[] = [
  {
    id: 'country-th',
    slug: 'thailand',
    name: 'Thailand',
    iso2: 'TH',
    iso3: 'THA',
    currencyCode: 'THB',
    isActive: true,
    orderIndex: 1,
    heroImageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'country-vn',
    slug: 'vietnam',
    name: 'Vietnam',
    iso2: 'VN',
    iso3: 'VNM',
    currencyCode: 'VND',
    isActive: true,
    orderIndex: 2,
    heroImageUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'country-id',
    slug: 'indonesia',
    name: 'Indonesia',
    iso2: 'ID',
    iso3: 'IDN',
    currencyCode: 'IDR',
    isActive: true,
    orderIndex: 3,
    heroImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'country-ph',
    slug: 'philippines',
    name: 'Philippines',
    iso2: 'PH',
    iso3: 'PHL',
    currencyCode: 'PHP',
    isActive: true,
    orderIndex: 4,
    heroImageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'country-jp',
    slug: 'japan',
    name: 'Japan',
    iso2: 'JP',
    iso3: 'JPN',
    currencyCode: 'JPY',
    isActive: true,
    orderIndex: 5,
    heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'country-pt',
    slug: 'portugal',
    name: 'Portugal',
    iso2: 'PT',
    iso3: 'PRT',
    currencyCode: 'EUR',
    isActive: true,
    orderIndex: 6,
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'country-ma',
    slug: 'morocco',
    name: 'Morocco',
    iso2: 'MA',
    iso3: 'MAR',
    currencyCode: 'MAD',
    isActive: true,
    orderIndex: 7,
    heroImageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];
```

**Step 3: Create `data/mock/cities.ts`**

5-8 cities per SEA country, 3-5 for secondary countries. Roughly 35-40 cities total.

```typescript
import { City } from '../types';

export const mockCities: City[] = [
  // === THAILAND ===
  { id: 'city-bkk', countryId: 'country-th', slug: 'bangkok', name: 'Bangkok', timezone: 'Asia/Bangkok', centerLat: 13.7563, centerLng: 100.5018, isActive: true, orderIndex: 1, heroImageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-cnx', countryId: 'country-th', slug: 'chiang-mai', name: 'Chiang Mai', timezone: 'Asia/Bangkok', centerLat: 18.7883, centerLng: 98.9853, isActive: true, orderIndex: 2, heroImageUrl: 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-krabi', countryId: 'country-th', slug: 'krabi', name: 'Krabi', timezone: 'Asia/Bangkok', centerLat: 8.0863, centerLng: 98.9063, isActive: true, orderIndex: 3, heroImageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-pai', countryId: 'country-th', slug: 'pai', name: 'Pai', timezone: 'Asia/Bangkok', centerLat: 19.3622, centerLng: 98.4408, isActive: true, orderIndex: 4, heroImageUrl: 'https://images.unsplash.com/photo-1600807746364-b5e97b5d2878?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-kpg', countryId: 'country-th', slug: 'koh-phangan', name: 'Koh Phangan', timezone: 'Asia/Bangkok', centerLat: 9.7319, centerLng: 100.0136, isActive: true, orderIndex: 5, heroImageUrl: 'https://images.unsplash.com/photo-1504699750789-ed60a1013dcc?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // === VIETNAM ===
  { id: 'city-hcm', countryId: 'country-vn', slug: 'ho-chi-minh', name: 'Ho Chi Minh City', timezone: 'Asia/Ho_Chi_Minh', centerLat: 10.8231, centerLng: 106.6297, isActive: true, orderIndex: 1, heroImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-hn', countryId: 'country-vn', slug: 'hanoi', name: 'Hanoi', timezone: 'Asia/Ho_Chi_Minh', centerLat: 21.0278, centerLng: 105.8342, isActive: true, orderIndex: 2, heroImageUrl: 'https://images.unsplash.com/photo-1509030450996-dd1a26613e7e?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-hoi', countryId: 'country-vn', slug: 'hoi-an', name: 'Hoi An', timezone: 'Asia/Ho_Chi_Minh', centerLat: 15.8801, centerLng: 108.3380, isActive: true, orderIndex: 3, heroImageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-dn', countryId: 'country-vn', slug: 'da-nang', name: 'Da Nang', timezone: 'Asia/Ho_Chi_Minh', centerLat: 16.0544, centerLng: 108.2022, isActive: true, orderIndex: 4, heroImageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-dl', countryId: 'country-vn', slug: 'da-lat', name: 'Da Lat', timezone: 'Asia/Ho_Chi_Minh', centerLat: 11.9404, centerLng: 108.4583, isActive: true, orderIndex: 5, heroImageUrl: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // === INDONESIA ===
  { id: 'city-ubud', countryId: 'country-id', slug: 'ubud', name: 'Ubud', timezone: 'Asia/Makassar', centerLat: -8.5069, centerLng: 115.2625, isActive: true, orderIndex: 1, heroImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-canggu', countryId: 'country-id', slug: 'canggu', name: 'Canggu', timezone: 'Asia/Makassar', centerLat: -8.6478, centerLng: 115.1385, isActive: true, orderIndex: 2, heroImageUrl: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-sem', countryId: 'country-id', slug: 'seminyak', name: 'Seminyak', timezone: 'Asia/Makassar', centerLat: -8.6913, centerLng: 115.1682, isActive: true, orderIndex: 3, heroImageUrl: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-yog', countryId: 'country-id', slug: 'yogyakarta', name: 'Yogyakarta', timezone: 'Asia/Jakarta', centerLat: -7.7956, centerLng: 110.3695, isActive: true, orderIndex: 4, heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-gili', countryId: 'country-id', slug: 'gili-islands', name: 'Gili Islands', timezone: 'Asia/Makassar', centerLat: -8.3500, centerLng: 116.0400, isActive: true, orderIndex: 5, heroImageUrl: 'https://images.unsplash.com/photo-1570789210967-2cac24261719?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // === PHILIPPINES ===
  { id: 'city-elnido', countryId: 'country-ph', slug: 'el-nido', name: 'El Nido', timezone: 'Asia/Manila', centerLat: 11.1784, centerLng: 119.3930, isActive: true, orderIndex: 1, heroImageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-siargao', countryId: 'country-ph', slug: 'siargao', name: 'Siargao', timezone: 'Asia/Manila', centerLat: 9.8482, centerLng: 126.0458, isActive: true, orderIndex: 2, heroImageUrl: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-cebu', countryId: 'country-ph', slug: 'cebu', name: 'Cebu', timezone: 'Asia/Manila', centerLat: 10.3157, centerLng: 123.8854, isActive: true, orderIndex: 3, heroImageUrl: 'https://images.unsplash.com/photo-1505245208761-ba872912fac0?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-manila', countryId: 'country-ph', slug: 'manila', name: 'Manila', timezone: 'Asia/Manila', centerLat: 14.5995, centerLng: 120.9842, isActive: true, orderIndex: 4, heroImageUrl: 'https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-bohol', countryId: 'country-ph', slug: 'bohol', name: 'Bohol', timezone: 'Asia/Manila', centerLat: 9.8500, centerLng: 124.0000, isActive: true, orderIndex: 5, heroImageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // === JAPAN ===
  { id: 'city-tokyo', countryId: 'country-jp', slug: 'tokyo', name: 'Tokyo', timezone: 'Asia/Tokyo', centerLat: 35.6762, centerLng: 139.6503, isActive: true, orderIndex: 1, heroImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-kyoto', countryId: 'country-jp', slug: 'kyoto', name: 'Kyoto', timezone: 'Asia/Tokyo', centerLat: 35.0116, centerLng: 135.7681, isActive: true, orderIndex: 2, heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-osaka', countryId: 'country-jp', slug: 'osaka', name: 'Osaka', timezone: 'Asia/Tokyo', centerLat: 34.6937, centerLng: 135.5023, isActive: true, orderIndex: 3, heroImageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // === PORTUGAL ===
  { id: 'city-lisbon', countryId: 'country-pt', slug: 'lisbon', name: 'Lisbon', timezone: 'Europe/Lisbon', centerLat: 38.7223, centerLng: -9.1393, isActive: true, orderIndex: 1, heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-porto', countryId: 'country-pt', slug: 'porto', name: 'Porto', timezone: 'Europe/Lisbon', centerLat: 41.1579, centerLng: -8.6291, isActive: true, orderIndex: 2, heroImageUrl: 'https://images.unsplash.com/photo-1557093793-e196ae071479?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // === MOROCCO ===
  { id: 'city-marrakech', countryId: 'country-ma', slug: 'marrakech', name: 'Marrakech', timezone: 'Africa/Casablanca', centerLat: 31.6295, centerLng: -7.9811, isActive: true, orderIndex: 1, heroImageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-fes', countryId: 'country-ma', slug: 'fes', name: 'Fes', timezone: 'Africa/Casablanca', centerLat: 34.0181, centerLng: -5.0078, isActive: true, orderIndex: 2, heroImageUrl: 'https://images.unsplash.com/photo-1560095633-6858b0185311?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'city-chefchaouen', countryId: 'country-ma', slug: 'chefchaouen', name: 'Chefchaouen', timezone: 'Africa/Casablanca', centerLat: 35.1688, centerLng: -5.2636, isActive: true, orderIndex: 3, heroImageUrl: 'https://images.unsplash.com/photo-1553244695-ee04dba3fc50?w=800', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];
```

**Step 4: Create `data/mock/cityAreas.ts`**

3-5 neighborhoods per major city. Focus on areas that matter for solo women travelers (safe neighborhoods, walkable areas, social hostels zone, etc.).

Create areas for at least: Bangkok, Chiang Mai, Ubud, Canggu, Hoi An, El Nido, Lisbon, Marrakech. Use real neighborhood names.

Example structure (implementer fills in all):
```typescript
import { CityArea } from '../types';

export const mockCityAreas: CityArea[] = [
  // Bangkok
  { id: 'area-bkk-silom', cityId: 'city-bkk', slug: 'silom', name: 'Silom', areaKind: 'district', isPrimary: false, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-bkk-sukhumvit', cityId: 'city-bkk', slug: 'sukhumvit', name: 'Sukhumvit', areaKind: 'district', isPrimary: true, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-bkk-rattanakosin', cityId: 'city-bkk', slug: 'rattanakosin', name: 'Rattanakosin (Old Town)', areaKind: 'district', isPrimary: false, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-bkk-khao-san', cityId: 'city-bkk', slug: 'khao-san', name: 'Khao San', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 4, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  // ... Chiang Mai, Ubud, Canggu, Hoi An, etc.
];
```

**Step 5: Create `data/mock/tags.ts`**

Tags and tag groups for the Sola system. These power filtering, recommendations, and the "why this fits" explanations.

```typescript
import { TagGroup, Tag } from '../types';

export const mockTagGroups: TagGroup[] = [
  { id: 'tg-vibe', slug: 'vibe', label: 'Vibe', scope: 'global', orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tg-good-for', slug: 'good-for', label: 'Good for', scope: 'global', orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tg-safety', slug: 'safety-comfort', label: 'Safety & comfort', scope: 'global', orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tg-amenity', slug: 'amenity', label: 'Amenities', scope: 'global', orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];

export const mockTags: Tag[] = [
  // Vibe
  { id: 'tag-quiet', tagGroupId: 'tg-vibe', slug: 'quiet', label: 'Quiet', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-social', tagGroupId: 'tg-vibe', slug: 'social', label: 'Social', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-cozy', tagGroupId: 'tg-vibe', slug: 'cozy', label: 'Cozy', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-lively', tagGroupId: 'tg-vibe', slug: 'lively', label: 'Lively', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-local', tagGroupId: 'tg-vibe', slug: 'local-feel', label: 'Local feel', filterGroup: 'vibe', scope: 'global', tagType: 'place', icon: null, orderIndex: 5, isActive: true, createdAt: '2026-01-01T00:00:00Z' },

  // Good for
  { id: 'tag-solo', tagGroupId: 'tg-good-for', slug: 'solo-friendly', label: 'Solo-friendly', filterGroup: 'good_for', scope: 'global', tagType: 'place', icon: null, orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-remote-work', tagGroupId: 'tg-good-for', slug: 'remote-work', label: 'Remote work', filterGroup: 'good_for', scope: 'global', tagType: 'place', icon: null, orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-first-timer', tagGroupId: 'tg-good-for', slug: 'first-timer', label: 'First-time traveler', filterGroup: 'good_for', scope: 'global', tagType: 'place', icon: null, orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-long-stay', tagGroupId: 'tg-good-for', slug: 'long-stay', label: 'Long stays', filterGroup: 'good_for', scope: 'global', tagType: 'place', icon: null, orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },

  // Safety & comfort
  { id: 'tag-well-lit', tagGroupId: 'tg-safety', slug: 'well-lit', label: 'Well-lit at night', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-walkable', tagGroupId: 'tg-safety', slug: 'walkable', label: 'Walkable', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-women-only', tagGroupId: 'tg-safety', slug: 'women-only-option', label: 'Women-only option', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-staff-helpful', tagGroupId: 'tg-safety', slug: 'staff-helpful', label: 'Helpful staff', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-safe-late', tagGroupId: 'tg-safety', slug: 'safe-late-night', label: 'Safe at night', filterGroup: 'safety', scope: 'global', tagType: 'place', icon: null, orderIndex: 5, isActive: true, createdAt: '2026-01-01T00:00:00Z' },

  // Amenities
  { id: 'tag-wifi', tagGroupId: 'tg-amenity', slug: 'fast-wifi', label: 'Fast wifi', filterGroup: 'amenity', scope: 'global', tagType: 'place', icon: null, orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-ac', tagGroupId: 'tg-amenity', slug: 'air-conditioning', label: 'A/C', filterGroup: 'amenity', scope: 'global', tagType: 'place', icon: null, orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-pool', tagGroupId: 'tg-amenity', slug: 'pool', label: 'Pool', filterGroup: 'amenity', scope: 'global', tagType: 'place', icon: null, orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];
```

**Step 6: Create `data/mock/placeCategories.ts`**

```typescript
import { PlaceCategory } from '../types';

export const mockPlaceCategories: PlaceCategory[] = [
  { id: 'cat-stay', slug: 'stay', name: 'Stay', parentId: null, icon: 'bed-outline', orderIndex: 1, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-eat', slug: 'eat-drink', name: 'Eat & Drink', parentId: null, icon: 'restaurant-outline', orderIndex: 2, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-cafe', slug: 'cafe', name: 'Cafe', parentId: 'cat-eat', icon: 'cafe-outline', orderIndex: 3, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-activity', slug: 'activity', name: 'Activity', parentId: null, icon: 'compass-outline', orderIndex: 4, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-cowork', slug: 'coworking', name: 'Coworking', parentId: null, icon: 'laptop-outline', orderIndex: 5, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-nightlife', slug: 'nightlife', name: 'Nightlife', parentId: null, icon: 'moon-outline', orderIndex: 6, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-wellness', slug: 'wellness', name: 'Wellness', parentId: null, icon: 'leaf-outline', orderIndex: 7, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-landmark', slug: 'landmark', name: 'Landmark', parentId: null, icon: 'location-outline', orderIndex: 8, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];
```

**Step 7: Create `data/mock/places.ts`**

At least 5-8 places per major city. Mix of stays, cafes, restaurants, activities. Focus on places real solo women travelers actually go to in SEA.

The implementer should create ~60-80 places total across all cities, with realistic names, descriptions, and price levels. Each place gets tags and at least one image.

Example structure for Bangkok:
```typescript
import { Place } from '../types';

export const mockPlaces: Place[] = [
  // Bangkok - Stays
  {
    id: 'place-bkk-luka', cityId: 'city-bkk', cityAreaId: 'area-bkk-silom', slug: 'luka-hostel-bangkok',
    name: 'Luka Hostel', placeType: 'hostel', primaryCategoryId: 'cat-stay',
    lat: 13.7276, lng: 100.5250, address: '17/8-9 Silom Soi 2, Silom, Bangkok',
    googlePlaceId: null, phone: '+66 2 634 7999', website: 'https://lukahostel.com',
    priceLevel: 1, hoursText: '24h reception', description: 'Clean, well-run hostel in the heart of Silom. Women-only dorm available. Rooftop bar with great views. Walking distance to BTS.',
    isActive: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  // ... 60-80 more places across all cities
];
```

**Step 8: Create `data/mock/placeTags.ts` and `data/mock/placeMedia.ts`**

Link tags to places. At least 2-4 tags per place. Create 1-2 media entries per place.

**Step 9: Create `data/mock/placeSignals.ts`**

A few signal entries for demonstration (liked, visited, rated).

**Step 10: Create `data/mock/profiles.ts`**

Replace `users.ts`. 6 profiles that reference real city IDs and tag slugs.

**Step 11: Create `data/mock/geoContent.ts`**

Editorial content for each country and each major city. This powers the country guide and city guide pages. Includes safety ratings, best months, currency, language, visa notes, highlights.

**Step 12: Restructure `data/mock/trips.ts`**

Use the new Trip and TripPlace types. Reference real city IDs and place IDs.

**Step 13: Restructure `data/mock/collections.ts`**

Use the new Collection type. Reference real place IDs.

**Step 14: Update `data/mock/index.ts`**

Re-export all new data.

**Step 15: Delete `data/mock/users.ts` and `data/mock/guides.ts`**

**Step 16: Commit**

```bash
git add data/types.ts data/mock/
git commit -m "feat: restructure mock data to match Supabase schema (normalized tables)"
```

---

## Task 2: API layer — query functions that screens consume

**Goal:** Create `data/api.ts` with typed functions that look like Supabase queries but read from mock data. Screens import from here only — never from mock directly.

**Files:**
- Create: `data/api.ts`

**Step 1: Create `data/api.ts`**

```typescript
import { mockCountries } from './mock/countries';
import { mockCities } from './mock/cities';
import { mockCityAreas } from './mock/cityAreas';
import { mockPlaces } from './mock/places';
import { mockPlaceMedia } from './mock/placeMedia';
import { mockPlaceCategories } from './mock/placeCategories';
import { mockTags, mockTagGroups } from './mock/tags';
import { mockPlaceTags } from './mock/placeTags';
import { mockProfiles } from './mock/profiles';
import { mockGeoContent } from './mock/geoContent';
import { mockTrips } from './mock/trips';
import { mockCollections } from './mock/collections';
import { mockConversations, mockMessages } from './mock/messages';
import { mockSavedPlaces } from './mock/savedPlaces';
import type * as T from './types';

// === GEOGRAPHY ===

export function getCountries(): T.Country[] {
  return mockCountries.filter(c => c.isActive).sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getCountryBySlug(slug: string): T.Country | undefined {
  return mockCountries.find(c => c.slug === slug);
}

export function getCountryByIso2(iso2: string): T.Country | undefined {
  return mockCountries.find(c => c.iso2 === iso2);
}

export function getCitiesByCountry(countryId: string): T.City[] {
  return mockCities.filter(c => c.countryId === countryId && c.isActive).sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getCityBySlug(slug: string): T.City | undefined {
  return mockCities.find(c => c.slug === slug);
}

export function getCityById(id: string): T.City | undefined {
  return mockCities.find(c => c.id === id);
}

export function getAreasByCity(cityId: string): T.CityArea[] {
  return mockCityAreas.filter(a => a.cityId === cityId && a.isActive).sort((a, b) => a.orderIndex - b.orderIndex);
}

// === PLACES ===

export function getPlacesByCity(cityId: string): T.Place[] {
  return mockPlaces.filter(p => p.cityId === cityId && p.isActive);
}

export function getPlacesByCityAndType(cityId: string, placeType: string): T.Place[] {
  return mockPlaces.filter(p => p.cityId === cityId && p.placeType === placeType && p.isActive);
}

export function getPlacesByArea(cityAreaId: string): T.Place[] {
  return mockPlaces.filter(p => p.cityAreaId === cityAreaId && p.isActive);
}

export function getPlaceById(id: string): T.Place | undefined {
  return mockPlaces.find(p => p.id === id);
}

export function getPlaceBySlug(slug: string): T.Place | undefined {
  return mockPlaces.find(p => p.slug === slug);
}

export function getPlaceMedia(placeId: string): T.PlaceMedia[] {
  return mockPlaceMedia.filter(m => m.placeId === placeId).sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getPlaceFirstImage(placeId: string): string | null {
  const media = mockPlaceMedia.find(m => m.placeId === placeId && m.mediaType === 'image');
  return media?.url ?? null;
}

export function getPlaceTags(placeId: string): T.Tag[] {
  const tagIds = mockPlaceTags.filter(pt => pt.placeId === placeId).map(pt => pt.tagId);
  return mockTags.filter(t => tagIds.includes(t.id));
}

export function getCategory(categoryId: string): T.PlaceCategory | undefined {
  return mockPlaceCategories.find(c => c.id === categoryId);
}

export function getCategories(): T.PlaceCategory[] {
  return mockPlaceCategories.filter(c => c.isActive).sort((a, b) => a.orderIndex - b.orderIndex);
}

// === GEO CONTENT ===

export function getCountryContent(countryId: string): T.GeoContent | undefined {
  return mockGeoContent.find(g => g.scope === 'country' && g.countryId === countryId);
}

export function getCityContent(cityId: string): T.GeoContent | undefined {
  return mockGeoContent.find(g => g.scope === 'city' && g.cityId === cityId);
}

// === PROFILES ===

export function getProfiles(): T.Profile[] {
  return mockProfiles;
}

export function getProfileById(id: string): T.Profile | undefined {
  return mockProfiles.find(p => p.id === id);
}

// === SAVED PLACES (mutable in-memory) ===

let savedPlaces = [...mockSavedPlaces];

export function getSavedPlaces(userId: string): T.SavedPlace[] {
  return savedPlaces.filter(sp => sp.userId === userId);
}

export function isPlaceSaved(userId: string, placeId: string): boolean {
  return savedPlaces.some(sp => sp.userId === userId && sp.placeId === placeId);
}

export function toggleSavePlace(userId: string, placeId: string, collectionId?: string): boolean {
  const existing = savedPlaces.findIndex(sp => sp.userId === userId && sp.placeId === placeId);
  if (existing >= 0) {
    savedPlaces.splice(existing, 1);
    return false; // unsaved
  } else {
    savedPlaces.push({
      id: `sp-${Date.now()}`,
      userId,
      placeId,
      collectionId: collectionId ?? null,
      createdAt: new Date().toISOString(),
    });
    return true; // saved
  }
}

// === COLLECTIONS ===

export function getCollections(userId: string): T.Collection[] {
  return mockCollections.filter(c => c.userId === userId);
}

export function getCollectionById(id: string): T.Collection | undefined {
  return mockCollections.find(c => c.id === id);
}

export function getCollectionPlaces(collectionId: string, userId: string): T.Place[] {
  const placeIds = savedPlaces
    .filter(sp => sp.userId === userId && sp.collectionId === collectionId)
    .map(sp => sp.placeId);
  return mockPlaces.filter(p => placeIds.includes(p.id));
}

// === TRIPS ===

export function getTrips(userId: string): T.Trip[] {
  return mockTrips.filter(t => t.userId === userId);
}

export function getTripById(id: string): T.Trip | undefined {
  return mockTrips.find(t => t.id === id);
}

// === MESSAGES ===

export function getConversations(): T.Conversation[] {
  return mockConversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function getMessages(conversationId: string): T.Message[] {
  return mockMessages.filter(m => m.conversationId === conversationId).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}

// === SEARCH ===

export function searchDestinations(query: string): (T.Country | T.City)[] {
  const q = query.toLowerCase();
  const countries = mockCountries.filter(c => c.name.toLowerCase().includes(q));
  const cities = mockCities.filter(c => c.name.toLowerCase().includes(q));
  return [...countries, ...cities].slice(0, 10);
}

export function searchPlaces(query: string, cityId?: string): T.Place[] {
  const q = query.toLowerCase();
  let results = mockPlaces.filter(p => p.isActive && (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)));
  if (cityId) results = results.filter(p => p.cityId === cityId);
  return results.slice(0, 20);
}
```

**Step 2: Commit**

```bash
git add data/api.ts
git commit -m "feat: add API layer for mock data queries (future Supabase swap point)"
```

---

## Task 3: Explore tab — country list screen

**Goal:** Rebuild `app/(tabs)/explore/index.tsx` to use the API layer. Show SEA countries as hero cards with safety ratings, solo-friendly badges. Search filters countries and cities.

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**What changes:**
- Import from `data/api` instead of mock guides
- Use `getCountries()` and `getCountryContent()` for display data
- Country cards show: hero image, name, safety rating, solo-friendly badge, tagline from geo_content
- Search filters both countries and cities
- Tapping a country navigates to `country/[slug]`
- Tapping a city in search results navigates to `place/[slug]` (city detail)

**Key UI elements:**
- Search bar at top
- "Featured destinations" section header
- Country cards: full-width, hero image background, country name overlay, safety pill, solo-friendly badge
- When searching: show mixed results (countries + cities) as compact list items

**Step 1: Rewrite the screen**

Replace the entire file. The screen should:
1. Call `getCountries()` to get all countries
2. Call `getCountryContent(country.id)` for each to get tagline, safety rating, solo-friendly
3. Render as vertical scroll of full-width cards
4. Search bar filters by country name and city name (using `searchDestinations`)

**Step 2: Verify navigation works**

Tapping a country card should navigate to `/(tabs)/explore/country/${country.slug}`.

**Step 3: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: rebuild explore screen with structured country data and search"
```

---

## Task 4: Explore tab — country detail screen

**Goal:** Rebuild `app/(tabs)/explore/country/[slug].tsx` to show country guide from geo_content + cities list + emergency numbers.

**Files:**
- Modify: `app/(tabs)/explore/country/[slug].tsx`

**What changes:**
- Use `getCountryBySlug()`, `getCountryContent()`, `getCitiesByCountry()` from API layer
- Hero image with country name overlay
- Quick facts grid: safety rating, best months, currency, language, visa note (all from geo_content)
- Highlights list from geo_content
- Cities section: horizontal scroll of city cards with hero images
- Emergency numbers section (keep existing safety.ts integration)
- Each city card tappable → navigates to `/(tabs)/explore/place/${city.slug}`

**Step 1: Rewrite the screen using API layer**

**Step 2: Commit**

```bash
git add app/(tabs)/explore/country/
git commit -m "feat: rebuild country detail screen with geo_content and city cards"
```

---

## Task 5: Explore tab — city detail screen (rename route conceptually)

**Goal:** Rebuild `app/(tabs)/explore/place/[slug].tsx` as a city detail page. This screen shows: city hero, neighborhoods (city_areas), places grouped by category, with tags visible on each place card.

**Note:** The route stays as `place/[slug]` for now (renaming routes is disruptive). The slug resolves to a city. Individual place detail will be a modal or sub-screen added later.

**Files:**
- Modify: `app/(tabs)/explore/place/[slug].tsx`

**What changes:**
- Use `getCityBySlug()`, `getCityContent()`, `getAreasByCity()`, `getPlacesByCity()`, `getPlaceTags()`, `getPlaceFirstImage()` from API
- City hero image with name and tagline overlay
- Neighborhoods as horizontal pills (from city_areas). Tapping one filters places to that area.
- Places grouped by category: "Where to stay", "Eat & Drink", "Cafes & Coworking", "Things to do"
- Each place card shows: image (from placeMedia), name, category pill, price level dots, 2-3 tag pills, first line of description
- Save button (heart icon) on each place card — calls `toggleSavePlace()`
- Tapping a place card opens a place detail modal (Task 6)

**Key UI for place cards:**
```
┌──────────────────────────────┐
│  [Image]                     │
│  ♡  (save button, top-right) │
├──────────────────────────────┤
│  Place Name         $$ (dots)│
│  ┌──────┐ ┌─────────┐       │
│  │ Cafe │ │Solo-safe│ ...   │
│  └──────┘ └─────────┘       │
│  Short description text...   │
└──────────────────────────────┘
```

**Step 1: Rewrite the screen**

**Step 2: Verify place cards render with tags and images**

**Step 3: Commit**

```bash
git add app/(tabs)/explore/place/
git commit -m "feat: rebuild city detail screen with areas, categorized places, tags, and save"
```

---

## Task 6: Place detail modal

**Goal:** Create a place detail screen/modal that shows full place information: all images, full description, all tags grouped by tag_group, signals, address, hours, save button, and a "why this fits" explainer.

**Files:**
- Create: `app/(tabs)/explore/place-detail/[id].tsx` (or use a modal approach)
- Alternatively, create `components/PlaceDetailSheet.tsx` as a bottom sheet

**What this screen shows:**
- Image carousel (from placeMedia)
- Place name, category, price level
- Tags grouped by tag group (Vibe: quiet, cozy | Safety: well-lit, walkable | Good for: solo, remote work)
- Full description
- Address, hours, phone, website (tappable)
- "Why this fits you" section — match 2-3 of the user's profile interests/preferences to this place's tags
- Save/unsave button (prominent)
- Nearby places in same area (optional)

**Step 1: Create the screen or component**

**Step 2: Wire navigation from city detail place cards**

**Step 3: Commit**

```bash
git commit -m "feat: add place detail screen with tags, signals, media, and save"
```

---

## Task 7: Home tab — traveler feed

**Goal:** Rebuild `app/(tabs)/home/index.tsx` to use profiles from API layer. Show travelers with their current city, interests (as tags), and travel style.

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**What changes:**
- Use `getProfiles()` from API layer
- Show current city name (resolved from `currentCityId` via `getCityById`)
- Interests shown as tag pills (matching tag system)
- "Online now" indicator
- Tapping navigates to user profile

**Step 1: Rewrite using API layer**

**Step 2: Commit**

```bash
git add app/(tabs)/home/index.tsx
git commit -m "feat: rebuild home feed with profile API layer"
```

---

## Task 8: Home tab — user profile screen

**Goal:** Rebuild `app/(tabs)/home/user/[id].tsx` to show full profile with saved places, interests as tags.

**Files:**
- Modify: `app/(tabs)/home/user/[id].tsx`

**What changes:**
- Use `getProfileById()`, `getSavedPlaces()`, `getPlaceById()`, `getPlaceFirstImage()` from API
- Show saved places as a horizontal scroll of place cards (if the user has public saves)
- Interests rendered as tag pills
- Message button still navigates to DM

**Step 1: Rewrite using API layer**

**Step 2: Commit**

```bash
git add app/(tabs)/home/user/
git commit -m "feat: rebuild user profile screen with saved places and tags"
```

---

## Task 9: Home tab — DM list and chat thread

**Goal:** Rebuild DM screens to use API layer. Add block/report buttons to chat. Messages persist in mock store during session.

**Files:**
- Modify: `app/(tabs)/home/dm/index.tsx`
- Modify: `app/(tabs)/home/dm/[id].tsx`

**What changes (DM list):**
- Use `getConversations()`, `getProfileById()` from API
- Show profile avatar, name, last message, time

**What changes (Chat thread):**
- Use `getMessages()`, `getProfileById()` from API
- Add block and report buttons in header (tap shows confirmation alert — action is no-op for now but UI must exist)
- Sending a message adds to the mock messages array (persists during session)
- Add ability to share a place in chat (future enhancement — just have the UI hook)

**Step 1: Rewrite both screens**

**Step 2: Commit**

```bash
git add app/(tabs)/home/dm/
git commit -m "feat: rebuild DM screens with API layer and block/report UI"
```

---

## Task 10: Trips tab — trip list and creation

**Goal:** Rebuild trips list and creation screens. Add date pickers to trip creation. Trips reference real city IDs.

**Files:**
- Modify: `app/(tabs)/trips/index.tsx`
- Modify: `app/(tabs)/trips/new.tsx`

**What changes (trip list):**
- Use `getTrips()` from API
- Show destination city name, country flag, dates, status badge
- Tapping navigates to trip detail

**What changes (new trip):**
- Add date pickers (arriving/leaving) — reuse the pattern from onboarding `trip-details.tsx`
- Destination search uses `searchDestinations()` from API
- On save, create a Trip object and add to mock trips array
- Navigate back to trip list

**Step 1: Rewrite both screens**

**Step 2: Commit**

```bash
git add app/(tabs)/trips/
git commit -m "feat: rebuild trips list and creation with date pickers and API layer"
```

---

## Task 11: Trips tab — trip detail

**Goal:** Rebuild trip detail to show attached places as real place cards (with images, tags). Add ability to add/remove places.

**Files:**
- Modify: `app/(tabs)/trips/[id].tsx`

**What changes:**
- Use `getTripById()`, `getCityById()`, `getPlaceById()`, `getPlaceFirstImage()`, `getPlaceTags()` from API
- Show trip header: city name, country flag, dates, nights
- Notes section (editable)
- Places section: real place cards with images, not just strings
- "Add a place" button that shows a search/picker
- Emergency numbers section (keep existing)

**Step 1: Rewrite the screen**

**Step 2: Commit**

```bash
git add app/(tabs)/trips/
git commit -m "feat: rebuild trip detail with real place cards and add-place flow"
```

---

## Task 12: Profile tab — own profile

**Goal:** Rebuild profile screen to show user data from onboarding store + saved places + collections, all using API layer.

**Files:**
- Modify: `app/(tabs)/profile/index.tsx`

**What changes:**
- Keep reading from onboardingStore for the user's own data
- Collections from `getCollections('me')` via API
- Saved places count from `getSavedPlaces('me')`
- Interests from onboardingStore.dayStyle mapped to tag display
- Stats row: "X places saved · Y countries · Z cities"
- Edit profile, Settings, Messages links all work

**Step 1: Rewrite the screen**

**Step 2: Commit**

```bash
git add app/(tabs)/profile/index.tsx
git commit -m "feat: rebuild profile screen with collections and saved places stats"
```

---

## Task 13: Profile tab — edit profile

**Goal:** Make profile edit actually work. User can change name, bio, country, photo, interests.

**Files:**
- Modify: `app/(tabs)/profile/edit.tsx`

**What changes:**
- Replace "coming soon" stub with actual form
- Reuse patterns from onboarding screens (photo picker, country search, bio textarea)
- Pre-fill with current values from onboardingStore
- On save, update onboardingStore and navigate back
- Interests: show tag pills with add/remove

**Step 1: Build the form**

**Step 2: Commit**

```bash
git add app/(tabs)/profile/edit.tsx
git commit -m "feat: implement working profile edit screen"
```

---

## Task 14: Profile tab — settings screen

**Goal:** Make settings actually editable. Tapping a setting opens a picker/toggle to change it.

**Files:**
- Modify: `app/(tabs)/profile/settings.tsx`

**What changes:**
- Each privacy setting is tappable and opens a selector (ActionSheet or inline picker)
- Changes write back to onboardingStore
- Add notification preferences section (mock — just toggles that save to store)
- Add "About Sola" link section
- Add "Log out" button (resets onboardingStore and navigates to onboarding)

**Step 1: Build editable settings**

**Step 2: Commit**

```bash
git add app/(tabs)/profile/settings.tsx
git commit -m "feat: implement working settings screen with editable privacy controls"
```

---

## Task 15: Profile tab — collection detail

**Goal:** Rebuild collection detail to show real place cards from the API layer.

**Files:**
- Modify: `app/(tabs)/profile/collections/[id].tsx`

**What changes:**
- Use `getCollectionById()`, `getCollectionPlaces()`, `getPlaceFirstImage()`, `getPlaceTags()` from API
- Show place cards with images, tags, category, price level
- Tapping a place opens place detail (same as from city screen)
- Header shows collection emoji + name + place count

**Step 1: Rewrite the screen**

**Step 2: Commit**

```bash
git add app/(tabs)/profile/collections/
git commit -m "feat: rebuild collection detail with real place cards"
```

---

## Task 16: SOS button — persistent safety access

**Goal:** Add a floating SOS button visible on all tab screens. Tapping opens a modal with emergency numbers for the user's current trip destination (or device locale fallback).

**Files:**
- Create: `components/SOSButton.tsx`
- Create: `components/SOSModal.tsx`
- Modify: `app/(tabs)/_layout.tsx` (add SOS button overlay)

**What the SOS modal shows:**
- Local emergency number (from safety.ts based on current trip destination country)
- One-tap "Call police" / "Call ambulance" buttons (uses `Linking.openURL('tel:...')`)
- "Share my location" button (composes SMS with coordinates)
- Emergency contact (from profile, or placeholder text if not set)

**Step 1: Create SOSButton and SOSModal components**

**Step 2: Add to tab layout as an absolute-positioned overlay**

**Step 3: Commit**

```bash
git add components/SOS* app/(tabs)/_layout.tsx
git commit -m "feat: add persistent SOS button with emergency numbers and one-tap calling"
```

---

## Task 17: Clean up — delete dead files and unused code

**Goal:** Remove all files and imports that are no longer used after the rebuild.

**Files to check/delete:**
- `data/placeholder.ts` (confirmed unused)
- `data/mock/users.ts` (replaced by profiles.ts)
- `data/mock/guides.ts` (replaced by normalized tables)
- Any unused imports in screens

**Step 1: Delete dead files**

**Step 2: Verify app still compiles and runs**

```bash
npx expo start
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove dead files and unused mock data"
```

---

## Execution order and dependencies

```
Task 1 (mock data)
  └→ Task 2 (API layer)
       ├→ Task 3 (Explore: country list)
       │    └→ Task 4 (Explore: country detail)
       │         └→ Task 5 (Explore: city detail)
       │              └→ Task 6 (Place detail modal)
       ├→ Task 7 (Home: feed)
       │    └→ Task 8 (Home: user profile)
       │         └→ Task 9 (Home: DMs)
       ├→ Task 10 (Trips: list + new)
       │    └→ Task 11 (Trips: detail)
       ├→ Task 12 (Profile: own)
       │    ├→ Task 13 (Profile: edit)
       │    ├→ Task 14 (Profile: settings)
       │    └→ Task 15 (Profile: collections)
       └→ Task 16 (SOS button)
            └→ Task 17 (Clean up)
```

Tasks 3-6, 7-9, 10-11, 12-15, and 16 are **independent branches** that can be done in any order after Tasks 1-2 are complete. The recommended order is as written (Explore first, since it's the core product loop).

---

## What this does NOT cover (intentionally deferred)

- **Backend / Supabase integration** — all mock data, swap later by rewriting `data/api.ts`
- **Authentication** — onboarding flow stays as-is, no real auth
- **Data persistence** — in-memory only, resets on app restart
- **Push notifications** — Phase 2+
- **Real-time messaging** — Phase 3
- **Image CDN / caching** — still Unsplash URLs for now
- **Maps** — coordinates are in the data but no map UI yet
- **Itinerary generation** — Phase 2
- **Community features** — Phase 3
