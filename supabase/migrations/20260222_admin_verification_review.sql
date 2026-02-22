-- Admin Verification Review: RLS policies
-- Allows admins to update verification status on profiles
-- and read selfie images from the verification-selfies bucket.

-- 1. Admin UPDATE on profiles for verification review
CREATE POLICY "Admins can update profiles for verification review"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 2. Admin SELECT on verification-selfies storage bucket
CREATE POLICY "Admins read verification selfies"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-selfies'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
