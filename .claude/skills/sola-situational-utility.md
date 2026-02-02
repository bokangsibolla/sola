---
name: sola-situational-utility
description: Situational utility — every screen must answer "why would she open this RIGHT NOW?" Use when designing any screen, evaluating whether a feature should exist, or prioritizing work.
---

# Situational Utility

## When to trigger

- Designing any new screen
- Evaluating whether a feature should exist
- Prioritizing feature backlog
- Designing the home screen or any entry point
- Any time a screen feels "empty" or "incomplete"

## Core rules

1. **Every screen answers: "why would she open this RIGHT NOW?"** If there's no clear situational answer, the screen shouldn't exist or should be merged into one that has a clear trigger.

2. **Situations drive features, not categories.** Don't organize by feature type (guides, social, trips). Organize by situation:

| Situation | What she needs | What Sola shows |
|-----------|---------------|-----------------|
| "I just landed and I'm anxious" | Grounding, safety, essentials | Safety brief, emergency numbers, WiFi info, currency |
| "I'm bored at the hostel" | Connection, things to do | Travelers nearby, suggested places for tonight |
| "I'm planning a trip" | Inspiration, logistics, safety | Guides, budget info, neighborhood safety, dates |
| "Something feels wrong" | SOS, fast exit | Emergency numbers in 1 tap, share location with contact |
| "I want to remember this" | Capture, save | Save to collection, trip journal note |
| "Where should I eat right now?" | Nearby food, solo-friendly | Recommended places sorted by proximity and time of day |
| "I'm lonely tonight" | Human connection | Message a connection, community space |
| "I just got back" | Reflection, sharing | Post-trip prompt, share tips |
| "Someone's making me uncomfortable" | Quick exit, documentation | Fake call feature, SOS, note-to-self |

3. **Time-of-day awareness.** The same screen can serve different content at different times:
   - Morning: "Your day in Lisbon" — weather, breakfast spots, opening hours of saved places
   - Afternoon: saved places that are open now, walking distance
   - Evening: dinner spots, safety tips for the area, "travelers nearby tonight"
   - Night: emergency numbers prominently displayed, "get home safe" transit info

4. **Trip-phase awareness.** Content priority shifts with the trip lifecycle:
   - 30+ days before: destination guides, visa info, budget planning
   - 7 days before: safety brief, emergency contacts check, packing essentials
   - Day of arrival: airport info, transit to accommodation, first-night essentials
   - During trip: daily utility (food, places, people, safety)
   - Day of departure: transit to airport, "anything to share?"
   - After return: trip reflection, sharing, planning next trip

5. **If a screen is empty, it shouldn't exist yet.** Don't show empty states for features that aren't useful without data. If there are no travelers nearby, don't show an empty "Travelers Near You" section. Show something that IS useful right now.

6. **One primary action per screen.** Every screen has one thing it most wants the user to do. Make that thing obvious and easy. Everything else is secondary.

## Expected output

When designing a screen:

```
SITUATIONAL UTILITY SPEC
- Screen: [name]
- Primary situation: [when does she open this?]
- Primary action: [the ONE thing this screen enables]
- Time-of-day variants: [does content change? how?]
- Trip-phase variants: [does priority change? how?]
- Empty state: [what if there's no data? show this screen at all?]
- "Right now" test: [can you complete the sentence "she opens this because right now she..."]
```

## Examples

**Home screen:**
- Primary situation: "I just opened the app and want to see what's relevant to me"
- Primary action: depends on mode — if active trip: quick access to today's essentials. If planning: trip prep status. If between trips: "thinking about your next trip?"
- Time-of-day: morning shows today's plan, evening shows dinner/safety
- Trip-phase: 7 days out shows prep checklist, during trip shows daily utility
- Empty state: never empty — always shows something situationally relevant

**Explore tab:**
- Primary situation: "I'm researching a destination" or "I want to know about where I am"
- Primary action: find and read a guide for a specific country/city
- Trip-phase: if she has a trip, her destination's guide is pinned to the top
- Empty state: shows popular destinations for solo women, not an empty search

**SOS screen:**
- Primary situation: "Something is wrong and I need help now"
- Primary action: call emergency services or alert emergency contact
- Time-of-day: no variation — always instantly accessible
- "Right now" test: "she opens this because right now she feels unsafe"

## How this reduces founder dependency

The situation table is a reference that any contributor can use to evaluate their own work. "Does this screen serve a real situation?" is a concrete question with a yes/no answer. The "right now" test is a one-line validation anyone can apply. No product intuition required.
