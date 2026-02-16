-- Activity detail page: add structured fields for premium layout
-- These are nullable and optional — UI gracefully hides when absent

ALTER TABLE places ADD COLUMN IF NOT EXISTS pickup_included boolean DEFAULT null;
ALTER TABLE places ADD COLUMN IF NOT EXISTS book_ahead_text text DEFAULT null;
ALTER TABLE places ADD COLUMN IF NOT EXISTS our_take_bullets jsonb DEFAULT '[]';
