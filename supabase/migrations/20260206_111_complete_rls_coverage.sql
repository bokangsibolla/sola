-- ============================================================
-- COMPLETE RLS COVERAGE
-- Fill gaps found during audit
-- ============================================================

-- 1. trip_buddies: ensure RLS is enabled and policies exist
ALTER TABLE trip_buddies ENABLE ROW LEVEL SECURITY;

-- SELECT: trip owner or the buddy user can see
DROP POLICY IF EXISTS "Trip participants can view buddies" ON trip_buddies;
CREATE POLICY "Trip participants can view buddies"
  ON trip_buddies FOR SELECT
  USING (
    user_id = auth.uid()
    OR trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- DELETE: trip owner can remove buddies
DROP POLICY IF EXISTS "Trip owner can remove buddies" ON trip_buddies;
CREATE POLICY "Trip owner can remove buddies"
  ON trip_buddies FOR DELETE
  USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- 2. Ensure conversation UPDATE policy exists
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

-- 3. Ensure messages UPDATE policy exists for read receipts
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

-- 4. Add UPDATE policy for trip_places (legacy but still used)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'trip_places' AND policyname = 'Users can update trip places'
  ) THEN
    CREATE POLICY "Users can update trip places"
      ON trip_places FOR UPDATE
      USING (
        EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_places.trip_id AND trips.user_id = auth.uid())
      );
  END IF;
END $$;
