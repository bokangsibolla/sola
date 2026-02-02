# SOLA — App UI Build Spec (Frontend Only)

Current goal
- Build the visual structure of the Sola mobile app.
- iOS-first design, previewed on web during development.
- No backend, no Supabase, no authentication yet.

What Sola is
- Sola is a travel planning app built for women who travel solo.
- It brings together places, stays, and things to do in one clear system.

Design rules (important)
- White background
- Black or near-black text only
- Orange used sparingly for primary actions and highlights
- Clean, calm, modern interface
- Mobile-first layouts

Navigation (MVP UI shell)
Bottom tabs:
- Explore
- Places
- Saved
- Profile

Screens we will build (UI only)
- Explore: discover countries and places
- Places: browse places by location
- Saved: saved places (empty state for now)
- Profile: user profile placeholder

Important concept
- Everything is a “Place”.
- A Place can be a country, city, island, neighborhood, stay, or activity.
- We are not implementing this logic yet — just designing for it.

Constraints
- Do not add backend code.
- Do not add Supabase.
- Do not add authentication.
- Do not install extra libraries unless explicitly asked.
- Use placeholder data only.