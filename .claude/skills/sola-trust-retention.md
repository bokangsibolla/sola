---
name: sola-trust-retention
description: Trust-driven retention over engagement metrics. Use when defining success metrics, analytics events, feature KPIs, or evaluating whether a feature is "working."
---

# Trust-Driven Retention

## When to trigger

- Defining KPIs or success metrics for any feature
- Adding analytics events or tracking
- Designing A/B tests
- Evaluating whether a feature should be kept or removed
- Any conversation about "engagement," "retention," or "growth"

## Core rules

1. **Success is trust, not time-in-app.** If she opens Sola once before a trip, gets what she needs, and doesn't return until the next trip — that is success. Never optimize against this.

2. **Metrics that matter (track these):**
   - Trips planned end-to-end in Sola
   - SOS features set up (contacts added, emergency info reviewed)
   - Connections that led to real meetups
   - Guides consulted before arrival
   - Return rate: did she plan her next trip in Sola?
   - Referral: did she share Sola with someone?
   - Safety info accessed during trip

3. **Anti-metrics (never optimize for these):**
   - Daily active users (DAU)
   - Session length
   - Screens per visit
   - Notification tap rate
   - Streak counts

4. **No re-engagement campaigns.** Never send "we miss you," "come back," or "see what's new." If she hasn't opened the app, she doesn't need it right now.

5. **Measure task completion, not funnel depth.** Success = "did she accomplish what she came to do?" Not "how many screens did she visit?"

6. **Churn is not failure.** A user who planned one trip and never travels solo again is a success story. Do not build churn prevention systems.

7. **Every analytics event must have a documented decision it informs.** No speculative tracking. If you can't name the decision, don't track it.

8. **Quarterly trust audit.** Review: any features driving usage without delivering value? Any metrics incentivizing behaviors that don't serve the user? Remove or redesign.

## Expected output

```
TRUST METRIC SPEC
- Feature: [name]
- Success metric: [what indicates value delivered]
- How measured: [specific event or query]
- Decision it informs: [what you'll change based on this]
- Anti-metric check: [does this optimize for DAU/session time? yes/no]
- Notification impact: [budget and opt-in model]
- Churn interpretation: [if users stop using this, what does it mean?]
```

## Examples

**Country guides:**
- Success: user opened guide for a country she has a trip to within 30 days
- Decision: which sections are useful (expand those), which are never opened (remove)
- Anti-metric check: no — don't track scroll depth or time on page
- Churn interpretation: she may already know the destination. Not a problem.

**Trip planning:**
- Success: trip created with destination and at least one saved place
- Decision: is the planning flow frictionless? Where do users drop off?
- Anti-metric check: no — measure completion, not edits
- Churn interpretation: no more solo trips planned. That's fine.

## How this reduces founder dependency

The metric framework is self-enforcing. The anti-metrics list is explicit. The notification budget is a hard cap. The quarterly audit is a checklist the founder can run in an hour.
