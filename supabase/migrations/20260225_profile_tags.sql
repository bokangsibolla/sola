-- Profile tags: connects user interests to the tag system
CREATE TABLE IF NOT EXISTS profile_tags (
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_slug   text NOT NULL,
  tag_label  text NOT NULL,
  tag_group  text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, tag_slug)
);

CREATE INDEX IF NOT EXISTS idx_profile_tags_slug ON profile_tags(tag_slug);
CREATE INDEX IF NOT EXISTS idx_profile_tags_group ON profile_tags(tag_group);

ALTER TABLE profile_tags ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read (for profile viewing + matching)
CREATE POLICY "profile_tags_select"
  ON profile_tags FOR SELECT
  TO authenticated
  USING (true);

-- Only owner can manage their tags
CREATE POLICY "profile_tags_insert"
  ON profile_tags FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "profile_tags_delete"
  ON profile_tags FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());
