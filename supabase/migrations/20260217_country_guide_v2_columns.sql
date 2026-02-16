-- Add new columns for country guide v2 redesign
-- These support the Travel Fit, Final Note, and At a Glance sections

ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS best_for_md TEXT,
  ADD COLUMN IF NOT EXISTS might_struggle_md TEXT,
  ADD COLUMN IF NOT EXISTS legal_context_md TEXT,
  ADD COLUMN IF NOT EXISTS final_note_md TEXT,
  ADD COLUMN IF NOT EXISTS cash_vs_card TEXT,
  ADD COLUMN IF NOT EXISTS plug_type TEXT;
