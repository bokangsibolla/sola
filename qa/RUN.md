# Sola QA Agent — Run Playbook

> When the user says "run QA", Claude reads this file and follows it step by step.

## Prerequisites

1. Expo web dev server running: `npx expo start --web --port 8082`
2. QA test user exists in Supabase Auth (email: `sola-tester@test.com`, password: `SolaQA2026test`)
3. Seed migration applied: `supabase/migrations/20260224_seed_qa_test_user.sql`

## Run Procedure

### Phase 0: Setup

1. Open browser to `http://localhost:8082`
2. Take a snapshot to confirm the app loaded
3. If login screen appears: log in with test user credentials
4. If already on a tab screen: confirm logged in as QA Tester
5. Record start time

### Phase 1: Tab Loading (Tests 1-5)

Read `qa/tests/01-tab-loading.ts` for detailed steps.

1. **Home tab** — Verify Sola logo, avatar, content visible
2. **Discover tab** — Click Discover tab, verify feed items and search bar
3. **Discussions tab** — Click Discussions tab, verify thread cards or empty state
4. **Trips tab** — Click Trips tab, verify "Test Trip to Portugal" visible
5. **Profile** — Open avatar menu → profile, verify "QA Tester" name

Record: ✅/❌ for each. Screenshot on failure.

### Phase 2: Discover Flow (Tests 6-12)

Read `qa/tests/02-discover-flow.ts` for detailed steps.

6. **Hero grid** — On Discover tab, verify hero grid has cards with images
7. **Tap city card** — Tap a city → city page opens with name and hero image
8. **City sections** — Scroll down, verify experiences/places/community sections
9. **Country from city** — Tap country link → country page with signals row
10. **Country sections** — Scroll, verify budget, Know Before You Go, cities
11. **Search opens** — Navigate back to Discover, tap search bar → search screen
12. **Search results** — Type "Bangkok" → results appear

Record: ✅/❌ for each. Screenshot on failure.

### Phase 3: Trips Flow (Tests 13-17)

Read `qa/tests/03-trips-flow.ts` for detailed steps.

13. **Trips list** — Click Trips tab, verify seeded trips visible
14. **Trip detail** — Tap "Test Trip to Portugal" → detail page
15. **Create trip starts** — Back, tap create → form appears
16. **Save trip** — Fill "QA_Trip_YYYYMMDD" + destination → save → appears in list
17. **Delete trip** — Open created trip → settings → delete → confirm → gone

Record: ✅/❌ for each. Screenshot on failure.

### Phase 4: Community Flow (Tests 18-22)

Read `qa/tests/04-community-flow.ts` for detailed steps.

18. **Feed loads** — Click Discussions tab, verify thread cards
19. **Thread detail** — Tap a thread → detail with replies
20. **Sola Team badge** — Find system thread, verify "Sola Team" + orange badge
21. **New post** — Tap compose → composer opens
22. **Post thread** — Fill "QA_Thread_YYYYMMDD" → post → appears in feed

Record: ✅/❌ for each. Screenshot on failure.

### Phase 5: Profile & Navigation (Tests 23-27)

Read `qa/tests/05-profile-nav.ts` for detailed steps.

23. **Avatar menu** — Home tab, tap avatar → MenuSheet opens
24. **Edit profile** — Tap Edit Profile → form with fields
25. **Delete account** — Navigate to settings → delete account → warning screen
26. **Back navigation** — Navigate back through screens → returns correctly
27. **Tab switching** — Rapidly switch all tabs → no crash or blank screen

Record: ✅/❌ for each. Screenshot on failure.

### Phase 6: Social — Travelers (Tests 28-31)

Read `qa/tests/06-social-travelers.ts` for detailed steps.

28. **Traveler profile** — Travelers tab → tap a profile → loads with bio/stats
29. **Connect** — Tap connect button → request sent confirmation
30. **Block** — Menu → block → blocked state shown
31. **Report** — Different user → menu → report → form/confirmation

Record: ✅/❌ for each. Screenshot on failure.

### Phase 7: Trip Detail Management (Tests 32-34)

Read `qa/tests/07-trip-detail.ts` for detailed steps.

32. **Add place to trip** — Discover → city → place → "Add to trip" → select trip → confirmed
33. **Add accommodation** — Trips → Portugal trip → add accommodation → fill form → appears
34. **Remove place** — Remove added place from trip → gone

Record: ✅/❌ for each. Screenshot on failure.

### Phase 8: Cleanup

Delete any test-created data:
- Trip: any trip with title starting with "QA_"
- Thread: any thread with title starting with "QA_"
- Connection requests sent during test 29
- Unblock any user blocked during test 30
- Remove any accommodation with name starting with "QA_"

Use Playwright to navigate to each item and delete via the UI.
If UI deletion isn't possible, note it in the cleanup section.

### Phase 9: Generate Report

1. Record end time, calculate duration
2. Count passes and failures
3. Generate markdown report following the format in `qa/report.ts`
4. Write report to `qa/reports/YYYY-MM-DD-qa-report.md`
5. Print summary to user:
   ```
   ## QA Complete
   ✅ X/34 passed | ❌ Y failed | ⏱ duration

   Failures:
   - #N: Test name — what went wrong

   Full report: qa/reports/YYYY-MM-DD-qa-report.md
   ```

## Important Notes

- If a test requires a previous test's state (e.g., test 17 needs test 16's trip), and the prerequisite failed, skip the dependent test and mark it as "skipped (depends on #N)"
- If the app crashes or goes blank during a test, take a screenshot, record the failure, and try to recover by navigating to a known tab
- Do NOT modify any code during a QA run — report only
- The `createsData: true` flag on tests means cleanup is needed after
- Screenshots go in `qa/screenshots/` with naming: `NN-test-name.png`
