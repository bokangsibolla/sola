# Sola Verification System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a two-layer verification system that ensures every accommodation on Sola passes a thoughtful baseline designed for solo female travelers. The curation itself communicates trust — no badges, no safety scores, just well-chosen places with contextually relevant information.

**Philosophy:** This is a feminist product design case study. We don't tell women what's "safe" — we anticipate the details they'd want to verify and do that work for them. If it's on Sola, we already thought about it.

---

## The Two Layers

### Layer 1: Sola Baseline (AI-Powered, Invisible)
Every place passes through automated verification using publicly available sources (Google Places API, reviews, official websites, social media). Places that can't be verified against enough criteria don't appear — not because they're bad, but because there's not enough certainty.

### Layer 2: Sola Checked (Physical, Selective)
For high-value places, on-site verification by Sola team or trusted contributors using a structured checklist.

---

## Architecture Overview

### Database Changes (extend existing, don't duplicate)

**Extend `places` table:**
- `verification_status`: enum — 'unverified', 'pending', 'baseline_passed', 'baseline_failed', 'insufficient_data', 'sola_checked'
- `verified_at`: timestamp
- `sola_checked_at`: timestamp (physical verification date)
- `sola_checked_by`: uuid (contributor who did physical check)

**New `place_verification` table:**
- Stores the AI verification run results
- Links to sources checked and signals extracted

**New `place_signals` table:**
- Stores extracted boolean/text signals per place
- e.g., `has_24h_checkin`, `female_dorm_available`, `reviews_mention_locks`, `neighborhood_walkable`

**New `place_sola_notes` table:**
- Stores contextual notes to surface in UI
- e.g., "Female-only dorm available", "Quiet residential street", "5 min from metro"

**Extend `tags` table:**
- Add new filter_group: 'sola_signal' for verification-derived tags

### UI Changes

**Accommodation cards (list view):**
- Clean design: image, name, neighborhood, 2-3 contextual signals as subtle pills
- No badges, no scores, no "verified" stamps
- Signals surface only when relevant (e.g., "Female-only dorm" for hostels)

**Accommodation detail page:**
- Hero images
- Name, neighborhood, price indicator
- "What to know" section — contextual signals relevant to solo travelers
- "Sola note" — optional short editorial line if there's something notable
- Details section (address, hours, contact)
- No "Safety" section — safety considerations are baked into everything

---

## Task 1: Database Migration — Extend places table

**Files:**
- Create: `supabase/migrations/00012_place_verification.sql`
- Modify: `data/types.ts`

**Step 1: Write the migration**

```sql
-- Sola Verification System
-- Extends places with verification status, adds verification tracking tables

-- ---------------------------------------------------------------------------
-- 1. Extend places table with verification columns
-- ---------------------------------------------------------------------------

-- Verification status enum
DO $$ BEGIN
  CREATE TYPE place_verification_status AS ENUM (
    'unverified',
    'pending',
    'baseline_passed',
    'baseline_failed',
    'insufficient_data',
    'sola_checked'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS verification_status place_verification_status DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS sola_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS sola_checked_by uuid REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_places_verification_status ON places(verification_status);

-- ---------------------------------------------------------------------------
-- 2. Place verification runs (each time AI verifies a place)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS place_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  status place_verification_status NOT NULL,
  sources_checked jsonb DEFAULT '[]', -- array of {source: 'google_places', url: '...', checked_at: '...'}
  raw_findings jsonb DEFAULT '{}', -- full AI analysis stored for debugging
  confidence_score numeric(3,2), -- 0.00 to 1.00
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_place_verifications_place ON place_verifications(place_id);

-- RLS
ALTER TABLE place_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read place_verifications" ON place_verifications FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 3. Place signals (extracted boolean/text signals)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS place_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  signal_key text NOT NULL, -- e.g., 'has_24h_checkin', 'female_dorm_available'
  signal_value text, -- 'true', 'false', or descriptive text
  signal_type text NOT NULL CHECK (signal_type IN ('boolean', 'text', 'category')),
  confidence numeric(3,2), -- how confident is this signal
  source text, -- 'google_reviews', 'official_website', 'ai_inference'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_id, signal_key)
);

CREATE INDEX IF NOT EXISTS idx_place_signals_place ON place_signals(place_id);
CREATE INDEX IF NOT EXISTS idx_place_signals_key ON place_signals(signal_key);

-- RLS
ALTER TABLE place_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read place_signals" ON place_signals FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 4. Place Sola notes (contextual notes to surface in UI)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS place_sola_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  note_type text NOT NULL CHECK (note_type IN ('highlight', 'context', 'consideration')),
  note_text text NOT NULL,
  display_context text, -- when to show: 'always', 'late_arrival', 'first_time_traveler'
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_place_sola_notes_place ON place_sola_notes(place_id);

-- RLS
ALTER TABLE place_sola_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read place_sola_notes" ON place_sola_notes FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 5. Verification baseline criteria (internal reference, not shown to users)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS verification_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria_key text UNIQUE NOT NULL,
  criteria_label text NOT NULL,
  category text NOT NULL, -- 'room_clarity', 'security', 'surroundings', 'operations', 'accuracy'
  weight numeric(3,2) DEFAULT 1.00, -- importance weight
  applies_to text[] DEFAULT '{}', -- place_types this applies to: ['hotel', 'hostel']
  is_required boolean DEFAULT false, -- must pass for baseline
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS (internal table, restrict access)
ALTER TABLE verification_criteria ENABLE ROW LEVEL SECURITY;
-- No public read policy - this is internal

-- ---------------------------------------------------------------------------
-- 6. Update updated_at trigger for new tables
-- ---------------------------------------------------------------------------

CREATE TRIGGER trg_place_signals_updated_at
  BEFORE UPDATE ON place_signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Step 2: Update TypeScript types**

Add to `data/types.ts`:

```typescript
export type PlaceVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'baseline_passed'
  | 'baseline_failed'
  | 'insufficient_data'
  | 'sola_checked';

// Extend Place interface
// Add to existing Place interface:
//   verificationStatus: PlaceVerificationStatus;
//   verifiedAt: string | null;
//   solaCheckedAt: string | null;
//   solaCheckedBy: string | null;

export interface PlaceVerification {
  id: string;
  placeId: string;
  status: PlaceVerificationStatus;
  sourcesChecked: { source: string; url?: string; checkedAt: string }[];
  rawFindings: Record<string, any>;
  confidenceScore: number | null;
  createdAt: string;
}

export interface PlaceSignal {
  id: string;
  placeId: string;
  signalKey: string;
  signalValue: string | null;
  signalType: 'boolean' | 'text' | 'category';
  confidence: number | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceSolaNote {
  id: string;
  placeId: string;
  noteType: 'highlight' | 'context' | 'consideration';
  noteText: string;
  displayContext: string | null;
  orderIndex: number;
  createdAt: string;
}
```

**Step 3: Run migration and commit**

```bash
npx supabase db push
git add supabase/migrations/00012_place_verification.sql data/types.ts
git commit -m "feat: add place verification schema for Sola baseline system"
```

---

## Task 2: Seed Verification Criteria (Internal Baseline)

**Files:**
- Create: `supabase/migrations/00013_seed_verification_criteria.sql`

This seeds the proprietary baseline criteria. These are INTERNAL and not exposed to users.

```sql
-- Seed verification criteria for Sola baseline
-- These define what we check, weighted by importance

INSERT INTO verification_criteria (criteria_key, criteria_label, category, weight, applies_to, is_required) VALUES
-- Room Clarity (can traveler understand what they're booking?)
('room_type_stated', 'Room type clearly stated (private/shared)', 'room_clarity', 1.0, '{hotel,hostel,homestay}', true),
('bathroom_type_stated', 'Bathroom type stated (private/shared)', 'room_clarity', 0.9, '{hotel,hostel,homestay}', false),
('female_only_option_clear', 'Female-only dorm clearly marked if available', 'room_clarity', 1.0, '{hostel}', true),
('mixed_dorm_disclosed', 'Mixed dorm clearly disclosed', 'room_clarity', 1.0, '{hostel}', true),
('bed_type_stated', 'Bed configuration stated', 'room_clarity', 0.6, '{hotel,hostel,homestay}', false),

-- Physical Security (signals from reviews and listings)
('lock_mentioned_positive', 'Reviews mention working locks/security', 'security', 0.9, '{hotel,hostel,homestay}', false),
('no_lock_complaints', 'No complaints about locks/security in reviews', 'security', 1.0, '{hotel,hostel,homestay}', true),
('locker_available', 'Lockers available for hostel guests', 'security', 0.8, '{hostel}', false),
('room_position_noted', 'Street-facing vs internal room noted if relevant', 'security', 0.5, '{hotel,hostel,homestay}', false),

-- Surroundings (neighborhood context)
('neighborhood_walkable', 'Neighborhood described as walkable', 'surroundings', 0.7, '{hotel,hostel,homestay}', false),
('transport_proximity', 'Distance to public transport stated or inferable', 'surroundings', 0.8, '{hotel,hostel,homestay}', false),
('no_area_safety_concerns', 'No safety concerns mentioned about area in reviews', 'surroundings', 1.0, '{hotel,hostel,homestay}', true),
('lighting_mentioned', 'Street lighting or area safety mentioned positively', 'surroundings', 0.6, '{hotel,hostel,homestay}', false),

-- Operational Honesty (policies and transparency)
('checkin_hours_stated', 'Check-in hours or process clearly stated', 'operations', 1.0, '{hotel,hostel,homestay}', true),
('24h_checkin_available', '24h check-in or late arrival option available', 'operations', 0.7, '{hotel,hostel,homestay}', false),
('guest_policy_stated', 'Guest/visitor policy stated', 'operations', 0.8, '{hostel,homestay}', false),
('pricing_transparent', 'No hidden fees mentioned in reviews', 'operations', 0.9, '{hotel,hostel,homestay}', true),
('cancellation_stated', 'Cancellation policy stated', 'operations', 0.7, '{hotel,hostel,homestay}', false),

-- Accuracy (does listing match reality?)
('photos_match_reviews', 'Photos described as accurate in reviews', 'accuracy', 0.8, '{hotel,hostel,homestay}', false),
('no_photo_complaints', 'No complaints about misleading photos', 'accuracy', 1.0, '{hotel,hostel,homestay}', true),
('location_accurate', 'Location/map pin described as accurate', 'accuracy', 0.9, '{hotel,hostel,homestay}', false),
('no_bait_switch', 'No bait-and-switch complaints (different room than booked)', 'accuracy', 1.0, '{hotel,hostel,homestay}', true),
('description_matches', 'Description matches reality per reviews', 'accuracy', 0.8, '{hotel,hostel,homestay}', false)

ON CONFLICT (criteria_key) DO UPDATE SET
  criteria_label = EXCLUDED.criteria_label,
  category = EXCLUDED.category,
  weight = EXCLUDED.weight,
  applies_to = EXCLUDED.applies_to,
  is_required = EXCLUDED.is_required;
```

---

## Task 3: API Functions for Verification Data

**Files:**
- Modify: `data/api.ts`

Add functions to fetch verification data:

```typescript
// ---------------------------------------------------------------------------
// Place Verification & Signals
// ---------------------------------------------------------------------------

export async function getPlaceSignals(placeId: string): Promise<PlaceSignal[]> {
  const { data, error } = await supabase
    .from('place_signals')
    .select('*')
    .eq('place_id', placeId)
    .order('signal_key');
  if (error) throw error;
  return rowsToCamel<PlaceSignal>(data ?? []);
}

export async function getPlaceSolaNotes(placeId: string): Promise<PlaceSolaNote[]> {
  const { data, error } = await supabase
    .from('place_sola_notes')
    .select('*')
    .eq('place_id', placeId)
    .order('order_index');
  if (error) throw error;
  return rowsToCamel<PlaceSolaNote>(data ?? []);
}

export async function getVerifiedPlacesByCity(cityId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .in('verification_status', ['baseline_passed', 'sola_checked'])
    .order('verification_status', { ascending: false }) // sola_checked first
    .order('name');
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

export async function getAccommodationsByCity(cityId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .in('verification_status', ['baseline_passed', 'sola_checked'])
    .order('name');
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}
```

---

## Task 4: AI Verification Script

**Files:**
- Create: `scripts/verify-place.ts`

This script uses Claude to verify a place against the baseline criteria using Google Places API and review analysis.

```typescript
/**
 * Sola Place Verification Script
 *
 * Verifies a place against the Sola baseline using:
 * 1. Google Places API for structured data
 * 2. Google Reviews analysis for signals
 * 3. Official website check (if available)
 *
 * Usage: npx ts-node scripts/verify-place.ts <place_id>
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic();

// The baseline criteria we check against
const BASELINE_CRITERIA = {
  room_clarity: [
    'room_type_stated',
    'bathroom_type_stated',
    'female_only_option_clear',
    'mixed_dorm_disclosed',
  ],
  security: [
    'lock_mentioned_positive',
    'no_lock_complaints',
    'locker_available',
  ],
  surroundings: [
    'neighborhood_walkable',
    'transport_proximity',
    'no_area_safety_concerns',
  ],
  operations: [
    'checkin_hours_stated',
    '24h_checkin_available',
    'guest_policy_stated',
    'pricing_transparent',
  ],
  accuracy: [
    'photos_match_reviews',
    'no_photo_complaints',
    'location_accurate',
    'no_bait_switch',
  ],
};

interface VerificationResult {
  status: 'baseline_passed' | 'baseline_failed' | 'insufficient_data';
  signals: Record<string, { value: string; confidence: number; source: string }>;
  solaNotes: { type: string; text: string; context?: string }[];
  confidenceScore: number;
  rawFindings: Record<string, any>;
}

async function fetchGooglePlaceData(googlePlaceId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not set');

  // Fetch place details
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=name,formatted_address,opening_hours,reviews,rating,user_ratings_total,website,types&key=${apiKey}`;
  const response = await fetch(detailsUrl);
  const data = await response.json();

  return data.result;
}

async function verifyPlace(placeId: string): Promise<VerificationResult> {
  // 1. Get place from database
  const { data: place, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', placeId)
    .single();

  if (error || !place) throw new Error(`Place not found: ${placeId}`);

  // 2. Fetch Google Places data if we have a Google Place ID
  let googleData = null;
  if (place.google_place_id) {
    try {
      googleData = await fetchGooglePlaceData(place.google_place_id);
    } catch (e) {
      console.warn('Could not fetch Google data:', e);
    }
  }

  // 3. Prepare context for Claude
  const reviewsText = googleData?.reviews
    ?.map((r: any) => r.text)
    .join('\n---\n') ?? 'No reviews available';

  const placeContext = `
Place Name: ${place.name}
Place Type: ${place.place_type}
Address: ${place.address ?? 'Not stated'}
Website: ${place.website ?? 'Not available'}
Description: ${place.description ?? 'None'}
Hours: ${place.hours_text ?? 'Not stated'}

Google Rating: ${googleData?.rating ?? 'N/A'} (${googleData?.user_ratings_total ?? 0} reviews)
Google Opening Hours: ${JSON.stringify(googleData?.opening_hours?.weekday_text ?? [])}

Reviews:
${reviewsText}
`;

  // 4. Ask Claude to analyze against baseline
  const prompt = `You are analyzing an accommodation listing for Sola, a travel app for solo female travelers.

Your job is to verify this place against our baseline criteria. We're checking if there's enough clear, consistent information for a solo female traveler to book with confidence.

PLACE DATA:
${placeContext}

BASELINE CRITERIA TO CHECK:

1. ROOM CLARITY
- Is the room type clearly stated (private vs shared)?
- Is the bathroom situation clear (private vs shared)?
- For hostels: Is female-only dorm option clearly available/marked?
- For hostels: Is mixed dorm clearly disclosed?

2. SECURITY SIGNALS
- Do reviews mention locks, security, or feeling safe positively?
- Are there any complaints about locks or security?
- For hostels: Are lockers mentioned?

3. SURROUNDINGS
- Is the neighborhood described as walkable?
- Is distance to public transport stated or inferable?
- Are there any safety concerns mentioned about the area?

4. OPERATIONS
- Are check-in hours/process clearly stated?
- Is 24h check-in or late arrival option available?
- Is guest/visitor policy stated (for hostels)?
- Are there complaints about hidden fees or surprise charges?

5. ACCURACY
- Do reviews say photos are accurate?
- Are there complaints about misleading photos?
- Is the location/map described as accurate?
- Are there bait-and-switch complaints (different room than booked)?

Based on your analysis, provide:

1. SIGNALS: For each criteria, provide:
   - signal_key (e.g., "room_type_stated")
   - value: "true", "false", or descriptive text
   - confidence: 0.0 to 1.0
   - source: where you found this info

2. SOLA_NOTES: 2-3 short notes to surface in the UI that would be helpful for a solo female traveler. These should be:
   - Factual, not judgmental
   - Relevant to solo travel
   - Examples: "Female-only dorm available", "24h check-in", "5 min walk from metro", "Quiet residential area"

3. OVERALL_STATUS:
   - "baseline_passed": Enough information is available and no major red flags
   - "baseline_failed": Clear red flags found (safety complaints, accuracy issues, etc.)
   - "insufficient_data": Not enough information to verify

4. CONFIDENCE_SCORE: 0.0 to 1.0 overall confidence in this verification

Respond in JSON format:
{
  "signals": {
    "signal_key": { "value": "...", "confidence": 0.X, "source": "..." },
    ...
  },
  "sola_notes": [
    { "type": "highlight|context|consideration", "text": "...", "context": "always|late_arrival|..." }
  ],
  "status": "baseline_passed|baseline_failed|insufficient_data",
  "confidence_score": 0.X,
  "reasoning": "Brief explanation of your assessment"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Parse JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse Claude response');

  const result = JSON.parse(jsonMatch[0]);

  return {
    status: result.status,
    signals: result.signals,
    solaNotes: result.sola_notes,
    confidenceScore: result.confidence_score,
    rawFindings: result,
  };
}

async function saveVerificationResult(placeId: string, result: VerificationResult) {
  // 1. Update place verification status
  await supabase
    .from('places')
    .update({
      verification_status: result.status,
      verified_at: new Date().toISOString(),
    })
    .eq('id', placeId);

  // 2. Save verification run
  await supabase
    .from('place_verifications')
    .insert({
      place_id: placeId,
      status: result.status,
      sources_checked: [{ source: 'google_places', checked_at: new Date().toISOString() }],
      raw_findings: result.rawFindings,
      confidence_score: result.confidenceScore,
    });

  // 3. Save signals
  for (const [key, signal] of Object.entries(result.signals)) {
    await supabase
      .from('place_signals')
      .upsert({
        place_id: placeId,
        signal_key: key,
        signal_value: signal.value,
        signal_type: signal.value === 'true' || signal.value === 'false' ? 'boolean' : 'text',
        confidence: signal.confidence,
        source: signal.source,
      }, { onConflict: 'place_id,signal_key' });
  }

  // 4. Save Sola notes
  // First clear existing notes
  await supabase
    .from('place_sola_notes')
    .delete()
    .eq('place_id', placeId);

  // Then insert new ones
  for (let i = 0; i < result.solaNotes.length; i++) {
    const note = result.solaNotes[i];
    await supabase
      .from('place_sola_notes')
      .insert({
        place_id: placeId,
        note_type: note.type,
        note_text: note.text,
        display_context: note.context ?? 'always',
        order_index: i,
      });
  }
}

// Main execution
async function main() {
  const placeId = process.argv[2];
  if (!placeId) {
    console.error('Usage: npx ts-node scripts/verify-place.ts <place_id>');
    process.exit(1);
  }

  console.log(`Verifying place: ${placeId}`);

  const result = await verifyPlace(placeId);
  console.log('Verification result:', JSON.stringify(result, null, 2));

  await saveVerificationResult(placeId, result);
  console.log('Saved to database');
}

main().catch(console.error);
```

---

## Task 5: Batch Verification Script

**Files:**
- Create: `scripts/verify-all-accommodations.ts`

Script to verify all accommodations in a city or country:

```typescript
/**
 * Batch verification for all accommodations in a location
 *
 * Usage:
 *   npx ts-node scripts/verify-all-accommodations.ts --city <city_slug>
 *   npx ts-node scripts/verify-all-accommodations.ts --country <country_slug>
 */

import { createClient } from '@supabase/supabase-js';
// Import the verifyPlace function from verify-place.ts

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyCity(citySlug: string) {
  // Get city
  const { data: city } = await supabase
    .from('cities')
    .select('id, name')
    .eq('slug', citySlug)
    .single();

  if (!city) throw new Error(`City not found: ${citySlug}`);

  // Get all accommodations
  const { data: places } = await supabase
    .from('places')
    .select('id, name')
    .eq('city_id', city.id)
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .eq('is_active', true)
    .eq('verification_status', 'unverified');

  console.log(`Found ${places?.length ?? 0} unverified accommodations in ${city.name}`);

  for (const place of places ?? []) {
    console.log(`\nVerifying: ${place.name}`);
    try {
      // Call verify-place logic here
      // await verifyAndSave(place.id);
      console.log('✓ Verified');
    } catch (e) {
      console.error('✗ Failed:', e);
    }

    // Rate limit: wait 2 seconds between API calls
    await new Promise(r => setTimeout(r, 2000));
  }
}

async function verifyCountry(countrySlug: string) {
  // Get country
  const { data: country } = await supabase
    .from('countries')
    .select('id, name')
    .eq('slug', countrySlug)
    .single();

  if (!country) throw new Error(`Country not found: ${countrySlug}`);

  // Get all cities in country
  const { data: cities } = await supabase
    .from('cities')
    .select('slug, name')
    .eq('country_id', country.id)
    .eq('is_active', true);

  console.log(`Found ${cities?.length ?? 0} cities in ${country.name}`);

  for (const city of cities ?? []) {
    console.log(`\n=== ${city.name} ===`);
    await verifyCity(city.slug);
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--city' && args[1]) {
    await verifyCity(args[1]);
  } else if (args[0] === '--country' && args[1]) {
    await verifyCountry(args[1]);
  } else {
    console.log('Usage:');
    console.log('  npx ts-node scripts/verify-all-accommodations.ts --city <city_slug>');
    console.log('  npx ts-node scripts/verify-all-accommodations.ts --country <country_slug>');
  }
}

main().catch(console.error);
```

---

## Task 6: Seed Initial Accommodations (5-10 per city)

**Files:**
- Create: `scripts/seed-accommodations.ts`

For each city, we need 5-10 curated accommodations. This script helps seed them from Google Places:

```typescript
/**
 * Seed accommodations for a city from Google Places
 *
 * Usage: npx ts-node scripts/seed-accommodations.ts <city_slug> <search_query>
 * Example: npx ts-node scripts/seed-accommodations.ts bangkok "women friendly hostel bangkok"
 */

// Script to search Google Places for accommodations and seed them into the database
// Then automatically run verification on each one

async function searchAndSeed(citySlug: string, query: string) {
  // 1. Search Google Places for accommodations
  // 2. Insert into places table with google_place_id
  // 3. Run verification on each
  // 4. Only keep ones that pass baseline
}
```

---

## Task 7: Redesign Accommodation List UI

**Files:**
- Modify: `app/(tabs)/explore/place/[slug].tsx`

The "Where to stay" section should now:
1. Only show verified places (baseline_passed or sola_checked)
2. Display clean cards with contextual signals
3. No badges or verification stamps visible

**Key changes:**

```typescript
// Replace getPlacesByCity with getAccommodationsByCity (verified only)
const { data: accommodations } = useData(
  () => city ? getAccommodationsByCity(city.id) : Promise.resolve([]),
  [city?.id],
);

// Accommodation card shows:
// - Image
// - Name
// - Neighborhood
// - 2-3 signal pills (e.g., "Female-only dorm", "24h check-in")
// - Price level

// AccommodationCard component
function AccommodationCard({ place }: { place: Place }) {
  const { data: signals } = useData(() => getPlaceSignals(place.id), [place.id]);
  const { data: notes } = useData(() => getPlaceSolaNotes(place.id), [place.id]);

  // Get highlight notes to show as pills
  const highlights = (notes ?? [])
    .filter(n => n.noteType === 'highlight')
    .slice(0, 3);

  return (
    <Pressable style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{place.name}</Text>
        {/* Signal pills */}
        <View style={styles.signalRow}>
          {highlights.map(note => (
            <View key={note.id} style={styles.signalPill}>
              <Text style={styles.signalText}>{note.noteText}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}
```

---

## Task 8: Redesign Accommodation Detail Page

**Files:**
- Modify: `app/(tabs)/explore/place-detail/[id].tsx`

The detail page should now:
1. Show hero images
2. Name, neighborhood, price
3. "What to know" section with contextual signals
4. "Sola note" if there's editorial commentary
5. Details (address, hours, contact)
6. No safety section, no verification badges

**Structure:**

```
[Hero Image Carousel]

[Name]                    [Price dots]
[Neighborhood] · [Type]

--- What to know ---
• Female-only dorm available
• 24h check-in
• 5 min walk from BTS station

[Sola note - if exists]
"Quiet residential area, most cafes close by 9pm"

--- Details ---
📍 Address
🕐 Hours
📞 Phone
🌐 Website

[Save to collection button]
```

---

## Task 9: Create "How We Choose" Public Methodology Page

**Files:**
- Create: `app/(tabs)/explore/how-we-choose.tsx`

A simple page explaining Sola's approach at a high level:

```
# How we choose places

Every place you see on Sola has been verified against criteria designed for solo female travelers.

We check what other platforms don't:
• Is the room situation crystal clear?
• Can you arrive independently, even late at night?
• Do travelers report the listing matches reality?
• Are there any concerns about the area?

We don't show ratings or safety scores. If a place is on Sola, we've already done the homework.

What you see instead:
• Contextual details that matter for your situation
• Clear information, no guesswork
• Places where solo travelers report feeling comfortable

---

This is what happens when you build with women in mind from the start.
```

---

## Task 10: Run Verification on All Existing Locations

**Execution plan:**

1. Get list of all active cities
2. For each city, identify/seed 5-10 accommodations (mix of hotels and hostels)
3. Run AI verification on each
4. Review results, manually approve/reject edge cases
5. Only baseline_passed and sola_checked appear in the app

**Cities to verify (based on existing data):**
- Bangkok, Thailand
- Chiang Mai, Thailand
- Lisbon, Portugal
- Porto, Portugal
- Tokyo, Japan
- Bali, Indonesia
- Manila, Philippines
- Cebu, Philippines

---

## Priority Order

### Phase 1: Foundation (do first)
- [ ] Task 1: Database migration
- [ ] Task 2: Seed verification criteria
- [ ] Task 3: API functions

### Phase 2: AI Pipeline
- [ ] Task 4: Single place verification script
- [ ] Task 5: Batch verification script

### Phase 3: Data Population
- [ ] Task 6: Seed 5-10 accommodations per city
- [ ] Task 10: Run verification on all locations

### Phase 4: UI Redesign
- [ ] Task 7: Accommodation list redesign
- [ ] Task 8: Accommodation detail redesign

### Phase 5: Case Study
- [ ] Task 9: Public methodology page

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/00012_place_verification.sql` | Create | Verification schema |
| `supabase/migrations/00013_seed_verification_criteria.sql` | Create | Baseline criteria |
| `data/types.ts` | Modify | Add verification types |
| `data/api.ts` | Modify | Add verification queries |
| `scripts/verify-place.ts` | Create | Single place verification |
| `scripts/verify-all-accommodations.ts` | Create | Batch verification |
| `scripts/seed-accommodations.ts` | Create | Seed places from Google |
| `app/(tabs)/explore/place/[slug].tsx` | Modify | Accommodation list redesign |
| `app/(tabs)/explore/place-detail/[id].tsx` | Modify | Accommodation detail redesign |
| `app/(tabs)/explore/how-we-choose.tsx` | Create | Public methodology |

---

## Success Criteria

1. **Invisible verification:** Users never see "verified" badges or checklists
2. **Contextual signals:** Relevant info surfaces based on place type and user context
3. **Quality bar:** Only places passing baseline appear in the app
4. **Scalable:** Can run verification on new places automatically
5. **Case study ready:** Methodology documented, approach demonstrable
