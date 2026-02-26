# Volunteer Opportunities — Feature Design

> Free access to real volunteer organizations across Southeast Asia. No middleman fees.

## Problem

Solo women travelers want to volunteer while traveling, but platforms like Volunteer World and GoAbroad charge $200-500+ in placement fees just to connect travelers with organizations. The organizations themselves often accept volunteers directly — the platforms are unnecessary middlemen.

## Solution

Surface verified volunteer organizations directly in Sola with their real contact details (phone, email, website). Travelers connect directly. Zero fees.

## Scope

- **Organizations**: Direct orgs only — animal shelters, teaching programs, conservation projects, community centers, farms. No paid placement platforms.
- **Commitment**: Any duration — from drop-in afternoons to 6-month programs. Clearly labeled.
- **Geography**: Southeast Asia (10 countries, ~100-150 opportunities total, ~10-15 per country).

## Data Model

### Extend existing `places` table

Volunteer organizations become first-class places (`place_type = 'volunteer'`), inheriting the full places infrastructure: city relationships, media, tags, verification, search.

**New columns:**

| Column | Type | Example |
|--------|------|---------|
| `volunteer_type` | text | `'animal'`, `'teaching'`, `'conservation'`, `'community'`, `'healthcare'`, `'construction'`, `'farming'` |
| `min_commitment` | text | `'Drop-in'`, `'1 week'`, `'2 weeks'`, `'1 month'`, `'3 months'` |
| `volunteer_details` | jsonb | See below |

**`volunteer_details` JSONB structure:**
```json
{
  "skills_needed": ["English fluency", "Basic carpentry"],
  "languages": ["English", "Thai"],
  "includes_accommodation": true,
  "includes_meals": true,
  "cost_note": "Room & board: $5/day",
  "how_to_apply": "Email volunteer@org.com with your dates",
  "what_volunteers_do": "Feed and care for rescued elephants, maintain enclosures, assist with veterinary checks",
  "email": "volunteer@elephantnaturepark.org"
}
```

**Existing columns used as-is:**
- `name`, `description`, `address`, `lat/lng` — location
- `phone`, `website` — direct contact details
- `google_place_id`, `google_maps_url` — maps integration
- `women_only` — boolean flag for women-only programs
- `best_time_of_day`, `estimated_duration` — scheduling
- `hours_text` — operating hours
- `place_media` — photos
- `is_active`, `verification_status` — quality control

### Migration

```sql
-- Add volunteer to place_type enum
ALTER TABLE places DROP CONSTRAINT places_place_type_check;
ALTER TABLE places ADD CONSTRAINT places_place_type_check CHECK (
  place_type IN (
    'hotel','hostel','homestay',
    'restaurant','cafe','bakery','bar','club','rooftop',
    'activity','coworking','landmark','transport','shop','tour',
    'wellness','spa','salon','gym',
    'laundry','pharmacy','clinic','hospital','atm','police',
    'volunteer'
  )
);

-- Add volunteer-specific columns
ALTER TABLE places ADD COLUMN volunteer_type text;
ALTER TABLE places ADD COLUMN min_commitment text;
ALTER TABLE places ADD COLUMN volunteer_details jsonb DEFAULT '{}';

-- Constraint: volunteer_type required when place_type is volunteer
ALTER TABLE places ADD CONSTRAINT volunteer_type_required CHECK (
  place_type != 'volunteer' OR volunteer_type IS NOT NULL
);
```

## Data Sourcing — 3 Phases

### Phase 1: Google Places API Discovery

Script (`scripts/content/discover-volunteer-orgs.ts`) searches each SE Asia city for:
- `"NGO"`, `"non-profit"`, `"volunteer"`, `"animal shelter"`, `"animal rescue"`
- `"language school"`, `"community center"`, `"conservation"`, `"wildlife sanctuary"`
- `"organic farm"`, `"permaculture"`, `"children's home"`, `"education center"`

Extracts: name, address, phone, website, Google Place ID, photos, rating.

### Phase 2: Web Research Enrichment

For each candidate, verify:
- Do they actually accept volunteers? (check website/social media)
- What's the minimum commitment?
- What do volunteers actually do?
- Any costs? (accommodation/meals)
- Best contact method

### Phase 3: Manual Curation

Add well-known organizations that Google Places might miss:
- Elephant Nature Park, Chiang Mai
- Bali sea turtle conservation projects
- Siem Reap teaching programs
- Cat/dog rescue organizations across Thailand/Bali

**Target: ~10-15 verified opportunities per country, ~100-150 total.**

## UI Placement

### 1. City Pages — "Volunteer" Section

After Experiences section. Shows 3-4 horizontal scroll cards:
- Org name
- Volunteer type chip (e.g., "Animal Rescue")
- Min commitment
- One-line description

### 2. Country Pages — "Volunteer Across [Country]" Section

Top opportunities across all cities in the country. Each card shows city name.

### 3. Dedicated Volunteer Screen

Accessible from Explore (quick action or search). Full listing with filters:
- Country / City dropdown
- Type (animal, teaching, conservation, community, etc.)
- Commitment (drop-in, short-term, long-term)

### 4. Place Detail Page — Volunteer Info Block

When `place_type = 'volunteer'`, show a structured info block:
- **What volunteers do** — clear description of daily activities
- **Minimum commitment** — how long you need
- **Skills / languages** — what's helpful to have
- **Includes** — accommodation, meals (icons)
- **Cost note** — any fees, transparently stated
- **How to apply** — prominent CTA with direct contact method
- **Contact** — phone, email, website (all tappable)

## Implementation Order

1. **Database migration** — add place_type + columns
2. **Discovery script** — Google Places API search across SE Asia cities
3. **Research & populate** — verify candidates, write descriptions, seed data
4. **City page section** — VolunteerSection component
5. **Country page section** — VolunteerCountrySection component
6. **Place detail enhancements** — volunteer info block on detail page
7. **Dedicated volunteer screen** — listing + filters
8. **Explore integration** — quick action or feed card linking to volunteer screen
