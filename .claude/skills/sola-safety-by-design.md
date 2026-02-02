---
name: sola-safety-by-design
description: Women-first safety and privacy by design. Use BEFORE writing any feature that touches user identity, location, messaging, social features, or data sharing. Use when reviewing any PR that adds social, location, or communication functionality.
---

# Women-First Safety and Privacy by Design

## When to trigger

- Adding or modifying any screen that shows user location, profile, or travel plans
- Building any social feature (messaging, connections, feeds, matching)
- Designing any data model that stores personal information
- Adding any third-party integration that receives user data
- Writing any backend endpoint that returns user data
- Reviewing any PR that touches the above

## Core rules

1. **Default to invisible.** New users are private by default. No profile, location, or trip is visible until the user explicitly opts in. Server must enforce this — never rely on client-side checks alone.

2. **Location is approximate unless chosen otherwise.** City-level precision is the default. Neighborhood or exact location requires explicit opt-in with a plain-language explanation of what becomes visible and to whom.

3. **Every social surface needs block + report.** No screen that shows another user's content (messages, profiles, feed cards) may ship without a block and report action. Block must be immediate, client-side, and confirmed server-side asynchronously. Blocked users must never appear again in any feed, search, or suggestion.

4. **Messages require mutual consent.** No user can message another without a prior connection request that was accepted. Connection requests must show: name, photo, home country, shared destination/dates if any. Requests can be declined silently — the sender sees "pending" indefinitely, never "declined."

5. **Identity verification before social features.** Before a user can send connection requests or appear in "travelers near you," they must complete at minimum: (a) email verification, (b) one selfie matched against profile photo. Phase 2 adds optional government ID. Unverified users can browse guides and plan trips but cannot interact socially.

6. **SOS must be reachable in 2 taps from any screen.** A persistent but non-intrusive safety affordance must exist globally. Activating it must: (a) show local emergency numbers, (b) offer one-tap call to local police, (c) send pre-written alert to user's trusted contacts with current city-level location, (d) optionally share live location for a time-limited window.

7. **Trusted contacts are stored encrypted at rest.** Emergency contacts (name, phone, relationship) are encrypted with a user-specific key. They are only decrypted server-side when an SOS is triggered or when the user views them.

8. **No dark patterns around safety.** Never gate safety features behind paywalls, sign-ups, or social pressure. Emergency numbers, embassy links, and SOS are always free and always accessible — even without an account.

9. **Data minimization.** Collect only what the feature requires. If a feature works with city-level location, do not request GPS coordinates. If a feature works without date of birth, do not ask for it.

10. **Retention limits.** Messages older than 12 months auto-archive. Location history is never stored beyond the current session. Trip data persists only while the trip status is active or the user explicitly saves it.

## Expected output

When this skill is triggered during development, the output must be a **Safety Impact Statement** appended as a comment in the PR or documented in the task:

```
SAFETY IMPACT STATEMENT
- Data collected: [list every field]
- Who can see it: [visibility rules]
- How it's stored: [encryption, retention]
- Block/report: [yes/no, if no — why not]
- SOS reachability: [still 2 taps from this screen? yes/no]
- Consent model: [what did the user agree to?]
- Failure mode: [what happens if this feature is misused?]
```

## Examples

**Adding "Travelers Near You" feed:**
- Data collected: city-level location, profile photo, first name, interests
- Who can see it: only verified users whose visibility is set to "connections" or "public"
- Block/report: yes — long-press card shows "Block" and "Report"
- SOS: yes — global SOS button remains visible in header
- Consent: user opted into "public" or "connections" visibility in settings
- Failure mode: stalker creates account to find target → mitigated by: verification required, approximate location only, block is instant, reported accounts reviewed within 24h

**Adding trip sharing:**
- Trip visibility default: private
- User must explicitly choose "share with connections" or "share publicly"
- Shared trip shows city and month only — never exact dates or accommodation unless user adds them manually
- Departure date is never shown publicly (prevents "her apartment is empty" inference)

## How this reduces founder dependency

This skill means every future contributor — human or AI — knows the safety rules before writing code. You never need to review every feature for safety compliance manually. The Safety Impact Statement creates an auditable trail. Violations are caught at PR time, not after launch.
