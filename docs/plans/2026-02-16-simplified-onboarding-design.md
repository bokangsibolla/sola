# Simplified Onboarding + Passive Tracking — Design

**Date:** 2026-02-16
**Status:** Approved
**Branch:** feature/simplified-onboarding

## Problem

Current onboarding has 6-8 screens collecting self-reported preferences (interests, travel style, stay preference, priorities) that are either:
- Never persisted to the database (priorities, stayPreference, tripIntent)
- Persisted but never displayed in the app (travel_style)
- Stored as non-normalized emoji strings (interests)

Self-reported preferences are unreliable. People engage with different content than what they claim to prefer.

## Solution

### A. Minimal Onboarding (4 screens)

```
Welcome → Create Account → Profile → You're In
```

**Welcome** — Splash with CTAs (unchanged)

**Create Account** — Google login (primary) + email/password (secondary). Apple kept for iOS but not prominent on Android.

**Profile** (single screen):
- First name (required) — pre-filled from Google
- Home country (required) — searchable picker
- Birthday (required) — date picker → `profiles.date_of_birth`
- Photo (optional) — camera/gallery

**You're In** — Writes to profiles, sets `onboarding_completed_at`

**Removed screens:** intent, trip-details, day-style, stay-preference

### B. Passive Event Tracking

Track user behavior in a `user_events` table via a client-side EventTracker that batches events in memory and flushes every 10 seconds (or on app background, or at 20 events).

**Table: `user_events`**
```
id, user_id, event_type, entity_type, entity_id, metadata (jsonb), created_at
```

**Event types:**
- viewed_country, viewed_city, viewed_place
- saved_place, unsaved_place
- opened_collection
- searched (metadata: {query, result_count})
- opened_thread, replied_thread
- created_trip, added_place_to_trip
- viewed_traveler

### C. Tag Affinity Scoring

**Table: `user_tag_affinity`**
```
user_id, tag_id (→ destination_tags), score, updated_at
```

A pg_cron job runs hourly to:
1. Process new user_events
2. Look up destination_tags for each entity
3. Apply weighted scores (view=+1, save=+5, trip=+10, etc.)
4. UPSERT into user_tag_affinity
5. Apply 0.95 daily time decay

### D. Personalisation

Priority order:
1. User saves and trips (strongest signal)
2. Tag affinity scores (behavioral)
3. Recency (last 7 days weighted 2x)
4. Global popularity (cold start fallback)

Server-side function `get_personalized_cities()` joins user_tag_affinity with destination_tags to rank cities. Falls back to popularity for new users with < 3 tags scoring > 2.

### E. Business Intelligence

**Collected at signup:** name, home_country, date_of_birth
**Inferred from behavior:** interests (via tag affinity), travel style, engagement patterns
**Available for reporting:** Demographics (age cohorts from DOB, country distribution), behavioral segments (from tag affinity clusters), engagement metrics (from user_events aggregation)

## Data Mapping

### Onboarding Writes

| Screen | Field | DB Column | Required |
|--------|-------|-----------|----------|
| Create Account | email | auth.users.email | yes |
| Create Account | password | auth.users (hashed) | yes (email) |
| Profile | firstName | profiles.first_name | yes |
| Profile | homeCountry | profiles.home_country_iso2, profiles.home_country_name | yes |
| Profile | birthday | profiles.date_of_birth | yes |
| Profile | photo | profiles.avatar_url (via storage) | no |
| You're In | — | profiles.onboarding_completed_at | auto |

### Passive Tracking Writes

| Surface | Event | entity_type | entity_id |
|---------|-------|-------------|-----------|
| Country page | viewed_country | country | country.id |
| City page | viewed_city | city | city.id |
| Place detail | viewed_place | place | place.id |
| Save button | saved_place | place | place.id |
| Unsave button | unsaved_place | place | place.id |
| Collection tap | opened_collection | collection | collection.id |
| Search submit | searched | null | null |
| Thread tap | opened_thread | thread | thread.id |
| Reply submit | replied_thread | thread | thread.id |
| Trip creation | created_trip | trip | trip.id |
| Add to trip | added_place_to_trip | place | place.id |
| Traveler profile | viewed_traveler | profile | profile.id |

## Schema Changes

### New column on profiles
```sql
ALTER TABLE profiles ADD COLUMN date_of_birth date;
```

### New table: user_events
```sql
CREATE TABLE user_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now() NOT NULL
);
```

### New table: user_tag_affinity
```sql
CREATE TABLE user_tag_affinity (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES destination_tags(id) ON DELETE CASCADE,
  score      numeric(6,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, tag_id)
);
```

## Test Checklist

- [ ] Google login → new user → 4-screen flow → lands on home
- [ ] Email login → new user → 4-screen flow → lands on home
- [ ] Google login → existing user → straight to home
- [ ] Email login → existing user → straight to home
- [ ] User who skips photo → completes onboarding → no avatar shown
- [ ] Birthday picker → valid date stored in profiles.date_of_birth
- [ ] Events tracked: view country/city/place, save/unsave, search, thread actions
- [ ] Events batch correctly (queue fills, flushes at 20 or 10s)
- [ ] App background → events flush
- [ ] Tag affinity computed from events (manual trigger for testing)
- [ ] New user with no events → gets popular content (fallback)
- [ ] User with events → gets personalized content
- [ ] Existing users not affected (old onboarding_completed_at still works)
