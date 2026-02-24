# Country Page Redesign v3 — Tabbed Layout with Women-First Content

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the country page from a single long scroll into a 3-tab layout (Overview | Travel Guide | Budget & Practical) with a premium rounded hero card, 3 curated destination highlights, structured budget tips, and comprehensive women-first content for all 19 countries.

**Architecture:** Add 2 JSONB columns to the existing `countries` table (`destination_highlights`, `budget_tips`). Restructure `[slug].tsx` from ScrollView to a tabbed layout using a segmented control. Create 4 new components (CountryHeroCard, HighlightCards, BudgetTips, CountryTabBar). Enrich existing thin content fields via a seed migration. No new tables.

**Tech Stack:** React Native, Expo Router, Supabase (Postgres), React Query, StyleSheet, expo-linear-gradient

**Women-First Content Lens:** Every piece of content — tips, descriptions, highlights — is written from the perspective of a woman traveling solo. Not generic travel advice with a safety section bolted on. The entire product IS the women's lens.

---

## Task 1: Schema Migration — Add New Columns

**Files:**
- Create: `supabase/migrations/20260222_country_page_v3_columns.sql`

**Step 1: Write the migration**

```sql
-- Country page v3: destination highlights + budget tips
ALTER TABLE countries ADD COLUMN IF NOT EXISTS destination_highlights JSONB;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS budget_tips JSONB;

COMMENT ON COLUMN countries.destination_highlights IS 'Array of 3 curated highlight objects: [{type, id, label, tagline, image_url}]';
COMMENT ON COLUMN countries.budget_tips IS 'Array of budget tip objects: [{category, tip, type, level}]';
```

**Step 2: Apply the migration**

```bash
source .env
PSQL=/opt/homebrew/Cellar/libpq/18.2/bin/psql
DB_URL="postgresql://postgres.bfyewxgdfkmkviajmfzp:${SUPABASE_DB_PASSWORD}@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
$PSQL "$DB_URL" -f supabase/migrations/20260222_country_page_v3_columns.sql
```

Expected: `ALTER TABLE` x2

**Step 3: Commit**

```bash
git add supabase/migrations/20260222_country_page_v3_columns.sql
git commit -m "feat(db): add destination_highlights and budget_tips columns to countries"
```

---

## Task 2: Update TypeScript Types & Data Mapping

**Files:**
- Modify: `data/types.ts` — Add new interfaces and update Country type
- Modify: `data/api.ts` — Update mapCountry function

**Step 1: Add new types to `data/types.ts`**

Add after the `BudgetBreakdown` interface:

```typescript
export interface DestinationHighlight {
  type: 'city' | 'place';
  id: string;
  label: string;
  tagline: string;
  imageUrl: string | null;
}

export interface BudgetTip {
  category: 'accommodation' | 'transport' | 'food' | 'activities' | 'general';
  tip: string;
  type: 'save' | 'dont_skimp';
  level: 'essential' | 'insider';
}
```

Update the `Country` interface — change existing `highlights` field and add new fields:

```typescript
// Replace existing:
//   highlights: string[] | null;
// With:
highlights: string[] | null;
destinationHighlights: DestinationHighlight[] | null;
budgetTips: BudgetTip[] | null;
```

**Step 2: Update mapCountry in `data/api.ts`**

Add to the mapCountry return object:

```typescript
destinationHighlights: row.destination_highlights ?? null,
budgetTips: row.budget_tips ?? null,
```

**Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20
```

Expected: No new errors (fields are nullable, so existing code won't break).

**Step 4: Commit**

```bash
git add data/types.ts data/api.ts
git commit -m "feat(types): add DestinationHighlight and BudgetTip types, update mapCountry"
```

---

## Task 3: Fix Budget Formatting Bug

**Files:**
- Modify: `components/explore/country/BudgetBreakdown.tsx` line 86

**Step 1: Fix the bug**

Line 86 currently reads:
```jsx
<Text style={styles.summaryAmount}>${total.low}\u2013${total.high}</Text>
```

The `\u2013` in JSX text content is literal characters, not an en-dash. Fix to:
```jsx
<Text style={styles.summaryAmount}>{`$${total.low}\u2013$${total.high}`}</Text>
```

This uses a template literal where `\u2013` is correctly interpreted as an en-dash (–), and both numbers get their `$` prefix.

**Step 2: Verify visually** — The budget summary should now show `$20–$130` instead of the broken `$20\u2013$130`.

**Step 3: Commit**

```bash
git add components/explore/country/BudgetBreakdown.tsx
git commit -m "fix(budget): fix en-dash rendering in daily budget summary"
```

---

## Task 4: New Component — CountryHeroCard

**Files:**
- Create: `components/explore/country/CountryHeroCard.tsx`

**Purpose:** Rounded card with inset padding containing the country hero image, gradient overlay, country name, and signal chips. Replaces the current full-bleed 240px hero.

**Implementation:**

```typescript
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface Props {
  name: string;
  heroImageUrl: string | null;
  soloLevel: string | null;
  avgDailyBudgetUsd: number | null;
  bestMonths: string | null;
}

const CARD_HEIGHT = 280;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenX * 2;

export function CountryHeroCard({ name, heroImageUrl, soloLevel, avgDailyBudgetUsd, bestMonths }: Props) {
  const signals: string[] = [];
  if (soloLevel) signals.push(soloLevel === 'beginner' ? 'First-timers welcome' : soloLevel === 'intermediate' ? 'Some experience' : 'Confident travelers');
  if (avgDailyBudgetUsd) signals.push(`$${avgDailyBudgetUsd}/day avg`);
  if (bestMonths) signals.push(bestMonths);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {heroImageUrl && (
          <Image source={{ uri: heroImageUrl }} style={styles.image} resizeMode="cover" />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />
        <View style={styles.overlay}>
          <Text style={styles.name}>{name}</Text>
          {signals.length > 0 && (
            <Text style={styles.signals}>{signals.join(' · ')}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
```

Styles: `container` has `paddingHorizontal: spacing.screenX`, `card` is `height: CARD_HEIGHT`, `borderRadius: radius.lg` (16), `overflow: 'hidden'`. `image` is `...StyleSheet.absoluteFillObject`. `overlay` is positioned absolute bottom with padding. `name` is 28px bold white. `signals` is 13px regular white at 0.85 opacity.

**Note:** The back arrow and any action buttons are handled by NavigationHeader, not inside this card.

**Step: Commit**

```bash
git add components/explore/country/CountryHeroCard.tsx
git commit -m "feat(country): add CountryHeroCard rounded hero component"
```

---

## Task 5: New Component — HighlightCards

**Files:**
- Create: `components/explore/country/HighlightCards.tsx`

**Purpose:** Row of 3 equal-width cards below the hero showing curated destination highlights. Each card has an image, label, and tagline. Tapping navigates to city or place detail.

**Implementation:**

```typescript
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { DestinationHighlight } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface Props {
  highlights: DestinationHighlight[];
}

const CARD_HEIGHT = 80;
const GAP = spacing.sm; // 8px

export function HighlightCards({ highlights }: Props) {
  const router = useRouter();
  if (!highlights || highlights.length === 0) return null;

  const handlePress = (h: DestinationHighlight) => {
    if (h.type === 'city') {
      router.push(`/(tabs)/discover/city/${h.id}`);
    } else {
      router.push(`/(tabs)/discover/place-detail/${h.id}`);
    }
  };

  return (
    <View style={styles.row}>
      {highlights.slice(0, 3).map((h) => (
        <Pressable
          key={h.id}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => handlePress(h)}
        >
          {h.imageUrl && (
            <Image source={{ uri: h.imageUrl }} style={styles.image} resizeMode="cover" />
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={styles.gradient} />
          <View style={styles.textWrap}>
            <Text style={styles.label} numberOfLines={1}>{h.label}</Text>
            <Text style={styles.tagline} numberOfLines={1}>{h.tagline}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
```

Styles: `row` is `flexDirection: 'row', gap: GAP, paddingHorizontal: spacing.screenX, marginTop: spacing.md`. Each `card` is `flex: 1, height: CARD_HEIGHT, borderRadius: radius.md (12), overflow: 'hidden'`. `label` is 13px semiBold white. `tagline` is 11px regular white at 0.8 opacity.

**Step: Commit**

```bash
git add components/explore/country/HighlightCards.tsx
git commit -m "feat(country): add HighlightCards 3-up row component"
```

---

## Task 6: New Component — BudgetTips

**Files:**
- Create: `components/explore/country/BudgetTips.tsx`

**Purpose:** Renders grouped budget tips from the `budget_tips` JSONB. Two sections: "How to save" (type=save) and "Don't cheap out on" (type=dont_skimp). Tips ordered essentials first, then insider.

**Implementation:**

```typescript
import { StyleSheet, Text, View } from 'react-native';
import type { BudgetTip } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface Props {
  tips: BudgetTip[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  accommodation: '\u{1F3E0}',
  transport: '\u{1F695}',
  food: '\u{1F37D}\uFE0F',
  activities: '\u{1F3AF}',
  general: '\u{1F4A1}',
};

function TipRow({ tip }: { tip: BudgetTip }) {
  return (
    <View style={styles.tipRow}>
      <Text style={styles.tipEmoji}>{CATEGORY_EMOJI[tip.category] || '\u{1F4A1}'}</Text>
      <View style={styles.tipContent}>
        <Text style={styles.tipText}>{tip.tip}</Text>
        {tip.level === 'insider' && (
          <View style={styles.insiderBadge}>
            <Text style={styles.insiderText}>INSIDER</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function BudgetTips({ tips }: Props) {
  if (!tips || tips.length === 0) return null;

  // Sort: essentials first, then insider
  const sorted = [...tips].sort((a, b) => {
    if (a.level === 'essential' && b.level === 'insider') return -1;
    if (a.level === 'insider' && b.level === 'essential') return 1;
    return 0;
  });

  const saveTips = sorted.filter(t => t.type === 'save');
  const skimpTips = sorted.filter(t => t.type === 'dont_skimp');

  return (
    <View style={styles.section}>
      {saveTips.length > 0 && (
        <>
          <Text style={styles.groupTitle}>How to save</Text>
          <View style={styles.card}>
            {saveTips.map((t, i) => (
              <TipRow key={i} tip={t} />
            ))}
          </View>
        </>
      )}

      {skimpTips.length > 0 && (
        <>
          <Text style={[styles.groupTitle, saveTips.length > 0 && { marginTop: spacing.xl }]}>
            Don't cheap out on
          </Text>
          <View style={styles.card}>
            {skimpTips.map((t, i) => (
              <TipRow key={i} tip={t} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}
```

Styles: `card` has `neutralFill` background, `radius.card` corners. `tipRow` is flex-row with `paddingVertical: spacing.md, paddingHorizontal: spacing.lg`, with 1px border between rows. `groupTitle` is 17px semiBold. `insiderBadge` is a small `orangeFill` pill with 9px fontSize, `colors.primary` text, `letterSpacing: 0.5`.

**Step: Commit**

```bash
git add components/explore/country/BudgetTips.tsx
git commit -m "feat(country): add BudgetTips component with save/dont-skimp grouping"
```

---

## Task 7: New Component — CountryTabBar

**Files:**
- Create: `components/explore/country/CountryTabBar.tsx`

**Purpose:** Segmented tab control with 3 tabs. Orange underline on active tab. Sits below the header, stays pinned.

**Implementation:**

```typescript
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

export type CountryTab = 'overview' | 'guide' | 'budget';

interface Props {
  activeTab: CountryTab;
  onTabChange: (tab: CountryTab) => void;
}

const TABS: { key: CountryTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'guide', label: 'Travel Guide' },
  { key: 'budget', label: 'Budget & Practical' },
];

export function CountryTabBar({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.underline} />}
          </Pressable>
        );
      })}
    </View>
  );
}
```

Styles: `container` is `flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, paddingHorizontal: spacing.screenX`. Each `tab` has `paddingVertical: spacing.md, marginRight: spacing.xl`. `label` is 15px medium textSecondary. `labelActive` is 15px semiBold textPrimary. `underline` is `height: 2, backgroundColor: colors.primary, position: 'absolute', bottom: 0, left: 0, right: 0`.

**Step: Commit**

```bash
git add components/explore/country/CountryTabBar.tsx
git commit -m "feat(country): add CountryTabBar segmented control component"
```

---

## Task 8: Refactor Country Page — Tabbed Layout

**Files:**
- Modify: `app/(tabs)/discover/country/[slug].tsx` — Major refactor from single ScrollView to tabbed layout

**This is the core task.** The page structure becomes:

```
NavigationHeader (back + country name)
CountryTabBar (sticky)
ScrollView (switches content based on active tab)
```

**Overview Tab content:**
1. CountryHeroCard (rounded card)
2. HighlightCards (3 destination highlights)
3. Intro text (2-3 paragraphs from `introMd`)
4. Explore Cities section (horizontal scroll of CityHorizontalCard)
5. Community highlights (2-3 thread previews from CommunityThreadRows)

**Travel Guide Tab content:**
1. WhyWomenLoveIt section
2. TravelFitSection (best for / might struggle — NOT accordion, both visible)
3. KnowBeforeYouGoAccordion (transport, health, culture, safety for women)

**Budget & Practical Tab content:**
1. BudgetBreakdown (existing component, now with fixed formatting)
2. BudgetTips (new component — save tips + don't skimp tips)
3. QuickReference (emergency, currency, visa, SIM providers)

**Key implementation details:**
- Use `useState<CountryTab>('overview')` for tab state
- Each tab is a function component or inline render block
- Only the content area scrolls — header + tab bar are fixed
- Remove: SignalsRow (signals move into hero card), AtAGlanceGrid (info distributed across tabs), FinalNote (content absorbed into guide)
- The "Things to Do" horizontal scroll (experiences) is removed from the country page — it belongs on the city pages

**Step 1: Implement the refactored page**

Restructure the component with tab state, render the CountryTabBar, and conditionally render each tab's content in a ScrollView below it.

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20
```

**Step 3: Commit**

```bash
git add app/(tabs)/discover/country/[slug].tsx
git commit -m "feat(country): refactor country page to 3-tab layout (Overview/Guide/Budget)"
```

---

## Task 9: Seed Migration — All 19 Countries Content

**Files:**
- Create: `supabase/migrations/20260222_seed_country_page_v3_content.sql`

**This is the largest task.** A single migration that:

1. Sets `destination_highlights` JSONB for all 19 countries (3 highlights each, using real city UUIDs from the DB)
2. Sets `budget_tips` JSONB for all 19 countries (5-8 tips each, mix of save/dont_skimp, essential/insider)
3. Enriches `intro_md` for the 7 thin countries (Cambodia, Laos, Malaysia, Myanmar, Philippines, Singapore, Taiwan) — 2-3 paragraphs each
4. Fills `budget_breakdown` for the 7 countries missing it
5. Fills `best_for_md` and `might_struggle_md` for countries missing travel fit data
6. Fills `why_we_love_md` for the 6 countries missing guide v2 content (Lesotho, Mozambique, Namibia, South Africa, South Korea, Zimbabwe)

**Content guidelines (women-first lens):**
- Every highlight tagline answers "why would a solo woman go here?"
- Every budget tip is framed for a woman alone (safety > savings)
- Intro paragraphs position the country through the solo female traveler experience
- "Don't cheap out on" tips prioritize safety-relevant spending (location, transport at night, insurance)
- "How to save" tips are practical and specific to each country (not generic)
- Insider tips share the kind of knowledge women pass to each other

**Highlight data source:** Use the city UUIDs from the database query results. Each highlight references a real city or notable destination. Use `image_url` from the city's `hero_image_url` (query at seed time via subselect).

**Example for South Africa:**

```sql
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "a2bdbda7-bb8d-55fe-b170-8f1bea4b0481", "label": "Cape Town", "tagline": "Where most women base themselves", "image_url": null},
    {"type": "city", "id": "14d46d18-b28f-568b-8692-35fb68be553d", "label": "Kruger National Park", "tagline": "Safari without a group tour", "image_url": null},
    {"type": "city", "id": "82b18abc-1e48-5300-a2c2-844cdcf6116f", "label": "Durban", "tagline": "Coastal warmth year-round", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "Use Uber or Bolt everywhere — it''s safer and cheaper than metered taxis, especially at night", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Don''t cheap out on location — being in a well-lit, central area matters more than saving R200/night", "type": "dont_skimp", "level": "essential"},
    {"category": "food", "tip": "Woolworths and Checkers ready meals are excellent and cheap — perfect for nights you don''t want to eat out alone", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Get a local SIM (Vodacom or MTN) at the airport — data is cheap and you''ll need maps and Uber constantly", "type": "save", "level": "essential"},
    {"category": "activities", "tip": "Don''t cheap out on safari guides — budget operators cut corners on safety and you''ll see less wildlife", "type": "dont_skimp", "level": "essential"},
    {"category": "transport", "tip": "The MyCiTi bus in Cape Town is safe, clean, and connects the airport to the city — no taxi needed on arrival", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Travel insurance is non-negotiable — private hospitals are world-class but expensive without cover", "type": "dont_skimp", "level": "essential"}
  ]'::jsonb
WHERE slug = 'south-africa';
```

**Note on `image_url` in highlights:** Set to `null` in the JSONB. The component will fall back to fetching the city's `hero_image_url` at render time by ID. This avoids duplicating URLs and keeps highlights in sync with city images.

**Step 1: Write the full migration** with all 19 country UPDATE statements.

**Step 2: Apply the migration**

```bash
source .env
$PSQL "$DB_URL" -f supabase/migrations/20260222_seed_country_page_v3_content.sql
```

**Step 3: Verify a sample**

```bash
$PSQL "$DB_URL" -c "SELECT slug, destination_highlights->0->>'label' as highlight_1, jsonb_array_length(budget_tips) as tip_count FROM countries WHERE destination_highlights IS NOT NULL ORDER BY slug;"
```

Expected: 19 rows, each with a first highlight label and tip count of 5-8.

**Step 4: Commit**

```bash
git add supabase/migrations/20260222_seed_country_page_v3_content.sql
git commit -m "feat(db): seed destination highlights, budget tips, and enriched content for all 19 countries"
```

---

## Task 10: Update HighlightCards to Resolve Images

**Files:**
- Modify: `components/explore/country/HighlightCards.tsx`

Since highlights store `image_url: null` and reference city/place IDs, the component needs to resolve images. Two approaches:

**Preferred:** Pass a lookup map from the parent. The country page already fetches cities via `getCitiesByCountry`. Build a map of `id → heroImageUrl` and pass it to HighlightCards:

```typescript
interface Props {
  highlights: DestinationHighlight[];
  imageMap: Record<string, string | null>; // id → heroImageUrl
}

// In render, use imageMap[h.id] || h.imageUrl as the image source
```

In `[slug].tsx`, build the map from the cities data:

```typescript
const imageMap = useMemo(() => {
  const map: Record<string, string | null> = {};
  cities?.forEach(c => { map[c.id] = c.heroImageUrl; });
  return map;
}, [cities]);
```

This avoids extra queries and works because most highlights are cities that are already fetched.

**Step: Commit**

```bash
git add components/explore/country/HighlightCards.tsx app/(tabs)/discover/country/[slug].tsx
git commit -m "feat(country): resolve highlight images from city data"
```

---

## Task 11: Clean Up Removed Components

**Files:**
- Modify: `app/(tabs)/discover/country/[slug].tsx` — Remove unused imports

**Components no longer used on the country page:**
- `SignalsRow` — signals moved into CountryHeroCard
- `AtAGlanceGrid` — info distributed across tabs (solo level in hero, budget in Budget tab, etc.)
- `FinalNote` — content absorbed into Travel Guide tab

**Do NOT delete these component files** — they may be used elsewhere or could be useful later. Just remove their imports from `[slug].tsx`.

**Step: Commit**

```bash
git add app/(tabs)/discover/country/[slug].tsx
git commit -m "refactor(country): remove unused component imports from country page"
```

---

## Task 12: Final Type Check & Visual Verification

**Step 1: Run full type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30
```

Expected: No new errors from our changes.

**Step 2: Verify the data is flowing**

Check that the country page loads correctly with:
- Hero card rendering with image and signals
- 3 highlight cards showing below hero with city images
- Tab bar switching between Overview, Travel Guide, Budget & Practical
- Budget tab showing tips grouped by save/dont_skimp
- Budget summary showing correct `$XX–$XX` format (bug fix verified)

**Step 3: Final commit if any fixes needed**

---

## Reference: City UUIDs by Country

For use in the seed migration (Task 9). These are real UUIDs from the database:

**Cambodia:** Siem Reap `bdc3914c`, Phnom Penh `f176a087`, Kampot `c6b0cb74`, Koh Rong `04fa2d58`
**Indonesia:** Ubud `45667a9e`, Canggu `cf0acfb1`, Gili Islands `a307e2eb`, Seminyak `e691b875`, Yogyakarta `8e7d9302`
**Japan:** Tokyo `a68427ee`, Kyoto `28465f19`, Osaka `9e15b3a1`
**Laos:** Luang Prabang `a89f43d9`, Vang Vieng `ab5d4dfa`, Vientiane `7411addf`
**Lesotho:** Maseru `259cf412`, Semonkong `11617b47`
**Malaysia:** Kuala Lumpur `e2acde6f`, Penang `6a9685f6`, Langkawi `b1b9fef3`, Kota Kinabalu `ece6da3e`, Malacca `3915222a`
**Morocco:** Marrakech `61ca2d6b`, Chefchaouen `8307eeef`, Fes `835bbdfc`
**Mozambique:** Maputo `62369421`, Tofo `b151d7fb`, Bazaruto `30dcdca7`
**Myanmar:** Bagan `7fda35f3`, Inle Lake `62058212`, Yangon `959233a5`
**Namibia:** Windhoek `97eb2542`, Sossusvlei `b2e04c93`, Swakopmund `aae8c3b9`
**Philippines:** El Nido `1c74ece0`, Siargao `f7ee87f1`, Coron `86063aca`, Cebu `f4c0733c`, Boracay `af610124`, Bohol `44517c0e`
**Portugal:** Lisbon `0e444e8e`, Porto `8fb61a1b`
**Singapore:** Singapore `9ee72f23`
**South Africa:** Cape Town `a2bdbda7`, Kruger `14d46d18`, Durban `82b18abc`, Johannesburg `33faf243`
**South Korea:** Seoul `9220ca93`, Busan `33af0601`
**Taiwan:** Taipei `136eee54`, Tainan `be06a2a8`
**Thailand:** Bangkok `19aa31e1`, Chiang Mai `ba437e7c`, Krabi `e4c3f2d1`, Koh Phangan `a2e8b89b`, Phuket `30ac3da7`, Pai `6ff1d710`, Koh Lanta `1177058d`, Koh Samui `bc0c241a`, Koh Tao `4006bf97`, Chiang Rai `ac0551a4`
**Vietnam:** Ho Chi Minh City `80529793`, Hanoi `c3b16617`, Hoi An `39b2e031`, Da Nang `505ec4d4`, Da Lat `b4816da9`
**Zimbabwe:** Victoria Falls `54d583c8`, Harare `17c5dbc9`, Masvingo `2d43fb37`

---

## Countries Needing Content Fill

| Gap | Countries |
|-----|-----------|
| Thin intro (needs 2-3 paragraphs) | Cambodia, Laos, Malaysia, Myanmar, Philippines, Singapore, Taiwan |
| No budget_breakdown | Cambodia, Laos, Malaysia, Myanmar, Philippines, Singapore, Taiwan |
| No why_we_love_md | Lesotho, Mozambique, Namibia, South Africa, South Korea, Zimbabwe |
| No best_for_md / might_struggle_md | Cambodia, Laos, Malaysia, Myanmar, Philippines, Singapore, Taiwan, + 6 African/Asian countries |
| No destination_highlights (new) | All 19 |
| No budget_tips (new) | All 19 |
