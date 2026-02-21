-- Backfill cross-checked verification status
-- Sets baseline_passed on accommodations that were researched across
-- multiple sources (2+), meaning we cross-referenced them online.
-- Does NOT overwrite places already marked as sola_checked (physically visited).

UPDATE places
SET
  verification_status = 'baseline_passed',
  verified_at = NOW()
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND verification_status = 'unverified'
  AND sources_checked IS NOT NULL
  AND array_length(sources_checked, 1) >= 2;
