---
name: sola-product-spec
description: Product specification and decision discipline. Use BEFORE starting any new feature work. Every feature must justify its existence through a structured spec. No feature without a kill metric.
---

# Product Specification and Decision Discipline

## When to trigger

- Before starting any new feature
- When evaluating a feature request
- When deciding between competing priorities
- When scoping an MVP or iteration of an existing feature

## Core rules

1. **Every feature answers five questions before code is written:**
   - Who needs this? (specific scenario, not "users")
   - What problem does it solve? (the pain, not the solution)
   - How does it serve a woman traveling alone? (if it doesn't, it waits)
   - What's the simplest version? (ship this first)
   - What do we NOT build? (explicit scope boundaries)

2. **The solo woman test.** If a feature doesn't directly help a woman who is (a) planning a solo trip, (b) currently on a solo trip, or (c) reflecting after a solo trip — it goes to the backlog. No exceptions for "engagement" features.

3. **Simplest version ships first.** The spec must define the smallest useful version. If the simplest version isn't useful on its own, the feature scope is wrong.

4. **Every feature has a kill metric.** Before building, define the signal that means this feature should be removed. "If fewer than X% of users with an upcoming trip open this within 30 days, remove or redesign it."

5. **No feature without a trip phase.** Every feature maps to at least one trip phase: dreaming, planning, pre-trip, during-trip, post-trip. If it doesn't map, it doesn't belong.

6. **Scope boundaries are explicit.** The spec must say what is NOT included. "This does not include real-time chat, push notifications for new messages, or read receipts." Prevents scope creep.

7. **One spec, one decision.** A spec proposes one approach. If there are multiple approaches, the spec compares them with tradeoffs and recommends one. The founder decides, then the spec is updated. No open-ended specs.

## Required spec template

```
FEATURE SPEC: [name]

WHO NEEDS THIS:
[Specific scenario: "A woman arriving in Marrakech alone at 10pm who doesn't speak French"]

WHAT PROBLEM IT SOLVES:
[The pain: "She doesn't know which neighborhoods are safe to book accommodation in"]

TRIP PHASE: [dreaming | planning | pre-trip | during-trip | post-trip]

SIMPLEST VERSION:
[What ships first, in 2-3 sentences]

WHAT WE DO NOT BUILD:
[Explicit exclusions]

KILL METRIC:
[Signal that means remove or redesign]

DEPENDS ON:
[Other features or infrastructure required]

SAFETY IMPACT: [reference sola-safety-by-design skill]
DATA IMPACT: [reference sola-sensitive-data skill]
```

## Examples

**Feature: Neighborhood safety notes in country guides**

```
WHO NEEDS THIS:
A woman booking accommodation in a new city who wants to know which
neighborhoods are safe to stay in alone.

WHAT PROBLEM IT SOLVES:
Generic hotel booking apps don't surface safety info. She's reading
Reddit threads and outdated blog posts to figure out where to stay.

TRIP PHASE: planning, pre-trip

SIMPLEST VERSION:
Add a "Neighborhoods" section to city guides with 3-5 neighborhoods,
each with a one-sentence safety note from women who've visited.
Static data, editable via JSON. No user-generated content yet.

WHAT WE DO NOT BUILD:
- No real-time safety alerts
- No user-submitted reviews (Phase 2)
- No map integration
- No booking integration

KILL METRIC:
If <20% of users who view a city guide scroll to the neighborhoods
section within 60 days of launch, redesign the placement.

DEPENDS ON:
Country guide data structure (exists), city guide screens (exist)
```

**Feature: Trip countdown on home screen**

```
WHO NEEDS THIS:
A woman with an upcoming trip who wants a visual reminder of
how soon she's leaving and what she hasn't prepared yet.

WHAT PROBLEM IT SOLVES:
She has trip dates in Sola but no sense of urgency or
preparation milestones. Important prep (visa, safety brief,
emergency contacts) gets forgotten until departure day.

TRIP PHASE: pre-trip

SIMPLEST VERSION:
A card on the home screen showing: "Lisbon in 7 days" with
a checklist of 3 items: safety brief read, emergency contacts
set up, travel essentials saved. Tapping each item navigates
to the relevant screen.

WHAT WE DO NOT BUILD:
- No daily countdown notifications
- No packing list
- No weather forecast
- No flight tracking

KILL METRIC:
If <30% of users with an upcoming trip tap at least one
checklist item, remove the card.

DEPENDS ON:
Trip data with dates (exists), safety brief (exists),
emergency contacts (needs implementation)
```

## How this reduces founder dependency

The spec template forces structured thinking before code. Any contributor fills it out; the founder reviews a 10-line document instead of evaluating raw feature ideas. The kill metric means features don't accumulate indefinitely. The "what we do NOT build" section prevents scope conversations during development.
