-- ============================================================================
-- Migration: Add place_kind to cities table
-- Purpose: Categorize cities as city/island/town/beach_town/mountain_town/village/region
--          with optional display descriptor for UI flexibility
-- Safe to re-run: YES (uses IF NOT EXISTS / idempotent UPDATEs)
-- ============================================================================

-- 1. Create enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_kind') THEN
    CREATE TYPE place_kind AS ENUM (
      'city',
      'island',
      'town',
      'beach_town',
      'mountain_town',
      'village',
      'region'
    );
  END IF;
END
$$;

-- 2. Add columns (safe to re-run)
ALTER TABLE cities ADD COLUMN IF NOT EXISTS place_kind place_kind NOT NULL DEFAULT 'city';
ALTER TABLE cities ADD COLUMN IF NOT EXISTS place_kind_descriptor text;

-- 3. Index for grouping queries
CREATE INDEX IF NOT EXISTS idx_cities_place_kind ON cities(place_kind) WHERE is_active = true;

-- ============================================================================
-- 4. Comprehensive backfill — all 75 cities
-- ============================================================================

-- Cambodia
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Historic City'      WHERE slug = 'siem-reap';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'phnom-penh';
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Riverside Town'      WHERE slug = 'kampot';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Tropical Island'     WHERE slug = 'koh-rong';

-- Indonesia
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Cultural Town'       WHERE slug = 'ubud';
UPDATE cities SET place_kind = 'beach_town', place_kind_descriptor = 'Surf Town'           WHERE slug = 'canggu';
UPDATE cities SET place_kind = 'beach_town', place_kind_descriptor = 'Resort Town'         WHERE slug = 'seminyak';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Historic City'       WHERE slug = 'yogyakarta';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Island Group'        WHERE slug = 'gili-islands';

-- Japan
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'tokyo';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Historic City'       WHERE slug = 'kyoto';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'osaka';

-- Laos
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Heritage Town'       WHERE slug = 'luang-prabang';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'vientiane';
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Adventure Town'      WHERE slug = 'vang-vieng';

-- Lesotho
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'maseru';
UPDATE cities SET place_kind = 'village',    place_kind_descriptor = 'Mountain Village'    WHERE slug = 'semonkong';

-- Malaysia
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'kuala-lumpur';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Cultural Island'     WHERE slug = 'penang';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Resort Island'       WHERE slug = 'langkawi';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Historic City'       WHERE slug = 'malacca';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Coastal City'        WHERE slug = 'kota-kinabalu';

-- Morocco
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'marrakech';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Historic City'       WHERE slug = 'fes';
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Blue Town'           WHERE slug = 'chefchaouen';

-- Mozambique
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'maputo';
UPDATE cities SET place_kind = 'beach_town', place_kind_descriptor = NULL                  WHERE slug = 'tofo';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Island Archipelago'  WHERE slug = 'bazaruto-archipelago';

-- Myanmar
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Temple Town'         WHERE slug = 'bagan';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'yangon';
UPDATE cities SET place_kind = 'region',     place_kind_descriptor = 'Lake District'       WHERE slug = 'inle-lake';

-- Namibia
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'windhoek';
UPDATE cities SET place_kind = 'region',     place_kind_descriptor = 'Desert Region'       WHERE slug = 'sossusvlei';
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Coastal Town'        WHERE slug = 'swakopmund';

-- Philippines
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Island Gateway'      WHERE slug = 'el-nido';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Surf Island'         WHERE slug = 'siargao';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'cebu';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'manila';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Beach Island'        WHERE slug = 'boracay';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Nature Island'       WHERE slug = 'bohol';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Island-Hopping Hub'  WHERE slug = 'coron';
UPDATE cities SET place_kind = 'beach_town', place_kind_descriptor = 'Surf Town'           WHERE slug = 'la-union';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'University City'     WHERE slug = 'dumaguete';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Mystic Island'       WHERE slug = 'siquijor';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'puerto-princesa';
UPDATE cities SET place_kind = 'mountain_town', place_kind_descriptor = 'Summer Capital'   WHERE slug = 'baguio';

-- Portugal
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'lisbon';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'porto';

-- Singapore
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'City-State'          WHERE slug = 'singapore';

-- South Africa
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'cape-town';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'johannesburg';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Coastal City'        WHERE slug = 'durban';
UPDATE cities SET place_kind = 'region',     place_kind_descriptor = 'National Park'       WHERE slug = 'kruger-national-park';

-- South Korea
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'seoul';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Coastal City'        WHERE slug = 'busan';

-- Taiwan
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'taipei';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Historic City'       WHERE slug = 'tainan';

-- Thailand
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'bangkok';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'chiang-mai';
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Coastal Gateway'     WHERE slug = 'krabi';
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Mountain Town'       WHERE slug = 'pai';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Resort Island'       WHERE slug = 'phuket';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Gulf Island'         WHERE slug = 'koh-phangan';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Gulf Island'         WHERE slug = 'koh-samui';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Andaman Island'      WHERE slug = 'koh-lanta';
UPDATE cities SET place_kind = 'island',     place_kind_descriptor = 'Dive Island'         WHERE slug = 'koh-tao';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'chiang-rai';

-- Vietnam
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = NULL                  WHERE slug = 'ho-chi-minh-city';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'hanoi';
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Ancient Town'        WHERE slug = 'hoi-an';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Coastal City'        WHERE slug = 'da-nang';
UPDATE cities SET place_kind = 'mountain_town', place_kind_descriptor = 'Highland Town'    WHERE slug = 'da-lat';

-- Zimbabwe
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Adventure Town'      WHERE slug = 'victoria-falls';
UPDATE cities SET place_kind = 'city',       place_kind_descriptor = 'Capital'             WHERE slug = 'harare';
UPDATE cities SET place_kind = 'town',       place_kind_descriptor = 'Historic Town'       WHERE slug = 'masvingo';
