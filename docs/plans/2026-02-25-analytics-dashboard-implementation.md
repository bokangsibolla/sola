# Sola Analytics Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone Next.js analytics dashboard pulling from Supabase + PostHog, deployed to Vercel with simple password auth.

**Architecture:** Next.js 15 App Router with server components for data fetching (keeps service role key secure). Supabase JS SDK with service role key for direct DB access. PostHog API for session data. Recharts for visualizations. Tailwind for styling.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Recharts, @supabase/supabase-js, cookies-next

---

## File Structure

```
dashboard/
  package.json
  next.config.ts
  tailwind.config.ts
  postcss.config.js
  tsconfig.json
  .env.local.example
  middleware.ts
  app/
    globals.css
    layout.tsx
    page.tsx              -- main dashboard (server component)
    login/
      page.tsx            -- login form
    api/
      auth/
        route.ts          -- POST login handler
  lib/
    supabase.ts           -- service role client
    posthog.ts            -- PostHog API wrapper
    queries/
      pulse.ts            -- hero metrics queries
      growth.ts           -- signups, retention, activation
      engagement.ts       -- session depth, screen time, save rates
      content.ts          -- leaderboards, search terms, community health
      funnels.ts          -- funnel step queries
  components/
    DateRangePicker.tsx
    MetricCard.tsx         -- single metric with trend arrow
    SectionHeader.tsx
    PulseRow.tsx
    SignupChart.tsx
    RetentionCohort.tsx
    StickynessGauge.tsx
    ActivationMetrics.tsx
    EngagementHeatmap.tsx
    ScreenTimeTable.tsx
    SessionDepthChart.tsx
    ContentLeaderboard.tsx
    SearchTerms.tsx
    CommunityHealth.tsx
    GeoDemandTable.tsx
    FunnelChart.tsx
    ChurnRiskTable.tsx
    PowerUsersTable.tsx
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `dashboard/package.json`
- Create: `dashboard/next.config.ts`
- Create: `dashboard/tailwind.config.ts`
- Create: `dashboard/postcss.config.js`
- Create: `dashboard/tsconfig.json`
- Create: `dashboard/.env.local.example`
- Create: `dashboard/app/globals.css`
- Create: `dashboard/app/layout.tsx`

**Step 1: Initialize project**

```bash
cd dashboard
npm init -y
npm install next@latest react@latest react-dom@latest typescript @types/react @types/node
npm install tailwindcss @tailwindcss/postcss postcss
npm install @supabase/supabase-js recharts
npm install cookies-next
```

**Step 2: Create config files**

`next.config.ts`:
```typescript
import type { NextConfig } from 'next';
const config: NextConfig = {};
export default config;
```

`tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sola: {
          orange: '#E5653A',
          orangeLight: '#FFF5F1',
          bg: '#FAFAFA',
          card: '#FFFFFF',
          border: '#F0F0F0',
          text: '#1A1A1A',
          textSecondary: '#6B7280',
          green: '#22C55E',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
```

`postcss.config.js`:
```javascript
module.exports = { plugins: { '@tailwindcss/postcss': {} } };
```

`app/globals.css`:
```css
@import 'tailwindcss';
```

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sola Analytics',
  description: 'Sola startup analytics dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sola-bg text-sola-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

`.env.local.example`:
```
SUPABASE_URL=https://bfyewxgdfkmkviajmfzp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
POSTHOG_API_KEY=your-posthog-project-api-key
POSTHOG_PROJECT_ID=your-project-id
DASHBOARD_PASSWORD=your-password
```

**Step 3: Add scripts to package.json**

```json
{
  "scripts": {
    "dev": "next dev --port 3100",
    "build": "next build",
    "start": "next start"
  }
}
```

**Step 4: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): scaffold Next.js analytics dashboard"
```

---

### Task 2: Password Auth

**Files:**
- Create: `dashboard/middleware.ts`
- Create: `dashboard/app/login/page.tsx`
- Create: `dashboard/app/api/auth/route.ts`

**Step 1: Create middleware**

`middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('sola-dash-auth')?.value;
  if (token !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Step 2: Create login page**

`app/login/page.tsx` — client component with form, POST to `/api/auth`, redirect on success.

**Step 3: Create auth API route**

`app/api/auth/route.ts` — validates password, sets httpOnly cookie, returns 200/401.

**Step 4: Test manually, commit**

```bash
git commit -m "feat(dashboard): add password auth middleware"
```

---

### Task 3: Supabase + PostHog Clients

**Files:**
- Create: `dashboard/lib/supabase.ts`
- Create: `dashboard/lib/posthog.ts`

**Step 1: Supabase server client**

`lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

**Step 2: PostHog API wrapper**

`lib/posthog.ts`:
```typescript
const BASE = 'https://us.i.posthog.com';

export async function posthogQuery(query: string) {
  const res = await fetch(`${BASE}/api/projects/${process.env.POSTHOG_PROJECT_ID}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.POSTHOG_API_KEY}`,
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.results;
}
```

**Step 3: Commit**

```bash
git commit -m "feat(dashboard): add Supabase and PostHog server clients"
```

---

### Task 4: Shared UI Components

**Files:**
- Create: `dashboard/components/MetricCard.tsx`
- Create: `dashboard/components/SectionHeader.tsx`
- Create: `dashboard/components/DateRangePicker.tsx`

**Step 1: MetricCard**

Displays a single metric: label, value, % change with green/red arrow. Used in the Pulse row and throughout.

```tsx
// Props: { label: string; value: string | number; change?: number; prefix?: string; suffix?: string }
// change > 0 = green up arrow, change < 0 = red down arrow
```

**Step 2: SectionHeader**

```tsx
// Props: { title: string; subtitle?: string }
// Renders: h2 with bottom border, consistent spacing
```

**Step 3: DateRangePicker**

Client component. Buttons: Today / 7d / 30d / 90d / All. Stores selection in URL search params so server components can read it.

**Step 4: Commit**

```bash
git commit -m "feat(dashboard): add shared UI components"
```

---

### Task 5: Pulse Queries + Hero Row

**Files:**
- Create: `dashboard/lib/queries/pulse.ts`
- Create: `dashboard/components/PulseRow.tsx`

**Step 1: Write pulse queries**

`lib/queries/pulse.ts`:
```typescript
import { supabase } from '../supabase';

// Total users
export async function getTotalUsers() { ... }
// profiles count

// DAU — distinct user_ids in user_events today
export async function getDAU(date: string) { ... }

// WAU — distinct user_ids in user_events last 7 days
export async function getWAU(date: string) { ... }

// Sessions today — PostHog query
export async function getSessionsToday() { ... }

// Each returns { value: number; previousValue: number } for % change calc
```

All queries use the `created_at` index on `user_events` and `profiles`.

**Step 2: PulseRow component**

Server component that calls all pulse queries and renders 5 MetricCards in a responsive grid row.

**Step 3: Wire into main page**

`app/page.tsx` — import PulseRow, render at top.

**Step 4: Test by running `npm run dev`, commit**

```bash
git commit -m "feat(dashboard): add pulse hero row with key metrics"
```

---

### Task 6: Growth — Signup Chart + Retention Cohort

**Files:**
- Create: `dashboard/lib/queries/growth.ts`
- Create: `dashboard/components/SignupChart.tsx`
- Create: `dashboard/components/RetentionCohort.tsx`
- Create: `dashboard/components/ActivationMetrics.tsx`
- Create: `dashboard/components/StickynessGauge.tsx`

**Step 1: Growth queries**

```typescript
// Signups per day — profiles grouped by created_at::date
export async function getSignupsOverTime(days: number) { ... }

// Retention cohort — for each signup week, what % had events in week+1, week+2, etc.
export async function getRetentionCohort() { ... }

// DAU/MAU ratio
export async function getStickiness() { ... }

// Activation rate — % of users who within 24h of signup did: 3+ place views OR 1 save OR 1 thread open
export async function getActivationRate(days: number) { ... }

// Signup-to-value time — median minutes from profile.created_at to first save/trip/post in user_events
export async function getSignupToValueTime() { ... }

// Resurrection rate — users inactive 14+ days who returned this week
export async function getResurrectionRate() { ... }
```

**Step 2: SignupChart**

Client component (needs Recharts). Line chart with area fill (#FFF5F1). X-axis = dates, Y-axis = signups. Period toggle buttons.

**Step 3: RetentionCohort**

Client component. HTML table with color-coded cells (opacity based on %). Rows = signup weeks, columns = Day 1/3/7/14/30. Classic retention grid.

**Step 4: ActivationMetrics**

Row of MetricCards: activation rate, resurrection rate, median time-to-value.

**Step 5: Wire into page, commit**

```bash
git commit -m "feat(dashboard): add growth section with signups, retention, activation"
```

---

### Task 7: Engagement Depth

**Files:**
- Create: `dashboard/lib/queries/engagement.ts`
- Create: `dashboard/components/SessionDepthChart.tsx`
- Create: `dashboard/components/EngagementHeatmap.tsx`
- Create: `dashboard/components/ScreenTimeTable.tsx`
- Create: `dashboard/components/PowerUsersTable.tsx`
- Create: `dashboard/components/ChurnRiskTable.tsx`

**Step 1: Engagement queries**

```typescript
// Session depth — group user_events by user_id + session window (30min gap = new session),
// count events per session, return histogram buckets
export async function getSessionDepthDistribution(days: number) { ... }

// Content heatmap — entity_type x event_type grid with counts
export async function getContentEngagementHeatmap(days: number) { ... }

// Screen time — for screen_viewed events, calculate time between successive events per user,
// group by screen name, return median per screen
export async function getScreenTimeBreakdown(days: number) { ... }

// Save-through rate — viewed_place count vs saved_place count, grouped by city/country
export async function getSaveThroughRate(days: number) { ... }

// Power users — users with 5+ sessions AND 3+ saves AND community activity
export async function getPowerUsers(days: number) { ... }

// Churn risk — active last week, absent this week, with last event details
export async function getChurnRiskUsers() { ... }

// Dead zones — screens with >50% immediate bounce (next event within 3s is navigation away)
export async function getDeadZones(days: number) { ... }
```

**Step 2: Build each component**

- `SessionDepthChart` — bar chart histogram
- `EngagementHeatmap` — HTML grid with color intensity
- `ScreenTimeTable` — sorted table with bar indicators
- `PowerUsersTable` — table with user info + activity summary
- `ChurnRiskTable` — table with last seen date + last screen

**Step 3: Wire into page, commit**

```bash
git commit -m "feat(dashboard): add engagement depth section"
```

---

### Task 8: Content Intelligence

**Files:**
- Create: `dashboard/lib/queries/content.ts`
- Create: `dashboard/components/ContentLeaderboard.tsx`
- Create: `dashboard/components/SearchTerms.tsx`
- Create: `dashboard/components/CommunityHealth.tsx`
- Create: `dashboard/components/GeoDemandTable.tsx`

**Step 1: Content queries**

```typescript
// Top content — for each entity type, rank by conversion (views → saves/trips/replies)
// Join user_events with places/cities/countries/community_threads for names
export async function getTopContent(entityType: string, days: number) { ... }

// Search terms — user_events where event_type='searched', group metadata.query
export async function getSearchTerms(days: number) { ... }

// Community health — posts/day, avg replies/thread, median time to first reply,
// % threads with 0 replies
export async function getCommunityHealth(days: number) { ... }

// Geographic demand — events per country/city, normalized by content count
export async function getGeoDemand(days: number) { ... }

// Affiliate performance — affiliate_clicks grouped by place, with CTR
export async function getAffiliatePerformance(days: number) { ... }
```

**Step 2: Build components**

- `ContentLeaderboard` — tabbed table (Countries | Cities | Places | Collections | Threads) with views + conversion rate columns
- `SearchTerms` — tag cloud or ranked list with search counts
- `CommunityHealth` — metric cards + ghost thread %
- `GeoDemandTable` — table sorted by demand/content ratio

**Step 3: Wire into page, commit**

```bash
git commit -m "feat(dashboard): add content intelligence section"
```

---

### Task 9: Funnels

**Files:**
- Create: `dashboard/lib/queries/funnels.ts`
- Create: `dashboard/components/FunnelChart.tsx`

**Step 1: Funnel queries**

```typescript
// Generic funnel — given array of event_types, count distinct users at each step
// where steps happen in order within the time range
export async function getFunnelData(steps: { label: string; eventType: string }[], days: number) { ... }

// Pre-defined funnels:
export const ONBOARDING_FUNNEL = [
  { label: 'Welcome', eventType: 'welcome_screen_viewed' },
  { label: 'Photo', eventType: 'profile_photo_added' },
  { label: 'Country', eventType: 'country_selected' },
  { label: 'Interests', eventType: 'interests_selected' },
  { label: 'Complete', eventType: 'onboarding_completed' },
];

export const DISCOVERY_FUNNEL = [
  { label: 'Explore', eventType: 'explore_screen_viewed' },
  { label: 'City Page', eventType: 'viewed_city' },
  { label: 'Place Detail', eventType: 'viewed_place' },
  { label: 'Saved', eventType: 'saved_place' },
];

export const COMMUNITY_FUNNEL = [
  { label: 'Feed', eventType: 'community_screen_viewed' },
  { label: 'Open Thread', eventType: 'opened_thread' },
  { label: 'Reply', eventType: 'replied_thread' },
];

export const TRIP_FUNNEL = [
  { label: 'Browse', eventType: 'viewed_place' },
  { label: 'Save', eventType: 'saved_place' },
  { label: 'Create Trip', eventType: 'created_trip' },
  { label: 'Add to Trip', eventType: 'added_place_to_trip' },
];
```

Note: Funnel queries combine PostHog events (from `AnalyticsEvents` constants) and Supabase `user_events` (from `EventType`). The dashboard query will primarily use `user_events` since that's where the behavioral data lives. For events only tracked in PostHog (onboarding steps), we'll query PostHog API.

**Step 2: FunnelChart**

Horizontal bar chart. Each step shows: label, absolute count, % of previous step, % of first step. Bars get progressively shorter. Orange gradient fill.

**Step 3: Render all 4 funnels on page**

Grid of 2x2 funnel charts with titles.

**Step 4: Commit**

```bash
git commit -m "feat(dashboard): add funnel analysis section"
```

---

### Task 10: Main Page Assembly + Polish

**Files:**
- Modify: `dashboard/app/page.tsx`

**Step 1: Assemble all sections**

```tsx
export default async function Dashboard({ searchParams }) {
  const days = parseDays(searchParams.range ?? '7d');

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Sola Analytics</h1>
          <p className="text-sola-textSecondary text-sm">Last updated: {new Date().toLocaleString()}</p>
        </div>
        <DateRangePicker />
      </div>

      {/* Sections */}
      <PulseRow days={days} />
      {/* Growth & Retention */}
      <SectionHeader title="Growth & Retention" />
      <SignupChart days={days} />
      <ActivationMetrics days={days} />
      <RetentionCohort />
      {/* Engagement */}
      <SectionHeader title="Engagement Depth" />
      <SessionDepthChart days={days} />
      <EngagementHeatmap days={days} />
      <ScreenTimeTable days={days} />
      <PowerUsersTable days={days} />
      <ChurnRiskTable />
      {/* Content */}
      <SectionHeader title="Content Intelligence" />
      <ContentLeaderboard days={days} />
      <SearchTerms days={days} />
      <CommunityHealth days={days} />
      <GeoDemandTable days={days} />
      {/* Funnels */}
      <SectionHeader title="Funnels & Drop-off" />
      <FunnelChart title="Onboarding" steps={ONBOARDING_FUNNEL} days={days} />
      <FunnelChart title="Discovery → Action" steps={DISCOVERY_FUNNEL} days={days} />
      <FunnelChart title="Community" steps={COMMUNITY_FUNNEL} days={days} />
      <FunnelChart title="Trip Planning" steps={TRIP_FUNNEL} days={days} />
    </main>
  );
}
```

**Step 2: Add loading states**

Wrap sections in `<Suspense fallback={<Skeleton />}>` for streaming.

**Step 3: Responsive design pass**

Ensure all grids collapse properly on tablet/mobile.

**Step 4: Commit**

```bash
git commit -m "feat(dashboard): assemble full dashboard page with all sections"
```

---

### Task 11: Vercel Deployment

**Step 1: Create Vercel project**

```bash
cd dashboard
npx vercel
```

Set root directory to `dashboard/`.

**Step 2: Add environment variables in Vercel**

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTHOG_API_KEY`
- `POSTHOG_PROJECT_ID`
- `DASHBOARD_PASSWORD`

**Step 3: Deploy**

```bash
npx vercel --prod
```

**Step 4: Test live URL, commit any fixes**

```bash
git commit -m "feat(dashboard): vercel deployment config"
```

---

## Execution Notes

- **PostHog fallback**: If PostHog API isn't set up yet, the session-related metrics (avg duration, session count) should show "Not configured" gracefully rather than erroring.
- **Empty state**: With few users, many charts will be sparse. Show actual data, not "no data" — even 3 data points on a line chart are useful.
- **Performance**: All queries run server-side in parallel using `Promise.all`. Page should load in <2s. Use `revalidate = 300` (5 min cache) on the page.
- **Design**: Clean, premium, lots of whitespace. The Sola orange (#E5653A) as accent only. White cards on #FAFAFA background. No heavy borders or shadows — 1px #F0F0F0 borders only. This should look like a tool from Linear or Vercel, not a Bootstrap template.
