// sola/components/explore/country/mappings.ts
// Pure mapping functions for the country page redesign.

import type { Country } from '@/data/types';

/** Map solo_level enum to a human-readable phrase. */
export function mapSoloLevel(level: Country['soloLevel']): string {
  switch (level) {
    case 'beginner': return 'Great for first-timers';
    case 'intermediate': return 'Best with some travel experience';
    case 'expert': return 'For confident solo travelers';
    default: return 'Suitable for solo travelers';
  }
}

/** Map safety_rating to a comfort-framed phrase. Never uses the word "safety". */
export function mapComfortLevel(rating: Country['safetyRating']): string {
  switch (rating) {
    case 'very_safe': return 'Very comfortable';
    case 'generally_safe': return 'Generally comfortable';
    case 'use_caution': return 'Comfortable with awareness';
    case 'exercise_caution': return 'Requires confidence';
    default: return 'Comfortable for most';
  }
}

/** Combine english_friendliness + internet_quality into a single "Getting around" phrase. */
export function mapGettingAround(
  english: Country['englishFriendliness'],
  internet: Country['internetQuality'],
): string {
  if (english === 'high') {
    return 'Easy — English widely spoken';
  }
  if (english === 'moderate') {
    return internet === 'excellent' || internet === 'good'
      ? 'Manageable — some English, good connectivity'
      : 'Manageable — some English';
  }
  // english === 'low' or null
  if (internet === 'excellent' || internet === 'good') {
    return 'Translation apps are your friend';
  }
  return 'Challenging — learn a few phrases';
}

/**
 * Extract the first sentence from a markdown string.
 * Strips headings, bold markers, and bullet prefixes before splitting.
 */
export function extractLeadSentence(md: string): string {
  const cleaned = md
    .replace(/^#+\s.*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s*/gm, '')
    .trim();

  const match = cleaned.match(/^(.+?[.!?])\s/);
  return match ? match[1] : cleaned.slice(0, 120);
}
