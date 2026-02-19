-- Fix double-encoded UTF-8 characters in city page data
-- The em-dash character (U+2014) got double-encoded as "â€"" or "Â" sequences
-- This replaces all known garbled patterns in text and JSONB columns

-- Fix text columns
UPDATE cities SET
  positioning_line = REPLACE(positioning_line, 'â€"', '-'),
  vibe = REPLACE(vibe, 'â€"', '-')
WHERE positioning_line LIKE '%â€"%' OR vibe LIKE '%â€"%';

UPDATE cities SET
  positioning_line = REPLACE(positioning_line, 'â€"', '-'),
  vibe = REPLACE(vibe, 'â€"', '-')
WHERE positioning_line LIKE '%â€"%' OR vibe LIKE '%â€"%';

-- Fix JSONB columns by casting to text, replacing, then back to JSONB
-- women_should_know
UPDATE cities SET
  women_should_know = (REPLACE(REPLACE(REPLACE(REPLACE(
    women_should_know::text,
    'â€"', '-'),
    'â€™', ''''),
    'â€œ', '"'),
    'â€\x9d', '"'))::jsonb
WHERE women_should_know::text LIKE '%â€%';

-- experience_pillars
UPDATE cities SET
  experience_pillars = (REPLACE(REPLACE(REPLACE(REPLACE(
    experience_pillars::text,
    'â€"', '-'),
    'â€™', ''''),
    'â€œ', '"'),
    'â€\x9d', '"'))::jsonb
WHERE experience_pillars::text LIKE '%â€%';

-- how_women_use
UPDATE cities SET
  how_women_use = (REPLACE(REPLACE(REPLACE(REPLACE(
    how_women_use::text,
    'â€"', '-'),
    'â€™', ''''),
    'â€œ', '"'),
    'â€\x9d', '"'))::jsonb
WHERE how_women_use::text LIKE '%â€%';

-- awareness
UPDATE cities SET
  awareness = (REPLACE(REPLACE(REPLACE(REPLACE(
    awareness::text,
    'â€"', '-'),
    'â€™', ''''),
    'â€œ', '"'),
    'â€\x9d', '"'))::jsonb
WHERE awareness::text LIKE '%â€%';

-- Also fix any remaining Â characters (from Â + non-breaking space encoding)
UPDATE cities SET
  women_should_know = (REPLACE(women_should_know::text, 'Â ', ' '))::jsonb
WHERE women_should_know::text LIKE '%Â %';

UPDATE cities SET
  experience_pillars = (REPLACE(experience_pillars::text, 'Â ', ' '))::jsonb
WHERE experience_pillars::text LIKE '%Â %';

UPDATE cities SET
  how_women_use = (REPLACE(how_women_use::text, 'Â ', ' '))::jsonb
WHERE how_women_use::text LIKE '%Â %';

UPDATE cities SET
  awareness = (REPLACE(awareness::text, 'Â ', ' '))::jsonb
WHERE awareness::text LIKE '%Â %';

-- Nuclear option: replace ALL known double-encoded sequences
-- em-dash â€" → -
-- right single quote â€™ → '
-- left single quote â€˜ → '
-- left double quote â€œ → "
-- right double quote â€ → "
-- Â (stray) → (nothing)
DO $$
DECLARE
  col text;
  cols text[] := ARRAY['women_should_know', 'experience_pillars', 'how_women_use', 'awareness'];
BEGIN
  FOREACH col IN ARRAY cols LOOP
    EXECUTE format(
      'UPDATE cities SET %I = (
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          %I::text,
          chr(195) || chr(162) || chr(194) || chr(128) || chr(148), ''-''),
          chr(195) || chr(162) || chr(194) || chr(128) || chr(153), ''''''''),
          chr(195) || chr(162) || chr(194) || chr(128) || chr(156), ''"''),
          chr(195) || chr(130) || chr(194), ''''),
          chr(195) || chr(130), '''')
        )::jsonb
      WHERE %I IS NOT NULL',
      col, col, col
    );
  END LOOP;
END $$;
