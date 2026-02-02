---
name: sola-personal-memory
description: Personal memory and continuity without creepiness. Use when building any personalization, recommendation, contextual suggestion, or feature that references past user behavior.
---

# Personal Memory and Continuity

## When to trigger

- Building any recommendation or "suggested for you" surface
- Designing features that reference past trips, preferences, or saved items
- Adding contextual notifications or smart defaults
- Storing any user preference, pattern, or history

## Core rules

1. **Memory serves the user, never the product.** Every remembered data point must answer: "How does this save her time or improve her safety?" If the answer is only "it increases engagement," do not store it.

2. **Three permitted memory categories:**
   - **Explicit preferences**: things she told us (accommodation style, budget, travel pace)
   - **Saved items**: places, guides, connections she deliberately bookmarked
   - **Trip history**: destinations visited, dates, notes she chose to keep

3. **No inferred personality profiles.** Never build behavioral models ("adventurous traveler," "budget-conscious"). Recommendations based on explicit preferences and saved items only.

4. **Every recommendation must be explainable.** If she asks "why are you showing me this?" the system must produce a one-sentence answer. Store a `reason` field alongside every recommendation.

5. **Surveillance language is banned.** Never: "we noticed you...", "based on your activity...", "you seem to like...", "users like you...". Permitted: "You saved a cafe in Lisbon — you arrive Tuesday", "You usually prefer boutique hotels — here are some in Porto."

6. **Memory is deletable per-category.** She can delete all preferences, all saved places, all trip history, or everything — independently. Hard delete. Settings > My Data > Memory.

7. **No FOMO from memory.** Never: "3 connections are in Barcelona right now!", "Your saved places are trending!", "You haven't traveled in 4 months."

8. **Recency decay.** Preferences older than 2 years without reconfirmation are demoted (not used for defaults, still visible in history).

9. **Memory is portable.** Export all stored memory as JSON from Settings > My Data > Export.

10. **Pre-fill, don't assume.** When memory suggests a default, show as pre-filled field she can change. Label: "Based on your last trip" with tap to clear.

## Expected output

```
MEMORY IMPACT ASSESSMENT
- Data remembered: [what specific data]
- Memory category: [explicit preference | saved item | trip history]
- User explanation: [one-sentence reason if she asks "why this?"]
- Phrasing: [exact copy — no surveillance language]
- Deletable: [which Settings > My Data category]
- FOMO check: [creates urgency or guilt? yes/no]
- Decay rule: [when does this stop being active?]
```

## Examples

**Pre-trip accommodation suggestion:**
- Remembered: "boutique hotel" chosen on last 2 trips
- Category: explicit preference
- Explanation: "You chose boutique hotels for Lisbon and Kyoto"
- Phrasing: "You usually prefer boutique hotels. Here are some in Porto."
- FOMO check: no
- Decay: confirmed 4 months ago, still active

**Saved place reminder:**
- Remembered: "Cafe A Brasileira" in Lisbon collection + upcoming trip Tuesday
- Explanation: "You saved this cafe and your Lisbon trip starts Tuesday"
- Phrasing: "You saved Cafe A Brasileira — you arrive in Lisbon Tuesday."
- FOMO check: no — her own saved item, her own trip
- Decay: stops after trip ends

## How this reduces founder dependency

Memory rules are codified. The three categories and banned language list are concrete. Any contributor building a personalization feature runs through the checklist. No ambiguity, no subjective judgment calls.
