# Community Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a place-based Q&A Community tab to Sola where women travelers can ask questions, share experiences, and discover discussions scoped to their destination — with calm, structured UX and women-first safety defaults.

**Architecture:** New `community` tab added to bottom navigation (replacing the hidden SOS redirect with a visible Community tab, keeping SOS as a modal). The Community data layer lives in `data/community/` with its own types, API functions, and hooks — mirroring the `data/trips/` pattern. Backend uses 6 new Supabase tables with RLS, leveraging existing `blocked_users` and country/city foreign keys. Frontend uses Expo Router stack screens for community home, place feed, thread detail, and thread creation.

**Tech Stack:** React Native + Expo Router (file-based routing), Supabase (Postgres + RLS), React Query for caching, existing design system (`constants/design.ts`), Feather/Ionicons for icons, `expo-image` for avatars.

---

## Navigation Integration Decision

**Current tabs:** Explore, Travelers, Trips, Profile (4 visible + SOS hidden)

**Proposed:** Explore, Community, Trips, Travelers, Profile (5 visible + SOS hidden)

Community becomes the 2nd tab — placed between Explore and Trips. This positions it as a core discovery tool (browse discussions about places you're exploring) rather than a social afterthought. The Travelers tab moves to 4th position. This requires:
- Adding a `community` directory under `app/(tabs)/`
- Adding a community icon to `assets/images/icons/`
- Updating `app/(tabs)/_layout.tsx` tab order
- Updating `components/TabBar.tsx` icon map

---

## Task 1: Supabase Migration — Community Tables

**Files:**
- Create: `supabase/migrations/20260205_community_tables.sql`

**Step 1: Write the migration SQL**

```sql
-- ============================================================
-- COMMUNITY FEATURE MIGRATION
-- Place-based Q&A for women solo travelers
-- ============================================================

-- 1. Community Topics (small curated set)
CREATE TABLE community_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE community_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Topics are publicly readable"
  ON community_topics FOR SELECT USING (true);

-- 2. Community Threads (questions / posts)
CREATE TABLE community_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  country_id uuid REFERENCES countries(id),
  city_id uuid REFERENCES cities(id),
  topic_id uuid REFERENCES community_topics(id),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'locked', 'removed')),
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'hidden')),
  pinned boolean NOT NULL DEFAULT false,
  helpful_count int NOT NULL DEFAULT 0,
  reply_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_threads_country_created
  ON community_threads(country_id, created_at DESC);
CREATE INDEX idx_community_threads_city_created
  ON community_threads(city_id, created_at DESC);
CREATE INDEX idx_community_threads_topic
  ON community_threads(topic_id);
CREATE INDEX idx_community_threads_author
  ON community_threads(author_id);

-- Full-text search on title + body
ALTER TABLE community_threads
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) STORED;

CREATE INDEX idx_community_threads_search
  ON community_threads USING gin(search_vector);

-- Auto-update updated_at
CREATE TRIGGER community_threads_updated_at
  BEFORE UPDATE ON community_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;

-- Readable by all authenticated users (unless removed/hidden)
CREATE POLICY "Threads are readable when active and public"
  ON community_threads FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status != 'removed'
    AND visibility = 'public'
  );

-- Authors can also see their own hidden threads
CREATE POLICY "Authors can see own threads"
  ON community_threads FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create threads"
  ON community_threads FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own threads"
  ON community_threads FOR UPDATE
  USING (auth.uid() = author_id);

-- 3. Community Replies
CREATE TABLE community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES community_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  parent_reply_id uuid REFERENCES community_replies(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'removed')),
  helpful_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_replies_thread
  ON community_replies(thread_id, created_at);
CREATE INDEX idx_community_replies_author
  ON community_replies(author_id);
CREATE INDEX idx_community_replies_parent
  ON community_replies(parent_reply_id);

CREATE TRIGGER community_replies_updated_at
  BEFORE UPDATE ON community_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Replies are readable when active"
  ON community_replies FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'active');

CREATE POLICY "Authors can see own replies"
  ON community_replies FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create replies"
  ON community_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own replies"
  ON community_replies FOR UPDATE
  USING (auth.uid() = author_id);

-- 4. Community Reactions ("Helpful" votes)
CREATE TABLE community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('thread', 'reply')),
  entity_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX idx_community_reactions_entity
  ON community_reactions(entity_type, entity_id);

ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own reactions"
  ON community_reactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add reactions"
  ON community_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON community_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Community Reports (content-level, extends existing user_reports)
CREATE TABLE community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('thread', 'reply')),
  entity_id uuid NOT NULL,
  reason text NOT NULL DEFAULT 'inappropriate',
  details text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewed', 'actioned')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_reports_entity
  ON community_reports(entity_type, entity_id);

ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own reports"
  ON community_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON community_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 6. Increment/decrement functions for denormalized counts

-- Increment reply_count on thread when reply is created
CREATE OR REPLACE FUNCTION community_inc_reply_count()
RETURNS trigger AS $$
BEGIN
  UPDATE community_threads
    SET reply_count = reply_count + 1
    WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_reply_insert
  AFTER INSERT ON community_replies
  FOR EACH ROW EXECUTE FUNCTION community_inc_reply_count();

-- Decrement reply_count when reply is soft-deleted
CREATE OR REPLACE FUNCTION community_dec_reply_count()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status = 'removed' THEN
    UPDATE community_threads
      SET reply_count = GREATEST(reply_count - 1, 0)
      WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_reply_soft_delete
  AFTER UPDATE ON community_replies
  FOR EACH ROW EXECUTE FUNCTION community_dec_reply_count();

-- Increment/decrement helpful_count on thread or reply
CREATE OR REPLACE FUNCTION community_inc_helpful()
RETURNS trigger AS $$
BEGIN
  IF NEW.entity_type = 'thread' THEN
    UPDATE community_threads SET helpful_count = helpful_count + 1 WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'reply' THEN
    UPDATE community_replies SET helpful_count = helpful_count + 1 WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_reaction_insert
  AFTER INSERT ON community_reactions
  FOR EACH ROW EXECUTE FUNCTION community_inc_helpful();

CREATE OR REPLACE FUNCTION community_dec_helpful()
RETURNS trigger AS $$
BEGIN
  IF OLD.entity_type = 'thread' THEN
    UPDATE community_threads SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.entity_id;
  ELSIF OLD.entity_type = 'reply' THEN
    UPDATE community_replies SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.entity_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_reaction_delete
  AFTER DELETE ON community_reactions
  FOR EACH ROW EXECUTE FUNCTION community_dec_helpful();
```

**Step 2: Verify the migration is valid SQL**

Run: `cat supabase/migrations/20260205_community_tables.sql | head -5`
Expected: Shows the migration header comment

**Step 3: Commit**

```bash
git add supabase/migrations/20260205_community_tables.sql
git commit -m "feat(community): add community tables migration with RLS and triggers"
```

---

## Task 2: Seed Community Topics

**Files:**
- Create: `supabase/migrations/20260205_seed_community_topics.sql`

**Step 1: Write the seed migration**

```sql
-- ============================================================
-- SEED: Community Topics (women-first curated set)
-- ============================================================

INSERT INTO community_topics (label, slug, sort_order) VALUES
  ('Safety & comfort',       'safety-comfort',     1),
  ('Stays',                  'stays',              2),
  ('Getting around',         'getting-around',     3),
  ('Local culture tips',     'local-culture',      4),
  ('Meeting people',         'meeting-people',     5),
  ('Itineraries & things to do', 'itineraries',    6)
ON CONFLICT (slug) DO NOTHING;
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260205_seed_community_topics.sql
git commit -m "feat(community): seed 6 women-first community topics"
```

---

## Task 3: Seed Demo Threads and Replies

**Files:**
- Create: `supabase/migrations/20260205_seed_community_threads.sql`

**Step 1: Write the seed migration**

This seeds realistic women-first Q&A threads for Philippines, Vietnam, Thailand, and Indonesia. Uses subqueries to look up country/city/topic IDs dynamically.

```sql
-- ============================================================
-- SEED: Demo Community Threads & Replies
-- Women-first questions for PH, VN, TH, ID
-- ============================================================

-- Helper: use a demo author (first profile found, or skip if none)
DO $$
DECLARE
  demo_author uuid;
  ph_country uuid;
  vn_country uuid;
  th_country uuid;
  id_country uuid;
  -- cities
  manila_city uuid;
  siargao_city uuid;
  hanoi_city uuid;
  hoian_city uuid;
  bangkok_city uuid;
  chiangmai_city uuid;
  bali_city uuid;
  yogya_city uuid;
  -- topics
  topic_safety uuid;
  topic_stays uuid;
  topic_getting_around uuid;
  topic_culture uuid;
  topic_meeting uuid;
  topic_itinerary uuid;
  -- thread IDs for replies
  t1 uuid; t2 uuid; t3 uuid; t4 uuid;
  t5 uuid; t6 uuid; t7 uuid; t8 uuid;
BEGIN
  -- Get a demo author
  SELECT id INTO demo_author FROM profiles LIMIT 1;
  IF demo_author IS NULL THEN RETURN; END IF;

  -- Countries
  SELECT id INTO ph_country FROM countries WHERE iso2 = 'PH';
  SELECT id INTO vn_country FROM countries WHERE iso2 = 'VN';
  SELECT id INTO th_country FROM countries WHERE iso2 = 'TH';
  SELECT id INTO id_country FROM countries WHERE iso2 = 'ID';

  -- Cities (may be null if not seeded)
  SELECT id INTO manila_city FROM cities WHERE slug = 'manila' LIMIT 1;
  SELECT id INTO siargao_city FROM cities WHERE slug = 'siargao' LIMIT 1;
  SELECT id INTO hanoi_city FROM cities WHERE slug = 'hanoi' LIMIT 1;
  SELECT id INTO hoian_city FROM cities WHERE slug = 'hoi-an' LIMIT 1;
  SELECT id INTO bangkok_city FROM cities WHERE slug = 'bangkok' LIMIT 1;
  SELECT id INTO chiangmai_city FROM cities WHERE slug = 'chiang-mai' LIMIT 1;
  SELECT id INTO bali_city FROM cities WHERE slug = 'bali' LIMIT 1;
  SELECT id INTO yogya_city FROM cities WHERE slug = 'yogyakarta' LIMIT 1;

  -- Topics
  SELECT id INTO topic_safety FROM community_topics WHERE slug = 'safety-comfort';
  SELECT id INTO topic_stays FROM community_topics WHERE slug = 'stays';
  SELECT id INTO topic_getting_around FROM community_topics WHERE slug = 'getting-around';
  SELECT id INTO topic_culture FROM community_topics WHERE slug = 'local-culture';
  SELECT id INTO topic_meeting FROM community_topics WHERE slug = 'meeting-people';
  SELECT id INTO topic_itinerary FROM community_topics WHERE slug = 'itineraries';

  -- Philippines threads
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id)
  VALUES (gen_random_uuid(), demo_author,
    'Solo female safety in Manila — what areas to avoid at night?',
    'I''m arriving in Manila next week for a 3-night stopover. I''ll be staying in Makati but want to explore some street food in Binondo. Any areas I should be careful about after dark? I usually take Grab everywhere but just want to know the vibe.',
    ph_country, manila_city, topic_safety)
  RETURNING id INTO t1;

  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id)
  VALUES (gen_random_uuid(), demo_author,
    'Best hostels with female-only dorms in Siargao?',
    'Heading to Siargao for 5 days to learn surfing. Looking for a hostel with a female-only dorm option that''s social but not a party hostel. Budget around $15-20/night. Bonus if it''s walkable to Cloud 9.',
    ph_country, siargao_city, topic_stays)
  RETURNING id INTO t2;

  -- Vietnam threads
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id)
  VALUES (gen_random_uuid(), demo_author,
    'Getting around Hanoi as a solo woman — motorbike vs Grab?',
    'I keep reading that traffic in Hanoi is insane. Is it worth renting a motorbike or should I just use Grab for everything? I''m comfortable on scooters from Bali but Hanoi looks like a different level. Also, any tips for crossing the street without dying?',
    vn_country, hanoi_city, topic_getting_around)
  RETURNING id INTO t3;

  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id)
  VALUES (gen_random_uuid(), demo_author,
    'Hoi An 3-day itinerary — what would you cut?',
    'I have 3 full days in Hoi An. My list: Ancient Town walking, Marble Mountains, Basket Boat ride, Ba Na Hills, cooking class, tailoring, An Bang Beach. That''s way too much. What would you prioritize and what can I skip?',
    vn_country, hoian_city, topic_itinerary)
  RETURNING id INTO t4;

  -- Thailand threads
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id)
  VALUES (gen_random_uuid(), demo_author,
    'Temple etiquette for women in Bangkok — what to know',
    'First time visiting temples in Bangkok. I know shoulders and knees need to be covered, but are there any other rules for women specifically? Can I enter all areas of the temples? Any that are particularly worth visiting that feel safe and calm?',
    th_country, bangkok_city, topic_culture)
  RETURNING id INTO t5;

  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id)
  VALUES (gen_random_uuid(), demo_author,
    'Meeting other solo women in Chiang Mai — coworking or hostels?',
    'I''ll be in Chiang Mai for 2 weeks working remotely. Want to meet other solo female travelers but I''m not a big drinker and hostel bar scenes aren''t my thing. Are coworking spaces a good way to connect? Any specific ones where women tend to hang out?',
    th_country, chiangmai_city, topic_meeting)
  RETURNING id INTO t6;

  -- Indonesia threads
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id)
  VALUES (gen_random_uuid(), demo_author,
    'Honest talk: is Bali still worth it for solo women?',
    'I see so many mixed opinions. Some say Bali is overrun with influencers and scams, others say it''s still magical. I''m planning 10 days, interested in yoga, rice terraces, and quieter beaches. Is Ubud still authentic or should I look at other areas? Any spots to avoid?',
    id_country, bali_city, topic_itinerary)
  RETURNING id INTO t7;

  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id)
  VALUES (gen_random_uuid(), demo_author,
    'Solo woman in Yogyakarta — Borobudur sunrise tips?',
    'Doing the Borobudur sunrise. Is it safe to go alone or should I book a group tour? I''ve read mixed things about the touts and guides being pushy. Also, is Prambanan worth adding same day or too rushed?',
    id_country, yogya_city, topic_culture)
  RETURNING id INTO t8;

  -- Replies for first 4 threads (2 replies each)
  IF t1 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t1, demo_author, 'Makati is very safe, you''ll be fine there even at night. For Binondo, go during the day — it''s amazing for street food but gets quiet after 8pm. Take Grab to/from and you''ll have zero issues. I walked around Salcedo and Legazpi Village at midnight and felt totally comfortable.'),
    (t1, demo_author, 'Been to Manila 3 times solo. Makati and BGC are the safest areas. I would avoid Tondo and be cautious in Quiapo after dark. Binondo is fine during the day but I wouldn''t linger past sunset. Grab is super cheap so there''s no reason not to use it everywhere.');
  END IF;

  IF t3 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t3, demo_author, 'Honestly, just use Grab for the first 2 days and observe. Hanoi traffic has a rhythm — once you see it, it makes sense. I ended up renting a motorbike on day 3 and it was fine, but the first day I was terrified. For crossing: just walk steadily at a consistent pace and they flow around you. Do NOT stop or run.'),
    (t3, demo_author, 'I used Grab the whole time and was happy with that choice. Motorbike rentals are like $7/day but the stress wasn''t worth it for me. Grab is ₫20-40k for most rides within the Old Quarter. The app works perfectly.');
  END IF;

  IF t5 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t5, demo_author, 'The main rules: cover shoulders and knees (bring a shawl), remove shoes before entering, don''t point your feet at Buddha statues, and don''t touch monks. Women cannot touch monks or hand them anything directly. Wat Pho is my favorite — it''s huge so it never feels crowded, and the reclining Buddha is stunning.'),
    (t5, demo_author, 'Adding to what''s been said: if you''re on your period, some women prefer to skip the most sacred inner areas out of respect, but it''s not strictly required. Wat Arun at sunset is gorgeous and very calm. Skip the Grand Palace if you''re short on time — it''s beautiful but extremely crowded and touristy.');
  END IF;

  IF t7 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t7, demo_author, 'Bali is absolutely still worth it if you know where to go. Skip the Seminyak/Kuta tourist strip. For your interests: Ubud is still lovely (stay north of the center for quiet), Sidemen is the new Ubud but calmer, and Amed/Lovina for quiet beaches. The rice terraces at Jatiluwih are way less crowded than Tegallalang.'),
    (t7, demo_author, 'I just came back from 12 days solo. Ubud is still authentic if you stay outside the center — I was in Penestanan and it was magical. Canggu is fun but very Instagram-heavy. My favorite surprise was Munduk in the north — waterfalls, coffee plantations, almost no tourists. Strongly recommend.');
  END IF;
END $$;
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260205_seed_community_threads.sql
git commit -m "feat(community): seed demo threads and replies for PH, VN, TH, ID"
```

---

## Task 4: Community TypeScript Types

**Files:**
- Create: `data/community/types.ts`

**Step 1: Write the types**

```typescript
/** Community feature types — mirrors Supabase schema. */

export type ThreadStatus = 'active' | 'locked' | 'removed';
export type ReplyStatus = 'active' | 'removed';
export type ReportStatus = 'open' | 'reviewed' | 'actioned';
export type CommunityEntityType = 'thread' | 'reply';

export interface CommunityTopic {
  id: string;
  label: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CommunityThread {
  id: string;
  authorId: string;
  title: string;
  body: string;
  countryId: string | null;
  cityId: string | null;
  topicId: string | null;
  status: ThreadStatus;
  visibility: string;
  pinned: boolean;
  helpfulCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Thread with joined author profile + place names for display. */
export interface ThreadWithAuthor extends CommunityThread {
  author: {
    id: string;
    firstName: string;
    avatarUrl: string | null;
  };
  countryName: string | null;
  cityName: string | null;
  topicLabel: string | null;
  /** Whether the current user has marked this helpful. */
  isHelpful: boolean;
}

export interface CommunityReply {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  parentReplyId: string | null;
  status: ReplyStatus;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Reply with joined author profile for display. */
export interface ReplyWithAuthor extends CommunityReply {
  author: {
    id: string;
    firstName: string;
    avatarUrl: string | null;
  };
  isHelpful: boolean;
}

export interface CommunityReaction {
  id: string;
  userId: string;
  entityType: CommunityEntityType;
  entityId: string;
  createdAt: string;
}

export interface CommunityReport {
  id: string;
  reporterId: string;
  entityType: CommunityEntityType;
  entityId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
}

/** Params for fetching a filtered thread feed. */
export interface ThreadFeedParams {
  countryId?: string;
  cityId?: string;
  topicId?: string;
  searchQuery?: string;
  sort: 'relevant' | 'new' | 'helpful';
  page: number;
  pageSize: number;
}

/** Params for creating a new thread. */
export interface CreateThreadInput {
  title: string;
  body: string;
  countryId?: string;
  cityId?: string;
  topicId?: string;
}

/** Params for creating a reply. */
export interface CreateReplyInput {
  threadId: string;
  body: string;
  parentReplyId?: string;
}
```

**Step 2: Commit**

```bash
git add data/community/types.ts
git commit -m "feat(community): add TypeScript types for community data layer"
```

---

## Task 5: Community API Functions

**Files:**
- Create: `data/community/communityApi.ts`

**Step 1: Write the API functions**

```typescript
/**
 * Community API layer — Supabase queries for threads, replies, reactions, reports.
 * Follows the same pattern as data/trips/tripApi.ts.
 */

import { supabase } from '@/lib/supabase';
import { toCamel, rowsToCamel } from '@/data/api';
import type {
  CommunityTopic,
  CommunityThread,
  ThreadWithAuthor,
  CommunityReply,
  ReplyWithAuthor,
  ThreadFeedParams,
  CreateThreadInput,
  CreateReplyInput,
} from './types';

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export async function getCommunityTopics(): Promise<CommunityTopic[]> {
  const { data, error } = await supabase
    .from('community_topics')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return rowsToCamel<CommunityTopic>(data ?? []);
}

// ---------------------------------------------------------------------------
// Threads — Feed
// ---------------------------------------------------------------------------

export async function getThreadFeed(
  userId: string,
  params: ThreadFeedParams,
  blockedIds: string[] = [],
): Promise<ThreadWithAuthor[]> {
  const { countryId, cityId, topicId, searchQuery, sort, page, pageSize } = params;
  const offset = page * pageSize;

  // Build base query with joined author profile + place names
  let query = supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_author_id_fkey(id, first_name, avatar_url),
      countries!community_threads_country_id_fkey(name),
      cities!community_threads_city_id_fkey(name),
      community_topics!community_threads_topic_id_fkey(label)
    `)
    .eq('status', 'active')
    .eq('visibility', 'public');

  // Place filters
  if (countryId) query = query.eq('country_id', countryId);
  if (cityId) query = query.eq('city_id', cityId);
  if (topicId) query = query.eq('topic_id', topicId);

  // Full-text search
  if (searchQuery && searchQuery.trim()) {
    const tsQuery = searchQuery.trim().split(/\s+/).join(' & ');
    query = query.textSearch('search_vector', tsQuery);
  }

  // Exclude blocked users
  if (blockedIds.length > 0) {
    query = query.not('author_id', 'in', `(${blockedIds.join(',')})`);
  }

  // Sort
  if (sort === 'new') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'helpful') {
    query = query.order('helpful_count', { ascending: false });
  } else {
    // 'relevant' — pinned first, then by helpful + recency blend
    query = query
      .order('pinned', { ascending: false })
      .order('helpful_count', { ascending: false })
      .order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;

  // Fetch user's reactions for these threads
  const threadIds = (data ?? []).map((t: any) => t.id);
  const userReactions = await getUserReactionsForEntities(userId, 'thread', threadIds);

  return (data ?? []).map((row: any) => ({
    ...toCamel<CommunityThread>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    countryName: row.countries?.name ?? null,
    cityName: row.cities?.name ?? null,
    topicLabel: row.community_topics?.label ?? null,
    isHelpful: userReactions.has(row.id),
  }));
}

// ---------------------------------------------------------------------------
// Threads — Single
// ---------------------------------------------------------------------------

export async function getThread(
  userId: string,
  threadId: string,
): Promise<ThreadWithAuthor | null> {
  const { data, error } = await supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_author_id_fkey(id, first_name, avatar_url),
      countries!community_threads_country_id_fkey(name),
      cities!community_threads_city_id_fkey(name),
      community_topics!community_threads_topic_id_fkey(label)
    `)
    .eq('id', threadId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const userReactions = await getUserReactionsForEntities(userId, 'thread', [threadId]);

  return {
    ...toCamel<CommunityThread>(data),
    author: {
      id: data.profiles?.id ?? data.author_id,
      firstName: data.profiles?.first_name ?? '',
      avatarUrl: data.profiles?.avatar_url ?? null,
    },
    countryName: data.countries?.name ?? null,
    cityName: data.cities?.name ?? null,
    topicLabel: data.community_topics?.label ?? null,
    isHelpful: userReactions.has(threadId),
  };
}

// ---------------------------------------------------------------------------
// Threads — Create / Update
// ---------------------------------------------------------------------------

export async function createThread(
  userId: string,
  input: CreateThreadInput,
): Promise<string> {
  const { data, error } = await supabase
    .from('community_threads')
    .insert({
      author_id: userId,
      title: input.title,
      body: input.body,
      country_id: input.countryId ?? null,
      city_id: input.cityId ?? null,
      topic_id: input.topicId ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateThread(
  threadId: string,
  updates: { title?: string; body?: string },
): Promise<void> {
  const { error } = await supabase
    .from('community_threads')
    .update(updates)
    .eq('id', threadId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Replies
// ---------------------------------------------------------------------------

export async function getThreadReplies(
  userId: string,
  threadId: string,
  blockedIds: string[] = [],
): Promise<ReplyWithAuthor[]> {
  let query = supabase
    .from('community_replies')
    .select(`
      *,
      profiles!community_replies_author_id_fkey(id, first_name, avatar_url)
    `)
    .eq('thread_id', threadId)
    .eq('status', 'active')
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: true });

  if (blockedIds.length > 0) {
    query = query.not('author_id', 'in', `(${blockedIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const replyIds = (data ?? []).map((r: any) => r.id);
  const userReactions = await getUserReactionsForEntities(userId, 'reply', replyIds);

  return (data ?? []).map((row: any) => ({
    ...toCamel<CommunityReply>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    isHelpful: userReactions.has(row.id),
  }));
}

export async function createReply(
  userId: string,
  input: CreateReplyInput,
): Promise<string> {
  const { data, error } = await supabase
    .from('community_replies')
    .insert({
      thread_id: input.threadId,
      author_id: userId,
      body: input.body,
      parent_reply_id: input.parentReplyId ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

// ---------------------------------------------------------------------------
// Reactions (Helpful)
// ---------------------------------------------------------------------------

async function getUserReactionsForEntities(
  userId: string,
  entityType: 'thread' | 'reply',
  entityIds: string[],
): Promise<Set<string>> {
  if (entityIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('community_reactions')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .in('entity_id', entityIds);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.entity_id));
}

export async function toggleHelpful(
  userId: string,
  entityType: 'thread' | 'reply',
  entityId: string,
): Promise<boolean> {
  // Check if already reacted
  const { data: existing } = await supabase
    .from('community_reactions')
    .select('id')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .maybeSingle();

  if (existing) {
    // Remove reaction
    await supabase
      .from('community_reactions')
      .delete()
      .eq('id', existing.id);
    return false; // no longer helpful
  } else {
    // Add reaction
    await supabase
      .from('community_reactions')
      .insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
      });
    return true; // now helpful
  }
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function reportContent(
  userId: string,
  entityType: 'thread' | 'reply',
  entityId: string,
  reason: string,
  details?: string,
): Promise<void> {
  const { error } = await supabase
    .from('community_reports')
    .insert({
      reporter_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      reason,
      details: details ?? null,
    });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Place Lookups (for thread creation place selector)
// ---------------------------------------------------------------------------

export async function searchCommunityCountries(
  query: string,
  limit: number = 10,
): Promise<{ id: string; name: string; iso2: string }[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('id, name, iso2')
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .order('order_index')
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name, iso2: r.iso2 }));
}

export async function getCitiesForCountry(
  countryId: string,
): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .eq('country_id', countryId)
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name }));
}
```

**Step 2: Verify `rowsToCamel` is exported from `data/api.ts`**

Check: `grep 'export function rowsToCamel' data/api.ts`
If not exported, add the export.

**Step 3: Commit**

```bash
git add data/community/communityApi.ts
git commit -m "feat(community): add community API layer with threads, replies, reactions, reports"
```

---

## Task 6: Community React Hooks

**Files:**
- Create: `data/community/useCommunityFeed.ts`
- Create: `data/community/useThread.ts`

**Step 1: Write the feed hook**

```typescript
/**
 * Hook for the community thread feed with place-based filtering.
 * Manages pagination, filters, and blocked-user exclusion.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/state/AuthContext';
import { getThreadFeed } from './communityApi';
import { getBlockedUserIds } from '@/data/api';
import type { ThreadWithAuthor, ThreadFeedParams } from './types';

interface UseCommunityFeedReturn {
  threads: ThreadWithAuthor[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  setFilters: (filters: Partial<Pick<ThreadFeedParams, 'countryId' | 'cityId' | 'topicId' | 'searchQuery' | 'sort'>>) => void;
  filters: Pick<ThreadFeedParams, 'countryId' | 'cityId' | 'topicId' | 'searchQuery' | 'sort'>;
}

const PAGE_SIZE = 15;

export function useCommunityFeed(): UseCommunityFeedReturn {
  const { userId } = useAuth();
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<Pick<ThreadFeedParams, 'countryId' | 'cityId' | 'topicId' | 'searchQuery' | 'sort'>>({
    sort: 'relevant',
  });

  // Fetch blocked users once
  useEffect(() => {
    if (!userId) return;
    getBlockedUserIds(userId).then(setBlockedIds).catch(() => {});
  }, [userId]);

  const fetchThreads = useCallback(async (pageNum: number, isRefresh: boolean) => {
    if (!userId) return;
    try {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 0) setLoading(true);

      const result = await getThreadFeed(userId, {
        ...filters,
        page: pageNum,
        pageSize: PAGE_SIZE,
      }, blockedIds);

      if (pageNum === 0) {
        setThreads(result);
      } else {
        setThreads((prev) => [...prev, ...result]);
      }
      setHasMore(result.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load threads'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, filters, blockedIds]);

  // Fetch on mount and when filters change
  useEffect(() => {
    setPage(0);
    fetchThreads(0, false);
  }, [fetchThreads]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchThreads(nextPage, false);
  }, [hasMore, loading, page, fetchThreads]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchThreads(0, true);
  }, [fetchThreads]);

  const setFilters = useCallback((newFilters: Partial<Pick<ThreadFeedParams, 'countryId' | 'cityId' | 'topicId' | 'searchQuery' | 'sort'>>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return { threads, loading, refreshing, error, hasMore, loadMore, refresh, setFilters, filters };
}
```

**Step 2: Write the thread detail hook**

```typescript
/**
 * Hook for a single thread with its replies.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/state/AuthContext';
import { getThread, getThreadReplies } from './communityApi';
import { getBlockedUserIds } from '@/data/api';
import type { ThreadWithAuthor, ReplyWithAuthor } from './types';

interface UseThreadReturn {
  thread: ThreadWithAuthor | null;
  replies: ReplyWithAuthor[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useThread(threadId: string): UseThreadReturn {
  const { userId } = useAuth();
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null);
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userId || !threadId) return;
    try {
      setLoading(true);
      const blockedIds = await getBlockedUserIds(userId);
      const [threadData, repliesData] = await Promise.all([
        getThread(userId, threadId),
        getThreadReplies(userId, threadId, blockedIds),
      ]);
      setThread(threadData);
      setReplies(repliesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load thread'));
    } finally {
      setLoading(false);
    }
  }, [userId, threadId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { thread, replies, loading, error, refresh: fetch };
}
```

**Step 3: Check if `getBlockedUserIds` exists in `data/api.ts`**

Run: `grep 'getBlockedUserIds' data/api.ts`
If not, create a simple function that queries `blocked_users` for the blocker_id.

**Step 4: Commit**

```bash
git add data/community/useCommunityFeed.ts data/community/useThread.ts
git commit -m "feat(community): add React hooks for feed and thread detail"
```

---

## Task 7: Community Tab Icon

**Files:**
- Create: `assets/images/icons/icon-community.png`

**Step 1: Generate a simple community icon**

Create a 52x52 PNG icon (matching existing icons at ~26x26 display size @2x). Use a chat-bubble or forum-style icon. The simplest approach: export from Feather icons or create a simple SVG-to-PNG.

For now, we can use a placeholder — copy an existing icon and rename it. The actual icon asset can be designed later.

```bash
# Placeholder: copy the explore icon temporarily
cp assets/images/icons/icon-inbox.png assets/images/icons/icon-community.png
```

**Step 2: Commit**

```bash
git add assets/images/icons/icon-community.png
git commit -m "feat(community): add community tab icon (placeholder)"
```

---

## Task 8: Add Community Tab to Navigation

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `components/TabBar.tsx`
- Create: `app/(tabs)/community/_layout.tsx`
- Create: `app/(tabs)/community/index.tsx` (stub)

**Step 1: Create the community stack layout**

Create `app/(tabs)/community/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';

export default function CommunityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="thread/[id]" />
      <Stack.Screen name="new" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
```

**Step 2: Create stub index screen**

Create `app/(tabs)/community/index.tsx`:

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/design';

export default function CommunityHome() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Community</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenX,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.textPrimary,
    paddingVertical: spacing.lg,
  },
});
```

**Step 3: Update tab layout** — `app/(tabs)/_layout.tsx`

Change the `<Tabs>` children order to:

```typescript
import { Tabs } from 'expo-router';
import React from 'react';
import TabBar from '@/components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="home" options={{ title: 'Travelers' }} />
      <Tabs.Screen name="sos" options={{ href: null, title: 'SOS' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

**Step 4: Update TabBar icon map** — `components/TabBar.tsx`

Add community to the `TAB_ICONS` map:

```typescript
const TAB_ICONS: Record<string, ImageSource> = {
  explore: require('@/assets/images/icons/icon-explore.png'),
  community: require('@/assets/images/icons/icon-community.png'),
  home: require('@/assets/images/icons/icon-travelers.png'),
  trips: require('@/assets/images/icons/icon-trips.png'),
  profile: require('@/assets/images/icons/icon-profile.png'),
};
```

**Step 5: Run the app to verify tab shows up**

Run: `npx expo start` and confirm 5 tabs are visible.

**Step 6: Commit**

```bash
git add app/\(tabs\)/_layout.tsx components/TabBar.tsx app/\(tabs\)/community/
git commit -m "feat(community): add Community tab to navigation with stub screen"
```

---

## Task 9: Community Home Screen — Full Implementation

**Files:**
- Modify: `app/(tabs)/community/index.tsx`

**Step 1: Implement the Community Home screen**

The screen has:
- Screen title "Community"
- Search bar (tappable, pushes to search mode inline)
- "Where are you going?" place selector button
- Thread feed (FlatList with pull-to-refresh and load-more)
- Floating "Ask" FAB button

```typescript
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import { getCommunityTopics, searchCommunityCountries, getCitiesForCountry } from '@/data/community/communityApi';
import type { ThreadWithAuthor, CommunityTopic } from '@/data/community/types';
import { useAuth } from '@/state/AuthContext';

// ---------------------------------------------------------------------------
// Thread Card Component (inline — keep it close to the feed)
// ---------------------------------------------------------------------------

function ThreadCard({ thread, onPress }: { thread: ThreadWithAuthor; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.threadCard, pressed && styles.pressed]}
    >
      {/* Topic + Place badge row */}
      <View style={styles.threadMeta}>
        {thread.topicLabel && (
          <Text style={styles.topicBadge}>{thread.topicLabel}</Text>
        )}
        {(thread.cityName || thread.countryName) && (
          <Text style={styles.placeBadge}>
            {thread.cityName ?? thread.countryName}
          </Text>
        )}
      </View>

      {/* Title */}
      <Text style={styles.threadTitle} numberOfLines={2}>
        {thread.title}
      </Text>

      {/* Body preview */}
      <Text style={styles.threadBody} numberOfLines={2}>
        {thread.body}
      </Text>

      {/* Footer: author + stats */}
      <View style={styles.threadFooter}>
        <Text style={styles.threadAuthor}>
          {thread.author.firstName}
        </Text>
        <View style={styles.threadStats}>
          {thread.replyCount > 0 && (
            <View style={styles.statItem}>
              <Feather name="message-circle" size={13} color={colors.textMuted} />
              <Text style={styles.statText}>{thread.replyCount}</Text>
            </View>
          )}
          {thread.helpfulCount > 0 && (
            <View style={styles.statItem}>
              <Feather name="heart" size={13} color={colors.textMuted} />
              <Text style={styles.statText}>{thread.helpfulCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Refine Bottom Sheet
// ---------------------------------------------------------------------------

function RefineSheet({
  visible,
  onClose,
  topics,
  selectedTopicId,
  onSelectTopic,
  sort,
  onSelectSort,
}: {
  visible: boolean;
  onClose: () => void;
  topics: CommunityTopic[];
  selectedTopicId: string | undefined;
  onSelectTopic: (id: string | undefined) => void;
  sort: 'relevant' | 'new' | 'helpful';
  onSelectSort: (sort: 'relevant' | 'new' | 'helpful') => void;
}) {
  const insets = useSafeAreaInsets();
  const sortOptions: { value: 'relevant' | 'new' | 'helpful'; label: string }[] = [
    { value: 'relevant', label: 'Relevant' },
    { value: 'new', label: 'New' },
    { value: 'helpful', label: 'Most helpful' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Refine</Text>

          {/* Sort */}
          <Text style={styles.sheetSectionLabel}>Sort by</Text>
          <View style={styles.pillRow}>
            {sortOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => onSelectSort(opt.value)}
                style={[styles.pill, sort === opt.value && styles.pillActive]}
              >
                <Text style={[styles.pillText, sort === opt.value && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Topic */}
          <Text style={styles.sheetSectionLabel}>Topic</Text>
          <View style={styles.pillRow}>
            <Pressable
              onPress={() => onSelectTopic(undefined)}
              style={[styles.pill, !selectedTopicId && styles.pillActive]}
            >
              <Text style={[styles.pillText, !selectedTopicId && styles.pillTextActive]}>All</Text>
            </Pressable>
            {topics.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => onSelectTopic(t.id)}
                style={[styles.pill, selectedTopicId === t.id && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedTopicId === t.id && styles.pillTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onClose} style={styles.sheetDone}>
            <Text style={styles.sheetDoneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Place Selector Bottom Sheet
// ---------------------------------------------------------------------------

function PlaceSelectorSheet({
  visible,
  onClose,
  onSelectPlace,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (countryId: string | undefined, cityId: string | undefined, label: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [countries, setCountries] = useState<{ id: string; name: string; iso2: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string; iso2: string } | null>(null);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);
    if (text.trim().length < 2) {
      setCountries([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchCommunityCountries(text.trim());
      setCountries(results);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSelectCountry = useCallback(async (country: { id: string; name: string; iso2: string }) => {
    setSelectedCountry(country);
    try {
      const citiesResult = await getCitiesForCountry(country.id);
      setCities(citiesResult);
    } catch {
      setCities([]);
    }
  }, []);

  const handleClearPlace = () => {
    onSelectPlace(undefined, undefined, 'All places');
    setSearchText('');
    setSelectedCountry(null);
    setCities([]);
    onClose();
  };

  const handleSelectCity = (city: { id: string; name: string }) => {
    onSelectPlace(selectedCountry!.id, city.id, `${city.name}, ${selectedCountry!.name}`);
    onClose();
  };

  const handleSelectCountryOnly = () => {
    if (!selectedCountry) return;
    onSelectPlace(selectedCountry.id, undefined, selectedCountry.name);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={[styles.sheetContainer, styles.placeSelectorSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Where are you going?</Text>

          {!selectedCountry ? (
            <>
              {/* Country search */}
              <View style={styles.searchInputRow}>
                <Feather name="search" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search country..."
                  placeholderTextColor={colors.textMuted}
                  value={searchText}
                  onChangeText={handleSearch}
                  autoFocus
                />
              </View>

              <ScrollView style={styles.placeResults}>
                <Pressable onPress={handleClearPlace} style={styles.placeRow}>
                  <Feather name="globe" size={18} color={colors.textSecondary} />
                  <Text style={styles.placeRowText}>All places</Text>
                </Pressable>
                {countries.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => handleSelectCountry(c)}
                    style={styles.placeRow}
                  >
                    <Text style={styles.placeRowFlag}>{getFlag(c.iso2)}</Text>
                    <Text style={styles.placeRowText}>{c.name}</Text>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              {/* City selection for chosen country */}
              <Pressable onPress={() => { setSelectedCountry(null); setCities([]); }} style={styles.backRow}>
                <Feather name="arrow-left" size={18} color={colors.orange} />
                <Text style={styles.backRowText}>{selectedCountry.name}</Text>
              </Pressable>

              <ScrollView style={styles.placeResults}>
                <Pressable onPress={handleSelectCountryOnly} style={styles.placeRow}>
                  <Feather name="map" size={18} color={colors.textSecondary} />
                  <Text style={styles.placeRowText}>All of {selectedCountry.name}</Text>
                </Pressable>
                {cities.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => handleSelectCity(c)}
                    style={styles.placeRow}
                  >
                    <Text style={styles.placeRowText}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getFlag(iso2: string): string {
  return String.fromCodePoint(
    ...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function CommunityHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { threads, loading, refreshing, hasMore, loadMore, refresh, setFilters, filters } = useCommunityFeed();

  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [showRefine, setShowRefine] = useState(false);
  const [showPlaceSelector, setShowPlaceSelector] = useState(false);
  const [placeLabel, setPlaceLabel] = useState('All places');
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load topics once
  React.useEffect(() => {
    getCommunityTopics().then(setTopics).catch(() => {});
  }, []);

  const handleSearch = useCallback(() => {
    setFilters({ searchQuery: searchText.trim() || undefined });
    setIsSearching(false);
  }, [searchText, setFilters]);

  const handleSelectPlace = useCallback((countryId: string | undefined, cityId: string | undefined, label: string) => {
    setFilters({ countryId, cityId });
    setPlaceLabel(label);
  }, [setFilters]);

  const renderThread = useCallback(({ item }: { item: ThreadWithAuthor }) => (
    <ThreadCard
      thread={item}
      onPress={() => router.push(`/(tabs)/community/thread/${item.id}`)}
    />
  ), [router]);

  const ListHeader = (
    <View>
      {/* Search bar */}
      {isSearching ? (
        <View style={styles.searchInputRow}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <Pressable onPress={() => { setIsSearching(false); setSearchText(''); setFilters({ searchQuery: undefined }); }}>
            <Feather name="x" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setIsSearching(true)} style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchBarText}>Search discussions...</Text>
        </Pressable>
      )}

      {/* Place selector + Refine row */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setShowPlaceSelector(true)}
          style={({ pressed }) => [styles.placeButton, pressed && styles.pressed]}
        >
          <Feather name="map-pin" size={15} color={colors.orange} />
          <Text style={styles.placeButtonText} numberOfLines={1}>{placeLabel}</Text>
          <Feather name="chevron-down" size={14} color={colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={() => setShowRefine(true)}
          style={({ pressed }) => [styles.refineButton, pressed && styles.pressed]}
        >
          <Feather name="sliders" size={15} color={colors.textSecondary} />
          <Text style={styles.refineButtonText}>Refine</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Text style={styles.screenTitle}>Community</Text>

      {/* Thread Feed */}
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={colors.orange} />
          ) : (
            <View style={styles.emptyState}>
              <Feather name="message-circle" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No discussions yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to ask a question</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.orange} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB — Ask a question */}
      <Pressable
        onPress={() => router.push('/(tabs)/community/new')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Feather name="edit-3" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>Ask</Text>
      </Pressable>

      {/* Bottom Sheets */}
      <RefineSheet
        visible={showRefine}
        onClose={() => setShowRefine(false)}
        topics={topics}
        selectedTopicId={filters.topicId}
        onSelectTopic={(id) => setFilters({ topicId: id })}
        sort={filters.sort}
        onSelectSort={(s) => setFilters({ sort: s })}
      />

      <PlaceSelectorSheet
        visible={showPlaceSelector}
        onClose={() => setShowPlaceSelector(false)}
        onSelectPlace={handleSelectPlace}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  screenTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  feedContent: { paddingHorizontal: spacing.screenX, paddingBottom: 100 },
  loader: { marginTop: 60 },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBarText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  placeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  placeButtonText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  refineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  refineButtonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Thread card
  threadCard: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    paddingVertical: spacing.lg,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  threadMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  topicBadge: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  placeBadge: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  threadTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  threadBody: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  threadFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  threadAuthor: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  threadStats: { flexDirection: 'row', gap: spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.textPrimary },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: spacing.screenX,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  fabPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  fabText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#FFFFFF' },

  // Bottom sheet (shared)
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderDefault, alignSelf: 'center', marginBottom: spacing.xl },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.lg },
  sheetSectionLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  pillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  pillText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  pillTextActive: { color: colors.orange },

  sheetDone: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  sheetDoneText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#FFFFFF' },

  // Place selector sheet
  placeSelectorSheet: { maxHeight: '70%' },
  placeResults: { maxHeight: 300 },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    gap: spacing.md,
  },
  placeRowFlag: { fontSize: 18 },
  placeRowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backRowText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.orange },
});
```

**Step 2: Verify it renders**

Run: `npx expo start`, navigate to Community tab, confirm the feed loads.

**Step 3: Commit**

```bash
git add app/\(tabs\)/community/index.tsx
git commit -m "feat(community): implement Community Home with feed, place selector, and refine sheet"
```

---

## Task 10: Thread Detail Screen

**Files:**
- Create: `app/(tabs)/community/thread/[id].tsx`

**Step 1: Implement the thread detail screen**

Full implementation with:
- Thread content at top (title, body, author, place, topic, helpful button)
- Replies list below sorted by helpful + recency
- Reply input at bottom (sticky)
- Report and block via action menu (long-press or "..." button)

This is a large file. Key behaviors:
- `useThread(id)` hook loads thread + replies
- `toggleHelpful()` for thread and each reply
- `createReply()` for new replies
- Report/block via `...` menu on thread and each reply
- Author shown as first name + avatar
- Back navigation to Community Home

**Step 2: Commit**

```bash
git add app/\(tabs\)/community/thread/\[id\].tsx
git commit -m "feat(community): implement thread detail with replies, helpful votes, and report"
```

---

## Task 11: Create Thread Screen

**Files:**
- Create: `app/(tabs)/community/new.tsx`

**Step 1: Implement the thread creation screen**

Form with:
- Title input (required, max 200 chars)
- Body input (required, multi-line, max 2000 chars)
- Place selector (optional — reuse PlaceSelectorSheet pattern)
- Topic selector (optional — horizontal pills)
- Post button (disabled until title + body filled)
- Close/cancel button in header

Uses `createThread()` from communityApi. On success, navigates to the new thread.

**Step 2: Commit**

```bash
git add app/\(tabs\)/community/new.tsx
git commit -m "feat(community): implement thread creation form with place and topic selection"
```

---

## Task 12: Blocked User Filtering Utility

**Files:**
- Modify: `data/api.ts` (if `getBlockedUserIds` doesn't exist)

**Step 1: Check if `getBlockedUserIds` exists**

Run: `grep 'getBlockedUserIds' data/api.ts`

**Step 2: If missing, add it**

```typescript
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.blocked_id);
}
```

**Step 3: Commit (if changes made)**

```bash
git add data/api.ts
git commit -m "feat: add getBlockedUserIds utility for content filtering"
```

---

## Task 13: Report and Block Flows

**Files:**
- Create: `components/community/ReportSheet.tsx`

**Step 1: Implement the report bottom sheet**

A simple modal with:
- Reason selection (pills): "Spam", "Harassment", "Inappropriate", "Misinformation", "Other"
- Optional details text input
- Submit button
- Calls `reportContent()` from communityApi

Also handles block-user action:
- Calls existing `blockUser()` from data/api.ts (or add if missing, using the `blocked_users` table)
- Shows confirmation before blocking
- After blocking, returns to feed and refreshes (blocked user's content disappears)

**Step 2: Commit**

```bash
git add components/community/ReportSheet.tsx
git commit -m "feat(community): add report and block bottom sheet"
```

---

## Task 14: Trip-Context Integration — Default Place Scope

**Files:**
- Modify: `data/community/useCommunityFeed.ts`

**Step 1: Add trip-aware default scoping**

When the Community tab opens:
1. Check if user has an active trip → use that trip's first stop country/city
2. Else check if user has upcoming trips → use next upcoming trip's country/city
3. Else default to no place filter ("All places")

```typescript
// At the top of useCommunityFeed, add trip-awareness:
import { getTripsGrouped } from '@/data/trips/tripApi';

// Inside the hook, after userId check:
useEffect(() => {
  if (!userId) return;
  getTripsGrouped(userId).then((grouped) => {
    if (grouped.current?.stops?.[0]) {
      const stop = grouped.current.stops[0];
      // Set filters to active trip's first stop
      // Need to look up country ID from iso2... or store it
    } else if (grouped.upcoming?.[0]?.stops?.[0]) {
      // Use next upcoming trip's stop
    }
  }).catch(() => {});
}, [userId]);
```

Implementation detail: The trip stops store `country_iso2` and `city_id` but the community feed needs `country_id`. We need to resolve this by looking up the country ID from `iso2`. Add a helper or cache this lookup.

**Step 2: Commit**

```bash
git add data/community/useCommunityFeed.ts
git commit -m "feat(community): auto-scope feed to user's active or upcoming trip destination"
```

---

## Task 15: Cross-Linking — Explore City/Country → Community

**Files:**
- Modify: `app/(tabs)/explore/country/[slug].tsx`
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Add "Community discussions" section to country/city pages**

At the bottom of the country/city detail page, add a section:
- Section header: "Community" with "See all" link
- Show 2-3 recent threads for that place
- "See all" navigates to Community tab with that place pre-selected

This creates a natural discovery path: Explore → see a city → see community discussions about it.

**Step 2: Commit**

```bash
git add app/\(tabs\)/explore/country/\[slug\].tsx app/\(tabs\)/explore/city/\[slug\].tsx
git commit -m "feat(community): add community discussions section to explore country/city pages"
```

---

## Summary of File Changes

### New Files (14)
| File | Purpose |
|------|---------|
| `supabase/migrations/20260205_community_tables.sql` | DB schema, RLS, triggers |
| `supabase/migrations/20260205_seed_community_topics.sql` | Seed 6 topics |
| `supabase/migrations/20260205_seed_community_threads.sql` | Seed demo threads for PH/VN/TH/ID |
| `data/community/types.ts` | TypeScript types |
| `data/community/communityApi.ts` | Supabase query functions |
| `data/community/useCommunityFeed.ts` | Feed hook with filters |
| `data/community/useThread.ts` | Thread detail hook |
| `app/(tabs)/community/_layout.tsx` | Stack navigator |
| `app/(tabs)/community/index.tsx` | Community Home screen |
| `app/(tabs)/community/thread/[id].tsx` | Thread detail screen |
| `app/(tabs)/community/new.tsx` | Create thread screen |
| `components/community/ReportSheet.tsx` | Report + block sheet |
| `assets/images/icons/icon-community.png` | Tab icon |

### Modified Files (4)
| File | Change |
|------|--------|
| `app/(tabs)/_layout.tsx` | Add community tab |
| `components/TabBar.tsx` | Add community icon mapping |
| `data/api.ts` | Add `getBlockedUserIds` if missing |
| `app/(tabs)/explore/country/[slug].tsx` | Add community section |
| `app/(tabs)/explore/city/[slug].tsx` | Add community section |

---

## Filtering & Discovery Summary

**3 filter concepts only:**
1. **Place** (country/city) — primary, via place selector button
2. **Topic** (6 options) — via Refine sheet
3. **Sort** (Relevant/New/Most helpful) — via Refine sheet

**No visible filter chips.** Single "Refine" entry point opens a calm bottom sheet. Place selector is its own button always visible.

**Why these 3:**
- Place is how travelers think ("I'm going to Vietnam, what should I know?")
- Topics reduce noise without requiring users to understand categories
- Sort handles the relevance/freshness tradeoff

---

## Safety & Moderation Summary

| Feature | Implementation |
|---------|---------------|
| Report thread/reply | Bottom sheet with reason selection → `community_reports` table |
| Block user | Confirmation → `blocked_users` table (existing) → content hidden |
| Content hiding | Blocked user content filtered server-side (RLS) + client-side |
| No DMs from community | Community is public Q&A only, no message button |
| Minimal identity | First name + avatar only, no follower counts |
| Soft deletion | Threads/replies set to `removed` status, not hard deleted |
| Thread locking | `locked` status prevents new replies (admin action) |
| Auto-hide for reporter | After reporting, content hidden immediately for that user (client-side) |

---

## Place-Based Discovery Flow

```
User opens Community tab
  ├── Has active trip? → Auto-scope to trip's current city/country
  ├── Has upcoming trip? → Auto-scope to next stop
  └── Neither? → Show "All places" feed

User taps "Where are you going?"
  ├── Search countries → Select country
  │   ├── "All of [Country]" → Shows all threads for that country
  │   └── Select city → Shows threads for that city
  └── "All places" → Removes place filter

From Explore tab:
  └── Country/City detail page → "Community" section
      └── "See all" → Opens Community tab scoped to that place
```
