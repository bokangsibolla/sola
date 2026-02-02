---
name: sola-human-centered-design
description: Human-centered (not feature-centered) design. Use when designing any new feature or user flow. Start from the moment and emotion, not the feature name.
---

# Human-Centered Design

## When to trigger

- Designing any new feature or user flow
- Evaluating feature priority
- Writing specs or product requirements
- Reviewing whether a screen serves a real need

## Core rules

1. **Start from the moment, not the feature.** Never begin with "we need a notifications system." Begin with "she just landed in a city she's never been to, it's late, and she needs to know she's safe." The feature emerges from the moment.

2. **Every feature maps to a real scenario.** Not an abstract user story. A specific, vivid moment:
   - Anxious arrival: alone at the airport at 11pm, phone almost dead
   - Lonely evening: sitting in a hostel common room, everyone else is in groups
   - Planning excitement: just decided on Japan, wants to know everything
   - Safety concern: a man followed her for two blocks and she's scared
   - Memory capture: the sunset from this rooftop should be remembered
   - Post-trip glow: back home, wanting to share what she learned

3. **The 11pm test.** Every feature must pass: "She's alone in a new city at 11pm. Does this feature help her right now?" If the answer is "no, but it helps during planning" — that's fine, document which phase it serves. If the answer is "no, it's just a feature" — reconsider.

4. **Emotions are design inputs.** Map the emotional state at each journey point:
   - Dreaming: curiosity, possibility, slight overwhelm
   - Planning: excitement mixed with anxiety about logistics
   - Pre-trip: growing nervousness, need for preparation
   - Arrival: vulnerability, disorientation, need for grounding
   - During-trip: alternating confidence and loneliness
   - Post-trip: nostalgia, pride, desire to help the next woman

5. **No feature lists — journey maps.** Don't spec "messaging feature." Map the journey: she sees someone in the feed → reads her profile → they're both going to Lisbon in March → she sends a connection request → the other person accepts → they exchange a few messages → they meet for coffee in Lisbon → they check in with each other for the rest of the trip.

6. **Design for the hardest moment first.** If a feature works when she's scared, tired, and low on battery, it works everywhere. Start from the stress case, not the ideal case.

7. **The app disappears when it works.** The goal is not "she loves using Sola." The goal is "she barely noticed Sola was there, but it made her trip safer and less lonely." Sola succeeds by receding.

## Expected output

When designing a feature, produce a **Moment Map**:

```
MOMENT MAP: [feature name]

THE MOMENT:
[Vivid description of the scenario — who, where, when, emotional state]

WHAT SHE NEEDS:
[Not what we build — what she actually needs in this moment]

WHAT SOLA DOES:
[The minimal response that serves the need]

EMOTIONAL ARC:
[How she feels before → during → after using this feature]

11PM TEST:
[Does this help at 11pm in a new city? If not, which phase does it serve?]

STRESS CASE:
[What if she's scared, tired, low battery, no WiFi? Does it still work?]
```

## Examples

**Feature: Emergency contacts setup**

```
THE MOMENT:
She's setting up her profile before her first solo trip. She's
never thought about who to contact if something goes wrong abroad.
The thought is uncomfortable but she knows it's important.

WHAT SHE NEEDS:
A way to designate someone who'll know where she is if she
can't communicate. Without making the process feel morbid.

WHAT SOLA DOES:
During onboarding (or first trip creation), a simple prompt:
"Add someone who should know where you are. Just in case."
One name, one phone number. That's it. No explanations about
what could go wrong. She gets it.

EMOTIONAL ARC:
Before: slight anxiety about safety → During: "this is easy and
not dramatic" → After: quiet relief, one less thing to worry about

11PM TEST: Yes — if she set this up, and she triggers SOS at 11pm,
her person gets notified. The setup moment enables the crisis moment.

STRESS CASE: Contact info stored on device in SecureStore. Works
offline to display. SOS send requires connectivity but queues if offline.
```

**Feature: "Women who've been here" tips on place entries**

```
THE MOMENT:
She's looking at a cafe in Kyoto on Sola. She wants to know
not just "is it good?" but "is it the kind of place where a
woman alone will feel comfortable?"

WHAT SHE NEEDS:
Peer validation from someone like her. Not a generic review.
A signal that says "someone like me went here and felt good."

WHAT SOLA DOES:
A single tip line on place entries, attributed to a real user:
"Solo tip: 'Counter seats are perfect for one. Staff is warm.'"
No ratings. No review counts. One curated voice.

EMOTIONAL ARC:
Before: uncertainty about whether she'll feel awkward alone →
During: "okay, another woman sat here alone and it was fine" →
After: confidence to go

11PM TEST: Partially — helps for dinner spots at night, but
primarily serves the planning and during-trip phases.

STRESS CASE: Works offline if the guide was previously loaded.
No connectivity required to read saved tips.
```

## How this reduces founder dependency

The Moment Map template forces anyone designing a feature to think in human terms first. The 11pm test and stress case are concrete, binary checks — not subjective judgment calls. Any contributor can evaluate their own design against these criteria without waiting for product review.
