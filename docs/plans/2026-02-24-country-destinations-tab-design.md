# Country Page — Destinations Tab Design

**Date**: 2026-02-24
**Status**: Approved
**Problem**: Cities within a country are buried mid-scroll in the Overview tab's horizontal carousel. The label "Cities" is too narrow — entries include islands, towns, beach towns, etc. Users who already know where they want to go can't quickly navigate there.

## Solution

1. Add a `place_kind` enum + optional `place_kind_descriptor` to the `cities` table
2. Add a **"Destinations"** tab to the country page segmented control
3. Replace the Overview tab's cities carousel with a slim 3-card teaser

---

## 1. Database Changes

### New enum + columns on `cities`

```sql
CREATE TYPE place_kind AS ENUM (
  'city',
  'island',
  'town',
  'beach_town',
  'mountain_town',
  'village',
  'region'
);

ALTER TABLE cities
  ADD COLUMN place_kind place_kind NOT NULL DEFAULT 'city',
  ADD COLUMN place_kind_descriptor text;
```

- `place_kind` — systematic grouping key. Default `'city'` so all 75 existing rows work immediately.
- `place_kind_descriptor` — optional display override (e.g. "Gulf Island", "Heritage Town"). If null, UI uses humanized enum.

### Comprehensive backfill (all 75 cities)

| slug | place_kind | descriptor |
|------|-----------|------------|
| **Cambodia** | | |
| siem-reap | city | Historic City |
| phnom-penh | city | Capital |
| kampot | town | Riverside Town |
| koh-rong | island | Tropical Island |
| **Indonesia** | | |
| ubud | town | Cultural Town |
| canggu | beach_town | Surf Town |
| seminyak | beach_town | Resort Town |
| yogyakarta | city | Historic City |
| gili-islands | island | Island Group |
| **Japan** | | |
| tokyo | city | *(null)* |
| kyoto | city | Historic City |
| osaka | city | *(null)* |
| **Laos** | | |
| luang-prabang | town | Heritage Town |
| vientiane | city | Capital |
| vang-vieng | town | Adventure Town |
| **Lesotho** | | |
| maseru | city | Capital |
| semonkong | village | Mountain Village |
| **Malaysia** | | |
| kuala-lumpur | city | *(null)* |
| penang | island | Cultural Island |
| langkawi | island | Resort Island |
| malacca | city | Historic City |
| kota-kinabalu | city | Coastal City |
| **Morocco** | | |
| marrakech | city | *(null)* |
| fes | city | Historic City |
| chefchaouen | town | Blue Town |
| **Mozambique** | | |
| maputo | city | Capital |
| tofo | beach_town | *(null)* |
| bazaruto-archipelago | island | Island Archipelago |
| **Myanmar** | | |
| bagan | town | Temple Town |
| yangon | city | *(null)* |
| inle-lake | region | Lake District |
| **Namibia** | | |
| windhoek | city | Capital |
| sossusvlei | region | Desert Region |
| swakopmund | town | Coastal Town |
| **Philippines** | | |
| el-nido | town | Island Gateway |
| siargao | island | Surf Island |
| cebu | city | *(null)* |
| manila | city | Capital |
| boracay | island | Beach Island |
| bohol | island | Nature Island |
| coron | island | Island-Hopping Hub |
| la-union | beach_town | Surf Town |
| dumaguete | city | University City |
| siquijor | island | Mystic Island |
| puerto-princesa | city | *(null)* |
| baguio | mountain_town | Summer Capital |
| **Portugal** | | |
| lisbon | city | Capital |
| porto | city | *(null)* |
| **Singapore** | | |
| singapore | city | City-State |
| **South Africa** | | |
| cape-town | city | *(null)* |
| johannesburg | city | *(null)* |
| durban | city | Coastal City |
| kruger-national-park | region | National Park |
| **South Korea** | | |
| seoul | city | Capital |
| busan | city | Coastal City |
| **Taiwan** | | |
| taipei | city | Capital |
| tainan | city | Historic City |
| **Thailand** | | |
| bangkok | city | Capital |
| chiang-mai | city | *(null)* |
| krabi | town | Coastal Gateway |
| pai | town | Mountain Town |
| phuket | island | Resort Island |
| koh-phangan | island | Gulf Island |
| koh-samui | island | Gulf Island |
| koh-lanta | island | Andaman Island |
| koh-tao | island | Dive Island |
| chiang-rai | city | *(null)* |
| **Vietnam** | | |
| ho-chi-minh-city | city | *(null)* |
| hanoi | city | Capital |
| hoi-an | town | Ancient Town |
| da-nang | city | Coastal City |
| da-lat | mountain_town | Highland Town |
| **Zimbabwe** | | |
| victoria-falls | town | Adventure Town |
| harare | city | Capital |
| masvingo | town | Historic Town |

**Summary**: 40 cities, 14 islands, 13 towns, 4 beach_towns, 2 mountain_towns, 1 village, 3 regions = 77 (2 descriptors with null = use generic label)

---

## 2. Type & Data Layer Changes

### `data/types.ts`

```typescript
// Add new type
export type PlaceKind = 'city' | 'island' | 'town' | 'beach_town' | 'mountain_town' | 'village' | 'region';

// Add to City interface
placeKind: PlaceKind;
placeKindDescriptor: string | null;
```

### `data/api.ts` — mapCity()

Add two lines to the existing mapper:

```typescript
placeKind: row.place_kind ?? 'city',
placeKindDescriptor: row.place_kind_descriptor ?? null,
```

### Grouping utility (in new component or inline)

```typescript
// Humanize enum value: 'beach_town' → 'Beach Town'
function humanizeKind(kind: PlaceKind): string {
  return kind.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Pluralize: 'City' → 'Cities', 'Beach Town' → 'Beach Towns'
function pluralizeKind(kind: PlaceKind): string {
  const singular = humanizeKind(kind);
  if (singular.endsWith('y') && !singular.endsWith('ay')) {
    return singular.slice(0, -1) + 'ies';
  }
  return singular + 's';
}

// Display label for individual city: descriptor ?? humanized kind
function displayKindLabel(city: City): string {
  return city.placeKindDescriptor ?? humanizeKind(city.placeKind);
}

// Group cities by place_kind, sorted by group size descending
interface DestinationGroup {
  kind: PlaceKind;
  label: string;       // pluralized: "Cities", "Islands"
  cities: City[];
}

function groupByPlaceKind(cities: City[]): DestinationGroup[] {
  const map = new Map<PlaceKind, City[]>();
  for (const city of cities) {
    const arr = map.get(city.placeKind) ?? [];
    arr.push(city);
    map.set(city.placeKind, arr);
  }
  return Array.from(map.entries())
    .map(([kind, items]) => ({
      kind,
      label: pluralizeKind(kind),
      cities: items, // already ordered by order_index from API
    }))
    .sort((a, b) => b.cities.length - a.cities.length);
}
```

---

## 3. Destinations Tab UI

### Country page route (`app/(tabs)/discover/country/[slug].tsx`)

```typescript
const TABS = ['Overview', 'Destinations', 'Travel Guide', 'Budget'];
```

Add tab index 1 rendering:

```tsx
{activeTab === 1 && (
  <DestinationsTab
    cities={cities ?? []}
    countryName={country.name}
  />
)}
```

Shift Travel Guide to index 2, Budget to index 3.

### `components/explore/country/DestinationsTab.tsx` (new file)

**Layout:**

```
┌──────────────────────────────────────┐
│  🔍 Search places in Thailand        │  ← TextInput, full width
├──────────────────────────────────────┤
│                                      │
│  Cities (12)                         │  ← Section header
│  ┌────┬──────────────────────────┐   │
│  │ img│ Bangkok                  │>  │  ← DestinationCard
│  │64px│ Capital                  │   │
│  └────┴──────────────────────────┘   │
│  ┌────┬──────────────────────────┐   │
│  │ img│ Chiang Mai               │>  │
│  │64px│ City                     │   │
│  └────┴──────────────────────────┘   │
│  ...                                 │
│                                      │
│  Islands (5)                         │  ← Next group
│  ┌────┬──────────────────────────┐   │
│  │ img│ Koh Phangan              │>  │
│  │64px│ Gulf Island              │   │
│  └────┴──────────────────────────┘   │
│  ...                                 │
└──────────────────────────────────────┘
```

**Props:**

```typescript
interface DestinationsTabProps {
  cities: City[];
  countryName: string;
}
```

**Behavior:**
- `useState` for search query
- Filter: `cities.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))`
- Group filtered results with `groupByPlaceKind()`
- Render as `SectionList` with section headers
- Empty state: "No places match your search"

### `components/explore/country/DestinationCard.tsx` (new file)

**Props:**

```typescript
interface DestinationCardProps {
  city: City;
}
```

**Layout:**
- Full width, horizontal row
- Left: 64px square image (rounded `radius.sm`), from `city.heroImageUrl`
- Center: name (16px semiBold) + kind label (14px regular, textSecondary) — uses `displayKindLabel(city)`
- Right: chevron-forward Ionicon
- Height: minimum 72px (comfortable touch target)
- Bottom border: 1px `borderSubtle` (except last in section)
- Taps → `router.push('/(tabs)/discover/city/${city.slug}')`

---

## 4. Overview Tab Teaser

### Changes to `CountryOverviewTab.tsx`

**Replace** the current cities section (lines 140-167) with:

```
┌──────────────────────────────────────┐
│  Where to go           All 12 →      │  ← heading + orange link
│  ┌────┬──────────────────────────┐   │
│  │ img│ Bangkok                  │>  │  ← DestinationCard (reused)
│  │64px│ Capital                  │   │
│  └────┴──────────────────────────┘   │
│  ┌────┬──────────────────────────┐   │
│  │ img│ Chiang Mai               │>  │
│  │64px│ City                     │   │
│  └────┴──────────────────────────┘   │
│  ┌────┬──────────────────────────┐   │
│  │ img│ Koh Phangan              │>  │
│  │64px│ Gulf Island              │   │
│  └────┴──────────────────────────┘   │
└──────────────────────────────────────┘
```

**Changes:**
- Section heading: "Cities" → "Where to go"
- Card style: `CityHorizontalCard` → `DestinationCard` (compact list cards)
- Show top 3 by `order_index` (across all place_kinds)
- "All X cities" → "All X destinations →" — taps to switch segmented control to Destinations tab (index 1)
- Remove horizontal `ScrollView` — vertical list of 3 cards
- Remove `CityHorizontalCard` import (no longer used here)

**How the "All X destinations" link works:**
- The country page lifts `activeTab` state, so OverviewTab receives an `onSwitchTab` callback
- Tapping the link calls `onSwitchTab(1)` to switch to the Destinations tab

---

## 5. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260224_place_kind.sql` | **Create** | Enum + columns + comprehensive backfill |
| `data/types.ts` | **Edit** | Add `PlaceKind` type, add fields to `City` interface |
| `data/api.ts` | **Edit** | Add 2 lines to `mapCity()` |
| `app/(tabs)/discover/country/[slug].tsx` | **Edit** | 4-tab segments, render DestinationsTab, pass `onSwitchTab` to OverviewTab |
| `components/explore/country/DestinationsTab.tsx` | **Create** | Search + grouped SectionList |
| `components/explore/country/DestinationCard.tsx` | **Create** | Compact list card (shared between Destinations tab & Overview teaser) |
| `components/explore/country/CountryOverviewTab.tsx` | **Edit** | Replace cities carousel with 3-card teaser using DestinationCard |

### Files NOT changed
- Travel Guide tab, Budget tab — untouched
- City detail pages — untouched
- `cities.tsx` modal — kept as-is (DestinationsTab is inline, modal is still reachable from other routes)
- Navigation structure — no new routes needed

---

## 6. Implementation Order

1. **Migration** — Create enum, add columns, backfill all 75 cities
2. **Types + mapper** — Add `PlaceKind`, update `City` interface, update `mapCity()`
3. **DestinationCard** — New shared card component
4. **DestinationsTab** — New tab with search + grouping
5. **Country page route** — Add 4th tab, wire up
6. **Overview teaser** — Replace carousel with 3-card vertical list + "All X destinations →"
7. **Type check** — `npx tsc --noEmit`
