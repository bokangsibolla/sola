# Together — Activity Companion Discovery

> Design doc for Sola's social activity matching feature.
> Date: 2026-02-25

## Overview

Together lets solo travelers find companions for specific activities. Two mechanics in one system:

- **Open Plan** — You have something in your itinerary and open it up for others to join
- **Looking For** — You don't have a specific plan yet and want to find someone to do something with

Both types live in a single feed, accessed from the Connect tab.

## Core Principles

- Opt-in everything. Nothing is shared by default.
- Host has full control. Accept, decline, close — no pressure.
- Safety-first. Profile requirements, city gating, silent declines.
- Intimate scale. Max 5 companions per post. This isn't group tours.
- Premium tone. "Together" — warm, intentional, not transactional.

---

## Post Types

### Open Plan

Triggered from an existing itinerary block. The user toggles an activity as "open to company."

- Pre-filled with activity name, date, time, city from the itinerary block
- User adds: a short note, max companions, activity category
- Linked to the itinerary block — if the block is rescheduled or deleted, the Together post updates or cancels automatically

### Looking For

Standalone post created from the Together feed. No itinerary link required.

- User provides: title, description, activity category, city, date/time (or "Flexible"), max companions
- City auto-suggested from upcoming trips
- More open-ended: "Anyone want to explore Chatuchak Market this weekend?"

---

## Discovery

### Where it lives

Dedicated section under the **Connect tab**. Toggle at the top: "Community" | "Together."

### Feed behavior

- Filtered to cities and dates relevant to the viewer's trips
- If you have an upcoming trip to Bangkok (Mar 5-12), you see Together posts in Bangkok around those dates
- If you have no trips, you can manually browse by city
- Sorted by date (soonest first), "happening today" prioritized

### Together card

Each card shows:

- Poster's photo, first name, travel style tags
- Activity type icon + title
- Date/time (or "Flexible")
- City + neighborhood
- Short note from the poster
- Spots available ("1-2 people welcome")
- Subtle Open Plan vs Looking For indicator

### Filtering

- **Activity type pills**: Food, Culture, Adventure, Nightlife, Day trip, Wellness, Shopping, Other
- **Timeframe pills**: Today, This week, Flexible

### Empty state

"No one's posted yet for Bangkok this week. Be the first — open up a plan or post what you're looking for."

---

## Connection Flow

### Requesting to join

1. Tap a Together card → full detail view
2. Detail shows: activity info, host's mini profile (photo, bio snippet, travel style, trip count on Sola), notes
3. Tap "Request to Join" → sheet slides up for an optional note ("Hey! I've been wanting to try that class too")
4. Request sent → card shows "Requested" state. Can cancel before host responds.

### Host side

1. Push notification: "Sarah wants to join your cooking class"
2. Host opens Together → sees pending requests on their post
3. Each request shows: requester's photo, name, bio snippet, travel style tags, their note
4. Host taps "Accept" or "Decline"
5. **Decline is silent** — no rejection notification. The request quietly disappears from the requester's view.
6. Unresponded requests fade after 48 hours.

### After accepting

- A DM thread is automatically created between the two
- Pre-populated with context: "You're both going to Cooking class at Silom Thai — Thu Mar 6, 2pm"
- Coordination happens in DMs (meeting point, what to bring, etc.)

### Host post management

- Host can close the post at any time ("No longer accepting requests")
- If host cancels the itinerary block, requesters get: "This plan was updated — check with [host] for details"
- Accepted companions can be removed before the activity (with gentle notification)

---

## Creating a Post

### Entry point 1: From itinerary (Open Plan)

- On trip day view, each itinerary block gets a small "Open to Together" toggle
- Tap → compact sheet, pre-filled from the block
- Add: note, max companions, activity category
- One tap to publish

### Entry point 2: From Together feed (Looking For)

- "+" button on the Together feed
- Step 1: What — title + description + category
- Step 2: Where — auto-suggests from upcoming trips, or search
- Step 3: When — date/time, or toggle "Flexible"
- Step 4: How many — 1-5
- Post it

### Managing posts

- "My Posts" section in Together feed (tab: "Feed" | "My Posts")
- Pending request count badge on each post
- Can close, edit, or delete posts
- Posts auto-close after the activity date passes
- Posts auto-cancel if the linked itinerary block is deleted

---

## Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| New request on your post | Host | Push + in-app |
| Your request was accepted | Requester | Push + in-app (links to DM) |
| Post you requested was updated/cancelled | Requester | In-app |
| Request declined | — | **No notification** (silent) |
| Unresponded request (48h) | — | Quietly removed |

---

## Data Model

### `together_posts`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| trip_id | uuid | FK → trips, nullable |
| post_type | text | 'open_plan' \| 'looking_for' |
| itinerary_block_id | uuid | FK → itinerary_blocks, nullable (Open Plan only) |
| title | text | Activity name or description |
| description | text | Short note/context |
| city_id | int | FK → cities |
| country_iso2 | text | For filtering |
| activity_date | date | Nullable for flexible posts |
| start_time | time | Nullable |
| end_time | time | Nullable |
| is_flexible | boolean | Default false |
| activity_category | text | 'food' \| 'culture' \| 'adventure' \| 'nightlife' \| 'day_trip' \| 'wellness' \| 'shopping' \| 'other' |
| max_companions | int | 1-5, default 2 |
| status | text | 'open' \| 'closed' \| 'cancelled' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `together_requests`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| post_id | uuid | FK → together_posts |
| requester_id | uuid | FK → auth.users |
| note | text | Optional message |
| status | text | 'pending' \| 'accepted' \| 'declined' \| 'cancelled' |
| responded_at | timestamptz | When host acted |
| created_at | timestamptz | |

### RLS Policies

- **Read posts**: Any verified user can read posts where `status = 'open'`. Blocked users excluded.
- **Write posts**: Only `auth.uid() = user_id` can insert/update/delete.
- **Read requests**: Post owner can read all requests on their posts. Requester can read their own.
- **Write requests**: Requester can insert and cancel their own. Post owner can accept/decline.

### Indexes

- `together_posts(city_id, activity_date, status)` — main feed query
- `together_posts(user_id, status)` — "my posts"
- `together_requests(post_id, status)` — requests per post
- `together_requests(requester_id, status)` — "my requests"

### DMs

No new tables. On accept, create a conversation using the existing messaging system with the activity context as the opening message.

---

## Safety & Trust

### Access requirements

- Completed profile required (photo + bio). No empty-profile lurking.
- Must have a trip in the relevant city to post. Prevents aimless browsing.
- Posts only visible to users with overlapping city + dates.

### Host controls

- Accept or decline at any time, no reason needed
- Close the post at any time
- Remove an accepted companion before the activity
- Block a user directly from the request screen

### Requester protections

- Silent declines — requests quietly fade after 48 hours if unresponded
- Cancel request anytime
- Block/report host from detail view

### Reporting

- Standard Sola report flow on any Together post or profile
- Reasons: "Inappropriate content", "Suspicious behavior", "Spam", "Made me uncomfortable"
- Reported posts hidden from reporter immediately

### Automatic safeguards

- **No external links** — posts can't include phone numbers, social handles, or URLs. Communication stays in-app.
- **Max 3 open posts** per user at a time. Prevents feed spam.
- **Max 10 pending requests** per user per day. Prevents mass-requesting.
- **Auto-archive** posts older than 7 days, even if date hasn't passed.

### What we don't do

- No real-time location sharing
- No "currently at" signals
- No ratings or reviews of companions after meetups
