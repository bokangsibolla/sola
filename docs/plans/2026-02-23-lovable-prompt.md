# Lovable Prompt — Sola Landing Page

Paste this into Lovable as a single message:

---

Build a single-page landing page for "Sola" — a travel planning app for women who travel solo. This is a conversion-focused launch page. Android launches March 8, 2026. iOS launches late March 2026. There are 50 early access beta spots available before March 8.

## Design System

Font: Plus Jakarta Sans (Google Fonts) — weights 400, 500, 600, 700. No other fonts.

Colors:
- Background: #FFFFFF
- Surface (alternating sections): #FAFAF8
- Orange (primary CTA): #E5653A
- Orange fill (warm accent): #FFF5F1
- Text primary: #0E0E0E
- Text secondary: #6B6B6B
- Text muted: #9A9A9A
- Border: #E8E8E8
- Border subtle: #F0F0F0
- Neutral fill: #F3F3F3
- Dark section: #0E0E0E

Spacing: 24px screen padding mobile, max-width 1120px centered desktop. 80px section spacing mobile, 120px desktop. Border radius: 8px cards, 14px buttons, 12px inputs.

Visual rules: No box shadows on cards — use 1px solid #E8E8E8 borders instead. No gradients. No decorative icons. Generous whitespace. Rounded corners on everything. The only exception is the phone mockup placeholder which can have a soft shadow (0 20px 60px rgba(0,0,0,0.08)).

## Page Sections

### 0. Sticky Nav Bar
White background. Subtle bottom border on scroll (1px solid #E8E8E8). Slight backdrop blur on scroll.
- Left: "sola" wordmark in #0E0E0E, Plus Jakarta Sans Bold, 20px, lowercase
- Right: Single orange button "Get Early Access" — scrolls to #early-access section
- No other nav links

### 1. Hero Section
Background: #FFFFFF. Centered text on mobile. On desktop: text left, phone mockup placeholder right.

Above the headline, show an announcement pill: "ANDROID EARLY ACCESS — 50 spots open →" — styled as an inline pill with #FFF5F1 background, #E5653A text, 13px semiBold, uppercase, letter-spacing 1px. Clicking it scrolls to #early-access.

Headline (36px mobile / 56px desktop, weight 700):
"Women can go anywhere."

Subheadline (18px, weight 400, color #6B6B6B):
"A travel planning app for women who travel solo.
Destinations. Itineraries. Safety. Community."

Two CTA buttons stacked on mobile, side by side on desktop:
1. "Join Android Early Access" — #E5653A background, white text, 48px height, 14px radius. Scrolls to #early-access.
2. "Join iOS Waitlist" — #F3F3F3 background, #0E0E0E text, same dimensions. Scrolls to #waitlist.

Below buttons: "Android launches March 8 · iOS coming late March" — 14px, #9A9A9A.

Phone mockup: Show a placeholder rectangle styled like a phone (rounded corners, slight shadow, 9:19.5 aspect ratio) with a gray gradient interior and text "App Screenshot" centered. On mobile it's centered below the text. On desktop it floats to the right of the text, slightly rotated 3 degrees.

### 2. What Sola Is
Background: #FAFAF8. Section label: "WHAT SOLA IS" — 12px semiBold, uppercase, #9A9A9A, letter-spacing 1.5px.

Three cards side by side on desktop, stacked on mobile. White background, 1px solid #E8E8E8 border, 8px radius, 24px padding.

Card 1:
Title (18px semiBold): "Not a booking engine."
Body (16px regular, #6B6B6B): "We don't sell flights or hotel rooms. Sola is where you plan the trip — not where you pay for it."

Card 2:
Title: "Not a generic travel guide."
Body: "No copy-paste 'top 10' lists. Every destination is curated with context that matters to women traveling alone."

Card 3:
Title: "A travel planning system."
Body: "Destinations, itineraries, accommodation, safety signals, day-by-day planning — built for how women actually travel."

### 3. Why Women Travel Differently
Background: #FFFFFF.

Section headline (24px mobile / 36px desktop, semiBold):
"Because women travel differently."

Four rows, each separated by a 1px solid #F0F0F0 divider. Each row has 24px vertical padding.

Row 1:
Bold (18px semiBold): "Planning is different."
Body (16px regular, #6B6B6B): "You research more. You prepare for things other travelers don't have to think about."

Row 2:
Bold: "Safety isn't optional."
Body: "You want to know which neighborhoods are walkable at night — not just which are trendy."

Row 3:
Bold: "Local insight matters more."
Body: "Generic advice doesn't cut it when you're navigating a city alone for the first time."

Row 4:
Bold: "Solo doesn't mean unsupported."
Body: "Traveling alone is a choice. Having no one to ask shouldn't be."

### 4. What You Can Do
Background: #FAFAF8.

Section headline: "Everything you need to plan a solo trip."

6 feature cards in a 2-column grid (1 column mobile). White background, 1px solid #E8E8E8 border, 8px radius, 20px padding. No icons — typography only.

1. Title (16px semiBold): "Discover destinations" — Desc (14px, #6B6B6B): "Browse countries, cities, and places curated for solo women travelers."
2. "Save places that matter" — "Bookmark restaurants, cafes, stays, and experiences to your trip."
3. "Build itineraries" — "Create multi-city trips with stops, dates, and accommodation."
4. "Add accommodation" — "Link your stays to each stop. See everything in one view."
5. "Plan day by day" — "Break each stop into daily plans. Know what you're doing every morning."
6. "Connect to maps" — "Open any saved place in Google Maps or Apple Maps with one tap."

On desktop, show a second phone mockup placeholder to the right of the grid (same style as hero mockup). On mobile, show it centered below the grid.

### 5. How It Works
Background: #FFFFFF.

Section headline: "How it works"

6 numbered steps, vertical list. Each step separated by 1px solid #F0F0F0 divider, 28px vertical padding.

Step numbers in #E5653A, 14px semiBold. Titles in 18px semiBold. Descriptions in 16px regular #6B6B6B.

01 "Create a trip" — "Name it. Set your dates. Add your first destination."
02 "Add stops" — "Build a multi-city route. Reorder cities as your plans change."
03 "Add accommodation" — "Link your Airbnb, hotel, or hostel to each stop."
04 "Save places" — "Browse the app. Find a restaurant you like. Save it to the right stop."
05 "Switch to daily mode" — "Break each stop into day-by-day plans. Drag places into the right day."
06 "Export to calendar" — "Sync your trip to Google Calendar or Apple Calendar. Every day, every plan."

### 6. Community
Background: #FFF5F1 (warm accent section).

Section headline: "Women asking real questions."

3 thread preview cards. White background, 1px solid #E8E8E8 border, 8px radius, 20px padding. Stacked vertically with 12px gap.

Thread 1: "Is it safe to walk alone at night in Medellín?" — "12 replies" (14px, #9A9A9A)
Thread 2: "Best co-working cafes in Chiang Mai for solo travelers?" — "8 replies"
Thread 3: "How to handle unwanted attention in Morocco — what actually works?" — "23 replies"

Closing line below cards: "Real questions. Practical answers. No forums. No noise." — 16px, #6B6B6B.

### 7. Early Access CTA (id="early-access")
Background: #FFFFFF. Centered content, max-width 480px.

Headline (24px mobile / 36px desktop, semiBold): "Get in before everyone else."

Body (16px, #6B6B6B): "50 early access spots for Android. Be one of the first to use Sola before public launch on March 8."

Email form:
- Email input: placeholder "your@email.com", #F3F3F3 background, no border (1px solid transparent, on focus: 1px solid #E5653A), 12px radius, 48px height, 16px padding.
- Submit button below input: "Apply for Early Access", #E5653A background, white text, 48px height, full width, 14px radius.
- On submit: validate email, show success state: replace form with "You're in. We'll be in touch before March 8." in #2D8A4E green text.

Microcopy below button: "No spam. Just early access." — 14px, #9A9A9A.

For now, use local state to handle the form submission (just toggle a success boolean). I'll connect Supabase later.

### 8. Final CTA (id="waitlist")
Background: #0E0E0E (dark). All text white. Centered, generous padding (80px mobile, 120px desktop).

Headline (28px mobile / 36px desktop, semiBold, white): "Ready to plan your next trip?"

Two buttons stacked on mobile, side by side on desktop:
1. "Join Android Early Access" — #E5653A background, white text, 48px height, 14px radius. Scrolls to #early-access.
2. "Join iOS Waitlist" — transparent background, 1px solid rgba(255,255,255,0.3) border, white text, same dimensions.

Below buttons, an inline email form: email input (#1A1A1A background, 1px solid rgba(255,255,255,0.15) border, white text, placeholder "your@email.com" in rgba(255,255,255,0.4)) + "Join" button (#E5653A, white text) — side by side. Max-width 420px centered.

"or" text between buttons and email form — 14px, rgba(255,255,255,0.4).

Timeline: "Android March 8 · iOS late March" — 14px, rgba(255,255,255,0.5).

### 9. Footer
Background: #0E0E0E (continuous from section 8, no visual break). Separated by a 1px solid rgba(255,255,255,0.1) line.

Centered layout:
- "sola" wordmark — white, Plus Jakarta Sans Bold, 20px, lowercase
- Links: "Privacy Policy" (href="/privacy") · "Terms of Service" (href="/terms") — 14px, rgba(255,255,255,0.5). Open in new tab.
- Contact: "team@solatravel.app" — mailto link, 14px, rgba(255,255,255,0.5)
- Copyright: "© 2026 Sola Travel" — 14px, rgba(255,255,255,0.3)

## Animations
- Fade-in on scroll: each section fades in and translates up 20px as it enters the viewport. Use IntersectionObserver. Duration 600ms, ease-out. Stagger child elements by 100ms.
- Phone mockup: subtle float animation (translateY -8px to 8px, 3s ease-in-out infinite).
- No animation on CTA buttons — they should be immediately actionable.
- Smooth scroll behavior for all anchor links.

## SEO
Title: "Sola — Travel Planning for Women Who Go Alone"
Meta description: "A travel planning app for solo women travelers. Destinations, itineraries, safety, community. Android launching March 8, 2026."
OG title: "Sola — Travel Planning for Women Who Go Alone"
OG description: "Plan solo trips with confidence. Curated destinations, day-by-day itineraries, safety signals, and a community of women who travel alone."

## Important
- Mobile-first responsive design
- No emojis anywhere in the UI
- No stock illustrations
- No generic startup phrases
- The tone is calm, premium, editorial — like Aesop's website meets Airbnb's editorial pages
- Absolutely no serif fonts
- Keep it clean. Let it breathe. Less is more.
