-- Country page v3: destination highlights + budget tips
ALTER TABLE countries ADD COLUMN IF NOT EXISTS destination_highlights JSONB;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS budget_tips JSONB;

COMMENT ON COLUMN countries.destination_highlights IS 'Array of 3 curated highlight objects: [{type, id, label, tagline, image_url}]';
COMMENT ON COLUMN countries.budget_tips IS 'Array of budget tip objects: [{category, tip, type, level}]';
