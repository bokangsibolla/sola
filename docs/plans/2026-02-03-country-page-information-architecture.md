# Explore Section: Product Analysis & Redesign

**Date:** 2026-02-03
**Status:** Proposal
**Scope:** Country, City, and Neighborhood page information architecture + Activities data integration

---

## 1. Diagnosis: What's Wrong Today

### Current Information Architecture

**Country Page (`/explore/country/[slug]`)**
Shows:
- Hero image + name + tagline
- Quick facts carousel (best time, currency, language, etc.)
- "Why we love it" section (expandable editorial)
- Highlights list
- **Cities to explore** (card grid)
- Practical sections (visa, money, safety, transport, etc.)
- Things to do list
- Emergency numbers

**City Page (`/explore/place/[slug]`)**
Shows:
- Hero image + city name + tagline
- Neighborhood filter pills
- Places grouped by category (Where to stay, Eat & Drink, Things to do, Coworking)
- Place cards with images, price, tags, description

**Place Detail (`/explore/place-detail/[id]`)**
Shows:
- Image carousel
- Name, price, category, rating
- Highlights, "Why We Love It", "Solo Travelers Say"
- Tags grouped by filter type
- "Good to Know" considerations
- Address, hours, phone, website
- Save + Maps buttons

### Where Value is Unclear or Generic

**Country Level Problems:**
1. **Information dump, not orientation.** The page tries to answer every question at once: practical logistics, why to visit, safety, cities, things to do. There's no clear hierarchy of "what matters first."

2. **Cities appear as an afterthought.** They're buried in a scrollable section, presented as equal-weight cards. The user doesn't understand *why* they should choose one city over another or what each city is *for*.

3. **Practical info dominates.** Visa, money, SIM, transport—these are reference sections, not discovery sections. They shouldn't occupy prime real estate on first view.

4. **No emotional framing.** The page tells me *facts* about the country but doesn't help me feel whether this country is *for me*. "Best months: April-October" is useful but not inspiring.

5. **Generic travel guide feel.** The structure (highlights, things to do, practical tips) mirrors every travel blog. It doesn't communicate "we understand how you actually travel."

**City Level Problems:**
1. **It's a place dump.** All places are shown immediately, organized by functional category (stay, eat, do). This is useful as a reference but feels like a database query, not a guide.

2. **No sense of time.** The page doesn't help me understand "what do I do this morning?" or "I have 3 hours before dinner." It's organized by *what things are*, not *when I'd need them*.

3. **Neighborhood filters are reactive, not guiding.** The pills let me filter, but they don't teach me what neighborhoods exist or why I'd care. If I don't already know Canggu from Seminyak, the filters mean nothing.

4. **Missing the "everyday" feeling.** The categories (landmarks, activities, wellness) feel like tourist categories. Where's "good coffee spot to start your day" or "quiet place to work for 2 hours"?

5. **No hierarchy of importance.** A 5-star hotel appears with the same weight as a local café. Everything is presented as equally relevant.

**Navigation Flow Problems:**
1. **Country → City feels like a jump, not a progression.** You go from broad cultural context to a list of specific venues. The city page doesn't ease you in with "what this city is about."

2. **No city-level editorial.** Despite having `getCityContent()` in the API, the city page jumps straight to places. There's no "Bali is about X, but Ubud specifically is about Y."

3. **Neighborhoods are filters, not destinations.** They should be discoverable in their own right for cities that warrant them, not just a way to slice the place list.

4. **Return visits aren't supported.** If I've been to Lisbon before and want to check "what's good in Alfama this trip," the flow doesn't support that. I have to navigate Country → City → Filter by Neighborhood every time.

### What the User Likely Feels

**Landing on a country page:**
"This is a lot of information. It looks nice, but I'm not sure what I'm supposed to do. Am I planning a trip? Researching? Just browsing? Everything seems equally important."

**Landing on a city page:**
"Okay, here are places. But I don't know this city at all. Why would I go to this café instead of that one? They all look similar. I feel like I'm scrolling through Yelp with a nicer design."

**Overall:**
"This is pretty, but it doesn't feel like it understands me. It feels like any other travel app—just with better photos."

---

## 2. Desired Mental Model

### The Feeling We Want

**"Start broad, then gently guide me deeper."**
- Users should feel oriented before they feel overwhelmed with options.
- Each level should answer a clear question, then invite them to the next.

**"This understands how I actually travel day-to-day."**
- Not "top 10 things to do" but "where to work this morning, where to eat lunch, what to do with a free afternoon."
- Time-based, rhythm-based, not category-based.

**"Everything feels curated, not exhaustive."**
- We don't show everything. We show what matters.
- Fewer options, higher confidence.

### The Hierarchy

| Level | Primary Question Answered | Tone |
|-------|--------------------------|------|
| **Country** | "Is this country for me? What kind of experience is it?" | Orienting, inspiring, framing |
| **City** | "What do I actually do here? How do I spend my time?" | Guiding, practical, rhythmic |
| **Neighborhood** | "What's this area like to be in day-to-day?" | Intimate, local, everyday |

### Mental Model Statement

> **Country pages orient you.** They tell you what kind of traveler this country suits, what the vibe is, and what to expect. They introduce cities as distinct experiences, not just locations.
>
> **City pages guide your days.** They help you understand how to spend your time—morning, afternoon, evening. They're organized around rhythms of daily life, not database categories.
>
> **Neighborhood pages (when they exist) make you feel local.** They're for cities big enough to have distinct areas. They answer: "What's it like to actually be here?"

---

## 3. Country Page Redesign

### What the Country Page Should Primarily Communicate

1. **Who this country is for.** "This is great for first-time solo travelers" or "This is for experienced nomads who want adventure."

2. **What kind of experience it offers.** Beach and slow? Urban and fast? Nature and remote? Cultural and rich?

3. **How cities differ.** Not just "here are cities" but "Lisbon is the capital energy, Porto is the coastal calm, Algarve is the beach escape."

4. **A sense of safety and context.** Women traveling alone should feel reassured (or informed) within the first scroll.

### What the Country Page Should NOT Try to Do

- **Not a complete travel guide.** Visa info, SIM cards, currency—these are reference material. They should exist but not dominate.
- **Not a place listing.** Don't show specific restaurants or cafés at country level. That's what city pages are for.
- **Not exhaustive.** Don't try to cover everything. Create confidence through curation.

### How It Should Lead the User Forward

The page should create a clear "read this, then choose a city" flow. By the end of the country page, the user should know:
- "Yes, this country fits what I'm looking for"
- "I want to explore [City X] first because it sounds like what I need"

### Proposed Section Structure

```
┌─────────────────────────────────────────────┐
│ HERO: Country name + one-line vibe          │
│ "Slow pace, stunning beaches, safe & social"│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ WHO THIS IS FOR (2-3 bullet persona matches)│
│ • First-time solo travelers                 │
│ • Digital nomads seeking community          │
│ • Anyone wanting beach + culture mix        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ THE EXPERIENCE (short editorial paragraph)  │
│ What it *feels* like to be here.            │
│ Not facts. Feelings.                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ SAFETY CONTEXT (for solo women travelers)   │
│ Clear, upfront, reassuring or honest.       │
│ "Generally safe. Exercise normal caution."  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ CHOOSE YOUR BASE (City cards with purpose)  │
│                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ LISBON   │ │ PORTO    │ │ ALGARVE  │     │
│ │ "Capital │ │ "Coastal │ │ "Beach   │     │
│ │ energy"  │ │ calm"    │ │ escape"  │     │
│ │          │ │          │ │          │     │
│ │ Best for:│ │ Best for:│ │ Best for:│     │
│ │ 1-2 weeks│ │ slow stay│ │ nature   │     │
│ └──────────┘ └──────────┘ └──────────┘     │
│                                             │
│ Each card: Image + name + 1-line purpose   │
│ + "Best for" context                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PRACTICAL INFO (collapsible, secondary)     │
│ Visa • Money • Connectivity • Transport     │
│ Available but not dominant.                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ EMERGENCY CONTACTS (footer, always visible) │
└─────────────────────────────────────────────┘
```

### Content Types (Intent, Not Copy)

| Section | Intent |
|---------|--------|
| Hero | Instant vibe check. One glance = "I get it." |
| Who this is for | Persona matching. "Am I this person?" |
| The experience | Emotional invitation. Create desire. |
| Safety context | Build trust. Show we prioritize their safety. |
| Choose your base | Guide the next step. Make cities feel distinct. |
| Practical info | Reference material. There when needed. |

### How Places Are Introduced

**Cities are NOT introduced as a grid dump.**

Instead:
- Each city card has a **purpose statement** ("Capital energy", "Coastal calm")
- Each city card has a **best for** context ("Good for 1-2 weeks", "Great for slow stays")
- Maximum 3-5 cities shown prominently; others in a "More places" expandable if needed
- Order by recommendation strength, not alphabetically

---

## 4. City/Place Page Redesign

### What the City Page Should Primarily Communicate

1. **What this city is about.** A 2-3 sentence orientation before diving into places.
2. **How to spend your time here.** Organized by rhythms, not categories.
3. **Clear everyday guidance.** Where to work, where to eat, where to walk.

### The Problem with Current Categories

Current: "Where to stay" | "Eat & Drink" | "Things to do" | "Coworking"

This answers "what type of thing is this?" but not "when would I need this?"

A café and a restaurant are both "Eat & Drink" but serve completely different purposes in my day.

### Proposed Structure: Time-Based Sections

Organize by **when you'd need something**, not what category it falls into.

```
┌─────────────────────────────────────────────┐
│ HERO: City name + purpose statement         │
│ "The creative heart of Portugal"            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ABOUT THIS CITY (short paragraph)           │
│ What makes it special. How it feels.        │
│ Sets expectations before showing places.    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ NEIGHBORHOODS (if applicable)               │
│ "Lisbon has distinct areas. Here's how     │
│ they feel:"                                 │
│ [Alfama] [Bairro Alto] [Príncipe Real]     │
│ Tappable to filter OR to go to area page   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ YOUR MORNING                                │
│ ☕ Cafés to start your day                  │
│ 💻 Places to work (if you need to)         │
│                                             │
│ [Café card] [Café card] [Coworking card]   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ YOUR AFTERNOON                              │
│ 🍜 Lunch spots                              │
│ 🚶 Walks and wandering                      │
│                                             │
│ [Restaurant card] [Walk/area card]          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ YOUR EVENING                                │
│ 🍷 Dinner recommendations                   │
│ 🌙 After-dinner options (bars, views)       │
│                                             │
│ [Dinner card] [Bar card] [Viewpoint card]  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ IF YOU HAVE A FULL DAY                      │
│ Day trips, longer activities, excursions    │
│                                             │
│ [Activity card] [Day trip card]             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ WHERE TO STAY                               │
│ Recommended areas + specific accommodations │
│ "Stay in Alfama for old-world charm,        │
│ Príncipe Real for cafés and coworking"     │
│                                             │
│ [Hotel card] [Hostel card]                  │
└─────────────────────────────────────────────┘
```

### Why This Works

| Old Structure | New Structure |
|---------------|---------------|
| "Eat & Drink" = 30 venues dumped together | Morning = coffee, Afternoon = lunch, Evening = dinner |
| User has to mentally sort by use case | We've already sorted by use case |
| Feels like a database | Feels like a guide |

### How to Avoid Feeling Like a Blog or Listicle

1. **Limited items per section.** Maximum 4-6 places per time-of-day section. Not "Top 50 cafés."

2. **Clear editorial voice.** Each place has a "why we chose this" line. Not generic descriptions.

3. **No numbered rankings.** Never "Top 10" or "#1 café." Just "here are good options."

4. **Curation over comprehensiveness.** We don't show everything. We show what we'd actually recommend.

5. **Acknowledging trade-offs.** Using the existing `considerations` field—"Can get crowded on weekends," "WiFi is unreliable." Honesty builds trust.

### Encouraging Exploration Without Forcing It

- Time-based sections let users engage at their own pace
- "If you have a full day" is optional—it's there for those who want it
- Neighborhood pills invite filtering without requiring it
- No progress bars, checkboxes, or gamification

---

## 5. Neighborhoods: When and Why

### Clear Criteria for When a City Gets Neighborhoods

A city should have distinct neighborhood pages when:

1. **Physical scale warrants it.** Cities where areas are 30+ minutes apart or have distinctly different daily rhythms.

2. **Character meaningfully differs.** "Shibuya is young and fast, Shimokitazawa is indie and slow" matters. "East side vs West side" with no real character difference doesn't.

3. **Travelers actually choose areas.** If the decision "where in this city should I base myself?" is meaningful, neighborhoods are warranted.

4. **We have enough content.** At least 5-8 curated places per neighborhood to make it feel substantial.

**Examples:**
- **Tokyo:** Yes. Shibuya, Shinjuku, Shimokitazawa are vastly different experiences.
- **Lisbon:** Yes. Alfama, Bairro Alto, Príncipe Real have distinct vibes.
- **Porto:** Probably not. It's walkable and cohesive. Neighborhood filters okay, but not full pages.
- **A small beach town in Thailand:** No. It's one vibe.

### How Neighborhoods Should Differ from Cities

| Aspect | City Level | Neighborhood Level |
|--------|------------|-------------------|
| **Tone** | "Here's the city, here's how to spend time" | "Here's what it's like to *be* in this area" |
| **Content** | Best-of recommendations across the city | Everyday spots in this specific area |
| **Decision it answers** | "What do I do in Lisbon?" | "What's near me in Alfama?" |
| **Emotional register** | Guide-like | Local-like |

### What Information Belongs at Neighborhood Level vs City Level

**City Level:**
- Overall city orientation
- Best-of recommendations (the ONE café you shouldn't miss)
- Practical logistics (getting around the whole city)
- Where to stay decision (which neighborhood to base in)

**Neighborhood Level:**
- "What's it like here" description (feeling, pace, who it suits)
- Daily rhythm places (your local coffee, your nearby lunch)
- Walks specific to this area
- "Stay here if you want X" guidance

**Example:**
- **City level (Lisbon):** "Best café in Lisbon: Fabrica Coffee Roasters" (highlight)
- **Neighborhood level (Príncipe Real):** "Coffee in Príncipe Real: Fabrica, Copenhagen Coffee Lab, Wish Slow Coffee" (local options)

---

## 6. Navigation and Subtle Guidance

### How Users Should Feel Guided

**Principle: Imply direction through design, not instruction.**

- Never say "Start here, then go there."
- Instead: make the logical next action the most visible, most inviting element.

### Current Navigation Problems

1. **Flat hierarchy.** Country cards and city cards look similar. The user doesn't subconsciously understand "this is a higher level than that."

2. **Back navigation is generic.** Going back from a place detail doesn't contextually return you to "where you were in the flow."

3. **No breadcrumbs or context.** On a place detail, I might forget which city I was exploring. The mental model breaks.

### Proposed Navigation Improvements

**1. Visual hierarchy through card design**

| Level | Card Treatment |
|-------|----------------|
| Country | Larger, full-bleed images, prominent text |
| City | Medium cards, clearly "inside" a country context |
| Place | Smaller, detail-focused, clearly "inside" a city |

The size and treatment should communicate "this is a container, these are contents."

**2. Contextual headers**

On a city page, show: `Portugal → Lisbon`

On a place detail, show: `Lisbon → Fabrica Coffee`

This isn't loud breadcrumb UI—just subtle contextual text that keeps the user oriented.

**3. "Back to" patterns**

Instead of generic back arrows, contextual labels:
- From place detail: "← Back to Lisbon"
- From city page: "← Back to Portugal"

**4. Section transitions that imply depth**

When tapping from country to city, the animation should feel like "zooming in"—not just pushing a new screen.

When tapping from city to place detail, the animation should feel like "focusing"—the card expanding into detail.

These micro-interactions build subconscious understanding of hierarchy.

### Ordering, Grouping, and Hierarchy for Subconscious Clarity

**Countries on Explore screen:**
- Order by "good for you" (based on user profile) first, then popular, then alphabetical
- Group by theme tabs already works—reinforce this

**Cities on Country page:**
- Order by "most likely to visit" or recommendation strength
- Don't alphabetize. Curate the order.

**Places on City page:**
- Within each time-of-day section, order by editorial recommendation strength
- First item in each section is our "top pick" without labeling it as such

**Neighborhoods:**
- Order by "most popular for solo travelers" first
- Or by geographic logic (central → outward)

### What NOT to Do

- **No onboarding carousels.** No "Here's how to use the app."
- **No tooltips.** If you need a tooltip, the design is wrong.
- **No forced linear flows.** Users can jump around. That's fine.
- **No progress indicators.** No "You've explored 3/10 cities!"
- **No badges or achievements.** This isn't a game.

### Subtle Signals of Quality

Instead of loud features, use subtle signals:

- **Confident white space.** Don't cram. Let content breathe.
- **Editorial voice.** Short, confident descriptions. Not marketing fluff.
- **Selective inclusion.** Showing fewer places signals "we chose these carefully."
- **Honest considerations.** Acknowledging downsides builds trust.

---

## 7. Activities & Experiences Data Integration

### CSV Data Analysis

The researched activities CSV contains **45 activities** across **23 cities** in **12 countries**, with the following structure:

| Field | Description | Example Values |
|-------|-------------|----------------|
| Activity Name | Name of the activity | "Bangkok Best Eats Midnight Food Tour" |
| Type | Activity type | `tour`, `cooking_class`, `landmark`, `viewpoint`, `day_trip`, `adventure` |
| Category | High-level grouping | "Tours & Experiences", "Outdoor & Adventure", "Cultural & Sightseeing" |
| Price Range | $ / $$ / $$$ | $$ |
| Price Estimate | Actual cost | "$70-80 per person" |
| Duration | How long it takes | "4 hours", "Full day", "1-2 hours" |
| **Best Time** | When to do it | `Morning`, `Afternoon`, `Evening`, `Sunset`, `Any` |
| **Physical Level** | Difficulty | `Easy`, `Moderate` |
| Why Selected | Editorial curation voice | Why this is good for solo travelers |
| Highlights | Key selling points | Semicolon-separated list |
| Considerations | Things to know | Semicolon-separated list |
| Solo Traveler Reviews | Social proof quotes | Direct quotes from solo travelers |
| Booking Info | How to book | "Book via GetYourGuide" |
| Google Rating | Rating out of 5 | 4.9 |
| Review Count | Number of reviews | 1068 |
| Sources Checked | Research sources | "TripAdvisor; GetYourGuide; Klook" |

### Critical Field: Best Time

The **Best Time** field directly enables the new time-based city page structure:

| Best Time Value | Maps To Section |
|-----------------|-----------------|
| `Morning` | "Your Morning" |
| `Afternoon` | "Your Afternoon" |
| `Evening` | "Your Evening" |
| `Sunset` | "Your Evening" (special callout) |
| `Any` | "If You Have a Full Day" or flexible placement |

This is the **key data point** that makes the redesign possible.

### Schema Changes Required

The existing `Place` schema needs these additions:

```typescript
// Add to Place interface in data/types.ts

// Time-based categorization (NEW)
bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'any' | null;

// Duration information (NEW)
estimatedDuration: string | null;  // "2-3 hours", "Full day", etc.

// Booking information (NEW)
bookingInfo: string | null;  // "Book via GetYourGuide", contact info, etc.

// Physical difficulty (NEW - or use tags)
physicalLevel: 'easy' | 'moderate' | 'challenging' | null;
```

**Alternative for Physical Level:** Use the existing tag system with `filterGroup: 'physical_level'` and tags like `easy`, `moderate`, `challenging`.

### Database Migration

```sql
-- Migration: 00016_place_time_and_duration.sql

ALTER TABLE places ADD COLUMN best_time_of_day TEXT
  CHECK (best_time_of_day IN ('morning', 'afternoon', 'evening', 'any'));

ALTER TABLE places ADD COLUMN estimated_duration TEXT;

ALTER TABLE places ADD COLUMN booking_info TEXT;

ALTER TABLE places ADD COLUMN physical_level TEXT
  CHECK (physical_level IN ('easy', 'moderate', 'challenging'));

-- Index for time-based queries
CREATE INDEX idx_places_best_time ON places(city_id, best_time_of_day)
  WHERE is_active = true;
```

### Type Mapping: CSV → Database

| CSV Type | Database `placeType` |
|----------|---------------------|
| `tour` | `tour` |
| `cooking_class` | `activity` (with tag) |
| `landmark` | `landmark` |
| `viewpoint` | `landmark` (with tag) |
| `day_trip` | `tour` (with tag) |
| `adventure` | `activity` (with tag) |

### Activity Entry Interface

```typescript
// scripts/content/activities-researched.ts

export interface ActivityEntry {
  // Identification
  name: string;
  googleMapsUrl: string;
  googlePlaceId: string | null;

  // Classification
  type: 'tour' | 'cooking_class' | 'landmark' | 'viewpoint' | 'day_trip' | 'adventure';
  category: 'Tours & Experiences' | 'Outdoor & Adventure' | 'Cultural & Sightseeing';
  citySlug: string;
  city: string;
  country: string;

  // Pricing
  priceRange: '$' | '$$' | '$$$';
  priceLevel: 1 | 2 | 3;
  priceEstimate: string | null;

  // Time & Duration (CRITICAL for new architecture)
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'sunset' | 'any';
  estimatedDuration: string;

  // Physical requirements
  physicalLevel: 'easy' | 'moderate';

  // Ratings
  googleRating: number | null;
  reviewCount: number | null;

  // Sola curation data
  whySelected: string;
  highlights: string[];
  considerations: string[];
  soloTravelerReviews: string;
  bookingInfo: string;
  sourcesChecked: string[];
}
```

### Seeding Strategy

Similar to accommodations, create a seeding script that:

1. Parses the CSV into `ActivityEntry[]`
2. Maps to database `Place` records
3. Creates associated tags (cooking_class, viewpoint, day_trip, etc.)
4. Sets the new time/duration fields

```typescript
// scripts/seed-activities.ts

function mapActivityToPlace(activity: ActivityEntry): Partial<Place> {
  return {
    name: activity.name,
    cityId: getCityIdBySlug(activity.citySlug),
    placeType: mapActivityType(activity.type),
    priceLevel: activity.priceLevel,
    googleMapsUrl: activity.googleMapsUrl,
    googlePlaceId: activity.googlePlaceId,
    googleRating: activity.googleRating,
    googleReviewCount: activity.reviewCount,

    // Curation fields
    whySelected: activity.whySelected,
    highlights: activity.highlights,
    considerations: activity.considerations,
    soloFemaleReviews: activity.soloTravelerReviews,
    sourcesChecked: activity.sourcesChecked,

    // NEW fields for time-based architecture
    bestTimeOfDay: activity.bestTimeOfDay === 'sunset' ? 'evening' : activity.bestTimeOfDay,
    estimatedDuration: activity.estimatedDuration,
    bookingInfo: activity.bookingInfo,
    physicalLevel: activity.physicalLevel,

    verificationStatus: 'sola_checked',
    isActive: true,
  };
}
```

### API Changes

Add new query functions:

```typescript
// data/api.ts additions

// Get places by time of day for a city
export async function getPlacesByTimeOfDay(
  cityId: string,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'any'
): Promise<Place[]>

// Get activities/tours for a city (for "If you have a full day" section)
export async function getActivitiesByCity(cityId: string): Promise<Place[]>

// Get places grouped by time of day
export async function getPlacesGroupedByTime(cityId: string): Promise<{
  morning: Place[];
  afternoon: Place[];
  evening: Place[];
  fullDay: Place[];
  accommodations: Place[];
}>
```

---

## 8. Content Requirements

### What We Have Now

| Content Type | Status | Count |
|--------------|--------|-------|
| Countries | ✅ Seeded | ~15 |
| Cities | ✅ Seeded | ~25 |
| Accommodations | ✅ Researched | 73 (from accommodation CSV) |
| Activities | ✅ Researched | 45 (from activities CSV) |
| Cafés/Restaurants | ❌ Not yet | - |
| Coworking | ❌ Not yet | - |
| City Editorial (GeoContent) | Partial | Some cities |

### Content Gaps for Time-Based Architecture

To fully enable the new city page structure, we need:

| Section | Required Content | Status |
|---------|------------------|--------|
| **Your Morning** | Cafés, coworking spaces | ❌ Need research |
| **Your Afternoon** | Lunch spots, walks | ❌ Need research |
| **Your Evening** | Dinner, bars, views | ❌ Need research |
| **Full Day** | Tours, activities | ✅ Have 45 |
| **Where to Stay** | Hotels, hostels | ✅ Have 73 |

### Minimum Viable Content Per City

For the new architecture to feel complete, each city needs:

- **3-5 morning spots** (cafés, coworking)
- **3-5 afternoon spots** (lunch, walks)
- **3-5 evening spots** (dinner, bars)
- **2-3 full-day activities** (from activities CSV)
- **3-5 accommodations** (from accommodations CSV)
- **1 city editorial paragraph** (from GeoContent)

### Content Priority

1. **Seed activities data** (have CSV, need to import)
2. **Write city editorial** (brief paragraph per city)
3. **Research everyday places** (cafés, restaurants, bars)
4. **Add `bestTimeOfDay` to existing places** (manual curation)

---

## 9. Implementation Plan

### Phase 1: Schema & Data Foundation

**Tasks:**
1. Add new columns to `places` table (`best_time_of_day`, `estimated_duration`, `booking_info`, `physical_level`)
2. Create `ActivityEntry` interface and parse CSV
3. Create `seed-activities.ts` script
4. Run seeding for 45 activities
5. Add `bestTimeOfDay` field to existing accommodations (default to `any`)

**Outcome:** Database has time-based fields, activities are seeded.

### Phase 2: API Layer

**Tasks:**
1. Add `getPlacesByTimeOfDay()` function
2. Add `getPlacesGroupedByTime()` function
3. Update `getCityContent()` to include city editorial
4. Add city purpose statement to GeoContent (`bestFor` field exists)

**Outcome:** API can serve time-grouped data.

### Phase 3: City Page Restructure (Highest Impact)

**Tasks:**
1. Refactor `app/(tabs)/explore/place/[slug].tsx`
2. Replace category tabs with time-based sections
3. Add city editorial intro section
4. Add neighborhood intro section (if city has areas)
5. Implement "Your Morning", "Your Afternoon", "Your Evening", "Full Day", "Where to Stay" sections
6. Keep neighborhood filter pills but make them secondary

**Outcome:** City pages feel like guides, not databases.

### Phase 4: Country Page Reframe

**Tasks:**
1. Refactor `app/(tabs)/explore/country/[slug].tsx`
2. Add "Who this is for" section (use `soloLevel`, `goodForInterests`)
3. Move practical info sections down
4. Enhance city cards with purpose statements and "best for" context
5. Add safety context earlier in the page

**Outcome:** Country pages orient and invite, not overwhelm.

### Phase 5: Navigation Polish

**Tasks:**
1. Add contextual breadcrumbs to city and place pages
2. Update back button labels to be contextual
3. Differentiate card treatments by level (country vs city vs place)

**Outcome:** Users always know where they are in the hierarchy.

### Phase 6: Content Backfill

**Tasks:**
1. Write city editorial paragraphs for top 10 cities
2. Research and add cafés/restaurants for top 5 cities
3. Add `bestTimeOfDay` to all curated places

**Outcome:** Content matches the new architecture.

---

## 10. Success Criteria

Users should be able to:
- Land on a country and know within 5 seconds if it's for them
- Land on a city and know what to do that morning without scrolling endlessly
- Feel like the app "gets" solo travel rhythms, not tourist itineraries
- Return repeatedly because it's useful day-to-day, not just for trip planning

### Metrics to Track

- Time spent on city page (should increase)
- Scroll depth on city page (should be more even, less drop-off)
- Places saved per session (should increase)
- Return visits to city pages (should increase)

---

## 11. Summary

### The Core Shift

| From | To |
|------|-----|
| Information architecture organized by **data type** (countries, cities, places) | Information architecture organized by **user journey** (orient, guide, localize) |
| Pages that answer "what exists here?" | Pages that answer "what should I do?" |
| Completeness as a value | Curation as a value |
| Category-based organization | Rhythm-based organization |

### Key Enabler: Best Time of Day

The activities CSV includes `Best Time` data (Morning, Afternoon, Evening, Sunset, Any). This is the **critical field** that enables the time-based city page structure. The schema changes to add `best_time_of_day` to places unlock the entire redesign.

### Next Steps

1. Review and approve this plan
2. Create schema migration for new place fields
3. Build activities seeding script
4. Start city page restructure in a new session
