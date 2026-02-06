# Community Q&A Redesign

## Problem
The Reddit-style up/down arrows feel unclear and the feed lacks structure. Users need a travel Q&A experience: find relevant questions fast, see quality answers rise.

## Design

### Feed Screen
- Search-first: tall 52px search bar, placeholder "What do you want to know?"
- Card layout: topic + place pills at top, question title, small author row, single helpful vote + answer count
- Single upvote only (no downvote) — keeps community positive
- Vote button: outlined triangle + "X helpful", orange when active

### Thread Detail
- Single helpful button on thread and each answer
- Language: "answers" not "replies", "Write an answer..." placeholder
- Left border on answer cards stays
- Best answers sorted to top by vote_score

### No Backend Changes
- castVote API called with 'up' only — toggle on/off works as-is
- vote_score, triggers, migration unchanged
