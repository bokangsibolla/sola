---
name: sola-ritual-design
description: Ritual-based, healthy repeat usage. Use when designing lifecycle features, notifications, engagement patterns, or any recurring touchpoint. Build rituals around travel, not artificial habits.
---

# Ritual-Based Repeat Usage

## When to trigger

- Designing any recurring or lifecycle feature
- Building notifications tied to trip phases
- Creating any "return to app" moment
- Designing post-trip or between-trip experiences

## Core rules

1. **Rituals follow the natural travel lifecycle, not artificial cadences.** No daily check-ins, no weekly digests, no monthly recaps unless tied to a real travel event.

2. **Five permitted ritual types:**

| Ritual | Trigger | Content | Frequency |
|--------|---------|---------|-----------|
| Pre-trip brief | 7 days before departure | Safety brief, prep checklist, emergency contacts check | Once per trip |
| Arrival grounding | First app open in destination city | Local essentials: emergency numbers, transit, currency, phrase book | Once per arrival |
| Post-trip reflection | 3 days after return date | "Back from Lisbon. Anything worth passing on?" | Once per trip |
| Connection check-in | 30 days after connection made during trip | "You and Mei met in Kyoto last month. Want to stay in touch?" | Once per connection |
| Year in review | December/January | "You traveled to 3 new countries this year." | Once per year |

3. **Every ritual is opt-in and skippable.** Dismissing a ritual is a single tap. No "are you sure?" No guilt copy. No follow-up if dismissed.

4. **Maximum 1 ritual prompt per trip phase.** Pre-trip gets one. Post-trip gets one. No stacking.

5. **Rituals happen at natural moments.** Not arbitrary times. The pre-trip brief sends when she's likely packing (7 days before, morning). The post-trip reflection sends when she's settled back (3 days after return, evening).

6. **No streaks, no chains.** Rituals are individual events, not sequences. Missing one has no consequence, no tracking, no notification about the miss.

7. **Rituals produce value for others.** The post-trip reflection feeds tips to women heading there next. The connection check-in maintains real relationships. Rituals are not just for her — they strengthen the network.

## Expected output

When designing a ritual:

```
RITUAL SPEC
- Name: [what is this ritual called internally]
- Trigger: [specific event that initiates it]
- Content: [what the user sees]
- Copy: [exact notification or prompt text]
- Frequency: [how often can this fire for one user]
- Skip behavior: [what happens when dismissed]
- Value created: [what does this produce for her or the community]
- Anti-guilt check: [does skipping create guilt? must be no]
```

## Examples

**Pre-trip safety brief:**
- Trigger: 7 days before trip departure date, 9am local time
- Content: country safety summary, emergency numbers save prompt, "emergency contacts set up?" check
- Copy: "Your trip to Lisbon is in 7 days. Your safety brief is ready."
- Frequency: once per trip
- Skip: single tap dismiss. No follow-up.
- Value: she arrives prepared. Emergency contacts are set up before she needs them.
- Anti-guilt: no — informational, not admonishing

**Post-trip reflection:**
- Trigger: 3 days after trip return date, 7pm local time
- Content: prompt to share one tip for women heading to that destination
- Copy: "Back from Lisbon. Anything worth sharing with women heading there next?"
- Frequency: once per trip
- Skip: "Nothing to share" button. No follow-up.
- Value: her tip helps the next woman. Community knowledge grows organically.
- Anti-guilt: "nothing to share" is a valid, guilt-free response

**Year in review:**
- Trigger: January 2, 10am local time
- Content: countries visited, connections made, safety features used (setup, not incidents), places saved
- Copy: "Your year in solo travel."
- Frequency: once per year
- Skip: single tap dismiss
- Value: reflection, pride, motivation — not a highlight reel for others
- Anti-guilt: shown privately, not shared publicly unless she chooses

## How this reduces founder dependency

The five ritual types are defined. The triggers are specific dates/events, not manual decisions. New rituals must fit one of the five types or justify a new one. The anti-guilt check is binary. Any contributor can design a ritual by filling out the spec template.
