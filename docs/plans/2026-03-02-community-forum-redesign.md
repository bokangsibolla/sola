# Community Tab Forum Redesign

**Date**: 2026-03-02
**Status**: Approved

## Problem

The Discussions tab looks like a blog, not a forum. Users don't realize they can post questions. Hero images and thumbnail cards create an editorial feel. Filter chips look cheap and generic.

## Design Decisions

### 1. Reddit-Clean Thread Cards
- **Text-only** — no images on thread cards, no FeaturedHeroCard
- **Vote arrows** (▲/▼) on left column (~36px) with count between
- **Right column**: Title (16px semiBold, max 2 lines) → meta line (topic · place · N answers) → author + time ago
- **Divider**: subtle 1px line between cards (no card borders/shadows)
- No avatars in feed (shown in thread detail)
- TEAM badge preserved for Sola Team posts

### 2. Sticky Compose Bar
- Always at top of feed (scrolls with content, part of FlatList header)
- Text input placeholder: "What would you like to ask?"
- Orange "Post" button on right
- Tapping navigates to `discussions/new` (existing screen)

### 3. Segmented Sort Control
- Three segments: New | Top | Relevant
- Rounded pill style, orange fill active state, muted inactive
- Maps to existing `sort` param in `ThreadFeedParams`

### 4. Filter Bottom Sheet
- Filter icon (≡) right of segmented control
- Orange dot when filters active
- Sheet contains: topic pills (single-select) + destination search
- Reuses existing `getCommunityTopics()` and country/city search
- "Apply Filters" + "Clear All" buttons
- No new Supabase queries needed

### 5. Search in Header
- Magnifying glass icon in NavigationHeader
- Expands inline search input from header
- Uses existing `searchQuery` param
- "Results for 'query'" label when active

## What Changes

| Component | Action |
|-----------|--------|
| Thread cards | Remove images, add vote column left, flatten layout |
| FeaturedHeroCard | Remove entirely |
| FilterBar (collapsed chips) | Replace with segmented control + filter icon |
| FilterBar (expanded panel) | Move to bottom sheet |
| Search chip | Move to header icon |
| ComposeCard | Simplify to input bar style |
| IntroBanner | Keep as-is (first-time only) |

## What Does NOT Change

- All Supabase queries and APIs (communityApi.ts)
- Data types (types.ts)
- Hooks (useCommunityFeed, useThread, useCommunityOnboarding)
- Thread detail screen (thread/[id].tsx)
- New thread screen (new.tsx)
- Vote system (castVote)
- Report system (ReportSheet)
- Navigation structure
