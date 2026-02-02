---
name: sola-progressive-trust
description: Progressive trust and permission design. Use when adding any feature that requires permissions, gates access, or introduces users to capabilities. Never ask for everything upfront.
---

# Progressive Trust and Permission Design

## When to trigger

- Adding any feature that requires device permissions (location, camera, notifications, contacts)
- Building any gated feature (features that require verification, connections, or trust level)
- Designing any onboarding or progressive disclosure flow
- Adding social features with trust tiers

## Core rules

1. **Never ask for permissions upfront.** Ask when the feature is needed, explain why in plain language, and make it easy to decline without losing core functionality.

2. **Trust is earned in tiers.** Users unlock capabilities gradually:

| Tier | Name | Requirements | Unlocks |
|------|------|-------------|---------|
| 0 | Visitor | Download app | Browse guides, view safety info, emergency numbers |
| 1 | Member | Email verified, profile completed | Plan trips, save places, view collections |
| 2 | Verified | Photo verification (selfie match) | Appear in "near you" feed, send connection requests |
| 3 | Connected | Mutual connection accepted | Direct messages, trip sharing with that connection |
| 4 | Trusted | 3+ connections, 30+ days active, no reports | Create community tips, appear in recommendations |

3. **Permission requests are contextual, not batched.** Each permission asked at the moment it's needed:
   - **Location**: asked when she taps "Travelers near you." Explanation: "To show who's nearby. Only your city is shared, never your exact location."
   - **Camera**: asked when she taps "Add photo" on profile. Explanation: "To add your profile photo."
   - **Notifications**: asked after she creates a trip with dates. Explanation: "To remind you about your trip to Lisbon and share your safety brief."
   - **Contacts**: asked only during SOS setup. Explanation: "To add emergency contacts who'll be alerted if you use SOS."

4. **Declining is always free.** If she declines location, she can still browse the feed (sorted by interest match instead of proximity). If she declines notifications, trips still work (she just won't get reminders). Declining never breaks core functionality.

5. **Explain what happens, not what we need.** Bad: "Sola needs access to your location." Good: "To show travelers in your city. Only your city name is shared."

6. **Trust can be lost.** If a user is reported and confirmed by moderation, they drop to Tier 1 (can still use the app for guides/trips but cannot interact socially). If reported multiple times, account suspended. Tier demotion is silent to the reported user to prevent retaliation.

7. **Verification is low-friction.** Photo verification: take a selfie, AI compares to profile photo, result in under 30 seconds. No government ID required at Tier 2. Government ID is optional for a "ID verified" badge at Tier 4.

8. **Progressive disclosure of social features.** A new user doesn't see an empty "Messages" tab — she sees it only after she has at least one connection. The Travelers Near You feed shows a preview with "Verify your profile to connect" prompt.

## Expected output

When adding a gated or permission-dependent feature:

```
TRUST & PERMISSION SPEC
- Feature: [name]
- Minimum trust tier: [0-4]
- Permission required: [location/camera/notifications/contacts/none]
- When permission is asked: [specific trigger moment]
- Permission explanation copy: [exact text shown to user]
- Decline behavior: [what happens if she says no]
- Graceful degradation: [how the feature works without the permission]
```

## Examples

**"Travelers Near You" feed:**
- Minimum tier: Tier 2 (verified) to appear, Tier 1 to view
- Permission: location, asked when tapping the feed
- Explanation: "To show travelers in your city. Only your city is shared."
- Decline: feed shows travelers sorted by shared interests/destinations instead
- Graceful degradation: fully functional without location, just not proximity-sorted

**Direct messaging:**
- Minimum tier: Tier 3 (mutual connection)
- Permission: notifications (optional), asked after first message received
- Explanation: "To let you know when Sarah replies."
- Decline: messages appear when she opens the app, no push notification
- Graceful degradation: fully functional, just no push alerts

**SOS with trusted contacts:**
- Minimum tier: Tier 1 (email verified)
- Permission: contacts (optional — can type manually), location (asked at SOS trigger)
- Explanation: "To send your location to your emergency contact."
- Decline: SOS still shows emergency numbers and allows manual call
- Graceful degradation: core SOS (emergency numbers, one-tap call) works with zero permissions

## How this reduces founder dependency

Trust tiers are defined once and applied across all features. Any contributor building a new social feature checks the tier table and knows exactly what trust level is required. Permission request copy follows a template. No founder review needed for individual permission flows.
