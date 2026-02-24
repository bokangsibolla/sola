-- Strip ratings and template descriptions from places
-- Safe to re-run (idempotent UPDATE statements)

BEGIN;

-- ═══════════════════════════════════════════════════════════════════
-- 1. Strip "Rated X/5 by N guests/travelers/visitors" from positioning_summary
-- ═══════════════════════════════════════════════════════════════════

UPDATE places
SET positioning_summary = TRIM(
  regexp_replace(
    positioning_summary,
    '\s*Rated \d(\.\d)?/5[^.]*\.',
    '',
    'gi'
  )
)
WHERE positioning_summary ~ 'Rated \d(\.\d)?/5';

-- ═══════════════════════════════════════════════════════════════════
-- 2. Remove "Rated X/5" entries from highlights arrays (JSONB)
-- ═══════════════════════════════════════════════════════════════════

UPDATE places
SET highlights = (
  SELECT COALESCE(
    jsonb_agg(elem ORDER BY ord),
    '[]'::jsonb
  )
  FROM jsonb_array_elements_text(highlights) WITH ORDINALITY AS t(elem, ord)
  WHERE elem !~ 'Rated \d(\.\d)?/5'
)
WHERE highlights IS NOT NULL
  AND highlights::text ~ 'Rated \d(\.\d)?/5';

-- ═══════════════════════════════════════════════════════════════════
-- 3. NULL out template/placeholder descriptions so enrichment picks them up
-- ═══════════════════════════════════════════════════════════════════

-- 3a. Placeholder pattern: "Name — type in City." (with or without trailing text)
UPDATE places
SET description = NULL
WHERE description ~ '^.+ — .+ in .+\.';

-- 3b. Template hostel: "A social/lively/popular hostel with a lively/social/vibrant atmosphere..."
UPDATE places
SET description = NULL
WHERE description ~* '^A (social|lively|popular) hostel with a (lively|social|vibrant) atmosphere';

-- 3c. Template hotel: "A peaceful/quiet/comfortable/modern hotel with a relaxed/calm/comfortable/modern atmosphere..."
UPDATE places
SET description = NULL
WHERE description ~* '^A (peaceful|quiet|comfortable|modern) hotel with a (relaxed|calm|comfortable|modern) atmosphere';

-- 3d. Template homestay: "An authentic homestay offering a genuine local experience..."
UPDATE places
SET description = NULL
WHERE description ~* '^An authentic homestay offering a genuine local experience';

-- 3e. Template women-only: "A women-only hostel..."
UPDATE places
SET description = NULL
WHERE description ~* '^A women-only hostel';

-- 3f. Any remaining description with "Rated X/5" scores
UPDATE places
SET description = NULL
WHERE description ~ 'Rated \d(\.\d)?/5';

-- 3g. Short placeholder descriptions (under 30 chars)
UPDATE places
SET description = NULL
WHERE description IS NOT NULL
  AND length(description) < 30;

COMMIT;
