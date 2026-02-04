# Explore Airbnb-Style Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Explore screen to match Airbnb's visual polish and UX patterns while maintaining Sola's brand identity (women-first solo travel).

**Architecture:**
- Replace current single Explore screen with a tabbed interface using 3 segments (Countries, Places, Activities)
- Create reusable card components and section layouts matching Airbnb's spacing/proportions
- Build a dedicated Search screen with segment-aware filtering
- Implement "See All" list screens for each section category
- Update bottom tab bar: rename Home → Explore, swap icon to "users" (two people)

**Tech Stack:** React Native, Expo Router, expo-image, FlatList for carousels, Sola design tokens

---

## Task 1: Create Mock Data File

**Files:**
- Create: `data/exploreMockData.ts`

**Step 1: Create the mock data file with typed data**

```typescript
// data/exploreMockData.ts
// Mock data for Explore redesign - structured for easy Supabase replacement later

import type { Country, City, Place } from './types';

// ---------------------------------------------------------------------------
// Mock Countries (grouped by continent)
// ---------------------------------------------------------------------------

export interface MockCountry {
  id: string;
  slug: string;
  name: string;
  iso2: string;
  continent: 'asia' | 'europe' | 'africa' | 'north-america' | 'south-america' | 'oceania';
  heroImageUrl: string;
  subtitle: string;
  citiesCount: number;
  rating: number;
  reviewCount: number;
}

export const mockCountries: MockCountry[] = [
  // Asia
  { id: 'c1', slug: 'thailand', name: 'Thailand', iso2: 'TH', continent: 'asia', heroImageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800', subtitle: 'Beaches, temples & street food', citiesCount: 12, rating: 4.8, reviewCount: 2340 },
  { id: 'c2', slug: 'vietnam', name: 'Vietnam', iso2: 'VN', continent: 'asia', heroImageUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800', subtitle: 'Ancient towns & stunning bays', citiesCount: 8, rating: 4.7, reviewCount: 1890 },
  { id: 'c3', slug: 'japan', name: 'Japan', iso2: 'JP', continent: 'asia', heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', subtitle: 'Tradition meets innovation', citiesCount: 10, rating: 4.9, reviewCount: 3120 },
  { id: 'c4', slug: 'indonesia', name: 'Indonesia', iso2: 'ID', continent: 'asia', heroImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', subtitle: 'Islands, rice terraces & culture', citiesCount: 7, rating: 4.6, reviewCount: 2100 },
  { id: 'c5', slug: 'philippines', name: 'Philippines', iso2: 'PH', continent: 'asia', heroImageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800', subtitle: 'Island hopping paradise', citiesCount: 6, rating: 4.5, reviewCount: 1560 },
  { id: 'c6', slug: 'south-korea', name: 'South Korea', iso2: 'KR', continent: 'asia', heroImageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800', subtitle: 'K-culture & mountain temples', citiesCount: 5, rating: 4.7, reviewCount: 1420 },
  // Europe
  { id: 'c7', slug: 'portugal', name: 'Portugal', iso2: 'PT', continent: 'europe', heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', subtitle: 'Coastal charm & historic cities', citiesCount: 6, rating: 4.8, reviewCount: 2890 },
  { id: 'c8', slug: 'spain', name: 'Spain', iso2: 'ES', continent: 'europe', heroImageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800', subtitle: 'Art, tapas & vibrant nights', citiesCount: 9, rating: 4.7, reviewCount: 3450 },
  { id: 'c9', slug: 'italy', name: 'Italy', iso2: 'IT', continent: 'europe', heroImageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800', subtitle: 'History, art & la dolce vita', citiesCount: 11, rating: 4.8, reviewCount: 4120 },
  { id: 'c10', slug: 'greece', name: 'Greece', iso2: 'GR', continent: 'europe', heroImageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800', subtitle: 'Islands, ruins & Mediterranean sun', citiesCount: 7, rating: 4.6, reviewCount: 2340 },
  // Africa
  { id: 'c11', slug: 'morocco', name: 'Morocco', iso2: 'MA', continent: 'africa', heroImageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800', subtitle: 'Medinas, desert & Atlas mountains', citiesCount: 5, rating: 4.5, reviewCount: 1780 },
  { id: 'c12', slug: 'south-africa', name: 'South Africa', iso2: 'ZA', continent: 'africa', heroImageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', subtitle: 'Safari, wine & coastal cities', citiesCount: 4, rating: 4.6, reviewCount: 1230 },
  // South America
  { id: 'c13', slug: 'colombia', name: 'Colombia', iso2: 'CO', continent: 'south-america', heroImageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800', subtitle: 'Colorful cities & Caribbean coast', citiesCount: 5, rating: 4.5, reviewCount: 1450 },
  { id: 'c14', slug: 'mexico', name: 'Mexico', iso2: 'MX', continent: 'north-america', heroImageUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800', subtitle: 'Ancient ruins & beach towns', citiesCount: 8, rating: 4.6, reviewCount: 2780 },
  // Oceania
  { id: 'c15', slug: 'australia', name: 'Australia', iso2: 'AU', continent: 'oceania', heroImageUrl: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800', subtitle: 'Beaches, outback & wildlife', citiesCount: 6, rating: 4.7, reviewCount: 2100 },
  { id: 'c16', slug: 'new-zealand', name: 'New Zealand', iso2: 'NZ', continent: 'oceania', heroImageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800', subtitle: 'Adventure & stunning landscapes', citiesCount: 4, rating: 4.8, reviewCount: 1560 },
];

// ---------------------------------------------------------------------------
// Mock Cities (categorized)
// ---------------------------------------------------------------------------

export type CityCategory = 'beaches' | 'cities' | 'nature' | 'culture' | 'food';

export interface MockCity {
  id: string;
  slug: string;
  name: string;
  countryId: string;
  countryName: string;
  category: CityCategory;
  heroImageUrl: string;
  rating: number;
  reviewCount: number;
}

export const mockCities: MockCity[] = [
  // Beaches & Islands
  { id: 'ct1', slug: 'bali', name: 'Bali', countryId: 'c4', countryName: 'Indonesia', category: 'beaches', heroImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', rating: 4.7, reviewCount: 3420 },
  { id: 'ct2', slug: 'phuket', name: 'Phuket', countryId: 'c1', countryName: 'Thailand', category: 'beaches', heroImageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800', rating: 4.5, reviewCount: 2180 },
  { id: 'ct3', slug: 'el-nido', name: 'El Nido', countryId: 'c5', countryName: 'Philippines', category: 'beaches', heroImageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800', rating: 4.8, reviewCount: 1890 },
  { id: 'ct4', slug: 'santorini', name: 'Santorini', countryId: 'c10', countryName: 'Greece', category: 'beaches', heroImageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', rating: 4.9, reviewCount: 4120 },
  { id: 'ct5', slug: 'da-nang', name: 'Da Nang', countryId: 'c2', countryName: 'Vietnam', category: 'beaches', heroImageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', rating: 4.6, reviewCount: 1560 },
  // Cities
  { id: 'ct6', slug: 'tokyo', name: 'Tokyo', countryId: 'c3', countryName: 'Japan', category: 'cities', heroImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', rating: 4.9, reviewCount: 5670 },
  { id: 'ct7', slug: 'barcelona', name: 'Barcelona', countryId: 'c8', countryName: 'Spain', category: 'cities', heroImageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', rating: 4.8, reviewCount: 4890 },
  { id: 'ct8', slug: 'lisbon', name: 'Lisbon', countryId: 'c7', countryName: 'Portugal', category: 'cities', heroImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', rating: 4.8, reviewCount: 3450 },
  { id: 'ct9', slug: 'seoul', name: 'Seoul', countryId: 'c6', countryName: 'South Korea', category: 'cities', heroImageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800', rating: 4.7, reviewCount: 2890 },
  { id: 'ct10', slug: 'ho-chi-minh', name: 'Ho Chi Minh', countryId: 'c2', countryName: 'Vietnam', category: 'cities', heroImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', rating: 4.6, reviewCount: 2340 },
  // Nature & Mountains
  { id: 'ct11', slug: 'chiang-mai', name: 'Chiang Mai', countryId: 'c1', countryName: 'Thailand', category: 'nature', heroImageUrl: 'https://images.unsplash.com/photo-1512553549066-2f3e097c9312?w=800', rating: 4.7, reviewCount: 2780 },
  { id: 'ct12', slug: 'queenstown', name: 'Queenstown', countryId: 'c16', countryName: 'New Zealand', category: 'nature', heroImageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800', rating: 4.9, reviewCount: 1890 },
  { id: 'ct13', slug: 'sapa', name: 'Sapa', countryId: 'c2', countryName: 'Vietnam', category: 'nature', heroImageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', rating: 4.6, reviewCount: 1230 },
  { id: 'ct14', slug: 'cape-town', name: 'Cape Town', countryId: 'c12', countryName: 'South Africa', category: 'nature', heroImageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', rating: 4.8, reviewCount: 2340 },
  // Culture & History
  { id: 'ct15', slug: 'kyoto', name: 'Kyoto', countryId: 'c3', countryName: 'Japan', category: 'culture', heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', rating: 4.9, reviewCount: 4560 },
  { id: 'ct16', slug: 'rome', name: 'Rome', countryId: 'c9', countryName: 'Italy', category: 'culture', heroImageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', rating: 4.8, reviewCount: 5120 },
  { id: 'ct17', slug: 'marrakech', name: 'Marrakech', countryId: 'c11', countryName: 'Morocco', category: 'culture', heroImageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800', rating: 4.5, reviewCount: 1890 },
  { id: 'ct18', slug: 'hoi-an', name: 'Hoi An', countryId: 'c2', countryName: 'Vietnam', category: 'culture', heroImageUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800', rating: 4.7, reviewCount: 2120 },
  // Food Cities
  { id: 'ct19', slug: 'bangkok', name: 'Bangkok', countryId: 'c1', countryName: 'Thailand', category: 'food', heroImageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', rating: 4.7, reviewCount: 4230 },
  { id: 'ct20', slug: 'osaka', name: 'Osaka', countryId: 'c3', countryName: 'Japan', category: 'food', heroImageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800', rating: 4.8, reviewCount: 3120 },
  { id: 'ct21', slug: 'mexico-city', name: 'Mexico City', countryId: 'c14', countryName: 'Mexico', category: 'food', heroImageUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800', rating: 4.6, reviewCount: 2780 },
  { id: 'ct22', slug: 'cartagena', name: 'Cartagena', countryId: 'c13', countryName: 'Colombia', category: 'food', heroImageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800', rating: 4.5, reviewCount: 1670 },
];

// ---------------------------------------------------------------------------
// Mock Activities
// ---------------------------------------------------------------------------

export type ActivityCategory = 'food-tours' | 'nature' | 'nightlife' | 'wellness' | 'culture' | 'adventure';

export interface MockActivity {
  id: string;
  slug: string;
  name: string;
  cityId: string;
  cityName: string;
  countryName: string;
  category: ActivityCategory;
  heroImageUrl: string;
  priceFrom: number;
  currency: string;
  rating: number;
  reviewCount: number;
  duration: string;
}

export const mockActivities: MockActivity[] = [
  // Best Rated Worldwide
  { id: 'a1', slug: 'tokyo-ramen-tour', name: 'Tokyo Ramen Walking Tour', cityId: 'ct6', cityName: 'Tokyo', countryName: 'Japan', category: 'food-tours', heroImageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', priceFrom: 85, currency: 'USD', rating: 4.97, reviewCount: 1240, duration: '3 hours' },
  { id: 'a2', slug: 'bali-rice-terrace', name: 'Tegallalang Rice Terraces Sunrise', cityId: 'ct1', cityName: 'Bali', countryName: 'Indonesia', category: 'nature', heroImageUrl: 'https://images.unsplash.com/photo-1531592937781-344ad608fabf?w=800', priceFrom: 45, currency: 'USD', rating: 4.95, reviewCount: 890, duration: '5 hours' },
  { id: 'a3', slug: 'barcelona-tapas-night', name: 'Barcelona Tapas & Wine Evening', cityId: 'ct7', cityName: 'Barcelona', countryName: 'Spain', category: 'food-tours', heroImageUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800', priceFrom: 75, currency: 'USD', rating: 4.94, reviewCount: 2100, duration: '4 hours' },
  { id: 'a4', slug: 'kyoto-tea-ceremony', name: 'Traditional Tea Ceremony Experience', cityId: 'ct15', cityName: 'Kyoto', countryName: 'Japan', category: 'culture', heroImageUrl: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800', priceFrom: 60, currency: 'USD', rating: 4.93, reviewCount: 780, duration: '2 hours' },
  { id: 'a5', slug: 'lisbon-tram-tour', name: 'Historic Tram 28 Walking Tour', cityId: 'ct8', cityName: 'Lisbon', countryName: 'Portugal', category: 'culture', heroImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', priceFrom: 35, currency: 'USD', rating: 4.91, reviewCount: 1560, duration: '3 hours' },
  // Food Tours
  { id: 'a6', slug: 'bangkok-street-food', name: 'Bangkok Street Food by Night', cityId: 'ct19', cityName: 'Bangkok', countryName: 'Thailand', category: 'food-tours', heroImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', priceFrom: 55, currency: 'USD', rating: 4.88, reviewCount: 1890, duration: '4 hours' },
  { id: 'a7', slug: 'hoi-an-cooking', name: 'Vietnamese Cooking Class', cityId: 'ct18', cityName: 'Hoi An', countryName: 'Vietnam', category: 'food-tours', heroImageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', priceFrom: 40, currency: 'USD', rating: 4.92, reviewCount: 670, duration: '4 hours' },
  { id: 'a8', slug: 'osaka-food-tour', name: 'Osaka Street Food Adventure', cityId: 'ct20', cityName: 'Osaka', countryName: 'Japan', category: 'food-tours', heroImageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800', priceFrom: 70, currency: 'USD', rating: 4.89, reviewCount: 1120, duration: '3.5 hours' },
  // Nature
  { id: 'a9', slug: 'el-nido-island-hopping', name: 'El Nido Island Hopping Tour A', cityId: 'ct3', cityName: 'El Nido', countryName: 'Philippines', category: 'nature', heroImageUrl: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800', priceFrom: 35, currency: 'USD', rating: 4.96, reviewCount: 2340, duration: 'Full day' },
  { id: 'a10', slug: 'queenstown-bungee', name: 'Kawarau Bridge Bungee Jump', cityId: 'ct12', cityName: 'Queenstown', countryName: 'New Zealand', category: 'adventure', heroImageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800', priceFrom: 180, currency: 'USD', rating: 4.87, reviewCount: 890, duration: '3 hours' },
  { id: 'a11', slug: 'chiang-mai-elephant', name: 'Ethical Elephant Sanctuary Visit', cityId: 'ct11', cityName: 'Chiang Mai', countryName: 'Thailand', category: 'nature', heroImageUrl: 'https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5?w=800', priceFrom: 75, currency: 'USD', rating: 4.94, reviewCount: 1670, duration: 'Half day' },
  // Wellness
  { id: 'a12', slug: 'bali-yoga-retreat', name: 'Ubud Sunrise Yoga Session', cityId: 'ct1', cityName: 'Bali', countryName: 'Indonesia', category: 'wellness', heroImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', priceFrom: 25, currency: 'USD', rating: 4.91, reviewCount: 560, duration: '2 hours' },
  { id: 'a13', slug: 'thai-massage-class', name: 'Traditional Thai Massage Workshop', cityId: 'ct11', cityName: 'Chiang Mai', countryName: 'Thailand', category: 'wellness', heroImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', priceFrom: 50, currency: 'USD', rating: 4.85, reviewCount: 340, duration: '3 hours' },
  // Culture
  { id: 'a14', slug: 'rome-colosseum', name: 'Colosseum Skip-the-Line Tour', cityId: 'ct16', cityName: 'Rome', countryName: 'Italy', category: 'culture', heroImageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', priceFrom: 55, currency: 'USD', rating: 4.88, reviewCount: 3450, duration: '3 hours' },
  { id: 'a15', slug: 'marrakech-medina', name: 'Medina Walking Tour with Local', cityId: 'ct17', cityName: 'Marrakech', countryName: 'Morocco', category: 'culture', heroImageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800', priceFrom: 30, currency: 'USD', rating: 4.82, reviewCount: 890, duration: '4 hours' },
  // Nightlife
  { id: 'a16', slug: 'seoul-nightlife', name: 'Hongdae Nightlife Experience', cityId: 'ct9', cityName: 'Seoul', countryName: 'South Korea', category: 'nightlife', heroImageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800', priceFrom: 65, currency: 'USD', rating: 4.79, reviewCount: 450, duration: '5 hours' },
  { id: 'a17', slug: 'barcelona-rooftop', name: 'Barcelona Rooftop Bar Crawl', cityId: 'ct7', cityName: 'Barcelona', countryName: 'Spain', category: 'nightlife', heroImageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', priceFrom: 45, currency: 'USD', rating: 4.76, reviewCount: 670, duration: '4 hours' },
];

// ---------------------------------------------------------------------------
// Continent Labels for Sections
// ---------------------------------------------------------------------------

export const continentLabels: Record<MockCountry['continent'], string> = {
  'asia': 'Asia',
  'europe': 'Europe',
  'africa': 'Africa',
  'north-america': 'North America',
  'south-america': 'South America',
  'oceania': 'Oceania',
};

export const cityCategoryLabels: Record<CityCategory, string> = {
  'beaches': 'Beaches & Islands',
  'cities': 'Cities',
  'nature': 'Nature & Mountains',
  'culture': 'Culture & History',
  'food': 'Food Cities',
};

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  'food-tours': 'Food Tours',
  'nature': 'Nature',
  'nightlife': 'Nightlife',
  'wellness': 'Wellness',
  'culture': 'Culture',
  'adventure': 'Adventure',
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function getCountriesByContinent(continent: MockCountry['continent']): MockCountry[] {
  return mockCountries.filter(c => c.continent === continent);
}

export function getCitiesByCategory(category: CityCategory): MockCity[] {
  return mockCities.filter(c => c.category === category);
}

export function getActivitiesByCategory(category: ActivityCategory): MockActivity[] {
  return mockActivities.filter(a => a.category === category);
}

export function getTopRatedActivities(limit: number = 5): MockActivity[] {
  return [...mockActivities].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function searchMockData(query: string): { countries: MockCountry[]; cities: MockCity[]; activities: MockActivity[] } {
  const q = query.toLowerCase().trim();
  if (!q) return { countries: [], cities: [], activities: [] };

  return {
    countries: mockCountries.filter(c => c.name.toLowerCase().includes(q)),
    cities: mockCities.filter(c => c.name.toLowerCase().includes(q) || c.countryName.toLowerCase().includes(q)),
    activities: mockActivities.filter(a => a.name.toLowerCase().includes(q) || a.cityName.toLowerCase().includes(q)),
  };
}
```

**Step 2: Verify file compiles**

Run: `npx tsc data/exploreMockData.ts --noEmit --esModuleInterop --skipLibCheck`
Expected: No errors

**Step 3: Commit**

```bash
git add data/exploreMockData.ts
git commit -m "feat(explore): add mock data for Airbnb-style redesign"
```

---

## Task 2: Create Core UI Components

**Files:**
- Create: `components/explore/ExploreCard.tsx`
- Create: `components/explore/SectionHeader.tsx`
- Create: `components/explore/SearchBar.tsx`
- Create: `components/explore/SegmentedControl.tsx`
- Create: `components/explore/RatingRow.tsx`

### Step 1: Create ExploreCard component

```typescript
// components/explore/ExploreCard.tsx
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface ExploreCardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  metaRow?: string;
  rating?: number;
  reviewCount?: number;
  price?: { amount: number; currency: string; suffix?: string };
  onPress: () => void;
  width?: number;
  showFavorite?: boolean;
}

export default function ExploreCard({
  imageUrl,
  title,
  subtitle,
  metaRow,
  rating,
  reviewCount,
  price,
  onPress,
  width = 280,
  showFavorite = true,
}: ExploreCardProps) {
  const [scale] = useState(new Animated.Value(1));

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  }, [scale]);

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View style={[styles.card, { width, transform: [{ scale }] }]}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={200} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
          {showFavorite && (
            <View style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={20} color={colors.textPrimary} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>

          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}

          {metaRow && (
            <Text style={styles.meta} numberOfLines={1}>{metaRow}</Text>
          )}

          {price && (
            <Text style={styles.price}>
              From ${price.amount} {price.suffix || ''}
            </Text>
          )}

          {rating !== undefined && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.textPrimary} />
              <Text style={styles.ratingText}>{rating.toFixed(2)}</Text>
              {reviewCount !== undefined && (
                <Text style={styles.reviewCount}>({reviewCount.toLocaleString()})</Text>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.card,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: spacing.sm,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
```

### Step 2: Create SectionHeader component

```typescript
// components/explore/SectionHeader.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}

export default function SectionHeader({ title, subtitle, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.seeAllButton} hitSlop={8}>
          <Ionicons name="arrow-forward" size={20} color={colors.textPrimary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});
```

### Step 3: Create SearchBar component

```typescript
// components/explore/SearchBar.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface SearchBarProps {
  placeholder?: string;
  onPress: () => void;
}

export default function SearchBar({ placeholder = 'Start your search', onPress }: SearchBarProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.inner}>
        <Ionicons name="search" size={18} color={colors.textPrimary} />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    // Airbnb-style shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  placeholder: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
```

### Step 4: Create SegmentedControl component

```typescript
// components/explore/SegmentedControl.tsx
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export default function SegmentedControl({ segments, selectedKey, onSelect }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {segments.map((segment) => {
          const isSelected = segment.key === selectedKey;
          return (
            <Pressable
              key={segment.key}
              onPress={() => onSelect(segment.key)}
              style={[styles.segment, isSelected && styles.segmentSelected]}
            >
              <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                {segment.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },
  inner: {
    flexDirection: 'row',
    backgroundColor: colors.neutralFill,
    borderRadius: 24,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  segmentTextSelected: {
    color: colors.textPrimary,
  },
});
```

### Step 5: Create index file for exports

```typescript
// components/explore/index.ts
export { default as ExploreCard } from './ExploreCard';
export { default as SectionHeader } from './SectionHeader';
export { default as SearchBar } from './SearchBar';
export { default as SegmentedControl } from './SegmentedControl';
```

### Step 6: Commit

```bash
git add components/explore/
git commit -m "feat(explore): add core UI components (card, section header, search bar, segmented control)"
```

---

## Task 3: Create Carousel Component

**Files:**
- Create: `components/explore/HorizontalCarousel.tsx`
- Modify: `components/explore/index.ts`

### Step 1: Create HorizontalCarousel component

```typescript
// components/explore/HorizontalCarousel.tsx
import { FlatList, StyleSheet, View, ListRenderItem } from 'react-native';
import { spacing } from '@/constants/design';

interface HorizontalCarouselProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  itemWidth?: number;
  gap?: number;
}

export default function HorizontalCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  itemWidth = 280,
  gap = spacing.md,
}: HorizontalCarouselProps<T>) {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, { gap }]}
      snapToInterval={itemWidth + gap}
      decelerationRate="fast"
      removeClippedSubviews
      initialNumToRender={3}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenX,
  },
});
```

### Step 2: Update index exports

```typescript
// components/explore/index.ts
export { default as ExploreCard } from './ExploreCard';
export { default as SectionHeader } from './SectionHeader';
export { default as SearchBar } from './SearchBar';
export { default as SegmentedControl } from './SegmentedControl';
export { default as HorizontalCarousel } from './HorizontalCarousel';
```

### Step 3: Commit

```bash
git add components/explore/
git commit -m "feat(explore): add horizontal carousel component"
```

---

## Task 4: Implement Countries Tab Content

**Files:**
- Create: `components/explore/tabs/CountriesTab.tsx`

### Step 1: Create CountriesTab component

```typescript
// components/explore/tabs/CountriesTab.tsx
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ExploreCard, SectionHeader, HorizontalCarousel } from '@/components/explore';
import {
  mockCountries,
  getCountriesByContinent,
  continentLabels,
  MockCountry,
} from '@/data/exploreMockData';
import { spacing } from '@/constants/design';

// Order continents by number of countries (most first)
function getContinentOrder(): MockCountry['continent'][] {
  const counts: Record<string, number> = {};
  mockCountries.forEach(c => {
    counts[c.continent] = (counts[c.continent] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([continent]) => continent as MockCountry['continent']);
}

interface CountriesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

export default function CountriesTab({ onNavigateToSeeAll }: CountriesTabProps) {
  const router = useRouter();
  const continentOrder = useMemo(() => getContinentOrder(), []);

  const handleCountryPress = useCallback((country: MockCountry) => {
    router.push(`/(tabs)/explore/country/${country.slug}` as any);
  }, [router]);

  const renderCountryCard = useCallback(
    ({ item }: { item: MockCountry }) => (
      <ExploreCard
        imageUrl={item.heroImageUrl}
        title={item.name}
        subtitle={item.subtitle}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handleCountryPress(item)}
        width={280}
      />
    ),
    [handleCountryPress]
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Top Countries (all countries sorted by review count) */}
      <SectionHeader
        title="Top countries"
        subtitle="Most loved destinations"
        onSeeAll={() => onNavigateToSeeAll('all-countries', 'All Countries')}
      />
      <HorizontalCarousel
        data={[...mockCountries].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8)}
        renderItem={renderCountryCard}
        keyExtractor={(item) => item.id}
      />

      {/* Continent Sections */}
      {continentOrder.map((continent) => {
        const countries = getCountriesByContinent(continent);
        if (countries.length === 0) return null;

        return (
          <div key={continent} style={{ marginTop: spacing.xxl }}>
            <SectionHeader
              title={continentLabels[continent]}
              onSeeAll={() => onNavigateToSeeAll(`continent-${continent}`, continentLabels[continent])}
            />
            <HorizontalCarousel
              data={countries}
              renderItem={renderCountryCard}
              keyExtractor={(item) => item.id}
            />
          </div>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxxl,
  },
});
```

Wait, I used `<div>` in React Native which won't work. Let me fix that.

### Step 1 (corrected): Create CountriesTab component

```typescript
// components/explore/tabs/CountriesTab.tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ExploreCard, SectionHeader, HorizontalCarousel } from '@/components/explore';
import {
  mockCountries,
  getCountriesByContinent,
  continentLabels,
  MockCountry,
} from '@/data/exploreMockData';
import { spacing } from '@/constants/design';

// Order continents by number of countries (most first)
function getContinentOrder(): MockCountry['continent'][] {
  const counts: Record<string, number> = {};
  mockCountries.forEach(c => {
    counts[c.continent] = (counts[c.continent] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([continent]) => continent as MockCountry['continent']);
}

interface CountriesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

export default function CountriesTab({ onNavigateToSeeAll }: CountriesTabProps) {
  const router = useRouter();
  const continentOrder = useMemo(() => getContinentOrder(), []);

  const handleCountryPress = useCallback((country: MockCountry) => {
    router.push(`/(tabs)/explore/country/${country.slug}` as any);
  }, [router]);

  const renderCountryCard = useCallback(
    ({ item }: { item: MockCountry }) => (
      <ExploreCard
        imageUrl={item.heroImageUrl}
        title={item.name}
        subtitle={item.subtitle}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handleCountryPress(item)}
        width={280}
      />
    ),
    [handleCountryPress]
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Top Countries (all countries sorted by review count) */}
      <SectionHeader
        title="Top countries"
        subtitle="Most loved destinations"
        onSeeAll={() => onNavigateToSeeAll('all-countries', 'All Countries')}
      />
      <HorizontalCarousel
        data={[...mockCountries].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8)}
        renderItem={renderCountryCard}
        keyExtractor={(item) => item.id}
      />

      {/* Continent Sections */}
      {continentOrder.map((continent) => {
        const countries = getCountriesByContinent(continent);
        if (countries.length === 0) return null;

        return (
          <View key={continent} style={styles.section}>
            <SectionHeader
              title={continentLabels[continent]}
              onSeeAll={() => onNavigateToSeeAll(`continent-${continent}`, continentLabels[continent])}
            />
            <HorizontalCarousel
              data={countries}
              renderItem={renderCountryCard}
              keyExtractor={(item) => item.id}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxxl,
  },
  section: {
    marginTop: spacing.xxl,
  },
});
```

### Step 2: Commit

```bash
git add components/explore/tabs/
git commit -m "feat(explore): add Countries tab content component"
```

---

## Task 5: Implement Places Tab Content

**Files:**
- Create: `components/explore/tabs/PlacesTab.tsx`

### Step 1: Create PlacesTab component

```typescript
// components/explore/tabs/PlacesTab.tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ExploreCard, SectionHeader, HorizontalCarousel } from '@/components/explore';
import {
  getCitiesByCategory,
  cityCategoryLabels,
  MockCity,
  CityCategory,
} from '@/data/exploreMockData';
import { spacing } from '@/constants/design';

const CATEGORY_ORDER: CityCategory[] = ['beaches', 'cities', 'nature', 'culture', 'food'];

interface PlacesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

export default function PlacesTab({ onNavigateToSeeAll }: PlacesTabProps) {
  const router = useRouter();

  const handleCityPress = useCallback((city: MockCity) => {
    router.push(`/(tabs)/explore/city/${city.slug}` as any);
  }, [router]);

  const renderCityCard = useCallback(
    ({ item }: { item: MockCity }) => (
      <ExploreCard
        imageUrl={item.heroImageUrl}
        title={item.name}
        subtitle={item.countryName}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handleCityPress(item)}
        width={280}
      />
    ),
    [handleCityPress]
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {CATEGORY_ORDER.map((category, index) => {
        const cities = getCitiesByCategory(category);
        if (cities.length === 0) return null;

        return (
          <View key={category} style={index > 0 ? styles.section : undefined}>
            <SectionHeader
              title={cityCategoryLabels[category]}
              onSeeAll={() => onNavigateToSeeAll(`cities-${category}`, cityCategoryLabels[category])}
            />
            <HorizontalCarousel
              data={cities}
              renderItem={renderCityCard}
              keyExtractor={(item) => item.id}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxxl,
  },
  section: {
    marginTop: spacing.xxl,
  },
});
```

### Step 2: Commit

```bash
git add components/explore/tabs/PlacesTab.tsx
git commit -m "feat(explore): add Places tab content component"
```

---

## Task 6: Implement Activities Tab Content

**Files:**
- Create: `components/explore/tabs/ActivitiesTab.tsx`

### Step 1: Create ActivitiesTab component

```typescript
// components/explore/tabs/ActivitiesTab.tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ExploreCard, SectionHeader, HorizontalCarousel } from '@/components/explore';
import {
  getActivitiesByCategory,
  getTopRatedActivities,
  activityCategoryLabels,
  MockActivity,
  ActivityCategory,
} from '@/data/exploreMockData';
import { spacing } from '@/constants/design';

const CATEGORY_ORDER: ActivityCategory[] = ['food-tours', 'nature', 'culture', 'wellness', 'adventure', 'nightlife'];

interface ActivitiesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

export default function ActivitiesTab({ onNavigateToSeeAll }: ActivitiesTabProps) {
  const router = useRouter();

  const handleActivityPress = useCallback((activity: MockActivity) => {
    // Navigate to activity detail (stub for now)
    router.push(`/(tabs)/explore/activity/${activity.slug}` as any);
  }, [router]);

  const renderActivityCard = useCallback(
    ({ item }: { item: MockActivity }) => (
      <ExploreCard
        imageUrl={item.heroImageUrl}
        title={item.name}
        subtitle={`${item.cityName}, ${item.countryName}`}
        price={{ amount: item.priceFrom, currency: item.currency, suffix: '/ person' }}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handleActivityPress(item)}
        width={280}
      />
    ),
    [handleActivityPress]
  );

  const topRated = getTopRatedActivities(8);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Best Rated Worldwide */}
      <SectionHeader
        title="Best rated worldwide"
        subtitle="Highest reviewed experiences"
        onSeeAll={() => onNavigateToSeeAll('activities-top', 'Best Rated Activities')}
      />
      <HorizontalCarousel
        data={topRated}
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id}
      />

      {/* Category Sections */}
      {CATEGORY_ORDER.map((category) => {
        const activities = getActivitiesByCategory(category);
        if (activities.length === 0) return null;

        return (
          <View key={category} style={styles.section}>
            <SectionHeader
              title={activityCategoryLabels[category]}
              onSeeAll={() => onNavigateToSeeAll(`activities-${category}`, activityCategoryLabels[category])}
            />
            <HorizontalCarousel
              data={activities}
              renderItem={renderActivityCard}
              keyExtractor={(item) => item.id}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxxl,
  },
  section: {
    marginTop: spacing.xxl,
  },
});
```

### Step 2: Create tabs index file

```typescript
// components/explore/tabs/index.ts
export { default as CountriesTab } from './CountriesTab';
export { default as PlacesTab } from './PlacesTab';
export { default as ActivitiesTab } from './ActivitiesTab';
```

### Step 3: Commit

```bash
git add components/explore/tabs/
git commit -m "feat(explore): add Activities tab content component"
```

---

## Task 7: Create Search Screen

**Files:**
- Create: `app/(tabs)/explore/search.tsx`

### Step 1: Create Search screen

```typescript
// app/(tabs)/explore/search.tsx
import { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { searchMockData, MockCountry, MockCity, MockActivity } from '@/data/exploreMockData';

type SearchResult =
  | { type: 'country'; item: MockCountry }
  | { type: 'city'; item: MockCity }
  | { type: 'activity'; item: MockActivity };

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ segment?: string }>();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const { countries, cities, activities } = searchMockData(query);
    const all: SearchResult[] = [];

    // Filter based on active segment if provided
    const segment = params.segment;

    if (!segment || segment === 'countries') {
      countries.forEach(item => all.push({ type: 'country', item }));
    }
    if (!segment || segment === 'places') {
      cities.forEach(item => all.push({ type: 'city', item }));
    }
    if (!segment || segment === 'activities') {
      activities.forEach(item => all.push({ type: 'activity', item }));
    }

    return all;
  }, [query, params.segment]);

  const handleResultPress = useCallback((result: SearchResult) => {
    switch (result.type) {
      case 'country':
        router.push(`/(tabs)/explore/country/${result.item.slug}` as any);
        break;
      case 'city':
        router.push(`/(tabs)/explore/city/${result.item.slug}` as any);
        break;
      case 'activity':
        router.push(`/(tabs)/explore/activity/${result.item.slug}` as any);
        break;
    }
  }, [router]);

  const getPlaceholder = () => {
    switch (params.segment) {
      case 'countries': return 'Search countries...';
      case 'places': return 'Search cities...';
      case 'activities': return 'Search activities...';
      default: return 'Search destinations...';
    }
  };

  const renderItem = useCallback(({ item }: { item: SearchResult }) => {
    let imageUrl = '';
    let title = '';
    let subtitle = '';
    let icon: 'flag' | 'location' | 'compass' = 'location';

    switch (item.type) {
      case 'country':
        imageUrl = item.item.heroImageUrl;
        title = item.item.name;
        subtitle = item.item.subtitle;
        icon = 'flag';
        break;
      case 'city':
        imageUrl = item.item.heroImageUrl;
        title = item.item.name;
        subtitle = item.item.countryName;
        icon = 'location';
        break;
      case 'activity':
        imageUrl = item.item.heroImageUrl;
        title = item.item.name;
        subtitle = `${item.item.cityName}, ${item.item.countryName}`;
        icon = 'compass';
        break;
    }

    return (
      <Pressable
        style={styles.resultItem}
        onPress={() => handleResultPress(item)}
      >
        <Image source={{ uri: imageUrl }} style={styles.resultImage} contentFit="cover" />
        <View style={styles.resultText}>
          <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <View style={styles.resultIconContainer}>
          <Ionicons name={icon} size={16} color={colors.textSecondary} />
        </View>
      </Pressable>
    );
  }, [handleResultPress]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={getPlaceholder()}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {query.length > 0 ? (
        results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.type}-${index}`}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No results for "{query}"</Text>
          </View>
        )
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Start typing to search</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultsList: {
    paddingVertical: spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
```

### Step 2: Commit

```bash
git add app/(tabs)/explore/search.tsx
git commit -m "feat(explore): add search screen with segment-aware filtering"
```

---

## Task 8: Create See All List Screen

**Files:**
- Create: `app/(tabs)/explore/see-all.tsx`

### Step 1: Create See All screen

```typescript
// app/(tabs)/explore/see-all.tsx
import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors, fonts, radius, spacing } from '@/constants/design';
import {
  mockCountries,
  mockCities,
  mockActivities,
  getCountriesByContinent,
  getCitiesByCategory,
  getActivitiesByCategory,
  getTopRatedActivities,
  MockCountry,
  MockCity,
  MockActivity,
} from '@/data/exploreMockData';

type ListItem = MockCountry | MockCity | MockActivity;

export default function SeeAllScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category: string; title: string }>();

  const { items, itemType } = useMemo(() => {
    const category = params.category || '';

    // Countries
    if (category === 'all-countries') {
      return { items: mockCountries, itemType: 'country' as const };
    }
    if (category.startsWith('continent-')) {
      const continent = category.replace('continent-', '') as MockCountry['continent'];
      return { items: getCountriesByContinent(continent), itemType: 'country' as const };
    }

    // Cities
    if (category.startsWith('cities-')) {
      const cityCategory = category.replace('cities-', '') as any;
      return { items: getCitiesByCategory(cityCategory), itemType: 'city' as const };
    }

    // Activities
    if (category === 'activities-top') {
      return { items: getTopRatedActivities(20), itemType: 'activity' as const };
    }
    if (category.startsWith('activities-')) {
      const activityCategory = category.replace('activities-', '') as any;
      return { items: getActivitiesByCategory(activityCategory), itemType: 'activity' as const };
    }

    return { items: [], itemType: 'country' as const };
  }, [params.category]);

  const handleItemPress = useCallback((item: ListItem, type: string) => {
    switch (type) {
      case 'country':
        router.push(`/(tabs)/explore/country/${(item as MockCountry).slug}` as any);
        break;
      case 'city':
        router.push(`/(tabs)/explore/city/${(item as MockCity).slug}` as any);
        break;
      case 'activity':
        router.push(`/(tabs)/explore/activity/${(item as MockActivity).slug}` as any);
        break;
    }
  }, [router]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    let imageUrl = '';
    let title = '';
    let subtitle = '';
    let rating: number | undefined;
    let reviewCount: number | undefined;
    let price: { amount: number; suffix: string } | undefined;

    if (itemType === 'country') {
      const country = item as MockCountry;
      imageUrl = country.heroImageUrl;
      title = country.name;
      subtitle = country.subtitle;
      rating = country.rating;
      reviewCount = country.reviewCount;
    } else if (itemType === 'city') {
      const city = item as MockCity;
      imageUrl = city.heroImageUrl;
      title = city.name;
      subtitle = city.countryName;
      rating = city.rating;
      reviewCount = city.reviewCount;
    } else {
      const activity = item as MockActivity;
      imageUrl = activity.heroImageUrl;
      title = activity.name;
      subtitle = `${activity.cityName}, ${activity.countryName}`;
      rating = activity.rating;
      reviewCount = activity.reviewCount;
      price = { amount: activity.priceFrom, suffix: '/ person' };
    }

    return (
      <Pressable
        style={styles.listItem}
        onPress={() => handleItemPress(item, itemType)}
      >
        <Image source={{ uri: imageUrl }} style={styles.listImage} contentFit="cover" />
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.listSubtitle} numberOfLines={1}>{subtitle}</Text>
          {price && (
            <Text style={styles.listPrice}>From ${price.amount} {price.suffix}</Text>
          )}
          {rating !== undefined && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.textPrimary} />
              <Text style={styles.ratingText}>{rating.toFixed(2)}</Text>
              {reviewCount !== undefined && (
                <Text style={styles.reviewCount}>({reviewCount.toLocaleString()})</Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color={colors.textPrimary} />
        </View>
      </Pressable>
    );
  }, [itemType, handleItemPress]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{params.title || 'Browse'}</Text>
        <Pressable style={styles.filterButton} hitSlop={8}>
          <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: spacing.screenX,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listImage: {
    width: 120,
    height: 120,
    borderRadius: radius.card,
  },
  listContent: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  listTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  listSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listPrice: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
```

### Step 2: Commit

```bash
git add app/(tabs)/explore/see-all.tsx
git commit -m "feat(explore): add See All list screen with filter placeholder"
```

---

## Task 9: Create Activity Detail Stub Screen

**Files:**
- Create: `app/(tabs)/explore/activity/[slug].tsx`

### Step 1: Create Activity detail stub

```typescript
// app/(tabs)/explore/activity/[slug].tsx
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { mockActivities } from '@/data/exploreMockData';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const activity = mockActivities.find(a => a.slug === slug);

  if (!activity) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Activity not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: activity.heroImageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
          {/* Back Button Overlay */}
          <Pressable
            style={[styles.backButton, { top: insets.top + spacing.sm }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          {/* Favorite Button Overlay */}
          <Pressable
            style={[styles.favoriteButton, { top: insets.top + spacing.sm }]}
          >
            <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{activity.name}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.location}>{activity.cityName}, {activity.countryName}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.textPrimary} />
            <Text style={styles.ratingText}>{activity.rating.toFixed(2)}</Text>
            <Text style={styles.reviewCount}>({activity.reviewCount.toLocaleString()} reviews)</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{activity.duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>From</Text>
              <Text style={styles.infoValue}>${activity.priceFrom}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Placeholder content */}
          <Text style={styles.sectionTitle}>About this experience</Text>
          <Text style={styles.description}>
            This is a placeholder description for the activity. The full description will be populated when connected to the backend.
          </Text>

          <Text style={styles.sectionTitle}>What's included</Text>
          <View style={styles.includesList}>
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} />
              <Text style={styles.includeText}>Local guide</Text>
            </View>
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} />
              <Text style={styles.includeText}>Food tastings</Text>
            </View>
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} />
              <Text style={styles.includeText}>Small group size</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceValue}>${activity.priceFrom}</Text>
          <Text style={styles.priceSuffix}>/ person</Text>
        </View>
        <Pressable style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Check availability</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    left: spacing.screenX,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    right: spacing.screenX,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.screenX,
    paddingBottom: 120,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  infoItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  includesList: {
    gap: spacing.md,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  includeText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  priceSuffix: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  bookButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  bookButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.background,
  },
});
```

### Step 2: Create the directory structure

Run: `mkdir -p app/\(tabs\)/explore/activity`

### Step 3: Commit

```bash
git add app/(tabs)/explore/activity/
git commit -m "feat(explore): add activity detail stub screen"
```

---

## Task 10: Rewrite Main Explore Screen

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

### Step 1: Rewrite the Explore screen with segmented tabs

```typescript
// app/(tabs)/explore/index.tsx
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/design';
import { SearchBar, SegmentedControl } from '@/components/explore';
import { CountriesTab, PlacesTab, ActivitiesTab } from '@/components/explore/tabs';

type SegmentKey = 'countries' | 'places' | 'activities';

const SEGMENTS = [
  { key: 'countries' as const, label: 'Countries' },
  { key: 'places' as const, label: 'Places' },
  { key: 'activities' as const, label: 'Activities' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const [selectedSegment, setSelectedSegment] = useState<SegmentKey>('countries');

  const handleSearchPress = useCallback(() => {
    posthog.capture('explore_search_tapped', { segment: selectedSegment });
    router.push({
      pathname: '/(tabs)/explore/search',
      params: { segment: selectedSegment },
    } as any);
  }, [router, posthog, selectedSegment]);

  const handleSegmentChange = useCallback((key: string) => {
    posthog.capture('explore_segment_changed', { segment: key });
    setSelectedSegment(key as SegmentKey);
  }, [posthog]);

  const handleNavigateToSeeAll = useCallback((category: string, title: string) => {
    posthog.capture('explore_see_all_tapped', { category, title });
    router.push({
      pathname: '/(tabs)/explore/see-all',
      params: { category, title },
    } as any);
  }, [router, posthog]);

  const getSearchPlaceholder = () => {
    switch (selectedSegment) {
      case 'countries': return 'Search countries...';
      case 'places': return 'Search cities...';
      case 'activities': return 'Search activities...';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Search Bar */}
      <SearchBar
        placeholder={getSearchPlaceholder()}
        onPress={handleSearchPress}
      />

      {/* Segmented Control */}
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey={selectedSegment}
        onSelect={handleSegmentChange}
      />

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {selectedSegment === 'countries' && (
          <CountriesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
        {selectedSegment === 'places' && (
          <PlacesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
        {selectedSegment === 'activities' && (
          <ActivitiesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContent: {
    flex: 1,
  },
});
```

### Step 2: Verify no TypeScript errors

Run: `npx tsc --noEmit`
Expected: No errors (or only pre-existing errors unrelated to explore)

### Step 3: Commit

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat(explore): rewrite main screen with segmented tabs (Countries, Places, Activities)"
```

---

## Task 11: Update Bottom Tab Bar

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

### Step 1: Update tab configuration

Change the Home tab name to "Explore" and update the current Explore tab icon to "users" (two people icon).

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { colors, fonts } from '@/constants/design';
import SOSButton from '@/components/SOSButton';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const [sosVisible, setSosVisible] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomInset,
            height: Platform.OS === 'ios' ? 88 + (bottomInset - 20) : 64 + (bottomInset - 8),
          },
        ],
        tabBarIconStyle: styles.tabBarIcon,
        tabBarLabel: ({ focused, children }) => (
          <Text style={[styles.tabBarLabel, { color: focused ? colors.orange : colors.textMuted }]}>
            {children}
          </Text>
        ),
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Feather name="search" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Travelers',
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarButton: () => (
            <Pressable
              style={styles.sosTab}
              onPress={() => setSosVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="SOS emergency button. Double tap to open emergency contacts."
              accessibilityHint="Opens emergency contact options for police, ambulance, and fire services"
            >
              <View style={styles.sosCircle}>
                <Feather name="shield" size={18} color={colors.background} />
              </View>
              <Text style={styles.sosLabel}>SOS</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
    <SOSButton externalVisible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 8,
    elevation: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 0 },
    }),
  },
  tabBarLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabBarIcon: {
    marginTop: 2,
  },
  sosTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  sosCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.emergency,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
```

### Step 2: Commit

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat(navigation): rename Home to Travelers, move Explore to first position, use users icon"
```

---

## Task 12: Add Explore Stack Layout

**Files:**
- Modify: `app/(tabs)/explore/_layout.tsx` (create if doesn't exist)

### Step 1: Create or update Explore stack layout

```typescript
// app/(tabs)/explore/_layout.tsx
import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" options={{ presentation: 'modal' }} />
      <Stack.Screen name="see-all" />
      <Stack.Screen name="country/[slug]" />
      <Stack.Screen name="city/[slug]" />
      <Stack.Screen name="activity/[slug]" />
      <Stack.Screen name="place-detail/[id]" />
    </Stack>
  );
}
```

### Step 2: Commit

```bash
git add app/(tabs)/explore/_layout.tsx
git commit -m "feat(explore): add stack layout with proper route configuration"
```

---

## Task 13: Run Full App Test

### Step 1: Start the development server

Run: `npx expo start`

### Step 2: Manual verification checklist

- [ ] App launches without crash
- [ ] Bottom tab shows: Explore, Travelers, SOS, Trips, Profile
- [ ] Explore tab opens new redesigned screen
- [ ] Segmented control switches between Countries, Places, Activities
- [ ] Search bar tap opens search modal
- [ ] Horizontal carousels scroll smoothly
- [ ] "See all" arrow buttons navigate to list screen
- [ ] Cards show: image, title, subtitle, rating
- [ ] No "Rendered more hooks" errors in console
- [ ] Country/City taps navigate to existing detail screens
- [ ] Activity taps navigate to new activity detail stub

### Step 3: Final commit

```bash
git add -A
git commit -m "feat(explore): complete Airbnb-style redesign implementation"
```

---

## Summary

This plan implements the Explore redesign in 13 tasks:

1. **Mock Data** - Typed data file for countries, cities, activities
2. **Core Components** - ExploreCard, SectionHeader, SearchBar, SegmentedControl
3. **Carousel** - Horizontal FlatList wrapper
4. **Countries Tab** - Continent-grouped carousels
5. **Places Tab** - Category-grouped city carousels
6. **Activities Tab** - Best rated + category carousels
7. **Search Screen** - Segment-aware search with results
8. **See All Screen** - Vertical list with filter button placeholder
9. **Activity Detail** - Stub screen for activities
10. **Main Explore** - Rewritten with segmented tabs
11. **Tab Bar** - Renamed Home→Travelers, reordered, updated icon
12. **Stack Layout** - Route configuration
13. **Testing** - Full app verification

Each task is atomic and can be committed independently. The implementation follows Sola's design system while achieving Airbnb-level visual polish.
