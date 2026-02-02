---
name: sola-anti-patterns
description: Anti-pattern elimination — what Sola will never do. Use as a FINAL CHECK before any PR merge. This is a hard blacklist.
---

# Anti-Pattern Elimination

## When to trigger

- Final review before any PR merge
- Evaluating any new feature proposal
- Quarterly product audit
- Any time someone suggests "what if we added..."

## The blacklist

These are not guidelines. They are bans. If any of these appear in the codebase, it is a bug.

### 1. No gamification
- No points, badges, streaks, leaderboards, levels, XP, achievements, or progress bars tied to usage
- No "you've visited 5 countries — unlock Gold Traveler!"
- No rewards for frequency of use
- Why: gamification manufactures engagement through psychological manipulation. Sola serves utility, not dopamine.

### 2. No artificial scarcity
- No "only 2 spots left," no "limited time," no countdown timers on non-trip features
- No "this deal expires," no "book before it's gone"
- Why: scarcity language creates anxiety. Sola reduces anxiety.

### 3. No social pressure
- No "3 friends already joined," no "X people are looking at this," no "trending"
- No visible follower/following counts, no like counts, no view counts
- No "X people saved this place" numbers
- Why: social proof metrics create comparison and FOMO. Sola builds genuine connection.

### 4. No engagement metrics visible to users
- No likes, hearts, upvotes, or reactions on content
- No "X views" or "X saves" displayed
- No "popular" or "trending" labels
- Why: visible metrics turn self-expression into performance.

### 5. No infinite scroll without purpose
- Every feed has a natural end
- "You've seen everyone nearby" is a valid end state
- No "pull to refresh" that manufactures new content that doesn't exist
- Why: infinite scroll is designed to prevent intentional use.

### 6. No dark patterns
- No pre-checked opt-ins
- No "are you sure you want to miss out?"
- No hidden unsubscribe flows
- No confusing double negatives ("uncheck to not receive")
- No forced detours before completing an action
- Why: dark patterns are manipulation. Full stop.

### 7. No data collection beyond feature need
- No tracking that doesn't inform a specific product decision
- No "we might need this later" data collection
- No third-party trackers that harvest data for advertising
- Why: excess data collection is a liability, not an asset.

### 8. No anxiety-inducing notifications
- No "you haven't opened the app in X days"
- No "X travelers near you — don't miss out"
- No "your trip is in X days and you haven't prepared"
- Why: guilt-based re-engagement is disrespectful.

### 9. No gendered stereotypes
- No "girls' trip" framing, no pink-washing
- No assumptions about shopping, spa, or "girly" activities
- No "women love these destinations" based on stereotype
- Recommendations based on stated preferences only
- Why: Sola serves all women, not a marketing persona.

### 10. No paywalled safety
- Emergency numbers always free and accessible
- SOS features never behind a paywall
- Safety ratings never behind a paywall
- Embassy info never behind a paywall
- Country safety briefs never behind a paywall
- Why: safety is a right, not a feature.

### 11. No required social media accounts
- Never require Facebook, Instagram, Twitter, or any social platform to sign up
- Social login is optional convenience only — email is always available
- Never import social graphs without explicit consent
- Why: social media accounts are not identity. Privacy is default.

### 12. No selling user data
- User data is never sold, rented, shared with advertisers, or used for ad targeting
- No data brokers, no advertising SDKs, no "partners" that receive user data for marketing
- Why: this is non-negotiable for trust.

### 13. No ads
- No banner ads, no interstitial ads, no sponsored content, no "promoted" listings
- Revenue comes from subscriptions or transactions, never from attention arbitrage
- Why: ads misalign incentives. Sola's incentive is to be useful, not to maximize screen time.

## Expected output

PR merge checklist — append to every PR:

```
ANTI-PATTERN CHECK
- [ ] No gamification (points, badges, streaks, levels)
- [ ] No artificial scarcity (countdown timers, "limited")
- [ ] No social pressure (follower counts, "X people...")
- [ ] No visible engagement metrics (likes, views, saves count)
- [ ] No infinite scroll without end state
- [ ] No dark patterns (pre-checked, double negatives, hidden flows)
- [ ] No excess data collection
- [ ] No anxiety notifications
- [ ] No gendered stereotypes
- [ ] No paywalled safety features
- [ ] No required social media
- [ ] No data selling or ad SDKs
- [ ] No ads or sponsored content
```

## How this reduces founder dependency

This is a binary checklist. Every item is yes/no. Any contributor can self-review against it. Any reviewer can check a PR in 60 seconds. No judgment calls. If it's on the list, it doesn't ship.
