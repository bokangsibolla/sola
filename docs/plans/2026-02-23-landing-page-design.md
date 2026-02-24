# Sola Launch Landing Page — Design & Copy Spec

> **Date**: February 23, 2026
> **Target**: Lovable implementation
> **URL**: solatravel.app
> **Android launch**: March 8, 2026
> **iOS launch**: Late March 2026

---

## Design Foundation

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#FFFFFF` | Page background |
| `surface` | `#FAFAF8` | Alternating section backgrounds |
| `orangeFill` | `#FFF5F1` | Soft accent sections, badge fills |
| `orange` | `#E5653A` | Primary CTAs, highlights |
| `textPrimary` | `#0E0E0E` | Headlines, body text |
| `textSecondary` | `#6B6B6B` | Supporting copy |
| `textMuted` | `#9A9A9A` | Captions, fine print |
| `border` | `#E8E8E8` | Card borders, dividers |
| `neutralFill` | `#F3F3F3` | Feature cards, input backgrounds |

### Typography
| Element | Font | Weight | Size (mobile / desktop) |
|---------|------|--------|------------------------|
| Hero headline | Plus Jakarta Sans | 700 (Bold) | 36px / 56px |
| Section headline | Plus Jakarta Sans | 600 (SemiBold) | 24px / 36px |
| Body | Plus Jakarta Sans | 400 (Regular) | 16px / 18px |
| Caption | Plus Jakarta Sans | 400 (Regular) | 14px / 14px |
| Button label | Plus Jakarta Sans | 600 (SemiBold) | 16px / 16px |
| Nav link | Plus Jakarta Sans | 500 (Medium) | 15px / 15px |

**Google Fonts import**: `Plus+Jakarta+Sans:wght@400;500;600;700`

### Spacing System
- Screen padding: `24px` (mobile), `48px` (tablet), `max-width: 1120px` centered (desktop)
- Section vertical spacing: `80px` (mobile), `120px` (desktop)
- Component gaps: `16px` small, `24px` medium, `32px` large
- Border radius: `8px` cards, `14px` buttons, `12px` inputs

### Visual Rules
- No box shadows on cards — use `1px solid #E8E8E8` borders
- Exception: phone mockup can use a soft `0 20px 60px rgba(0,0,0,0.08)` shadow for depth
- No gradients on UI elements
- No decorative icons as section markers
- Rounded corners on everything (no sharp edges)
- Generous whitespace — let the page breathe

---

## Page Structure

### 0. Navigation Bar

**Layout**: Sticky top bar, white background, subtle bottom border on scroll.

```
┌──────────────────────────────────────────────────────┐
│  sola                                 [Get Early Access] │
└──────────────────────────────────────────────────────┘
```

- **Left**: "sola" wordmark in `#0E0E0E`, Plus Jakarta Sans Bold, 20px, lowercase
- **Right**: Single CTA button — `Get Early Access` (orange fill, white text, 14px radius)
- No other nav links (single page — no need)
- On scroll: adds `border-bottom: 1px solid #E8E8E8` and slight background blur
- Mobile: same layout, button slightly smaller

---

### 1. Hero Section

**Background**: `#FFFFFF`
**Layout**: Centered text, stacked vertically. Phone mockup below on mobile, beside on desktop.

```
Mobile:                              Desktop:
┌─────────────────────┐              ┌────────────────────────────────────────┐
│                     │              │                                        │
│  ANDROID EARLY ACCESS              │  Women can                    ┌──────┐│
│  50 spots open →    │              │  go anywhere.                 │      ││
│                     │              │                               │  📱  ││
│  Women can          │              │  A travel planning app for    │ App  ││
│  go anywhere.       │              │  women who travel solo.       │ Mock ││
│                     │              │  Destinations. Itineraries.   │      ││
│  A travel planning  │              │  Safety. Community.           │      ││
│  app for women who  │              │                               │      ││
│  travel solo.       │              │  [Early Access] [Waitlist]    └──────┘│
│                     │              │                                        │
│  [Early Access]     │              │  Android March 8 · iOS late March     │
│  [Join iOS Waitlist]│              └────────────────────────────────────────┘
│                     │
│     ┌──────────┐    │
│     │  Phone   │    │
│     │  Mockup  │    │
│     │          │    │
│     └──────────┘    │
│                     │
└─────────────────────┘
```

#### Copy

**Announcement bar** (above headline):
```
ANDROID EARLY ACCESS — 50 spots open →
```
Small pill/banner in `orangeFill` background, `orange` text, 13px semiBold, uppercase tracking. Links to early access form section.

**Headline**:
```
Women can go anywhere.
```

**Subheadline**:
```
A travel planning app for women who travel solo.
Destinations. Itineraries. Safety. Community.
```
Color: `textSecondary` (#6B6B6B), 18px regular.

**Primary CTA (pre-March 8)**:
```
Join Android Early Access
```
Style: Orange fill (`#E5653A`), white text, 48px height, full-width on mobile, auto-width desktop. 14px border radius.
Action: Scrolls to Early Access section (#early-access).

**Primary CTA (post-March 8)**:
```
Download on Google Play
```
Style: Same orange. Includes small Play Store icon.
Action: Links to Play Store listing.

**Secondary CTA**:
```
Join iOS Waitlist
```
Style: `#F3F3F3` background, `#0E0E0E` text. Same dimensions.
Action: Scrolls to waitlist form section (#waitlist).

**Timeline note** (below buttons):
```
Android launches March 8 · iOS coming late March
```
Color: `textMuted` (#9A9A9A), 14px.

#### Phone Mockup
- Show the Sola explore/discover screen
- Phone frame: minimal dark bezel or no bezel (modern mockup)
- Slight tilt (3-5° rotation) for visual interest — optional, can be straight
- Shadow: `0 20px 60px rgba(0,0,0,0.08)` for floating effect
- Use a placeholder screenshot of the app UI

#### Hero Headline Alternatives

| # | Headline | Tone |
|---|----------|------|
| 1 | **Women can go anywhere.** | Confident, declarative (recommended) |
| 2 | **Go anywhere. Plan everything.** | Action-oriented, practical |
| 3 | **Travel planning, built for women who go alone.** | Descriptive, specific |
| 4 | **Solo travel. Thoughtfully planned.** | Minimal, premium |
| 5 | **The world is yours to plan.** | Aspirational but restrained |

**Recommendation**: Option 1. It's bold without being loud. Aligns with brand voice. Works as a statement and a mission.

---

### 2. What Sola Is

**Background**: `#FAFAF8` (surface)
**Layout**: Three short text blocks side by side (desktop) or stacked (mobile). No icons.

```
┌────────────────────────────────────────────────┐
│                                                │
│  What Sola is                                  │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Not a    │  │ Not a    │  │ A travel │     │
│  │ booking  │  │ generic  │  │ planning │     │
│  │ engine.  │  │ guide.   │  │ system   │     │
│  │          │  │          │  │ built    │     │
│  │ We don't │  │ No copy- │  │ for how  │     │
│  │ sell     │  │ paste    │  │ women    │     │
│  │ flights. │  │ lists.   │  │ actually │     │
│  │          │  │          │  │ travel.  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                │
└────────────────────────────────────────────────┘
```

#### Copy

**Section label**: `WHAT SOLA IS` — 12px semiBold, uppercase, `textMuted`, letter-spacing 1.5px

**Card 1**:
> **Not a booking engine.**
> We don't sell flights or hotel rooms. Sola is where you plan the trip — not where you pay for it.

**Card 2**:
> **Not a generic travel guide.**
> No copy-paste "top 10" lists. Every destination is curated with context that matters to women traveling alone.

**Card 3**:
> **A travel planning system.**
> Destinations, itineraries, accommodation, safety signals, day-by-day planning — built for how women actually travel.

**Card style**: White background (`#FFFFFF`), `1px solid #E8E8E8` border, 8px radius, 24px padding. Title in 18px semiBold, body in 16px regular `textSecondary`.

---

### 3. Why Women Travel Differently

**Background**: `#FFFFFF`
**Layout**: Section title left-aligned. Four rows, each with a short bold statement and one supporting sentence.

```
┌────────────────────────────────────────────────┐
│                                                │
│  Because women travel differently.             │
│                                                │
│  ─────────────────────────────────────         │
│  Planning is different.                        │
│  You research more. You prepare for things     │
│  other travelers don't have to think about.    │
│  ─────────────────────────────────────         │
│  Safety isn't optional.                        │
│  You want to know which neighborhoods are      │
│  walkable at night. Not just which are trendy. │
│  ─────────────────────────────────────         │
│  Local insight matters more.                   │
│  Generic advice doesn't cut it when you're     │
│  navigating a city alone for the first time.   │
│  ─────────────────────────────────────         │
│  Solo doesn't mean unsupported.                │
│  Traveling alone is a choice. Having no one    │
│  to ask shouldn't be.                          │
│  ─────────────────────────────────────         │
│                                                │
└────────────────────────────────────────────────┘
```

#### Copy

**Section headline**:
```
Because women travel differently.
```
36px semiBold (desktop), 24px (mobile).

**Row 1**:
> **Planning is different.**
> You research more. You prepare for things other travelers don't have to think about.

**Row 2**:
> **Safety isn't optional.**
> You want to know which neighborhoods are walkable at night — not just which are trendy.

**Row 3**:
> **Local insight matters more.**
> Generic advice doesn't cut it when you're navigating a city alone for the first time.

**Row 4**:
> **Solo doesn't mean unsupported.**
> Traveling alone is a choice. Having no one to ask shouldn't be.

**Layout style**: Each row separated by a `1px solid #F0F0F0` divider. Bold statement in 18px semiBold `textPrimary`. Supporting line in 16px regular `textSecondary`. Vertical padding: 24px per row.

---

### 4. What You Can Do in the App

**Background**: `#FAFAF8`
**Layout**: Section title + 6-item grid (2 columns desktop, 1 column mobile). Phone mockup alongside on desktop.

```
Desktop:
┌────────────────────────────────────────────────────────┐
│                                                        │
│  Everything you need to plan a solo trip.              │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────┐   ┌──────┐  │
│  │ Discover         │  │ Save places     │   │      │  │
│  │ destinations     │  │ that matter     │   │  📱  │  │
│  └─────────────────┘  └─────────────────┘   │ Trip │  │
│  ┌─────────────────┐  ┌─────────────────┐   │ Plan │  │
│  │ Build            │  │ Add             │   │ Mock │  │
│  │ itineraries      │  │ accommodation   │   │      │  │
│  └─────────────────┘  └─────────────────┘   │      │  │
│  ┌─────────────────┐  ┌─────────────────┐   └──────┘  │
│  │ Plan day         │  │ Connect to      │             │
│  │ by day           │  │ maps            │             │
│  └─────────────────┘  └─────────────────┘             │
│                                                        │
└────────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────┐
│                      │
│  Everything you need │
│  to plan a solo trip.│
│                      │
│  ┌──────┐  ┌──────┐  │
│  │Disc. │  │Save  │  │
│  └──────┘  └──────┘  │
│  ┌──────┐  ┌──────┐  │
│  │Build │  │Accom.│  │
│  └──────┘  └──────┘  │
│  ┌──────┐  ┌──────┐  │
│  │Day   │  │Maps  │  │
│  └──────┘  └──────┘  │
│                      │
│     ┌──────────┐     │
│     │  Phone   │     │
│     │  Mockup  │     │
│     └──────────┘     │
│                      │
└──────────────────────┘
```

#### Copy

**Section headline**:
```
Everything you need to plan a solo trip.
```

**Feature cards** (each card: title + one line):

| # | Title | Description |
|---|-------|-------------|
| 1 | **Discover destinations** | Browse countries, cities, and places curated for solo women travelers. |
| 2 | **Save places that matter** | Bookmark restaurants, cafes, stays, and experiences to your trip. |
| 3 | **Build itineraries** | Create multi-city trips with stops, dates, and accommodation. |
| 4 | **Add accommodation** | Link your stays to each stop. See everything in one view. |
| 5 | **Plan day by day** | Break each stop into daily plans. Know what you're doing every morning. |
| 6 | **Connect to maps** | Open any saved place in Google Maps or Apple Maps with one tap. |

**Card style**: `#FFFFFF` background, `1px solid #E8E8E8` border, 8px radius. Title in 16px semiBold. Description in 14px regular `textSecondary`. Padding 20px. No icons — typography only.

**Phone mockup**: Show trip planner screen (itinerary view with stops). Positioned right side on desktop, centered below grid on mobile.

---

### 5. How Trip Planning Works

**Background**: `#FFFFFF`
**Layout**: Vertical step sequence. Each step is a numbered row with title and description.

```
┌────────────────────────────────────────────────┐
│                                                │
│  How it works                                  │
│                                                │
│  01  Create a trip                             │
│      Name it. Set your dates. Add your         │
│      first destination.                        │
│                                                │
│  02  Add stops                                 │
│      Build a multi-city route. Reorder         │
│      cities as your plans change.              │
│                                                │
│  03  Add accommodation                         │
│      Link your Airbnb, hotel, or hostel        │
│      to each stop.                             │
│                                                │
│  04  Save places                               │
│      Browse the app. Find a restaurant you     │
│      like. Save it to the right stop.          │
│                                                │
│  05  Switch to daily mode                      │
│      Break each stop into day-by-day plans.    │
│      Drag places into the right day.           │
│                                                │
│  06  Export to calendar                        │
│      Sync your trip to Google Calendar or      │
│      Apple Calendar. Every day, every plan.    │
│                                                │
└────────────────────────────────────────────────┘
```

#### Copy

**Section headline**:
```
How it works
```

**Steps**:

| Step | Title | Description |
|------|-------|-------------|
| 01 | **Create a trip** | Name it. Set your dates. Add your first destination. |
| 02 | **Add stops** | Build a multi-city route. Reorder cities as your plans change. |
| 03 | **Add accommodation** | Link your Airbnb, hotel, or hostel to each stop. |
| 04 | **Save places** | Browse the app. Find a restaurant you like. Save it to the right stop. |
| 05 | **Switch to daily mode** | Break each stop into day-by-day plans. Drag places into the right day. |
| 06 | **Export to calendar** | Sync your trip to Google Calendar or Apple Calendar. Every day, every plan. |

**Number style**: `#E5653A` (orange), 14px semiBold, monospaced feel (use tabular nums or fixed width). Title: 18px semiBold. Description: 16px regular `textSecondary`.

**Dividers**: Subtle `1px solid #F0F0F0` between each step. Vertical padding: 28px per step.

---

### 6. Community Layer

**Background**: `#FFF5F1` (orangeFill) — warm accent section to break visual rhythm.
**Layout**: Section title + 3 example thread previews.

```
┌────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                │
│  Women asking real questions.                  │
│                                                │
│  ┌──────────────────────────────────────┐      │
│  │ Is it safe to walk alone at night    │      │
│  │ in Medellín?                         │      │
│  │ 12 replies                           │      │
│  └──────────────────────────────────────┘      │
│  ┌──────────────────────────────────────┐      │
│  │ Best co-working cafes in Chiang Mai  │      │
│  │ for solo travelers?                  │      │
│  │ 8 replies                            │      │
│  └──────────────────────────────────────┘      │
│  ┌──────────────────────────────────────┐      │
│  │ How to handle unwanted attention     │      │
│  │ in Morocco — what actually works?    │      │
│  │ 23 replies                           │      │
│  └──────────────────────────────────────┘      │
│                                                │
│  Real questions. Practical answers.            │
│  No forums. No noise.                          │
│                                                │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────────┘
```

#### Copy

**Section headline**:
```
Women asking real questions.
```

**Example threads** (display as cards):

| Thread title | Replies |
|-------------|---------|
| Is it safe to walk alone at night in Medellín? | 12 replies |
| Best co-working cafes in Chiang Mai for solo travelers? | 8 replies |
| How to handle unwanted attention in Morocco — what actually works? | 23 replies |

**Closing line**:
```
Real questions. Practical answers. No forums. No noise.
```
16px regular, `textSecondary`.

**Card style**: `#FFFFFF` background, `1px solid #E8E8E8` border, 8px radius. Thread title in 16px semiBold. Reply count in 14px `textMuted`. Padding 20px.

---

### 7. Early Access CTA

**Background**: `#FFFFFF`
**Layout**: Centered text block with email form.

```
┌────────────────────────────────────────────────┐
│                                                │
│  Get in before everyone else.                  │
│                                                │
│  50 early access spots for Android.            │
│  Be one of the first to use Sola before        │
│  public launch on March 8.                     │
│                                                │
│  ┌────────────────────────────────────┐        │
│  │  your@email.com                    │        │
│  └────────────────────────────────────┘        │
│  ┌────────────────────────────────────┐        │
│  │       Apply for Early Access       │        │
│  └────────────────────────────────────┘        │
│                                                │
│  No spam. Just early access.                   │
│                                                │
└────────────────────────────────────────────────┘
```

#### Copy

**Section headline**:
```
Get in before everyone else.
```

**Body**:
```
50 early access spots for Android. Be one of the first
to use Sola before public launch on March 8.
```

**Form**:
- Email input: placeholder `your@email.com`, `#F3F3F3` background, no visible border until focus, 12px radius, 48px height
- Submit button: `Apply for Early Access`, orange fill, white text, 48px height, full width on mobile
- On success: replace form with `You're in. We'll be in touch before March 8.`
- On duplicate: `You've already applied. We'll email you soon.`

**Microcopy** (below form):
```
No spam. Just early access.
```
14px, `textMuted`.

#### Data Model (Supabase)

Create table `waitlist`:
```sql
CREATE TABLE public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android', -- 'android' | 'ios'
  source TEXT DEFAULT 'landing',            -- 'landing' | 'early-access'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Only insert allowed (no read/update/delete from client)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);
```

The form should insert with `source = 'early-access'` and `platform = 'android'`.

---

### 8. Final Download / Waitlist CTA

**Background**: `#0E0E0E` (dark section — visual contrast for final push)
**Layout**: Centered. Bold headline. Two buttons. This is the closer.

```
┌────────────────────────────────────────────────┐
│ ████████████████████████████████████████████████│
│                                                │
│  Ready to plan your next trip?                 │
│                                                │
│  ┌────────────────────────────────────┐        │
│  │   Join Android Early Access        │        │
│  └────────────────────────────────────┘        │
│                                                │
│  ┌────────────────────────────────────┐        │
│  │   Join iOS Waitlist                │        │
│  └────────────────────────────────────┘        │
│                                                │
│  or                                            │
│                                                │
│  ┌────────────────────────────────────┐        │
│  │  your@email.com        [Join]      │        │
│  └────────────────────────────────────┘        │
│                                                │
│  Android March 8 · iOS late March              │
│                                                │
│ ████████████████████████████████████████████████│
└────────────────────────────────────────────────┘
```

#### Copy

**Headline** (white text on dark):
```
Ready to plan your next trip?
```
36px semiBold (desktop), 28px (mobile).

**Primary CTA (pre-March 8)**:
```
Join Android Early Access
```
Orange fill button. Scrolls to early access form or links to Play Store when live.

**Secondary CTA**:
```
Join iOS Waitlist
```
White outline button (`1px solid rgba(255,255,255,0.3)`), white text.

**Inline waitlist** (alternative — for users who just want to drop an email):
```
[your@email.com          ] [Join →]
```
Inline email + submit. Inserts with `source = 'landing'`, `platform = 'ios'`.

**Timeline text**:
```
Android March 8 · iOS late March
```
`rgba(255,255,255,0.5)`, 14px.

**Post-March 8 variant**:
- Replace "Join Android Early Access" with "Download on Google Play" (Play Store badge)
- Keep iOS waitlist as-is until iOS launches

---

### 9. Footer

**Background**: `#0E0E0E` (continuous from section 8, or `#FAFAF8` if section 8 is separated)
**Layout**: Simple, minimal. One line or two columns max.

```
┌────────────────────────────────────────────────┐
│                                                │
│  sola                                          │
│                                                │
│  Privacy Policy  ·  Terms of Service           │
│                                                │
│  team@solatravel.app                           │
│                                                │
│  © 2026 Sola Travel                            │
│                                                │
└────────────────────────────────────────────────┘
```

#### Content

- **Wordmark**: "sola" — same style as nav, but white (on dark) or dark (on light)
- **Legal links**: `Privacy Policy` → `/privacy` | `Terms of Service` → `/terms`
- **Contact**: `team@solatravel.app` (mailto link)
- **Copyright**: `© 2026 Sola Travel`
- **Social links** (optional): Instagram icon only if account exists. No placeholder socials.

**Style**: All text 14px. Links in `textMuted` color (or `rgba(255,255,255,0.5)` on dark). No decorative elements.

---

## CTA State Logic Summary

### Pre-March 8 (Current)

| Button | Label | Action | Style |
|--------|-------|--------|-------|
| Primary | `Join Android Early Access` | Scroll to #early-access form | Orange fill |
| Secondary | `Join iOS Waitlist` | Scroll to #waitlist form | Neutral fill / outline |
| Nav | `Get Early Access` | Scroll to #early-access form | Orange fill (small) |

### March 8+ (Android Live)

| Button | Label | Action | Style |
|--------|-------|--------|-------|
| Primary | `Download on Google Play` | Play Store link | Orange fill + Play icon |
| Secondary | `Join iOS Waitlist` | Scroll to #waitlist form | Neutral fill / outline |
| Nav | `Download App` | Play Store link | Orange fill (small) |

### Late March+ (Both Live)

| Button | Label | Action | Style |
|--------|-------|--------|-------|
| Primary | `Download on Google Play` | Play Store link | Orange fill |
| Secondary | `Download on App Store` | App Store link | Neutral fill |
| Nav | `Download` | Smart link (detects OS) | Orange fill (small) |

Implement this with a simple config object or environment variable (`LAUNCH_PHASE: 'pre-launch' | 'android-live' | 'both-live'`) that controls which buttons render.

---

## Conversion Flow Summary

```
User lands on page
  │
  ├─ Sees announcement pill → "50 spots" urgency
  │
  ├─ Reads hero → understands what Sola is in 3 seconds
  │
  ├─ Scrolls through value props → builds confidence
  │
  ├─ Sees features + trip planning → "I want this"
  │
  ├─ Community section → "This is real, not vaporware"
  │
  ├─ Early Access form → converts (Android)
  │     └─ Supabase insert: {email, platform: 'android', source: 'early-access'}
  │
  └─ Final CTA → catches remaining visitors
        ├─ Android early access
        └─ iOS waitlist → {email, platform: 'ios', source: 'landing'}
```

Two conversion points. No form fatigue (email only). No account creation required.

---

## Lovable Implementation Notes

### Section Components to Create

| Component | Props |
|-----------|-------|
| `NavBar` | `ctaLabel`, `ctaHref`, `logoText` |
| `HeroSection` | `headline`, `subheadline`, `primaryCta`, `secondaryCta`, `mockupSrc` |
| `ThreeCardGrid` | `label`, `cards: {title, body}[]` |
| `StackedRows` | `headline`, `rows: {title, body}[]` |
| `FeatureGrid` | `headline`, `features: {title, desc}[]`, `mockupSrc` |
| `StepSequence` | `headline`, `steps: {number, title, desc}[]` |
| `CommunityPreview` | `headline`, `threads: {title, replies}[]`, `closingLine` |
| `EmailCaptureForm` | `headline`, `body`, `buttonLabel`, `platform`, `source` |
| `FinalCta` | `headline`, `primaryCta`, `secondaryCta`, `emailForm` |
| `Footer` | `links`, `email`, `copyright` |

### Responsive Breakpoints
- Mobile: `< 640px` — single column, full-width buttons, stacked layout
- Tablet: `640px – 1024px` — 2 columns where applicable
- Desktop: `> 1024px` — max-width 1120px container, side-by-side layouts

### Animation Suggestions (Optional)
- **Fade-in on scroll**: Each section fades in + translates up 20px as it enters viewport. CSS `@keyframes` with `IntersectionObserver`, or Lovable's built-in scroll animations.
- **Phone mockup**: Subtle float animation (translateY ±8px, 3s ease-in-out infinite). Purely decorative.
- **No entrance animations on CTAs** — they should be immediately actionable.
- **Transition duration**: 300ms max, ease-out curve.

### Phone Mockup Assets Needed
1. **Hero**: Explore/discover feed screen
2. **Features section**: Trip planner / itinerary view
3. Export as PNG with transparent background, ~375×812px (iPhone aspect ratio)
4. Can use actual app screenshots or Figma mockups inside a device frame

### SEO & Meta

```html
<title>Sola — Travel Planning for Women Who Go Alone</title>
<meta name="description" content="A travel planning app for solo women travelers. Destinations, itineraries, safety, community. Android launching March 8, 2026.">
<meta property="og:title" content="Sola — Travel Planning for Women Who Go Alone">
<meta property="og:description" content="Plan solo trips with confidence. Curated destinations, day-by-day itineraries, safety signals, and a community of women who travel alone.">
<meta property="og:image" content="https://solatravel.app/og-image.png">
<meta property="og:url" content="https://solatravel.app">
<meta name="twitter:card" content="summary_large_image">
```

OG image: create a 1200×630px image with the Sola wordmark + tagline on white/warm background.

---

## Visual Tone Reference

**The landing page should feel like**:
- Aesop's website (calm, typographic, restrained luxury)
- Airbnb's editorial pages (structured, warm, photography-forward)
- Notion's marketing (clean, systematic, no visual noise)

**It should NOT feel like**:
- A startup template (gradient hero, stock illustrations, "Join 10,000+ users")
- A travel agency (busy, image-heavy, promotional)
- A social media app launch (playful, emoji-heavy, "Download now!!!")

**One word**: Considered.
