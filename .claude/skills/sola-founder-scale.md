---
name: sola-founder-scale
description: Founder-scale decision automation. Use when designing any operational system, workflow, content pipeline, or moderation process. Every system must be operable by one non-coder founder.
---

# Founder-Scale Decision Automation

## When to trigger

- Designing any operational system or workflow
- Building content management or publishing
- Creating moderation or review systems
- Setting up monitoring, alerts, or dashboards
- Any time a process requires recurring human intervention

## Core rules

1. **If it requires daily manual intervention, automate it or don't build it.** One-time setup is fine. Daily ops is not sustainable for a solo founder.

2. **If it requires code changes to update content, add a config layer.** Country guides, safety data, emergency numbers, featured destinations — all must be editable without deploying code.

3. **Content pipeline:**
   - Country guides authored in structured JSON/markdown
   - Deployed via Supabase data or a simple CMS (no code deploy)
   - New guide workflow: author → validate schema → publish
   - Founder can add a new country guide in under 30 minutes

4. **Moderation system:**
   - Layer 1: Automated keyword/pattern detection (blocks obvious violations instantly)
   - Layer 2: User reputation scoring (new accounts flagged more aggressively)
   - Layer 3: Community reporting (reports queue items for review)
   - Layer 4: Founder review (only flagged items, max 15 minutes/day at 100K users)
   - Escalation: if moderation queue exceeds 50 items, auto-restrict new accounts until cleared

5. **Automated alerts (Slack or email):**
   - New user spike (>2x daily average) — could indicate press mention or bot attack
   - Safety feature activation spike — indicates regional safety event
   - Error rate exceeds 1% — something is broken
   - Moderation queue exceeds 20 items — needs attention
   - Supabase approaching plan limits — cost alert

6. **Decision matrix for common founder decisions:**

| Situation | Decision rule | Action |
|-----------|--------------|--------|
| User reported for harassment | 2+ independent reports → auto-restrict to Tier 1. 3+ → auto-suspend. | Founder reviews suspensions weekly, not in real-time |
| New country guide request | Check: >100 users with trips to this country in next 90 days? If yes, prioritize. | Founder authors guide using template |
| Feature request from user | Log it. If 3+ independent requests for same thing, add to backlog. | Founder reviews backlog monthly |
| Bug report | Auto-create issue. If safety-related, alert immediately. | Founder triages safety bugs same-day, others weekly |
| Cost approaching budget | Alert at 80% of monthly budget. Auto-scale-down at 95%. | Founder reviews, adjusts plan or optimizes |

7. **Weekly automated dashboard (emailed to founder):**
   - New users this week
   - Trips created this week
   - Active trips right now
   - Safety features set up (emergency contacts, SOS)
   - Moderation actions taken (automated + manual)
   - Error count and top errors
   - Cost this month vs. budget

8. **No human-in-the-loop for standard operations.** User sign-up, profile creation, trip planning, guide access, place saving — all fully automated. Humans intervene only for: moderation review, content creation, and strategic decisions.

## Expected output

When designing an operational system:

```
FOUNDER-SCALE CHECK
- System: [name]
- Daily founder time required: [minutes — must be <15 for any single system]
- Automated triggers: [what fires without human input]
- Human intervention points: [when does the founder need to act]
- Escalation path: [what happens if the founder is unavailable for 48 hours]
- Cost at 10K users: [estimated]
- Cost at 100K users: [estimated]
- Cost at 1M users: [estimated]
```

## Examples

**Moderation system:**
- Daily founder time: 10 minutes (reviewing flagged items only)
- Automated: keyword filter, reputation scoring, auto-restrict on 2+ reports
- Human: review restricted accounts, decide on permanent bans
- Escalation: if founder unavailable 48h, auto-restricted accounts stay restricted, queue builds (no damage)
- Cost: Supabase edge functions for automated layer, zero additional cost

**Country guide publishing:**
- Daily founder time: 0 (publishing is event-driven, not daily)
- Automated: schema validation, deployment on save to Supabase
- Human: author the guide content (30 min per guide)
- Escalation: no urgency — guides publish when ready
- Cost: zero incremental (stored in Supabase)

## How this reduces founder dependency

Every operational system has an explicit time budget. If any system requires more than 15 minutes daily, it must be automated further before shipping. The decision matrix removes judgment from common situations. The weekly dashboard replaces manual investigation. The escalation path means the founder can take a weekend off without the app breaking.
