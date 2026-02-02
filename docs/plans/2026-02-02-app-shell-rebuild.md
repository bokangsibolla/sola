# Sola App Shell Rebuild — Post-Login Experience

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Gut the current placeholder tab screens and rebuild the core post-login app shell — the tabs, the screens you land on after signup, the ability to view other users, DM them, plan trips, browse country guides, and save collections of places.

**Architecture:** Expo Router file-based routing with 4 bottom tabs (Home, Explore, Trips, Profile). Stack screens nested inside tabs for detail views (user profiles, DM threads, country guides, place details). In-memory stores for now (no backend yet), with mock data structured to match future Supabase schema. All screens use existing `AppScreen`, `AppHeader`, design tokens from `constants/design.ts`.

**Tech Stack:** Expo 54, React Native 0.81, expo-router 6, Reanimated 4, Ionicons, existing PlusJakartaSans/InstrumentSerif fonts.

---

## What gets deleted

All current tab screens are gutted and rewritten. Files removed:
- `app/(tabs)/explore.tsx` — replaced
- `app/(tabs)/places.tsx` — removed entirely (merged into Explore)
- `app/(tabs)/saved.tsx` — removed (becomes Collections inside Profile)
- `app/(tabs)/trip.tsx` — replaced with Trips tab

Files kept as-is:
- All `app/(onboarding)/*` screens — onboarding flow unchanged
- `app/_layout.tsx` — root layout unchanged
- `components/AppScreen.tsx`, `components/AppHeader.tsx` — reused
- `components/ui/*` — reused and extended
- `constants/design.ts` — extended with new colors
- `data/safety.ts`, `data/cities.ts`, `data/geo.ts`, `data/greetings.ts` — kept
- `state/onboardingStore.ts` — kept, extended

## New tab structure

| Tab | Icon | Default? | What it shows |
|-----|------|----------|---------------|
| Home | `home` / `home-outline` | Yes (landing after login) | Feed of nearby travelers, travel tips, personalized suggestions |
| Explore | `compass` / `compass-outline` | No | Country guides, city guides, search destinations, browse places |
| Trips | `airplane` / `airplane-outline` | No | Your trips (planned, active, past), add new trip |
| Profile | `person` / `person-outline` | No | Your profile, collections/saved, settings, privacy |

## New screen routes (nested stacks)

```
app/(tabs)/
  _layout.tsx          — 4 tabs: home, explore, trips, profile
  home/
    index.tsx          — home feed
    user/[id].tsx      — other user's profile
    dm/index.tsx       — DM list (conversations)
    dm/[id].tsx        — DM thread with a user
  explore/
    index.tsx          — search + browse countries
    country/[slug].tsx — country guide (overview, cities, safety, tips)
    place/[slug].tsx   — place/city detail (things to do, stays, tips)
  trips/
    index.tsx          — your trips list
    new.tsx            — create/add a trip
    [id].tsx           — trip detail (itinerary, dates, places)
  profile/
    index.tsx          — your profile + collections + settings
    collections/[id].tsx — a saved collection detail
    edit.tsx           — edit profile
    settings.tsx       — privacy & app settings
```

## Mock data structure

All mock data lives in `data/mock/` as typed arrays. Each entity has an `id` field. This structure mirrors future Supabase tables.

---

## Tasks

### Task 1: Clean up — delete old tab files, add new colors

**Files:**
- Delete: `app/(tabs)/explore.tsx`, `app/(tabs)/places.tsx`, `app/(tabs)/saved.tsx`, `app/(tabs)/trip.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/_layout.tsx`
- Modify: `constants/design.ts`

**Step 1: Delete old tab files**

```bash
rm app/(tabs)/explore.tsx app/(tabs)/places.tsx app/(tabs)/saved.tsx app/(tabs)/trip.tsx app/(tabs)/profile.tsx app/(tabs)/_layout.tsx
```

**Step 2: Add missing design tokens to `constants/design.ts`**

Add to the `colors` object:
```typescript
textSecondary: '#6B6B6B',
borderSubtle: '#F0F0F0',
greenSoft: '#2D8A4E',
greenFill: '#EEFBF3',
blueSoft: '#3B82F6',
blueFill: '#EFF6FF',
```

These are needed across the app. `textSecondary` and `borderSubtle` were referenced but never defined — fix that now.

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: delete old tab screens, add missing design tokens"
```

---

### Task 2: Mock data — users, trips, messages, guides

**Files:**
- Create: `data/mock/users.ts`
- Create: `data/mock/trips.ts`
- Create: `data/mock/messages.ts`
- Create: `data/mock/guides.ts`
- Create: `data/mock/collections.ts`
- Create: `data/mock/index.ts`

**Step 1: Create `data/mock/users.ts`**

```typescript
export interface User {
  id: string;
  firstName: string;
  bio: string;
  photoUrl: string | null;
  countryIso2: string;
  countryName: string;
  interests: string[];
  travelStyle: string;
  placesVisited: string[];     // country ISO codes
  currentCity: string | null;
  isOnline: boolean;
}

export const mockUsers: User[] = [
  {
    id: 'u1',
    firstName: 'Amara',
    bio: 'Slow traveler. Love getting lost in markets.',
    photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    countryIso2: 'NG',
    countryName: 'Nigeria',
    interests: ['🍜 Trying the food', '🏛️ History & culture'],
    travelStyle: 'Budget-friendly',
    placesVisited: ['PT', 'ES', 'MA', 'GH', 'TH'],
    currentCity: 'Lisbon',
    isOnline: true,
  },
  {
    id: 'u2',
    firstName: 'Mei',
    bio: 'Photographer chasing golden hours around the world.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    countryIso2: 'TW',
    countryName: 'Taiwan',
    interests: ['📸 Photo spots', '🌿 Being outdoors'],
    travelStyle: 'Mid-range',
    placesVisited: ['JP', 'KR', 'NZ', 'IS', 'NO'],
    currentCity: 'Kyoto',
    isOnline: false,
  },
  {
    id: 'u3',
    firstName: 'Sofia',
    bio: 'Yoga teacher on a permanent sabbatical.',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    countryIso2: 'AR',
    countryName: 'Argentina',
    interests: ['🧘 Rest & wellness', '🌿 Being outdoors'],
    travelStyle: 'Budget-friendly',
    placesVisited: ['IN', 'ID', 'TH', 'PE', 'MX'],
    currentCity: 'Ubud',
    isOnline: true,
  },
  {
    id: 'u4',
    firstName: 'Priya',
    bio: 'Tech nomad. Always looking for the best co-working spot.',
    photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
    countryIso2: 'IN',
    countryName: 'India',
    interests: ['🌙 Going out at night', '🍜 Trying the food'],
    travelStyle: 'Mid-range',
    placesVisited: ['DE', 'PT', 'TH', 'VN', 'JP', 'MX'],
    currentCity: 'Chiang Mai',
    isOnline: true,
  },
  {
    id: 'u5',
    firstName: 'Emma',
    bio: 'History nerd. Will walk 30k steps for a good ruin.',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    countryIso2: 'GB',
    countryName: 'United Kingdom',
    interests: ['🏛️ History & culture', '🗺️ Hidden gems'],
    travelStyle: 'Treat yourself',
    placesVisited: ['IT', 'GR', 'EG', 'JO', 'TR', 'HR'],
    currentCity: 'Athens',
    isOnline: false,
  },
  {
    id: 'u6',
    firstName: 'Aya',
    bio: 'Solo since 2019. The world is friendlier than you think.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    countryIso2: 'JP',
    countryName: 'Japan',
    interests: ['🚶‍♀️ Solo-friendly', '🛍️ Shopping & markets'],
    travelStyle: 'Mid-range',
    placesVisited: ['FR', 'IT', 'AU', 'KR', 'TH', 'VN', 'US'],
    currentCity: null,
    isOnline: false,
  },
];
```

**Step 2: Create `data/mock/trips.ts`**

```typescript
export interface Trip {
  id: string;
  userId: string;
  destination: string;
  countryIso2: string;
  arriving: string;       // ISO date
  leaving: string;        // ISO date
  nights: number;
  status: 'planned' | 'active' | 'completed';
  places: string[];       // place slugs to visit
  notes: string;
}

export const mockTrips: Trip[] = [
  {
    id: 't1',
    userId: 'me',
    destination: 'Lisbon',
    countryIso2: 'PT',
    arriving: '2026-03-15',
    leaving: '2026-03-22',
    nights: 7,
    status: 'planned',
    places: ['alfama', 'belem', 'sintra'],
    notes: 'Want to find a good fado bar',
  },
  {
    id: 't2',
    userId: 'me',
    destination: 'Kyoto',
    countryIso2: 'JP',
    arriving: '2025-11-01',
    leaving: '2025-11-10',
    nights: 9,
    status: 'completed',
    places: ['fushimi-inari', 'arashiyama', 'kinkaku-ji'],
    notes: 'Best trip ever. Autumn colors were unreal.',
  },
];
```

**Step 3: Create `data/mock/messages.ts`**

```typescript
export interface Conversation {
  id: string;
  withUserId: string;
  lastMessage: string;
  lastMessageAt: string;   // ISO datetime
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;       // 'me' or user id
  text: string;
  sentAt: string;         // ISO datetime
}

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    withUserId: 'u1',
    lastMessage: 'The Time Out Market is amazing, definitely go!',
    lastMessageAt: '2026-02-01T14:30:00Z',
    unreadCount: 1,
  },
  {
    id: 'c2',
    withUserId: 'u3',
    lastMessage: 'See you in Ubud next month!',
    lastMessageAt: '2026-01-28T09:15:00Z',
    unreadCount: 0,
  },
  {
    id: 'c3',
    withUserId: 'u4',
    lastMessage: 'That coworking space in Chiang Mai is called Punspace',
    lastMessageAt: '2026-01-25T18:45:00Z',
    unreadCount: 0,
  },
];

export const mockMessages: Message[] = [
  // Conversation with Amara (c1)
  { id: 'm1', conversationId: 'c1', senderId: 'me', text: 'Hey! I saw you\'re in Lisbon. Any food recs?', sentAt: '2026-02-01T14:00:00Z' },
  { id: 'm2', conversationId: 'c1', senderId: 'u1', text: 'The Time Out Market is amazing, definitely go!', sentAt: '2026-02-01T14:30:00Z' },
  // Conversation with Sofia (c2)
  { id: 'm3', conversationId: 'c2', senderId: 'u3', text: 'Are you still planning the Bali trip?', sentAt: '2026-01-28T08:00:00Z' },
  { id: 'm4', conversationId: 'c2', senderId: 'me', text: 'Yes! Arriving mid-March', sentAt: '2026-01-28T09:00:00Z' },
  { id: 'm5', conversationId: 'c2', senderId: 'u3', text: 'See you in Ubud next month!', sentAt: '2026-01-28T09:15:00Z' },
  // Conversation with Priya (c3)
  { id: 'm6', conversationId: 'c3', senderId: 'me', text: 'Do you know any good coworking spaces in Chiang Mai?', sentAt: '2026-01-25T18:00:00Z' },
  { id: 'm7', conversationId: 'c3', senderId: 'u4', text: 'That coworking space in Chiang Mai is called Punspace', sentAt: '2026-01-25T18:45:00Z' },
];
```

**Step 4: Create `data/mock/guides.ts`**

```typescript
export interface CountryGuide {
  slug: string;
  name: string;
  iso2: string;
  heroImageUrl: string;
  tagline: string;
  safetyRating: 'very safe' | 'generally safe' | 'use caution';
  soloFriendly: boolean;
  bestMonths: string;
  currency: string;
  language: string;
  visaNote: string;
  highlights: string[];
  cities: CityGuide[];
}

export interface CityGuide {
  slug: string;
  name: string;
  countrySlug: string;
  heroImageUrl: string;
  tagline: string;
  neighborhoods: string[];
  mustDo: PlaceEntry[];
  eats: PlaceEntry[];
  stays: PlaceEntry[];
}

export interface PlaceEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  priceLevel?: '$' | '$$' | '$$$' | '$$$$';
  tip?: string;
}

export const mockCountryGuides: CountryGuide[] = [
  {
    slug: 'portugal',
    name: 'Portugal',
    iso2: 'PT',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=800',
    tagline: 'Affordable, safe, and endlessly charming',
    safetyRating: 'very safe',
    soloFriendly: true,
    bestMonths: 'Apr–Oct',
    currency: 'EUR (€)',
    language: 'Portuguese',
    visaNote: 'Schengen area — 90 days visa-free for most passports',
    highlights: ['Pastel de nata trail', 'Fado nights in Alfama', 'Surfing in Ericeira', 'Day trip to Sintra'],
    cities: [
      {
        slug: 'lisbon',
        name: 'Lisbon',
        countrySlug: 'portugal',
        heroImageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=800',
        tagline: 'Hilly, sunny, and full of pastéis',
        neighborhoods: ['Alfama', 'Bairro Alto', 'Belém', 'Príncipe Real'],
        mustDo: [
          { id: 'p1', name: 'Tram 28 ride', category: 'Experience', description: 'The iconic yellow tram through the oldest neighborhoods', imageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=600', tip: 'Go early morning to avoid crowds' },
          { id: 'p2', name: 'Castelo de São Jorge', category: 'History', description: 'Hilltop castle with panoramic views of the city', imageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=600', priceLevel: '$' },
          { id: 'p3', name: 'LX Factory', category: 'Culture', description: 'Creative hub with shops, food, and art in a converted factory', imageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=600' },
        ],
        eats: [
          { id: 'e1', name: 'Time Out Market', category: 'Food hall', description: 'Best of Lisbon\'s food scene under one roof', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', priceLevel: '$$' },
          { id: 'e2', name: 'Pastéis de Belém', category: 'Bakery', description: 'The original pastel de nata since 1837', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', priceLevel: '$' },
        ],
        stays: [
          { id: 's1', name: 'The Lumiares', category: 'Boutique Hotel', description: 'Converted 18th-century palace in Bairro Alto', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', priceLevel: '$$$' },
          { id: 's2', name: 'Lisbon Destination Hostel', category: 'Hostel', description: 'Social hostel inside a gorgeous train station', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', priceLevel: '$' },
        ],
      },
    ],
  },
  {
    slug: 'japan',
    name: 'Japan',
    iso2: 'JP',
    heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    tagline: 'Safe, clean, and utterly fascinating',
    safetyRating: 'very safe',
    soloFriendly: true,
    bestMonths: 'Mar–May, Oct–Nov',
    currency: 'JPY (¥)',
    language: 'Japanese',
    visaNote: '90 days visa-free for most Western passports',
    highlights: ['Cherry blossom season', 'Temple stays', 'Street food in Osaka', 'Onsen culture'],
    cities: [
      {
        slug: 'kyoto',
        name: 'Kyoto',
        countrySlug: 'japan',
        heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
        tagline: 'Temples, gardens, and tea ceremonies',
        neighborhoods: ['Gion', 'Arashiyama', 'Higashiyama', 'Fushimi'],
        mustDo: [
          { id: 'p4', name: 'Fushimi Inari Shrine', category: 'Temple', description: 'Thousands of vermillion torii gates up the mountain', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600', tip: 'Start at sunrise to have it to yourself' },
          { id: 'p5', name: 'Arashiyama Bamboo Grove', category: 'Nature', description: 'Walk through towering bamboo stalks', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600' },
        ],
        eats: [
          { id: 'e3', name: 'Nishiki Market', category: 'Market', description: 'Kyoto\'s 400-year-old kitchen — sample as you walk', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', priceLevel: '$' },
        ],
        stays: [
          { id: 's3', name: 'Traditional Ryokan', category: 'Ryokan', description: 'Tatami floors, futon beds, kaiseki dinner included', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', priceLevel: '$$$' },
        ],
      },
    ],
  },
  {
    slug: 'morocco',
    name: 'Morocco',
    iso2: 'MA',
    heroImageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    tagline: 'Sensory overload in the best way',
    safetyRating: 'generally safe',
    soloFriendly: true,
    bestMonths: 'Mar–May, Sep–Nov',
    currency: 'MAD (د.م.)',
    language: 'Arabic, French, Berber',
    visaNote: '90 days visa-free for most passports',
    highlights: ['Getting lost in the medina', 'Sahara desert camping', 'Hammam ritual', 'Atlas Mountains trekking'],
    cities: [
      {
        slug: 'marrakech',
        name: 'Marrakech',
        countrySlug: 'morocco',
        heroImageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
        tagline: 'Chaos, color, and incredible hospitality',
        neighborhoods: ['Medina', 'Gueliz', 'Mellah', 'Palmerie'],
        mustDo: [
          { id: 'p6', name: 'Jardin Majorelle', category: 'Garden', description: 'Yves Saint Laurent\'s cobalt-blue botanical garden', imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=600', priceLevel: '$' },
        ],
        eats: [
          { id: 'e4', name: 'Jemaa el-Fnaa food stalls', category: 'Street food', description: 'The main square transforms into an open-air restaurant at sunset', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', priceLevel: '$' },
        ],
        stays: [
          { id: 's4', name: 'Riad Yasmine', category: 'Riad', description: 'That famous Instagram pool — and it\'s even better in person', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', priceLevel: '$$' },
        ],
      },
    ],
  },
];
```

**Step 5: Create `data/mock/collections.ts`**

```typescript
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
```

**Step 6: Create `data/mock/index.ts`**

```typescript
export { mockUsers, type User } from './users';
export { mockTrips, type Trip } from './trips';
export { mockConversations, mockMessages, type Conversation, type Message } from './messages';
export { mockCountryGuides, type CountryGuide, type CityGuide, type PlaceEntry } from './guides';
export { mockCollections, type Collection } from './collections';
```

**Step 7: Commit**

```bash
git add data/mock/ && git commit -m "feat: add mock data for users, trips, messages, guides, collections"
```

---

### Task 3: Tab layout — 4 tabs with nested stacks

**Files:**
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/home/_layout.tsx`
- Create: `app/(tabs)/explore/_layout.tsx`
- Create: `app/(tabs)/trips/_layout.tsx`
- Create: `app/(tabs)/profile/_layout.tsx`

**Step 1: Create `app/(tabs)/_layout.tsx`**

```typescript
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { colors } from '@/constants/design';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textPrimary,
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
          <Text style={[styles.tabBarLabel, { color: focused ? colors.orange : colors.textSecondary }]}>
            {children}
          </Text>
        ),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'airplane' : 'airplane-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 0,
    paddingTop: 8,
    elevation: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.02,
        shadowRadius: 3,
      },
      android: { elevation: 0 },
    }),
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabBarIcon: {
    marginTop: 2,
  },
});
```

**Step 2: Create nested stack layouts**

Each tab gets a `_layout.tsx` that wraps its screens in a Stack with `headerShown: false`.

`app/(tabs)/home/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`app/(tabs)/explore/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`app/(tabs)/trips/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';

export default function TripsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`app/(tabs)/profile/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Step 3: Commit**

```bash
git add app/(tabs)/ && git commit -m "feat: new 4-tab layout with nested stacks"
```

---

### Task 4: Home tab — feed + traveler cards

**Files:**
- Create: `app/(tabs)/home/index.tsx`
- Create: `components/TravelerCard.tsx`

**Step 1: Create `components/TravelerCard.tsx`**

A card showing another user's photo, name, country, bio, interests, and current city. Tappable.

```typescript
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import type { User } from '@/data/mock';

interface TravelerCardProps {
  user: User;
  onPress: () => void;
}

export default function TravelerCard({ user, onPress }: TravelerCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color={colors.textMuted} />
            </View>
          )}
          {user.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{user.firstName}</Text>
          <Text style={styles.location}>
            {user.currentCity ? `${user.currentCity} · ` : ''}{user.countryName}
          </Text>
        </View>
      </View>
      <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>
      <View style={styles.tags}>
        {user.interests.slice(0, 2).map((interest) => (
          <View key={interest} style={styles.tag}>
            <Text style={styles.tagText}>{interest}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.greenSoft,
    borderWidth: 2,
    borderColor: colors.background,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
});
```

**Step 2: Create `app/(tabs)/home/index.tsx`**

```typescript
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import TravelerCard from '@/components/TravelerCard';
import { mockUsers } from '@/data/mock';
import { colors, fonts, spacing, typography } from '@/constants/design';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Travelers near you</Text>
        <Text style={styles.subtitle}>
          Women exploring the world right now
        </Text>

        <View style={styles.feed}>
          {mockUsers.map((user) => (
            <TravelerCard
              key={user.id}
              user={user}
              onPress={() => router.push(`/home/user/${user.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 22,
    width: 60,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  feed: {
    gap: 0,
  },
});
```

**Step 3: Commit**

```bash
git add components/TravelerCard.tsx app/(tabs)/home/index.tsx && git commit -m "feat: home tab with traveler feed"
```

---

### Task 5: User profile screen (viewing other users)

**Files:**
- Create: `app/(tabs)/home/user/[id].tsx`

**Step 1: Create `app/(tabs)/home/user/[id].tsx`**

```typescript
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockUsers } from '@/data/mock';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = mockUsers.find((u) => u.id === id);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>User not found</Text>
      </View>
    );
  }

  const countryData = countries.find((c) => c.iso2 === user.countryIso2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          style={styles.messageButton}
          onPress={() => router.push(`/home/dm/${user.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.orange} />
          <Text style={styles.messageButtonText}>Message</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + name */}
        <View style={styles.profileHeader}>
          {user.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={32} color={colors.textMuted} />
            </View>
          )}
          <Text style={styles.name}>{user.firstName}</Text>
          <Text style={styles.origin}>
            {countryData?.flag ?? ''} {user.countryName}
          </Text>
          {user.currentCity && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.orange} />
              <Text style={styles.currentCity}>Currently in {user.currentCity}</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        <Text style={styles.bio}>{user.bio}</Text>

        {/* Interests */}
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.tags}>
          {user.interests.map((interest) => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Places visited */}
        <Text style={styles.sectionTitle}>Places visited</Text>
        <View style={styles.flags}>
          {user.placesVisited.map((iso) => {
            const c = countries.find((cc) => cc.iso2 === iso);
            return (
              <Text key={iso} style={styles.flag}>{c?.flag ?? iso}</Text>
            );
          })}
        </View>

        {/* Travel style */}
        <Text style={styles.sectionTitle}>Travel style</Text>
        <Text style={styles.travelStyle}>{user.travelStyle}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  origin: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  currentCity: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  bio: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xl,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  flags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.xl,
  },
  flag: {
    fontSize: 28,
  },
  travelStyle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
```

**Step 2: Commit**

```bash
git add app/(tabs)/home/user/ && git commit -m "feat: user profile detail screen"
```

---

### Task 6: DM screens — conversation list + chat thread

**Files:**
- Create: `app/(tabs)/home/dm/index.tsx`
- Create: `app/(tabs)/home/dm/[id].tsx`

**Step 1: Create `app/(tabs)/home/dm/index.tsx`**

DM list showing conversations. Each row shows user avatar, name, last message, timestamp, unread badge.

```typescript
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { mockConversations, mockUsers } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function DMListScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <AppHeader title="Messages" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockConversations.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              No conversations yet. Say hi to a fellow traveler.
            </Text>
          </View>
        ) : (
          mockConversations.map((convo) => {
            const user = mockUsers.find((u) => u.id === convo.withUserId);
            if (!user) return null;
            return (
              <Pressable
                key={convo.id}
                style={styles.row}
                onPress={() => router.push(`/home/dm/${convo.withUserId}`)}
              >
                {user.photoUrl ? (
                  <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={18} color={colors.textMuted} />
                  </View>
                )}
                <View style={styles.rowText}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowName}>{user.firstName}</Text>
                    <Text style={styles.rowTime}>{timeAgo(convo.lastMessageAt)}</Text>
                  </View>
                  <Text
                    style={[styles.rowMessage, convo.unreadCount > 0 && styles.rowMessageUnread]}
                    numberOfLines={1}
                  >
                    {convo.lastMessage}
                  </Text>
                </View>
                {convo.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{convo.unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rowName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  rowMessage: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  rowMessageUnread: {
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.orange,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.background,
  },
});
```

**Step 2: Create `app/(tabs)/home/dm/[id].tsx`**

Chat thread with message bubbles and input bar.

```typescript
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockConversations, mockMessages, mockUsers, type Message } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function DMThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = mockUsers.find((u) => u.id === id);
  const convo = mockConversations.find((c) => c.withUserId === id);
  const [messages, setMessages] = useState<Message[]>(
    convo ? mockMessages.filter((m) => m.conversationId === convo.id) : [],
  );
  const [text, setText] = useState('');

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      conversationId: convo?.id ?? 'new',
      senderId: 'me',
      text: text.trim(),
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerName}>{user?.firstName ?? 'Chat'}</Text>
        <Pressable onPress={() => user && router.push(`/home/user/${user.id}`)} hitSlop={12}>
          <Ionicons name="person-circle-outline" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMe = item.senderId === 'me';
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={sendMessage}
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={18} color={text.trim() ? colors.background : colors.textMuted} />
        </Pressable>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.card,
    marginBottom: spacing.sm,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.orange,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.borderDefault,
  },
  bubbleText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: colors.background,
  },
  bubbleTextThem: {
    color: colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderDefault,
  },
});
```

**Step 3: Commit**

```bash
git add app/(tabs)/home/dm/ && git commit -m "feat: DM list and chat thread screens"
```

---

### Task 7: Explore tab — country guides + search

**Files:**
- Create: `app/(tabs)/explore/index.tsx`
- Create: `app/(tabs)/explore/country/[slug].tsx`
- Create: `app/(tabs)/explore/place/[slug].tsx`

**Step 1: Create `app/(tabs)/explore/index.tsx`**

Search bar + grid of country guide cards.

```typescript
import { useState, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { mockCountryGuides } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return mockCountryGuides;
    const q = search.toLowerCase();
    return mockCountryGuides.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.cities.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <AppScreen>
      <AppHeader title="Explore" subtitle="Country guides and travel inspiration" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries or cities..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Country guide cards */}
        {filtered.map((guide) => (
          <Pressable
            key={guide.slug}
            style={styles.guideCard}
            onPress={() => router.push(`/explore/country/${guide.slug}`)}
          >
            <Image source={{ uri: guide.heroImageUrl }} style={styles.guideImage} />
            <View style={styles.guideOverlay}>
              <Text style={styles.guideName}>{guide.name}</Text>
              <Text style={styles.guideTagline}>{guide.tagline}</Text>
              <View style={styles.guideMeta}>
                {guide.soloFriendly && (
                  <View style={styles.guideBadge}>
                    <Text style={styles.guideBadgeText}>Solo-friendly</Text>
                  </View>
                )}
                <View style={styles.guideBadge}>
                  <Text style={styles.guideBadgeText}>{guide.safetyRating}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}

        {filtered.length === 0 && (
          <Text style={styles.noResults}>No guides found for "{search}"</Text>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  guideCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    height: 200,
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  guideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  guideName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  guideTagline: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  guideMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
  },
  guideBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  guideBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  noResults: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
```

**Step 2: Create `app/(tabs)/explore/country/[slug].tsx`**

Country guide detail — overview info, safety, cities list, highlights.

```typescript
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockCountryGuides } from '@/data/mock';
import { getEmergencyNumbers } from '@/data/safety';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function CountryGuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const guide = mockCountryGuides.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Guide not found</Text>
      </View>
    );
  }

  const emergency = getEmergencyNumbers(guide.iso2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: guide.heroImageUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{guide.name}</Text>
            <Text style={styles.heroTagline}>{guide.tagline}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick facts */}
          <View style={styles.factsGrid}>
            <Fact icon="shield-checkmark-outline" label="Safety" value={guide.safetyRating} />
            <Fact icon="calendar-outline" label="Best time" value={guide.bestMonths} />
            <Fact icon="cash-outline" label="Currency" value={guide.currency} />
            <Fact icon="language-outline" label="Language" value={guide.language} />
          </View>

          <Text style={styles.visaNote}>{guide.visaNote}</Text>

          {/* Highlights */}
          <Text style={styles.sectionTitle}>Highlights</Text>
          {guide.highlights.map((h, i) => (
            <View key={i} style={styles.highlightRow}>
              <Text style={styles.highlightBullet}>·</Text>
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}

          {/* Cities */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Cities</Text>
          {guide.cities.map((city) => (
            <Pressable
              key={city.slug}
              style={styles.cityCard}
              onPress={() => router.push(`/explore/place/${city.slug}`)}
            >
              <Image source={{ uri: city.heroImageUrl }} style={styles.cityImage} />
              <View style={styles.cityText}>
                <Text style={styles.cityName}>{city.name}</Text>
                <Text style={styles.cityTagline}>{city.tagline}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}

          {/* Emergency numbers */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Emergency numbers</Text>
          <View style={styles.emergencyCard}>
            <EmergencyRow label="Police" number={emergency.police} />
            <EmergencyRow label="Ambulance" number={emergency.ambulance} />
            <EmergencyRow label="Fire" number={emergency.fire} />
            {emergency.general && <EmergencyRow label="General" number={emergency.general} />}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon as any} size={18} color={colors.orange} />
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function EmergencyRow({ label, number }: { label: string; number: string }) {
  return (
    <View style={styles.emergencyRow}>
      <Text style={styles.emergencyLabel}>{label}</Text>
      <Text style={styles.emergencyNumber}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  hero: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroName: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  heroTagline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  fact: {
    width: '47%',
    gap: 4,
  },
  factLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  factValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  visaNote: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  highlightBullet: {
    ...typography.body,
    color: colors.orange,
  },
  highlightText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cityImage: {
    width: 72,
    height: 72,
  },
  cityText: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cityTagline: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  emergencyCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  emergencyLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  emergencyNumber: {
    ...typography.label,
    color: colors.orange,
  },
});
```

**Step 3: Create `app/(tabs)/explore/place/[slug].tsx`**

City/place detail — neighborhoods, must-do, eats, stays.

```typescript
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockCountryGuides, type CityGuide, type PlaceEntry } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

function findCity(slug: string): CityGuide | undefined {
  for (const guide of mockCountryGuides) {
    const city = guide.cities.find((c) => c.slug === slug);
    if (city) return city;
  }
  return undefined;
}

export default function PlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const city = findCity(slug ?? '');

  if (!city) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Place not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: city.heroImageUrl }} style={styles.hero} />

        <View style={styles.content}>
          <Text style={styles.cityName}>{city.name}</Text>
          <Text style={styles.tagline}>{city.tagline}</Text>

          {/* Neighborhoods */}
          <Text style={styles.sectionTitle}>Neighborhoods</Text>
          <View style={styles.pills}>
            {city.neighborhoods.map((n) => (
              <View key={n} style={styles.pill}>
                <Text style={styles.pillText}>{n}</Text>
              </View>
            ))}
          </View>

          {/* Must-do */}
          {city.mustDo.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Must-do</Text>
              {city.mustDo.map((entry) => (
                <PlaceEntryCard key={entry.id} entry={entry} />
              ))}
            </>
          )}

          {/* Eats */}
          {city.eats.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Where to eat</Text>
              {city.eats.map((entry) => (
                <PlaceEntryCard key={entry.id} entry={entry} />
              ))}
            </>
          )}

          {/* Stays */}
          {city.stays.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Where to stay</Text>
              {city.stays.map((entry) => (
                <PlaceEntryCard key={entry.id} entry={entry} />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PlaceEntryCard({ entry }: { entry: PlaceEntry }) {
  return (
    <View style={styles.entryCard}>
      <Image source={{ uri: entry.imageUrl }} style={styles.entryImage} />
      <View style={styles.entryText}>
        <Text style={styles.entryName}>{entry.name}</Text>
        <Text style={styles.entryCategory}>
          {entry.category}
          {entry.priceLevel ? ` · ${entry.priceLevel}` : ''}
        </Text>
        <Text style={styles.entryDesc} numberOfLines={2}>{entry.description}</Text>
        {entry.tip && (
          <Text style={styles.entryTip}>Tip: {entry.tip}</Text>
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
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  hero: {
    width: '100%',
    height: 200,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cityName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  entryCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  entryImage: {
    width: 88,
    height: 88,
  },
  entryText: {
    flex: 1,
    padding: spacing.md,
  },
  entryName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  entryCategory: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  entryDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 18,
  },
  entryTip: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
    marginTop: 4,
  },
});
```

**Step 4: Commit**

```bash
git add app/(tabs)/explore/ && git commit -m "feat: explore tab with country guides, city details, place entries"
```

---

### Task 8: Trips tab — list + create + detail

**Files:**
- Create: `app/(tabs)/trips/index.tsx`
- Create: `app/(tabs)/trips/new.tsx`
- Create: `app/(tabs)/trips/[id].tsx`

**Step 1: Create `app/(tabs)/trips/index.tsx`**

List of your trips (planned, active, completed) with a FAB to add new.

```typescript
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { mockTrips } from '@/data/mock';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const STATUS_COLORS = {
  planned: { bg: colors.blueFill, text: colors.blueSoft },
  active: { bg: colors.greenFill, text: colors.greenSoft },
  completed: { bg: colors.borderDefault, text: colors.textMuted },
};

export default function TripsScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <AppHeader
        title="Trips"
        subtitle="Your travel plans"
        rightComponent={
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/trips/new')}
          >
            <Ionicons name="add" size={22} color={colors.orange} />
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockTrips.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="airplane-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              No trips yet. Tap + to plan your first adventure.
            </Text>
          </View>
        ) : (
          mockTrips.map((trip) => {
            const country = countries.find((c) => c.iso2 === trip.countryIso2);
            const statusStyle = STATUS_COLORS[trip.status];
            return (
              <Pressable
                key={trip.id}
                style={styles.tripCard}
                onPress={() => router.push(`/trips/${trip.id}`)}
              >
                <View style={styles.tripHeader}>
                  <Text style={styles.tripFlag}>{country?.flag ?? ''}</Text>
                  <View style={styles.tripHeaderText}>
                    <Text style={styles.tripDestination}>{trip.destination}</Text>
                    <Text style={styles.tripDates}>
                      {trip.arriving} → {trip.leaving} · {trip.nights} nights
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {trip.status}
                    </Text>
                  </View>
                </View>
                {trip.notes ? (
                  <Text style={styles.tripNotes} numberOfLines={1}>{trip.notes}</Text>
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  tripCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripFlag: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  tripHeaderText: {
    flex: 1,
  },
  tripDestination: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  tripDates: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  tripNotes: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
```

**Step 2: Create `app/(tabs)/trips/new.tsx`**

Simple form to create a trip — destination, dates, notes.

```typescript
import { useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchDestinations } from '@/data/cities';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function NewTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [destination, setDestination] = useState('');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');

  const results = useMemo(() => {
    if (search.length < 2) return [];
    return searchDestinations(search).slice(0, 6);
  }, [search]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>New trip</Text>
        <Pressable
          onPress={() => {
            // In a real app, save to store/DB
            router.back();
          }}
          disabled={!destination && !search.trim()}
        >
          <Text style={[styles.saveText, (!destination && !search.trim()) && { opacity: 0.35 }]}>
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Where are you going?</Text>
        <View style={styles.inputRow}>
          <Ionicons name="location-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="City or country..."
            placeholderTextColor={colors.textMuted}
            value={destination || search}
            onChangeText={(t) => { setDestination(''); setSearch(t); }}
          />
        </View>

        {results.length > 0 && !destination && (
          <View style={styles.results}>
            {results.map((r, i) => (
              <Pressable
                key={`${r.name}-${i}`}
                style={styles.resultRow}
                onPress={() => { setDestination(r.name); setSearch(''); }}
              >
                <Text style={styles.resultName}>{r.name}</Text>
                <Text style={styles.resultDetail}>{r.detail}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={[styles.label, { marginTop: spacing.xl }]}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Things to remember, places to visit..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={300}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  navTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  saveText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  results: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  resultName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultDetail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
```

**Step 3: Create `app/(tabs)/trips/[id].tsx`**

Trip detail showing destination, dates, notes, places to visit.

```typescript
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockTrips } from '@/data/mock';
import { countries } from '@/data/geo';
import { getEmergencyNumbers } from '@/data/safety';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const trip = mockTrips.find((t) => t.id === id);

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  const country = countries.find((c) => c.iso2 === trip.countryIso2);
  const emergency = getEmergencyNumbers(trip.countryIso2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.flag}>{country?.flag ?? ''}</Text>
        <Text style={styles.destination}>{trip.destination}</Text>
        <Text style={styles.dates}>{trip.arriving} → {trip.leaving}</Text>
        <Text style={styles.nights}>{trip.nights} nights</Text>

        {trip.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Places to visit</Text>
          {trip.places.length > 0 ? (
            trip.places.map((place, i) => (
              <View key={i} style={styles.placeRow}>
                <Ionicons name="location-outline" size={16} color={colors.orange} />
                <Text style={styles.placeText}>{place}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No places added yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency numbers</Text>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyRow}>
              <Text style={styles.emergencyLabel}>Police</Text>
              <Text style={styles.emergencyNumber}>{emergency.police}</Text>
            </View>
            <View style={styles.emergencyRow}>
              <Text style={styles.emergencyLabel}>Ambulance</Text>
              <Text style={styles.emergencyNumber}>{emergency.ambulance}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  flag: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  destination: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  dates: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  nights: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  notesText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  placeText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  emergencyCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  emergencyLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  emergencyNumber: {
    ...typography.label,
    color: colors.orange,
  },
});
```

**Step 4: Commit**

```bash
git add app/(tabs)/trips/ && git commit -m "feat: trips tab with list, create, and detail screens"
```

---

### Task 9: Profile tab — your profile, collections, settings

**Files:**
- Create: `app/(tabs)/profile/index.tsx`
- Create: `app/(tabs)/profile/edit.tsx`
- Create: `app/(tabs)/profile/settings.tsx`
- Create: `app/(tabs)/profile/collections/[id].tsx`

**Step 1: Create `app/(tabs)/profile/index.tsx`**

Your profile as other travelers see it, plus collections and settings links.

```typescript
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { mockCollections } from '@/data/mock';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function ProfileScreen() {
  const router = useRouter();
  const data = onboardingStore.getData();
  const country = countries.find((c) => c.iso2 === data.countryIso2);

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {data.photoUri ? (
              <Image source={{ uri: data.photoUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={colors.textMuted} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{data.firstName || 'Traveler'}</Text>
          {country && (
            <Text style={styles.origin}>{country.flag ?? ''} {country.name}</Text>
          )}
          {data.bio ? (
            <Text style={styles.bio}>{data.bio}</Text>
          ) : null}

          <Pressable
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Ionicons name="create-outline" size={16} color={colors.orange} />
            <Text style={styles.editButtonText}>Edit profile</Text>
          </Pressable>
        </View>

        {/* Interests */}
        {data.dayStyle.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {data.dayStyle.map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Collections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections</Text>
          {mockCollections.length === 0 ? (
            <Text style={styles.emptyText}>
              Save places into collections as you explore.
            </Text>
          ) : (
            mockCollections.map((col) => (
              <Pressable
                key={col.id}
                style={styles.collectionRow}
                onPress={() => router.push(`/profile/collections/${col.id}`)}
              >
                <Text style={styles.collectionEmoji}>{col.emoji}</Text>
                <View style={styles.collectionText}>
                  <Text style={styles.collectionName}>{col.name}</Text>
                  <Text style={styles.collectionCount}>
                    {col.placeIds.length} {col.placeIds.length === 1 ? 'place' : 'places'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))
          )}
        </View>

        {/* Settings link */}
        <Pressable
          style={styles.settingsRow}
          onPress={() => router.push('/profile/settings')}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.settingsText}>Privacy & settings</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        {/* Messages link */}
        <Pressable
          style={styles.settingsRow}
          onPress={() => router.push('/home/dm')}
        >
          <Ionicons name="chatbubbles-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.settingsText}>Messages</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  origin: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  collectionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  collectionText: {
    flex: 1,
  },
  collectionName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  collectionCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  settingsText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
});
```

**Step 2: Create `app/(tabs)/profile/edit.tsx`**

Placeholder edit screen (routes back to onboarding profile for now).

```typescript
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, typography } from '@/constants/design';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>Edit profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Ionicons name="construct-outline" size={40} color={colors.textMuted} />
        <Text style={styles.text}>Profile editing coming soon.</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace('/(onboarding)/profile')}
        >
          <Text style={styles.buttonText}>Go to onboarding setup</Text>
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
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  navTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
});
```

**Step 3: Create `app/(tabs)/profile/settings.tsx`**

Privacy settings from the old profile tab, plus a placeholder for other settings.

```typescript
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onboardingStore } from '@/state/onboardingStore';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const VISIBILITY_LABELS = {
  private: 'Only you',
  connections: 'Your connections',
  public: 'Everyone',
} as const;

const PRECISION_LABELS = {
  city: 'City level',
  neighborhood: 'Neighborhood',
  exact: 'Exact location',
} as const;

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const privacy = onboardingStore.getData().privacyDefaults;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>Privacy & settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Privacy</Text>

        <SettingRow
          icon="person-outline"
          label="Profile visibility"
          value={VISIBILITY_LABELS[privacy.profileVisibility]}
          description="Only you can see your profile."
        />
        <SettingRow
          icon="airplane-outline"
          label="Trip visibility"
          value={VISIBILITY_LABELS[privacy.tripVisibility]}
          description="Your trip details are private."
        />
        <SettingRow
          icon="location-outline"
          label="Location precision"
          value={PRECISION_LABELS[privacy.locationPrecision]}
          description="Your location is shared at city level only."
        />
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Pressable style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <Ionicons name={icon as any} size={18} color={colors.textPrimary} />
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
      <Text style={styles.settingDesc}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  navTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  settingCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  settingLabel: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  settingValue: {
    ...typography.captionSmall,
    color: colors.orange,
  },
  settingDesc: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
```

**Step 4: Create `app/(tabs)/profile/collections/[id].tsx`**

Collection detail showing saved places.

```typescript
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockCollections, mockCountryGuides, type PlaceEntry } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

function findPlaceById(id: string): PlaceEntry | undefined {
  for (const guide of mockCountryGuides) {
    for (const city of guide.cities) {
      const allEntries = [...city.mustDo, ...city.eats, ...city.stays];
      const found = allEntries.find((e) => e.id === id);
      if (found) return found;
    }
  }
  return undefined;
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const collection = mockCollections.find((c) => c.id === id);

  if (!collection) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Collection not found</Text>
      </View>
    );
  }

  const places = collection.placeIds
    .map(findPlaceById)
    .filter(Boolean) as PlaceEntry[];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>{collection.emoji}</Text>
        <Text style={styles.title}>{collection.name}</Text>
        <Text style={styles.count}>
          {places.length} {places.length === 1 ? 'place' : 'places'}
        </Text>

        {places.map((place) => (
          <View key={place.id} style={styles.placeCard}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeCategory}>
              {place.category}
              {place.priceLevel ? ` · ${place.priceLevel}` : ''}
            </Text>
            <Text style={styles.placeDesc}>{place.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  count: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  placeCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  placeName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeCategory: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  placeDesc: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
});
```

**Step 5: Commit**

```bash
git add app/(tabs)/profile/ && git commit -m "feat: profile tab with collections, edit, and settings screens"
```

---

### Task 10: Wire up navigation + verify everything compiles

**Files:**
- Modify: `app/_layout.tsx` (if needed — should already work since tabs route to `(tabs)`)

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors — likely `textSecondary` and `borderSubtle` references that Task 1 should have resolved.

**Step 2: Start Expo and walk through the app**

```bash
npx expo start
```

Verify:
- Onboarding flow completes and lands on Home tab
- Home tab shows traveler cards
- Tapping a card opens user profile with back navigation
- Message button on profile opens DM thread
- Explore tab shows country guide cards
- Tapping a country opens guide with cities
- Tapping a city opens place detail with must-do, eats, stays
- Trips tab shows trip list with + button
- Tapping + opens new trip form
- Tapping a trip opens trip detail
- Profile tab shows your data, collections, settings link
- All back buttons work
- Tab switching works

**Step 3: Final commit**

```bash
git add -A && git commit -m "feat: complete app shell rebuild — 4 tabs, 15+ screens, mock data"
```

---

## Summary

| Task | What it does | Files created/modified |
|------|-------------|----------------------|
| 1 | Delete old tabs, add design tokens | ~6 deleted, 1 modified |
| 2 | Mock data | 6 created |
| 3 | Tab layout with nested stacks | 5 created |
| 4 | Home feed + TravelerCard | 2 created |
| 5 | User profile detail | 1 created |
| 6 | DM list + chat thread | 2 created |
| 7 | Explore + country guide + place detail | 3 created |
| 8 | Trips list + create + detail | 3 created |
| 9 | Profile + collections + edit + settings | 4 created |
| 10 | Wire up + verify | 0-1 modified |

**Total: ~26 new files, ~6 deleted, ~2 modified**
