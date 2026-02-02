---
name: sola-low-ops
description: Low-ops, high-leverage system design. Use when making any architecture, infrastructure, or service selection decision. Minimize operational burden, maximize managed services.
---

# Low-Ops, High-Leverage System Design

## When to trigger

- Choosing any technology, service, or architecture pattern
- Evaluating build vs. buy decisions
- Designing database schemas or API patterns
- Setting up CI/CD, monitoring, or deployment
- Any time someone suggests self-hosting something

## Core rules

1. **Managed services over self-hosted, always.** Supabase over self-hosted Postgres. Vercel/EAS over custom CI. Resend over self-hosted email. The ops tax of self-hosting is never worth it at Sola's scale and team size.

2. **Supabase is the platform:**
   - Auth: Supabase Auth (email, Apple, Google OAuth)
   - Database: Supabase Postgres with row-level security
   - Storage: Supabase Storage for images with signed URLs
   - Real-time: Supabase Realtime for messages and presence
   - Edge functions: Supabase Edge Functions for server logic
   - Full-text search: Supabase pg_trgm or full-text search (Algolia only if search is a core differentiator)

3. **Row-level security is the auth layer.** RLS policies in Supabase replace application-level permission checks. Every table has RLS enabled. Default deny. This means security works even if application code has bugs.

4. **EAS for mobile deployment:**
   - EAS Build for app store builds
   - EAS Update for over-the-air JavaScript updates (no app store review for content/logic changes)
   - EAS Submit for app store submissions
   - No custom build servers

5. **Transactional email only.** Resend or Postmark for: email verification, password reset, SOS alerts, trip reminders. No marketing automation, no drip campaigns, no newsletters. If marketing email is ever needed, use a separate service with separate consent.

6. **Push notifications via Expo:** Expo Push API. No Firebase Cloud Messaging setup, no APNs certificate management. Expo handles it.

7. **Monitoring:**
   - Sentry for crash reporting and error tracking (free tier covers early stage)
   - Supabase dashboard for database metrics
   - No custom monitoring stack. No Grafana, no Prometheus, no Datadog.

8. **Cost budget:**
   - Under $100/month until 10K users
   - Under $500/month until 100K users
   - Under $2,000/month until 500K users
   - If projected to exceed these thresholds, optimize before scaling the plan

9. **No microservices.** Supabase + Edge Functions is the entire backend. No separate services for auth, messaging, notifications, search. One platform. One dashboard. One bill.

10. **Static where possible.** Country guides, emergency numbers, safety data — serve from Supabase but cache aggressively on device. These change rarely. Don't fetch on every screen load.

11. **Schema-first database design.** Define Supabase schemas with RLS policies before writing any application code. The database schema IS the API contract. Use Supabase's auto-generated REST API where possible.

## Expected output

When making a technology or architecture decision:

```
LOW-OPS CHECK
- Decision: [what are we choosing]
- Options considered: [managed option vs. self-hosted/custom]
- Chosen: [which and why]
- Ops burden: [what does the founder need to do to keep this running]
- Cost at 10K / 100K / 1M users: [estimates]
- Failure mode: [what happens if this service goes down]
- Migration path: [can we move away if needed]
```

## Examples

**Message storage:**
- Options: Supabase Postgres + Realtime vs. Firebase Firestore vs. custom WebSocket server
- Chosen: Supabase — already the platform, Realtime handles subscriptions, RLS handles access control, one bill
- Ops burden: zero — Supabase manages it
- Cost: included in Supabase Pro plan ($25/mo) up to reasonable scale
- Failure: Supabase outage = messages delayed (they queue). Mitigated by Supabase's 99.9% uptime SLA.
- Migration: standard Postgres — export and move to any Postgres host

**Image storage:**
- Options: Supabase Storage vs. Cloudinary vs. S3
- Chosen: Supabase Storage — signed URLs, integrated with auth, one dashboard
- Ops burden: zero
- Cost: included in Supabase plan (1GB free, $0.021/GB after)
- Failure: images temporarily unavailable, app shows placeholder
- Migration: S3-compatible API, can switch to any S3-compatible provider

**Push notifications:**
- Options: Expo Push vs. Firebase Cloud Messaging vs. OneSignal
- Chosen: Expo Push — zero config, works with Expo project, no certificate management
- Ops burden: zero
- Cost: free for standard usage
- Failure: notifications delayed — non-critical except for safety (SOS has SMS fallback)

## How this reduces founder dependency

Every technology decision defaults to the managed option with the least ops burden. The founder never needs to SSH into a server, manage certificates, or debug infrastructure. Supabase is one dashboard for database, auth, storage, real-time, and serverless functions. EAS is one dashboard for builds and updates. The cost budget creates automatic guardrails against overspending.
