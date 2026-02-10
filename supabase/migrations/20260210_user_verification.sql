-- User verification system
ALTER TABLE profiles
  ADD COLUMN verification_status text DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN verification_selfie_url text,
  ADD COLUMN verification_submitted_at timestamptz,
  ADD COLUMN verification_reviewed_at timestamptz,
  ADD COLUMN verification_reviewed_by uuid REFERENCES auth.users(id);

-- Storage bucket for verification selfies (private — admin review only)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('verification-selfies', 'verification-selfies', false)
  ON CONFLICT (id) DO NOTHING;

-- Only the user can upload their own selfie
CREATE POLICY "Users upload own verification selfie"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-selfies'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only service role can read selfies (for admin review)
CREATE POLICY "Service role reads verification selfies"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-selfies'
    AND auth.role() = 'service_role'
  );

-- Index for admin review queue
CREATE INDEX idx_profiles_verification_pending
  ON profiles (verification_submitted_at)
  WHERE verification_status = 'pending';

COMMENT ON COLUMN profiles.verification_status IS 'User verification: unverified, pending (selfie submitted), verified (approved), rejected';
