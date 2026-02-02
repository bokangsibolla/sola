---
name: sola-sensitive-data
description: Sensitive data handling, classification, and retention rules. Use when adding any data model, database table, storage, API endpoint, or analytics event that touches user data.
---

# Sensitive Data Handling and Retention

## When to trigger

- Adding or modifying any data model, database table, or Supabase query
- Writing any API endpoint that reads or writes user data
- Adding analytics events or tracking
- Storing anything on device (AsyncStorage, SecureStore)
- Integrating any third-party service that receives user data

## Data classification tiers

### Tier 1: Critical (physical safety risk if exposed)

| Data | Examples |
|------|----------|
| Real-time location | GPS coordinates during trip |
| Emergency contacts | Names, phones, relationships |
| SOS triggers | Any record of emergency activation |
| Safety check-in status | Whether user checked in or missed |

**Rules:**
1. Never persist location beyond the active session. When app closes or trip ends, location data is deleted.
2. Emergency contacts encrypted at rest with user-specific key. Decrypted only during SOS or when user views them.
3. No analytics on safety feature usage. Never track SOS frequency, not even anonymized.
4. SOS data retained max 30 days after incident closes, then hard-deleted.
5. On-device: use `expo-secure-store` only. Never plain AsyncStorage.

### Tier 2: Sensitive (reveals patterns, enables harassment)

| Data | Examples |
|------|----------|
| Messages | Content, timestamps, read receipts |
| Trip dates/destinations | Where user is going and when |
| Accommodation | Hotel names, addresses, check-in dates |
| Profile photos | User-uploaded images |

**Rules:**
6. Messages auto-archive after 12 months. Hard-delete after 24 months.
7. Trip data retained 6 months after trip end, then archived.
8. Profile photos in private Supabase bucket. Signed URLs only, expiring after 1 hour.
9. All Tier 2 data encrypted in transit (TLS) and at rest.

### Tier 3: Standard (low risk)

| Data | Examples |
|------|----------|
| Preferences | Travel style, interests, dietary needs |
| App settings | Notification prefs, theme |
| Saved places | Public place IDs only |

**Rules:**
10. Standard Supabase encryption sufficient.
11. Retained until account deletion.
12. Can be used for anonymized, aggregated analytics. Never linked to individual.

## Universal rules

13. **Row-level security on every Supabase table.** Default deny. Explicitly grant access. No table without RLS.
14. **No user data in logs.** Never log emails, names, locations, message content. User IDs only when necessary for debugging.
15. **No third-party analytics SDKs that transmit PII.** Privacy-first only (PostHog self-hosted, Plausible). No Google Analytics.
16. **Every API endpoint validates ownership.** Query must include `user_id = auth.uid()` or equivalent RLS policy.
17. **Deletion means deletion.** Hard-delete within 72 hours. No soft-delete flags for Tier 1 or 2.

## GDPR compliance

18. **Data export.** Users can export all data as JSON. Deliverable within 48 hours.
19. **Account deletion.** From profile settings. Purge from backups within 72 hours.
20. **Consent is specific.** Each data usage (messages, location, contacts) requires separate consent. No blanket toggle.

## Expected output

When adding a data model or endpoint:

```
DATA IMPACT STATEMENT
- Data: [what is stored]
- Tier: [1, 2, or 3]
- Retention: [how long, auto-delete rule]
- Encryption: [Supabase default / application-level / SecureStore]
- RLS policy: [who can access]
- Logs: [confirm no PII in logs]
- Analytics: [what is tracked, confirm no PII]
```

## Examples

**Adding trip table:**
- Tier 2 (dates + destination reveal travel patterns)
- Retention: 6 months post-trip, then archive
- RLS: `auth.uid() = user_id`
- Departure date never exposed publicly

**Adding emergency contacts:**
- Tier 1 (physical safety)
- Retention: until user deletes
- Encrypted with user-specific key via SecureStore on device
- RLS: only owning user + SOS system can read
- Zero analytics

## How this reduces founder dependency

Data handling decisions are pre-made by tier. No one needs to ask "should we encrypt this?" or "how long do we keep this?" The tier answers it. The Data Impact Statement creates an audit trail.
