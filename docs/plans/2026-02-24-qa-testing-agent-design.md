# Sola QA Testing Agent — Design

**Date**: 2026-02-24
**Trigger**: Pre-build share (manual, "run QA")
**Platform**: Expo Web via Playwright MCP tools
**Backend**: Real Supabase, seeded test user
**Output**: Markdown report + failure screenshots

---

## Architecture

The QA agent is a Claude Code workflow, not a standalone test framework. You start the Expo web dev server, tell Claude "run QA", and Claude uses Playwright MCP tools to navigate every critical path, verify content, and generate a report.

### Flow

1. Expo dev server running on `localhost:8082` (web mode)
2. Claude navigates to the app via Playwright
3. Logs in as `sola-tester@test.com`
4. Runs 34 checks sequentially across 7 groups
5. Screenshots every failure
6. Generates `qa/reports/YYYY-MM-DD-qa-report.md`
7. Cleans up test-created data
8. Prints summary

### File Structure

```
qa/
  config.ts              — Test user credentials, base URL, timeouts
  report.ts              — Markdown report generator
  tests/
    01-tab-loading.ts
    02-discover-flow.ts
    03-trips-flow.ts
    04-community-flow.ts
    05-profile-nav.ts
    06-social-travelers.ts
    07-trip-detail.ts
  screenshots/           — Auto-captured on failure
  reports/               — Generated markdown reports by date
```

### No Framework Dependencies

- No Playwright npm package needed (uses MCP tools)
- No Jest, Mocha, or test runner
- Test files are structured definitions that Claude reads and executes
- Human-readable report output, not CI logs

---

## Test User

**Account**: `sola-tester@test.com` (Supabase Auth)
**Migration**: `supabase/migrations/20260224_seed_qa_test_user.sql`

### Pre-seeded state

- Profile: name, avatar, bio filled in
- Onboarding completed (skip onboarding screens)
- 2 trips: "Test Trip to Portugal" (1 place + 1 accommodation), "Test Trip to Thailand" (empty)
- 1 community thread posted by test user
- 1 traveler connection
- A few favorited/saved cities

### Cleanup rules

- Tests that create data (trip, post, connection) use `QA` prefix + date
- Cleanup runs as the last step — delete test-created data
- Seeded baseline data is never touched

---

## Test Cases (34 checks, 7 groups)

### Group 1: Tab Loading (5)

| # | Test | Pass criteria |
|---|------|---------------|
| 1 | Home tab loads | Sola logo visible, avatar visible, content rendered |
| 2 | Discover tab loads | Feed items visible, search bar present |
| 3 | Connect tab loads | Tab content renders without blank screen |
| 4 | Trips tab loads | "Test Trip to Portugal" visible |
| 5 | Profile screen loads | Test user's name and avatar visible |

### Group 2: Discover Flow (7)

| # | Test | Pass criteria |
|---|------|---------------|
| 6 | Hero grid renders | City cards and collection card visible with images |
| 7 | Tap a city card | City page opens, city name in header, hero image loads |
| 8 | City page sections render | Experiences, places, community threads present |
| 9 | Tap a country from city | Country page opens, signals row visible |
| 10 | Country page sections | Budget breakdown, Know Before You Go, cities section render |
| 11 | Search opens | Search screen with Recent, Browse By, Popular Destinations |
| 12 | Search returns results | Type "Bangkok" → results appear |

### Group 3: Trips Flow (5)

| # | Test | Pass criteria |
|---|------|---------------|
| 13 | Trips list shows seeded trips | "Test Trip to Portugal" visible |
| 14 | Tap into a trip | Trip detail opens, destination info visible |
| 15 | Create trip flow starts | Tap create → form/modal appears |
| 16 | Fill and save trip | Enter name + destination → trip appears in list |
| 17 | Delete/remove trip | Remove test-created trip → no longer in list |

### Group 4: Community Flow (5)

| # | Test | Pass criteria |
|---|------|---------------|
| 18 | Community feed loads | Thread cards visible with titles and authors |
| 19 | Tap a thread | Thread detail opens, replies visible |
| 20 | Sola Team badge renders | System threads show "Sola Team" + orange badge |
| 21 | New post flow | Tap compose → composer opens |
| 22 | Post a thread | Submit test post → appears in feed |

### Group 5: Profile & Navigation (5)

| # | Test | Pass criteria |
|---|------|---------------|
| 23 | Avatar button opens menu | Tap avatar → MenuSheet slides up |
| 24 | Edit profile loads | Form fields visible |
| 25 | Settings/delete account | Delete account screen renders warning |
| 26 | Back navigation works | Push into detail → back → returns |
| 27 | Tab switching is stable | Rapidly switch all 4 tabs → no crash |

### Group 6: Social — Travelers (4)

| # | Test | Pass criteria |
|---|------|---------------|
| 28 | View traveler profile | Profile loads with bio, trips, stats |
| 29 | Add/connect with traveler | Connect button → request sent confirmation |
| 30 | Block a user | Block → blocked state shown |
| 31 | Report a user | Report → report form/confirmation appears |

### Group 7: Trip Detail Management (3)

| # | Test | Pass criteria |
|---|------|---------------|
| 32 | Add a place to trip | "Add to trip" → select trip → place appears |
| 33 | Add accommodation to trip | Add accommodation → search/select → appears |
| 34 | Remove place from trip | Remove place → no longer listed |

---

## Report Format

Generated at `qa/reports/YYYY-MM-DD-qa-report.md`:

```markdown
# Sola QA Report — YYYY-MM-DD HH:MM

## Summary
✅ X/34 checks passed | ❌ Y failures | ⏱ duration

## Results
### 1. Tab Loading (N/5)
- ✅/❌ each check

## Failures Detail
### ❌ #N — Test name
- Expected: ...
- Got: ...
- Screenshot: screenshots/NN-test-name.png
- Likely area: file path hint

## Cleanup
- ✅/❌ cleanup status for each test-created item
```

---

## Decisions Log

| Question | Answer |
|----------|--------|
| Trigger | Pre-build share, manual |
| Platform | Expo Web via Playwright |
| Backend | Real Supabase, seeded test user |
| Depth | Screens load + key interactions work |
| Coverage | 34 checks across 7 groups |
| On failure | Report only, user decides |
| Runner | Claude via Playwright MCP, not standalone framework |
