# Sola — Agent Handbook

> Every Claude Code agent reads this file on startup. Follow it exactly.

## What is Sola

Women-first solo travel app for intellectual, independent women travelers. Built with React Native (Expo Router) + Supabase. Premium tone — never cheesy, never basic.

**Target**: iOS App Store v1 launch → 10,000 users.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.81, Expo SDK 54, Expo Router 6 |
| State | React Query (TanStack) |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Analytics | PostHog |
| Auth | Apple Auth, Expo Auth Session |
| Notifications | Expo Notifications |
| Error Tracking | Sentry |
| Navigation | File-based routing via Expo Router |
| Styling | StyleSheet (no styled-components, no Tailwind) |

## Project Structure

```
app/
  (auth)/          — Login, signup screens
  (onboarding)/    — Onboarding flow
  (tabs)/          — Main app
    explore/       — Discovery feed, search, city/collection detail
    community/     — Community threads, new post, thread detail
    home/          — Home tab, DMs, user profiles
    trips/         — Trip planning and management
    profile/       — User profile, settings
    sos.tsx        — Emergency SOS screen
components/
  explore/         — Feed cards, search bar, hero grid, etc.
  community/       — Thread cards, reply components
  travelers/       — Traveler profile cards
  trips/           — Trip-related components
  ui/              — Generic UI primitives
  AppHeader.tsx    — Consistent header across all tabs
  AppScreen.tsx    — Screen wrapper with safe areas
  InboxButton.tsx  — Shared inbox button
  TabBar.tsx       — Custom bottom tab bar
constants/
  design.ts        — SINGLE SOURCE OF TRUTH for all design tokens
data/
  api.ts           — Core Supabase queries
  explore/         — Feed types, builder, hooks
  community/       — Community API, hooks, types
  travelers/       — Traveler profile hooks
  trips/           — Trip API and hooks
supabase/
  migrations/      — Postgres migrations (numbered)
  functions/       — Edge functions
```

## Design System — Non-Negotiable Rules

Source of truth: `constants/design.ts`. See `.claude/skills/sola-design-system.md` for full spec.

1. **Every value from tokens.** No magic numbers. `24` → `spacing.xl`.
2. **24px screen padding.** `paddingHorizontal: spacing.screenX`. Always.
3. **Safe areas on every screen.** `useSafeAreaInsets()`.
4. **44pt minimum touch targets.**
5. **Flat design.** No shadows. Cards use 1px border.
6. **White backgrounds.** `colors.background` everywhere.
7. **No serif fonts.** Only PlusJakartaSans. Never use InstrumentSerif or any serif font.
8. **Colors mean something.** Orange=action. Green=safe. Yellow=caution. Blue=info.
9. **Animations ≤ 300ms.** Gentle easing. No bouncing.
10. **Premium tone.** No "queen", no "girl boss", no "bestie". See `.claude/skills/sola-feminist-ux-writing.md`.

## Coding Conventions

### TypeScript
- Strict mode. No `any` unless absolutely necessary.
- Use existing patterns — check how similar things are done before creating new ones.
- Interface names: `FooProps`, `FooData`. No `I` prefix.

### Components
- Functional components only with `const Foo: React.FC<Props>`.
- Use `StyleSheet.create()` at bottom of file — never inline styles.
- Always destructure props.
- Export as default for screens, named for components.

### Data Layer
- All Supabase calls go in `data/` directory (api.ts or domain-specific files).
- Use React Query for all server state.
- `toCamel()` utility in communityApi.ts auto-maps snake_case DB columns — use it.
- Hook naming: `useFoo()` for data hooks.

### Navigation
- Expo Router file-based routing. New screen = new file in `app/`.
- Use `router.push()` / `router.back()`, never `navigation` object.
- Tab params use `[id].tsx` pattern.

### Database
- All new tables MUST have RLS policies.
- All migrations go in `supabase/migrations/` with `YYYYMMDD_` prefix.
- Never store secrets in client code.

#### Direct DB Access (psql)
```bash
PSQL=/opt/homebrew/Cellar/libpq/18.2/bin/psql
DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.bfyewxgdfkmkviajmfzp.supabase.co:5432/postgres"
$PSQL "$DB_URL" -f supabase/migrations/MIGRATION_FILE.sql
```
- Password is `SUPABASE_DB_PASSWORD` in `.env`
- Use direct connection (`db.PROJECT_REF.supabase.co:5432`), NOT the pooler
- psql binary: `/opt/homebrew/Cellar/libpq/18.2/bin/psql`

#### Applying Seed Migrations
Data seed migrations (UPDATE/INSERT ON CONFLICT) are safe to re-run. Schema migrations (CREATE TABLE) are NOT — they'll fail if tables exist. When applying missing seed data:
```bash
$PSQL "$DB_URL" -f supabase/migrations/20260218_seed_city_page_data.sql
```

## Pre-existing Issues (Ignore These)

These TypeScript errors exist in files we don't own — don't fix them:
- `scripts/content/geo-content.ts` — string/null type errors
- `supabase/functions/push-on-message/index.ts` — Deno import errors

When running `npx tsc`, filter with: `grep -E '(app/|components/|data/|constants/)'`

## Skills Available

You have 19 specialized skills in `.claude/skills/`. Check `sola-master-index.md` for the lookup table. Key ones:
- **sola-design-system** — Before touching any UI
- **sola-feminist-ux-writing** — Before writing any user-facing text
- **sola-safety-by-design** — Before any feature touching identity/location/messaging
- **sola-qa-regression** — Before any PR
- **sola-anti-patterns** — Final check before merge

## Current Priorities (Feb 2026)

1. **V1 iOS Launch** — Bug-free, polished, every flow works end-to-end
2. **Content Population** — Real data, working links, useful safety info for cities
3. **Monetization** — Subscription model (RevenueCat)
4. **Offline Support** — Local cache, sync queue
5. **Launch to 10K users** — ASO, PR, partnerships

## Agent Work Rules

1. **Always create a branch.** Never commit directly to `main`.
2. **Small, focused PRs.** One feature or fix per PR.
3. **Test your changes.** Run `npx tsc --noEmit` before committing.
4. **Don't break other tabs.** If you're working on explore, don't modify community.
5. **Check existing patterns.** Before building something new, search for how it's already done.
6. **Ask if unsure.** Better to ask than to build the wrong thing.
