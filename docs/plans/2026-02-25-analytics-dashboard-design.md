# Sola Analytics Dashboard — Design

**Date**: 2026-02-25
**Status**: Approved

## Overview

Standalone Next.js 15 web dashboard deployed to Vercel. Provides daily-glanceable startup metrics for founders, partners, and investors. Password-protected.

## Architecture

- **Framework**: Next.js 15 (App Router), server components
- **Location**: `dashboard/` at repo root
- **Deploy**: Vercel (separate project)
- **Data sources**: Supabase (service role, server-side only) + PostHog API
- **Auth**: Simple password via `DASHBOARD_PASSWORD` env var, cookie session
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Export**: PDF export for investor meetings

## Metrics

### 1. Pulse (Hero Row)
- Total Users (profiles count)
- DAU (distinct users in user_events today)
- WAU (distinct users 7d)
- Avg Session Duration (PostHog)
- Sessions Today (PostHog)
- All with % change vs previous period (green/red)

### 2. Growth & Retention
- Signups over time (line chart, 7d/30d/all toggle)
- Retention cohort table (signup week x Day 1/3/7/14/30 return rates, color-coded)
- DAU/MAU stickiness ratio with sparkline
- Activation rate (% signups with meaningful first action within 24h: 3+ place views, save, or community thread)
- Resurrection rate (inactive 14+ days, returned this week)
- Signup-to-value time (median minutes to first save/trip/post)
- Churn risk cohort (active last week, absent this week, with last screen viewed)

### 3. Engagement Depth
- Session depth distribution (histogram: screens per session)
- Content engagement heatmap (entity type x action type grid)
- Screen flow sankey diagram (actual navigation paths)
- Time-on-screen breakdown (median per screen type, from successive screen_viewed timestamps)
- Save-through rate (places viewed → saved, by city/country/type)
- Power user identification (5+ sessions AND 3+ saves AND community activity, top 20 list)
- Dead zone analysis (screens with high immediate bounce-back)

### 4. Content Intelligence
- Top content leaderboard (countries/cities/places/collections/threads ranked by conversion rate, not just views)
- Search intent analysis (grouped search terms, unmet demand signals)
- Community health (posts/day, replies/thread, time to first reply, % ghost threads)
- Geographic demand map (engagement per content available by country/city)
- Affiliate link performance (clicks by place, CTR)

### 5. Funnels & Drop-off
- Onboarding: Welcome → Photo → Country → Interests → Complete
- Discovery-to-action: Explore → City → Place → Save/Trip
- Community participation: View → Open → Read → Reply → Create
- Trip planning: Browse → Save → Create trip → Add to trip
- Messaging: View profile → Connect → Converse → 3+ messages
- Each with absolute numbers + conversion rates + week-over-week comparison

## Global Controls
- Date range picker: Today / 7d / 30d / 90d / Custom
- Export to PDF button
- Auto-refresh every 5 minutes

## Access
- Single password via DASHBOARD_PASSWORD env var
- Cookie-based session after login
- Middleware protection on all routes
