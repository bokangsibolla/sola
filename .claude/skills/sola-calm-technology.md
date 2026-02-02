---
name: sola-calm-technology
description: Calm technology and respectful interruptions. Use when adding notifications, animations, loading states, sound, haptics, or any interruptive UI element. Sola should be the calmest thing on her phone.
---

# Calm Technology and Respectful Interruptions

## When to trigger

- Adding push notifications or in-app alerts
- Adding animations or transitions
- Designing loading or waiting states
- Adding sound or haptic feedback
- Creating any UI element that demands attention
- Designing badges, indicators, or status markers

## Core rules

1. **Sola is the calmest thing on her phone.** If she's stressed, anxious, or overwhelmed, opening Sola should feel like a deep breath. Never add to the noise.

2. **Notification budget: max 2 non-safety per day.** Safety notifications (SOS responses, check-in reminders during active trips) have no cap. Everything else: maximum 2 per day, and only if the user has an active trip or upcoming trip within 14 days.

3. **Notification tiers:**

| Type | Priority | Examples | Rules |
|------|----------|----------|-------|
| Safety | Immediate | SOS response, missed check-in alert | Always delivered, no cap |
| Trip-relevant | Normal | "Your trip is in 3 days", safety brief ready | Max 1/day, only pre-trip or during-trip |
| Social | Low | Connection request, new message | Max 1/day, batched if multiple |
| None | Never send | "You haven't opened Sola in a while", "X travelers near you" | Banned entirely |

4. **No anxiety-creating badges.** No red dots with numbers. No unread counts on tab bar icons. If she has a new message, show a subtle dot (not a number). If she has a connection request, show it when she opens the relevant screen.

5. **Loading states are serene.** No spinning wheels. Use subtle skeleton placeholders that fade in. If loading takes more than 3 seconds, show a calm message: "Getting your info ready." Never show progress percentages.

6. **Animations are gentle.** Maximum 300ms for UI transitions. Easing: ease-out for entrances, ease-in for exits. No bouncing, no wiggling, no pulse effects, no confetti, no celebration animations beyond a single gentle fade.

7. **Sound is off by default.** No notification sounds, no button clicks, no success chimes. If sound is ever added, it is opt-in via settings and off by default.

8. **Haptics are soft confirmation only.** Light impact for button taps (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`). Medium impact only for significant actions (SOS trigger, trip creation). Never heavy impact. Never continuous vibration.

9. **No streaks, no guilt.** Never track consecutive days of usage. Never display "you haven't done X in Y days." Never reward or acknowledge frequency of use.

10. **Respect do-not-disturb.** If the device is in do-not-disturb mode, only safety-tier notifications break through. All others queue silently.

## Expected output

When adding any interruptive element:

```
CALM TECHNOLOGY CHECK
- Element type: [notification / animation / loading / sound / haptic / badge]
- Notification tier: [safety / trip-relevant / social / banned]
- Frequency: [how often can this fire?]
- Duration/intensity: [ms for animation, feedback style for haptic]
- Can user disable: [yes/no — safety cannot be disabled]
- Anxiety check: [does this create urgency or guilt? yes/no]
- Do-not-disturb behavior: [breaks through / queues silently]
```

## Examples

**Trip reminder notification (7 days before):**
- Tier: trip-relevant
- Copy: "Your trip to Lisbon is in 7 days. Safety brief is ready."
- Frequency: once per trip, 7 days before departure
- Can disable: yes, in notification settings
- Anxiety check: no — informational, no urgency language
- DND: queues silently

**New message notification:**
- Tier: social
- Copy: "New message from Sarah."
- Frequency: batched — max 1 notification per hour for messages
- Can disable: yes
- Anxiety check: no — no "don't miss" or "reply now" language
- DND: queues silently

**SOS check-in missed:**
- Tier: safety
- Copy: "You haven't checked in. Your emergency contact will be notified in 15 minutes."
- Frequency: follows check-in timer
- Can disable: no (safety feature while active)
- Anxiety check: intentionally urgent — this is a safety feature
- DND: breaks through

**Screen transition animation:**
- Type: animation
- Duration: 250ms ease-out push transition
- Calm check: no bouncing, no overshoot, no parallax effects

## How this reduces founder dependency

The notification budget (2/day max) and tier system are hard rules, not guidelines. Any contributor adding a notification checks the tier table and caps. The animation and haptic specs are precise values. No subjective debates about whether something is "too much."
