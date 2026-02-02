---
name: sola-qa-regression
description: QA and regression prevention. Use when writing any feature code, fixing bugs, or reviewing PRs. Tests ship with the feature, not after.
---

# QA and Regression Prevention

## When to trigger

- Writing any new feature code
- Modifying any existing screen or component
- Fixing a bug
- Reviewing any PR

## Core rules

1. **Every new screen gets a snapshot test.** Catches unintended visual regressions.
2. **Every data flow gets an integration test.** Any function that reads, transforms, or writes data must verify input/output.
3. **Every safety feature gets an E2E test.** SOS, emergency contacts, safety ratings — tested end-to-end because failure is not acceptable.
4. **Tests ship with the feature.** A PR without tests for new functionality is incomplete.
5. **Fix the test, not the snapshot.** If a snapshot fails, read the diff. Intentional change? Update. Unintentional? You found a bug.

## Test naming convention

```
it('<verb>s <what> when <condition>')
```

Examples: `it('renders empty state when no trips exist')`, `it('calls onPress when tapped')`, `it('displays error when network fails')`

## Required tests by feature type

### New screen
- [ ] Snapshot (default state)
- [ ] Snapshot (loading, empty, error states)
- [ ] Navigation (mounts, back works)

### New component
- [ ] Snapshot (each visual variant)
- [ ] Interaction (onPress, onSubmit)
- [ ] Accessibility (accessible label present)

### New data flow (store, hook, API)
- [ ] Happy path returns correct data
- [ ] Empty state handled
- [ ] Error state handled

### Safety feature
All of the above, plus:
- [ ] E2E: full flow from trigger to resolution
- [ ] E2E: works offline or degraded connectivity
- [ ] E2E: correct data reaches correct recipient

### Bug fix
- [ ] Regression test reproducing original bug
- [ ] Test proves fix works

## Test file locations

Mirror app structure in `__tests__/`:
```
__tests__/screens/HomeScreen.test.tsx
__tests__/components/SafetyBadge.test.tsx
__tests__/hooks/useTrips.test.ts
__tests__/e2e/sos-flow.test.ts
```

## Pre-commit checks

1. `npx tsc --noEmit` — zero errors
2. `npx eslint . --ext .ts,.tsx` — zero errors
3. `npx jest --bail` — all pass
4. Snapshot diffs reviewed if changed

## Regression checklist (before any PR)

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] No hardcoded values (uses design tokens)
- [ ] No console.log or debug statements
- [ ] No PII in test fixtures
- [ ] Safe area handling verified
- [ ] Tested on small screen (iPhone SE) and large screen (iPhone 15 Pro Max)

## How this reduces founder dependency

The test requirements per feature type are explicit. No one needs to ask "what should I test?" The regression checklist is a gate, not a guideline. If it fails, the PR is incomplete.
