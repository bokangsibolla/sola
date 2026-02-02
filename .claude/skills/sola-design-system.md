---
name: sola-design-system
description: UI consistency and design system rules. Use when creating or modifying ANY React Native component, screen layout, or visual element. Source of truth is constants/design.ts.
---

# UI Consistency and Design System

## When to trigger

- Creating any new screen or component
- Modifying layout, colors, spacing, typography, or border radius
- Adding icons, images, or illustrations
- Reviewing any PR that changes visual appearance

## Design tokens (source of truth: constants/design.ts)

All visual values MUST come from the design tokens file. Never hardcode colors, spacing, or font values.

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| colors.background | #FFFFFF | Screen backgrounds |
| colors.textPrimary | #0E0E0E | Headings, primary body text |
| colors.textSecondary | #6B6B6B | Supporting text, descriptions |
| colors.textMuted | #9A9A9A | Placeholders, timestamps, captions |
| colors.orange | #E5653A | Primary action, brand accent |
| colors.orangeFill | #FFF5F1 | Selected chip/tag backgrounds |
| colors.borderDefault | #E8E8E8 | Card borders, dividers |
| colors.borderSubtle | #F0F0F0 | Subtle separators |
| colors.greenSoft | #2D8A4E | Success, safe ratings |
| colors.greenFill | #EEFBF3 | Green tag backgrounds |
| colors.warning | #D4940A | Caution, medium safety |
| colors.warningFill | #FDF8EC | Warning tag backgrounds |
| colors.blueSoft | #3B82F6 | Info, links |
| colors.blueFill | #EFF6FF | Blue tag backgrounds |

### Spacing
Use spacing scale only: screenX(24), xs(4), sm(8), md(12), lg(16), xl(24), xxl(32), xxxl(40), xxxxl(48). Never use arbitrary pixel values.

### Typography
- Headings: fonts.semiBold (PlusJakartaSans-SemiBold)
- Body: fonts.regular (PlusJakartaSans-Regular)
- Emphasis: fonts.medium (PlusJakartaSans-Medium)
- Display/emotional headings only: fonts.serif (InstrumentSerif-Regular) — used sparingly for hero moments
- Always use typography presets (h1, h2, body, bodyMuted, label, caption, captionSmall, button)

### Radius
sm(8) for chips, md(12) for medium elements, input(14) for inputs, card(14) for cards, button(16) for buttons, full(999) for circles.

## Core rules

1. **Every value from tokens.** No magic numbers. If `24` appears in a style, it must be `spacing.xl` or `spacing.screenX`.
2. **24px screen padding on every screen.** `paddingHorizontal: spacing.screenX`. No exceptions.
3. **Safe areas on every screen.** Use `useSafeAreaInsets()`. Account for top and bottom.
4. **44pt minimum touch targets.** Every tappable element must be at least 44x44 points.
5. **Flat design.** No shadows, no elevation, no gradients on UI chrome. Gradients allowed only on hero image overlays for text legibility.
6. **Cards: 1px border, no shadow.** `borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.card`.
7. **White background everywhere.** `colors.background`. No gray backgrounds.
8. **Serif for display only.** `fonts.serif` only for h1-level hero headings.
9. **Color means something.** Orange = action/brand. Green = safe/positive. Yellow = caution. Blue = info. Never decorative.
10. **Animations are calm.** Max 300ms for UI transitions. Gentle easing. No bouncing, wiggling, or attention-grabbing motion.

## Standard component patterns

### Primary button
```
backgroundColor: colors.orange, paddingVertical: spacing.lg, borderRadius: radius.button, full-width, 52px height
Text: typography.button, color: white
```

### Secondary button
```
backgroundColor: transparent, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.button
Text: typography.button, color: colors.textPrimary
```

### Chip (selected)
```
backgroundColor: colors.orangeFill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill
Text: typography.caption, color: colors.orange
```

### Empty state
```
Centered vertically. One line of colors.textMuted text in typography.body. No illustrations.
```

### Text input
```
borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.input, paddingHorizontal: spacing.lg, paddingVertical: spacing.md
```

## Design checklist (before any PR)

- [ ] All colors from design tokens
- [ ] All spacing from spacing scale
- [ ] Typography uses presets
- [ ] Touch targets >= 44pt
- [ ] Safe area respected
- [ ] Cards use 1px border pattern (no shadows)
- [ ] No gradients on UI elements
- [ ] Serif only for h1 hero headings
- [ ] Animations <= 300ms

## How this reduces founder dependency

Any contributor can build a screen that looks like Sola without design review. Tokens are the single source of truth. If a value isn't in `constants/design.ts`, it doesn't belong in the app.
