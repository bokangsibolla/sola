---
name: sola-travel-companion
description: Travel companion mindset — Sola is not an app you browse, it's a companion that helps when needed and stays quiet when not. Use when designing any feature or evaluating feature priority.
---

# Travel Companion Mindset

## When to trigger

- Designing any feature or screen
- Evaluating feature priority or backlog
- Deciding what to show on the home screen
- Any time someone proposes a "browsing" or "discovery" feature

## Core rules

1. **Sola is not a feed to scroll.** It's a companion that helps when needed and stays quiet when not. The mental model is not "Instagram for travel." It is "a trusted friend who knows where you're going and has been there before."

2. **What would a thoughtful travel companion do right now?** This is the design question for every feature. A companion doesn't show you "trending destinations." She says "you land in Lisbon Tuesday — here's what you need to know."

3. **The app serves the trip, not the other way around.** The user should never do work to feed the app (writing reviews, rating places, maintaining a profile for its own sake). If the app asks for input, that input must directly improve HER experience.

4. **Three modes, not one:**

| Mode | When | App behavior |
|------|------|-------------|
| Planning | Has a future trip | Proactive: surfaces relevant guides, safety info, prep checklists |
| Active trip | Currently traveling | Reactive: instant access to emergency info, nearby essentials, quick reference |
| Between trips | No upcoming trip | Quiet: no notifications, no engagement attempts. Occasional: "thinking about your next trip?" when she opens the app |

5. **Before trip: help prepare.** Surface relevant safety info, connect her with women who've been there, show neighborhood guides, prompt emergency contact setup. All based on her specific destination and dates.

6. **During trip: be instantly useful.** Emergency numbers one tap away. "Where to eat right now" based on her location and time of day. Quick translation help. Weather. Currency conversion. Don't make her search — anticipate.

7. **After trip: help remember.** Ask what's worth sharing with women heading there next. Surface photos from her camera roll that match trip dates and location (with permission). Let her archive the trip as a memory, not delete it.

8. **Never demand attention.** The app should never make the user feel guilty for not opening it. No "we miss you." No "you haven't updated your profile." If she doesn't need Sola right now, that's success.

9. **Never create busywork.** No "complete your profile to 100%." No "add 5 places to your collection." No "rate your last trip." If something is worth doing, make the value obvious. If she doesn't do it, she didn't need to.

## Expected output

When evaluating a feature against companion mindset:

```
COMPANION CHECK
- Mode: [planning / active trip / between trips]
- Would a travel companion do this? [yes/no — explain]
- Does this serve the trip or the app? [trip / app]
- Does this demand attention or offer it? [demand / offer]
- Does this create busywork? [yes/no]
```

## Examples

**Home screen feed of "travelers near you":**
- Mode: active trip (or planning if destination matches)
- Companion check: yes — a companion would say "there's another woman from London also here in Lisbon right now"
- Serves: the trip — reduces loneliness, enables real connection
- Demands attention? No — it's there when she opens the app, doesn't push
- Busywork? No — no required action, just awareness

**"Complete your profile" progress bar:**
- Companion check: no — a friend wouldn't nag you to fill out a form
- Serves: the app — increases data collection, not trip quality
- Demands attention? Yes — creates a persistent incomplete feeling
- Busywork? Yes — profile fields beyond name/photo/country are optional for a reason
- VERDICT: do not build

**Post-trip "anything worth sharing?"**
- Mode: between trips (triggered by trip end date)
- Companion check: yes — a friend would ask "how was it? anything I should know?"
- Serves: the trip — her notes help the next woman
- Demands attention? Offers gently — one prompt, easily dismissed
- Busywork? Only if she wants to share. A "nothing to share" dismissal is fine.

## How this reduces founder dependency

The three modes (planning, active, between) give any contributor a clear framework for when features should activate. The companion check is a quick yes/no evaluation. "Would a travel companion do this?" is intuitive and doesn't require product expertise to answer.
