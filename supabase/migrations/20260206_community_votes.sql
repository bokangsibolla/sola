-- Community Votes Migration
-- Adds up/down voting to community_reactions and vote_score to threads/replies.
-- Run this in the Supabase SQL Editor.

-- 1. Add vote direction column to community_reactions
ALTER TABLE community_reactions
  ADD COLUMN IF NOT EXISTS vote TEXT NOT NULL DEFAULT 'up'
  CHECK (vote IN ('up', 'down'));

-- 2. Add vote_score column to community_threads
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS vote_score INT NOT NULL DEFAULT 0;

-- 3. Add vote_score column to community_replies
ALTER TABLE community_replies
  ADD COLUMN IF NOT EXISTS vote_score INT NOT NULL DEFAULT 0;

-- 4. Backfill vote_score from existing helpful_count
UPDATE community_threads SET vote_score = helpful_count WHERE vote_score = 0 AND helpful_count > 0;
UPDATE community_replies SET vote_score = helpful_count WHERE vote_score = 0 AND helpful_count > 0;

-- 5. Drop old helpful triggers (if they exist)
DROP TRIGGER IF EXISTS trg_community_reaction_insert ON community_reactions;
DROP TRIGGER IF EXISTS trg_community_reaction_delete ON community_reactions;
DROP FUNCTION IF EXISTS fn_community_reaction_insert();
DROP FUNCTION IF EXISTS fn_community_reaction_delete();

-- 6. Create new trigger function for vote score updates
CREATE OR REPLACE FUNCTION fn_community_vote_change()
RETURNS TRIGGER AS $$
DECLARE
  _table TEXT;
  _delta INT;
BEGIN
  -- Determine target table
  IF TG_OP = 'INSERT' THEN
    _table := CASE WHEN NEW.entity_type = 'thread' THEN 'community_threads' ELSE 'community_replies' END;
    _delta := CASE WHEN NEW.vote = 'up' THEN 1 ELSE -1 END;
    EXECUTE format('UPDATE %I SET vote_score = vote_score + $1 WHERE id = $2', _table) USING _delta, NEW.entity_id;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    _table := CASE WHEN OLD.entity_type = 'thread' THEN 'community_threads' ELSE 'community_replies' END;
    _delta := CASE WHEN OLD.vote = 'up' THEN -1 ELSE 1 END;
    EXECUTE format('UPDATE %I SET vote_score = vote_score + $1 WHERE id = $2', _table) USING _delta, OLD.entity_id;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Vote direction changed (e.g. up -> down or down -> up)
    IF OLD.vote <> NEW.vote THEN
      _table := CASE WHEN NEW.entity_type = 'thread' THEN 'community_threads' ELSE 'community_replies' END;
      -- Swing is always 2: reversing a +1 to -1 = -2, or reversing -1 to +1 = +2
      _delta := CASE WHEN NEW.vote = 'up' THEN 2 ELSE -2 END;
      EXECUTE format('UPDATE %I SET vote_score = vote_score + $1 WHERE id = $2', _table) USING _delta, NEW.entity_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create triggers
CREATE TRIGGER trg_community_vote_insert
  AFTER INSERT ON community_reactions
  FOR EACH ROW EXECUTE FUNCTION fn_community_vote_change();

CREATE TRIGGER trg_community_vote_delete
  AFTER DELETE ON community_reactions
  FOR EACH ROW EXECUTE FUNCTION fn_community_vote_change();

CREATE TRIGGER trg_community_vote_update
  AFTER UPDATE OF vote ON community_reactions
  FOR EACH ROW EXECUTE FUNCTION fn_community_vote_change();

-- 8. Add UPDATE RLS policy on community_reactions (users can change their own vote)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_reactions' AND policyname = 'Users can update own reactions'
  ) THEN
    CREATE POLICY "Users can update own reactions"
      ON community_reactions
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
