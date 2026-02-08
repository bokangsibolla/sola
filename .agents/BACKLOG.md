# Sola V1 Launch — Agent Task Backlog

> Each task below is designed to be picked up by a single agent session.
> Copy the task description into a `claude --print` command or interactive session.
> Mark tasks [x] when PRs are merged.

## Phase 1: Bug-Free iOS (Worktree: sola-bugfix)

### P1-01: TypeScript Error Cleanup
- [ ] Run `npx tsc --noEmit` and fix ALL errors in `app/`, `components/`, `data/`, `constants/`
- [ ] Ignore errors in `scripts/content/` and `supabase/functions/`
- [ ] Goal: Zero errors in our code

### P1-02: Screen-by-Screen QA Audit
- [ ] Go through every screen file in `app/(tabs)/` and verify:
  - Safe area insets used correctly (top + bottom)
  - No content hidden behind notch or home indicator
  - All Pressable/TouchableOpacity have 44pt min touch targets
  - No hardcoded colors/spacing (must use design tokens)
  - Loading states handled (not blank screens)
  - Error states handled (not crash on network failure)

### P1-03: Navigation Flow Audit
- [ ] Test every navigation path:
  - Auth → Onboarding → Home (fresh user)
  - Tab switching (all 5 tabs render)
  - Deep links: city detail, collection detail, community thread
  - Back button behavior on every screen
  - Modal dismiss behavior
- [ ] Fix any broken routes or missing screens

### P1-04: iOS-Specific Polish
- [ ] Status bar style (light/dark) correct on every screen
- [ ] Keyboard avoidance on all text inputs
  - Community new post
  - Search screen
  - DM composer
  - Profile edit
- [ ] Haptic feedback on key interactions (tab switch, like, send)
- [ ] Pull-to-refresh on feed screens
- [ ] Scroll-to-top on tab re-press

### P1-05: Data Integrity Audit
- [ ] Verify all Supabase queries in `data/api.ts` handle null/empty results
- [ ] Verify all React Query hooks have proper error/loading states
- [ ] Check that auth state properly gates protected screens
- [ ] Verify RLS policies don't block legitimate reads

## Phase 2: Content Population (Worktree: sola-content)

### P2-01: City Data Completeness
- [ ] For every city in the database, ensure these fields are populated:
  - Name, country, continent
  - Safety score (1-5) with source
  - Hero image URL (working, high-quality)
  - Short description (2-3 sentences, premium tone)
  - Solo female traveler tips (at least 3)
  - Emergency number
  - Embassy/consulate info for major nationalities

### P2-02: Collection Content
- [ ] Audit all editorial collections
- [ ] Each collection needs: title, description, cover image, 4+ cities
- [ ] Verify collection images load correctly
- [ ] Add at least 5 curated collections:
  - "Safest Cities for Solo Women"
  - "Best Cafes to Work From"
  - "Under-the-Radar Gems"
  - "Beach & Coast"
  - "Culture & History"

### P2-03: Asset & Link Audit
- [ ] Every image in `assets/images/` is referenced somewhere
- [ ] Every Supabase Storage URL in the DB resolves to an actual image
- [ ] Every external URL (if any) is HTTPS and loads
- [ ] Remove unused assets to reduce bundle size

### P2-04: Community Seed Content
- [ ] Verify all 8 seed threads render correctly
- [ ] Add 10+ more realistic seed threads covering:
  - Safety questions ("Is X safe at night?")
  - Logistics ("Best SIM card in Y?")
  - Social ("Anyone in Z this month?")
  - Tips ("Hidden gems in W")
- [ ] Each thread should have 2-3 seed replies

## Phase 3: Monetization (Worktree: sola-infra)

### P3-01: RevenueCat Integration
- [ ] Install `react-native-purchases`
- [ ] Configure RevenueCat with App Store Connect
- [ ] Create entitlement: "sola_premium"
- [ ] Create offering with monthly + annual plans
- [ ] Build paywall screen following design system
- [ ] Add entitlement checks to gated features

### P3-02: Define Premium Features
- [ ] Free tier: Browse cities, read community, basic safety info
- [ ] Premium tier candidates:
  - Offline city guides (download for offline)
  - AI trip planning assistant
  - Detailed safety reports by neighborhood
  - Connect with verified solo travelers
  - Priority community support from Sola team
  - Ad-free experience

### P3-03: Subscription UI
- [ ] Settings → Subscription management screen
- [ ] Premium upsell cards at natural points in the app
- [ ] Restore purchases flow
- [ ] Receipt validation via Supabase Edge Function

## Phase 4: Offline Support (After v1 launch)

### P4-01: Offline Architecture Plan
- [ ] Design local SQLite/WatermelonDB schema
- [ ] Define what's available offline (city guides, saved trips, emergency info)
- [ ] Design sync queue for offline → online reconciliation
- [ ] Plan offline indicator UI

### P4-02: Implementation
- [ ] Install and configure local DB
- [ ] Background sync service
- [ ] Offline-first reads with network-first writes
- [ ] Download manager for city guide packs
- [ ] OfflineBanner component (already exists, wire it up)

## Phase 5: Launch Prep

### P5-01: App Store Assets
- [ ] App icon (1024x1024)
- [ ] Screenshots for 6.7" and 6.1" iPhone
- [ ] App preview video (15-30s)
- [ ] App Store description and keywords
- [ ] Privacy policy URL
- [ ] Support URL

### P5-02: Launch Marketing
- [ ] Landing page / website
- [ ] Social media presence (Instagram, TikTok)
- [ ] Press kit
- [ ] Outreach list: travel bloggers, solo female travel influencers
- [ ] Launch day plan
