import { colors } from '@/constants/design';
import type { EntryType, MoodTag, TripStatus, TripFull } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - entryDay.getTime()) / DAY_MS);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function nightsBetween(a: string, b: string): number {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY_MS));
}

export function getFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

export function tripDayNumber(trip: TripFull): number | null {
  if (trip.status !== 'active' || !trip.arriving) return null;
  const start = new Date(trip.arriving);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / DAY_MS) + 1;
}

export const STATUS_COLORS: Record<TripStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: colors.neutralFill, text: colors.textSecondary, label: 'Draft' },
  planned: { bg: colors.blueFill, text: colors.blueSoft, label: 'Upcoming' },
  active: { bg: colors.greenFill, text: colors.greenSoft, label: 'Active' },
  completed: { bg: colors.neutralFill, text: colors.textSecondary, label: 'Completed' },
};

export const ENTRY_ICONS: Record<EntryType, string> = {
  note: '\u{1F4DD}',
  arrival: '\u{2708}\u{FE0F}',
  departure: '\u{1F6EB}',
  stay: '\u{1F3E0}',
  tip: '\u{1F4A1}',
  comfort_check: '\u{1FAE7}',
  highlight: '\u{2728}',
};

export const ENTRY_LABELS: Record<EntryType, string> = {
  note: 'Note',
  arrival: 'Arrived',
  departure: 'Departed',
  stay: 'Staying at',
  tip: 'Tip',
  comfort_check: 'How I feel',
  highlight: 'Highlight',
};

export const MOOD_COLORS: Record<MoodTag, { bg: string; text: string; label: string }> = {
  calm: { bg: colors.greenFill, text: colors.greenSoft, label: 'Calm' },
  happy: { bg: colors.blueFill, text: colors.blueSoft, label: 'Happy' },
  uneasy: { bg: colors.warningFill, text: colors.warning, label: 'Uneasy' },
  unsafe: { bg: colors.emergencyFill, text: colors.emergency, label: 'Unsafe' },
};

export const TRAVEL_STYLE_OPTIONS = [
  { key: 'calm', label: 'Calm' },
  { key: 'social', label: 'Social' },
  { key: 'nature', label: 'Nature' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'food', label: 'Food' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'budget', label: 'Budget' },
] as const;

export function groupEntriesByDate(entries: { createdAt: string }[]): [string, typeof entries][] {
  const groupMap = new Map<string, typeof entries>();
  const keys: string[] = [];
  for (const entry of entries) {
    const key = formatDateRelative(entry.createdAt);
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
      keys.push(key);
    }
    groupMap.get(key)!.push(entry);
  }
  return keys.map((k) => [k, groupMap.get(k)!]);
}
