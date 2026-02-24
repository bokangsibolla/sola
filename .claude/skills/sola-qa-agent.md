# Sola QA Testing Agent

Use this skill when the user says "run QA", "test the app", or "QA check".

## What It Does

Automated pre-build smoke test that verifies 34 critical paths across 7 feature groups using Playwright MCP tools against the Expo web dev server.

## How to Run

1. Read `qa/RUN.md` — this is the full playbook
2. Follow it step by step
3. Read each test file in `qa/tests/` as you reach that group
4. Generate report in `qa/reports/`

## Files

```
qa/
  RUN.md               — Step-by-step playbook (START HERE)
  config.ts            — Test user credentials, URLs, timeouts
  report.ts            — Report format definition
  tests/
    01-tab-loading.ts  — Tests 1-5: all tabs render
    02-discover-flow.ts — Tests 6-12: feed, city, country, search
    03-trips-flow.ts   — Tests 13-17: list, create, delete trips
    04-community-flow.ts — Tests 18-22: threads, posting
    05-profile-nav.ts  — Tests 23-27: menu, profile, navigation
    06-social-travelers.ts — Tests 28-31: connect, block, report
    07-trip-detail.ts  — Tests 32-34: add/remove places, accommodation
  screenshots/         — Failure screenshots
  reports/             — Generated markdown reports
```

## Prerequisites

- Expo web server: `npx expo start --web --port 8082`
- QA test user exists in Supabase Auth
- Seed migration applied: `20260224_seed_qa_test_user.sql`

## Test User

- Email: `sola-tester@test.com`
- Password: `SolaQA2026test`
- Display name: QA Tester
