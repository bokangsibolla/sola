-- Add onboarding_completed_at to profiles so completion persists across devices.
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;
