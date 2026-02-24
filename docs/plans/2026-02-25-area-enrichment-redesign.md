# Area/Neighborhood Enrichment + Page Redesign

**Date**: 2026-02-25
**Status**: Design

## Problem

- 177 areas across 75 cities, only 31 (Southern Africa) have any context text
- 146 areas have no positioning_line, no who_it_suits, just a name and image
- 20 duplicate areas (same name in same city from overlapping seed scripts)
- Duplicate/generic images (e.g., General Luna and Cloud 9 in Siargao share the exact same file)
- Missing neighborhoods (e.g., Pacifico in Siargao)
- Area detail page is just a hero + filtered place list. Not useful on its own.

## Design

### Area Page Layout (top to bottom)

1. **Hero** (existing): Full-width image, area name, positioning line, city breadcrumb
2. **Vibe block** (new): 2-3 sentence description of the feel. Written as if a friend is telling you about it.
3. **The crowd** (new): Single sentence about who actually hangs out there.
4. **Practical info** (new): Key-value rows. Only rows with data shown.
   - Getting around
   - WiFi
   - ATMs
   - SIM cards
   - Budget note
   - Nearest hospital
5. **Places** (existing): Grouped by type, CompactPlaceCards

### New DB Fields

```sql
ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS vibe_description text;
ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS crowd_vibe text;
ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS practical_info jsonb;
```

### Writing Style

All content follows the Sola feminist UX writing guide:

- **positioning_line**: One sentence, max 15 words. Specific, not generic. No em dashes.
  - Good: "Surf town center with beachfront cafes and the best nightlife on the island"
  - Bad: "A vibrant beachside paradise — your gateway to adventure!"
- **who_it_suits**: Start with the traveler type. One sentence.
  - Good: "Solo surfers and digital nomads who want beach access and social hostels"
- **vibe_description**: 2-3 sentences. Grounded in reality. No cliches, no exclamation marks.
  - Good: "General Luna is where most travelers base themselves on Siargao. The main road has a steady rotation of surf shops, cafes, and motorbike rental spots. It's social without being overwhelming, and you can walk to most things."
- **crowd_vibe**: One sentence. Who you'll see.
  - Good: "Mostly young surfers, a handful of long-stay remote workers, and Filipino families on weekends"
- **practical_info** JSONB: Only relevant keys per area. Values are one sentence.

### Banned in Content

- Em dashes, semicolons
- "Amazing", "awesome", "incredible", "vibrant", "bustling"
- "Wanderlust", "bucket list", "explore the world", "hidden gem"
- "Empower", "queen", "girl boss", "slay"
- Exclamation marks
- Generic descriptions that could apply to any beach/city

## Implementation Plan

### Phase 1: Database Cleanup (migration)

1. **Dedup 20 duplicate areas**: For each duplicate pair, keep the one with places assigned (or the one with `is_primary = true`), deactivate the other, reassign places.
2. **Add missing areas**: Pacifico (Siargao), audit other cities.
3. **Schema migration**: Add `vibe_description`, `crowd_vibe`, `practical_info` columns.

### Phase 2: Content Enrichment (script)

Build `scripts/enrich-areas.ts` that:
1. Fetches all active areas with their cities and places
2. For each area, constructs a prompt with:
   - Area name, kind, city name, country name
   - List of places in the area (name + type)
   - City-level context (what the city is known for)
3. AI generates: vibe_description, crowd_vibe, practical_info, positioning_line, who_it_suits
4. Applies directly to DB via UPDATE

### Phase 3: Image Fixes (script)

Build `scripts/fix-area-images.ts` that:
1. Identifies areas with duplicate/placeholder images
2. Fetches unique Unsplash images using area name + city name search
3. Uploads to Supabase storage
4. Updates hero_image_url

### Phase 4: UI Update

Update `app/(tabs)/discover/area/[id].tsx` to render new fields:
- Vibe description section
- Crowd vibe line
- Practical info key-value rows (from JSONB)

### Phase 5: Update existing Southern Africa content

- Remove em dashes from existing positioning_line values
- Backfill vibe_description, crowd_vibe, practical_info for the 31 already-enriched areas
