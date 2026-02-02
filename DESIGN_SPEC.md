# Sola – Mobile App Design Spec (MVP)

Goal:
Build a calm, modern iOS-first mobile app for solo women travelers.
Focus is on visual structure, spacing, and interaction patterns.

Design principles:
- iOS-first (Expo + React Native)
- White background
- Black/near-black text
- Orange used ONLY for primary actions and highlights
- Calm, minimal, Airbnb x Notion feel
- No clutter, no heavy borders, no gradients

App structure:
- Bottom tabs:
  - Explore (Home)
  - Places
  - Saved
  - Profile

Important:
- Explore IS the home screen
- Each screen uses a consistent AppScreen + AppHeader
- Placeholder content only (must be easy to replace with Supabase later)
- No backend, no auth, no Supabase yet

Out of scope:
- No onboarding logic
- No recommendations logic
- No data fetching