import { colors } from '@/constants/design';
import type {
  EntryType,
  MoodTag,
  TripStatus,
  TripFull,
  TripStop,
  TripAccommodation,
  TripTransport,
  AccommodationStatus,
  TransportType,
} from './types';
import type { TripDayWithBlocks } from './itineraryTypes';

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

/** Resolve the city for a given day based on which stop's date range it falls within. */
export function getCityIdForDay(day: TripDayWithBlocks, stops: TripStop[]): string | null {
  if (stops.length <= 1) return stops[0]?.cityId ?? null;
  if (!day.date) return stops[0]?.cityId ?? null;
  const stop = stops.find(
    (s) => s.startDate && s.endDate && s.startDate <= day.date! && day.date! <= s.endDate,
  );
  return stop?.cityId ?? stops[0]?.cityId ?? null;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Format "YYYY-MM-DD" → "Mon, 24 Feb" */
export function formatDayDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = SHORT_DAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  return `${weekday}, ${d} ${month}`;
}

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

// ── Accommodation helpers ────────────────────────────────────

export const ACCOMMODATION_STATUS_COLORS: Record<AccommodationStatus, { bg: string; text: string; label: string }> = {
  planned: { bg: colors.neutralFill, text: colors.textSecondary, label: 'Planned' },
  booked: { bg: colors.greenFill, text: colors.greenSoft, label: 'Booked' },
  confirmed: { bg: colors.greenFill, text: colors.greenSoft, label: 'Confirmed' },
};

/** Format a check-in/check-out range — "Mar 1–5" or "Mar 1 – Apr 2" */
export function formatDateRange(checkIn: string, checkOut: string): string {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const aMonth = MONTHS[a.getMonth()];
  const bMonth = MONTHS[b.getMonth()];
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${aMonth} ${a.getDate()}\u2013${b.getDate()}`;
  }
  return `${aMonth} ${a.getDate()} \u2013 ${bMonth} ${b.getDate()}`;
}

/** Number of nights between check-in and check-out dates (date strings). */
export function nightsCount(checkIn: string, checkOut: string): number {
  return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / DAY_MS));
}

/** Find the accommodation covering a specific date. */
export function getAccommodationForDay(
  accommodations: TripAccommodation[],
  date: string,
): TripAccommodation | null {
  return accommodations.find((a) => a.checkIn <= date && date < a.checkOut) ?? null;
}

// ── Transport helpers ────────────────────────────────────────

export const TRANSPORT_TYPE_ICONS: Record<TransportType, string> = {
  flight: '\u2708\uFE0F',
  train: '\uD83D\uDE82',
  bus: '\uD83D\uDE8C',
  car: '\uD83D\uDE97',
  ferry: '\u26F4\uFE0F',
  other: '\uD83D\uDE8F',
};

export const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  flight: 'Flight',
  train: 'Train',
  bus: 'Bus',
  car: 'Car',
  ferry: 'Ferry',
  other: 'Transport',
};

/** Format transport times — "11:30 → 13:00" */
export function formatTransportTimes(
  departureAt: string | null,
  arrivalAt: string | null,
): string | null {
  if (!departureAt && !arrivalAt) return null;
  const dep = departureAt ? formatTime(departureAt) : '?';
  const arr = arrivalAt ? formatTime(arrivalAt) : '?';
  return `${dep} \u2192 ${arr}`;
}

/** Check if a day involves inter-city travel based on transport records. */
export function isTransportDay(
  dayDate: string,
  transports: TripTransport[],
): boolean {
  if (!dayDate) return false;
  return transports.some((t) => {
    if (!t.departureAt) return false;
    const depDate = t.departureAt.slice(0, 10);
    return depDate === dayDate;
  });
}

/** Get transports departing on a specific date. */
export function getTransportsForDate(
  transports: TripTransport[],
  date: string,
): TripTransport[] {
  return transports.filter((t) => t.departureAt && t.departureAt.slice(0, 10) === date);
}
