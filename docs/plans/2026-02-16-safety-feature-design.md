# Safety Feature — Trip-Integrated Design

## Problem

The Safety quick link on the home tab routes to a placeholder page with zero functionality. Solo women travelers don't need another app to tap in an emergency — they'll call or WhatsApp directly. A dedicated safety page is dead weight.

## Insight

The real value is **information you don't have in your head abroad**: local emergency numbers, embassy contacts, and a quick way to share your itinerary with someone back home. This belongs inside the trip — where it's contextual and useful.

## Design

Three changes. No new pages.

### 1. Trip Plan Tab — Safety Card Upgrade

The plan tab already shows emergency numbers as plain text. Upgrade:

- **Emergency contact** (from profile) displayed at top of safety card — name, relationship, phone
  - WhatsApp button → `whatsapp://send?phone=X&text=pre-filled` (works over WiFi)
  - Call button → `tel:X` fallback
- **Local emergency numbers** for the trip's destination country — police, ambulance, fire
  - Large, clear text — designed to show to a bystander
  - Tap to copy to clipboard with "Copied" toast
- **Embassy link** → opens browser to embassy finder for the destination country
- **"Share my trip" button** → native Share sheet with pre-composed message:
  > "I'm traveling to Bangkok, Thailand. Feb 20–28. Here's my itinerary in case you need to reach me."
  - Includes destination, dates, hotel name if saved

### 2. Profile Settings — Emergency Contact Field

One new row in settings: "Emergency contact"

- Form fields: **Name**, **Relationship** (Parent / Partner / Sibling / Friend), **Phone** (with country code)
- Single contact only (like airline booking)
- Stored in `profiles` table (new columns: `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`)
- Displayed on every trip's safety card automatically

### 3. Home Quick Link — Smart Routing

The Safety button on the home page:

- **Has active/upcoming trip** → deep-links to that trip's plan tab (scrolls to safety section)
- **No trip** → routes to profile settings emergency contact section, with note: "Add a trip to see destination safety info"

### What Gets Removed

- `app/(tabs)/home/sos.tsx` — the placeholder page. Delete it.
- The `/(tabs)/sos` route reference in QuickLinksRow (replace with smart routing logic)

## Data Changes

**`profiles` table** — 3 new columns:
```sql
emergency_contact_name text,
emergency_contact_phone text,
emergency_contact_relationship text check (
  emergency_contact_relationship in ('parent', 'partner', 'sibling', 'friend')
)
```

**No new tables.** Emergency numbers already exist in `data/safety.ts` (40+ countries).

## Files Affected

| File | Change |
|------|--------|
| `components/trips/PlanTab.tsx` | Upgrade safety card — tappable numbers, emergency contact, share trip, embassy link |
| `app/(tabs)/home/settings.tsx` | Add "Emergency contact" row + inline form |
| `components/home/QuickLinksRow.tsx` | Smart routing logic for Safety button |
| `data/home/homeApi.ts` | Fetch emergency contact from profile |
| `data/home/useHomeData.ts` | Return emergency contact data |
| `supabase/migrations/YYYYMMDD_emergency_contact_columns.sql` | Add 3 columns to profiles |
| `app/(tabs)/home/sos.tsx` | Delete |

## Non-Goals (V1)

- Live location sharing
- Encrypted contact storage
- Backend-sent alerts
- Multiple emergency contacts
- In-app SOS trigger
