---
name: sola-master-index
description: Master index of all Sola skills. Quick reference for finding the right skill. Use when starting any task to identify which skills apply.
---

# Sola Skills — Master Index

## Quick lookup: "I'm about to..."

| I'm about to... | Check these skills |
|-----------------|-------------------|
| Write any user-facing text | feminist-ux-writing |
| Build a new screen or component | design-system, situational-utility |
| Add a feature | product-spec, human-centered-design, travel-companion |
| Touch user data | sensitive-data, safety-by-design |
| Add social features | safety-by-design, progressive-trust |
| Add notifications or alerts | calm-technology, ritual-design |
| Add personalization | personal-memory |
| Define success metrics | trust-retention |
| Display information to users | information-as-care |
| Choose a technology or service | low-ops |
| Build an operational workflow | founder-scale |
| Write tests | qa-regression |
| Merge a PR | anti-patterns, qa-regression |

## All skills by category

### Safety & Privacy
| Skill | Purpose | Trigger |
|-------|---------|---------|
| sola-safety-by-design | Women-first safety rules, Safety Impact Statement | Any feature touching identity, location, messaging, social |
| sola-sensitive-data | Data classification, encryption, retention, GDPR | Any data model, storage, API endpoint |
| sola-progressive-trust | Trust tiers, permission requests, verification | Any gated feature or device permission |

### Voice & Design
| Skill | Purpose | Trigger |
|-------|---------|---------|
| sola-feminist-ux-writing | Tone, banned words, copy patterns | Any user-facing text |
| sola-design-system | Visual tokens, component patterns, design checklist | Any UI component or screen |
| sola-calm-technology | Notification budget, animation limits, haptics | Any interruptive UI element |

### Product Philosophy
| Skill | Purpose | Trigger |
|-------|---------|---------|
| sola-product-spec | Feature specs, kill metrics, scope boundaries | Before starting any new feature |
| sola-human-centered-design | Moment maps, 11pm test, stress cases | Designing any feature or flow |
| sola-anti-patterns | Hard blacklist of what Sola never does | Final check before PR merge |
| sola-information-as-care | Progressive disclosure, trip-phase content | Any information display |

### Travel Experience
| Skill | Purpose | Trigger |
|-------|---------|---------|
| sola-travel-companion | Three modes, companion check, no busywork | Designing features, evaluating priority |
| sola-situational-utility | "Why open this right now?", time/phase awareness | Designing any screen |
| sola-personal-memory | Memory categories, no surveillance, deletable | Any personalization or recommendation |
| sola-ritual-design | Five ritual types, natural triggers, no guilt | Lifecycle features, notifications |
| sola-trust-retention | Trust metrics, anti-metrics, no re-engagement | Success metrics, analytics, KPIs |

### Operations & Scale
| Skill | Purpose | Trigger |
|-------|---------|---------|
| sola-founder-scale | Decision automation, moderation, alerts, dashboards | Any operational system or workflow |
| sola-low-ops | Managed services, Supabase-first, cost budget | Any architecture or infrastructure decision |
| sola-qa-regression | Test requirements, checklists, pre-commit checks | Any feature code or PR |

## Skill priority order

When multiple skills apply (they usually do), check in this order:

1. **safety-by-design** — safety violations are never acceptable
2. **anti-patterns** — blacklist violations are never acceptable
3. **product-spec** — does this feature justify its existence?
4. **human-centered-design** — does this serve a real moment?
5. **Domain skills** — design-system, feminist-ux-writing, sensitive-data, etc.
6. **Operations** — low-ops, founder-scale, qa-regression
