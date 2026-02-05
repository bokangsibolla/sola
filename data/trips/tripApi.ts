import { supabase } from '@/lib/supabase';
import { toCamel, rowsToCamel, getConnectedUserIds } from '@/data/api';
import type { Profile } from '@/data/types';
import type {
  TripFull,
  TripStop,
  TripEntry,
  TripSavedItem,
  TripBuddy,
  TripWithStops,
  GroupedTrips,
  CreateTripInput,
  CreateEntryInput,
  TripOverlapMatch,
  TripKind,
} from './types';
import { nightsBetween } from './helpers';

// ── Read ─────────────────────────────────────────────────────────

export async function getTripsGrouped(userId: string): Promise<GroupedTrips> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('arriving', { ascending: true, nullsFirst: false });
  if (error) throw error;

  const trips = rowsToCamel<TripFull>(data ?? []);

  // Fetch stops for all trips in one query
  const tripIds = trips.map((t) => t.id);
  const { data: stopsData } = await supabase
    .from('trip_stops')
    .select('*')
    .in('trip_id', tripIds.length > 0 ? tripIds : ['__none__'])
    .order('stop_order', { ascending: true });
  const allStops = rowsToCamel<TripStop>(stopsData ?? []);

  const stopsMap = new Map<string, TripStop[]>();
  for (const stop of allStops) {
    const arr = stopsMap.get(stop.tripId) || [];
    arr.push(stop);
    stopsMap.set(stop.tripId, arr);
  }

  const withStops: TripWithStops[] = trips.map((t) => ({
    ...t,
    stops: stopsMap.get(t.id) || [],
  }));

  let current: TripWithStops | null = null;
  const upcoming: TripWithStops[] = [];
  const past: TripWithStops[] = [];

  for (const trip of withStops) {
    if (trip.status === 'active') {
      current = trip;
    } else if (trip.status === 'completed') {
      past.push(trip);
    } else {
      upcoming.push(trip);
    }
  }

  past.sort((a, b) => (b.leaving ?? '').localeCompare(a.leaving ?? ''));

  return { current, upcoming, past };
}

export async function getTripWithStops(tripId: string): Promise<TripWithStops | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();
  if (error) return null;
  const trip = toCamel<TripFull>(data);

  const { data: stopsData } = await supabase
    .from('trip_stops')
    .select('*')
    .eq('trip_id', tripId)
    .order('stop_order', { ascending: true });
  const stops = rowsToCamel<TripStop>(stopsData ?? []);

  return { ...trip, stops: stops ?? [] };
}

export async function getTripEntries(tripId: string): Promise<TripEntry[]> {
  const { data, error } = await supabase
    .from('trip_entries')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return rowsToCamel<TripEntry>(data ?? []);
}

export async function getTripSavedItems(tripId: string): Promise<TripSavedItem[]> {
  const { data, error } = await supabase
    .from('trip_saved_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return rowsToCamel<TripSavedItem>(data ?? []);
}

export async function getTripOverlapMatches(tripId: string, userId: string): Promise<TripOverlapMatch[]> {
  const { data, error } = await supabase
    .from('trip_overlap_matches')
    .select('*')
    .eq('my_trip_id', tripId)
    .eq('my_user_id', userId);
  if (error) throw error;

  const { data: blocked } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);
  const blockedIds = new Set((blocked ?? []).map((b: { blocked_id: string }) => b.blocked_id));

  return rowsToCamel<TripOverlapMatch>(data ?? []).filter(
    (m) => !blockedIds.has(m.theirUserId)
  );
}

// ── Write ────────────────────────────────────────────────────────

function statusFromKind(kind?: TripKind, hasDates?: boolean): string {
  if (kind === 'currently_traveling') return 'active';
  if (kind === 'past_trip') return 'completed';
  if (hasDates) return 'planned';
  return 'draft';
}

export async function createTrip(userId: string, input: CreateTripInput): Promise<string> {
  const firstStop = input.stops[0];
  const destinationName = firstStop?.cityName || '';
  const countryIso2 = firstStop?.countryIso2 || '';
  const cityId = firstStop?.cityId || null;

  const nights = input.arriving && input.leaving
    ? nightsBetween(input.arriving, input.leaving)
    : 0;

  const status = statusFromKind(input.tripKind, !!(input.arriving && input.leaving));

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      destination_city_id: cityId,
      destination_name: destinationName,
      country_iso2: countryIso2,
      title: input.title || destinationName || 'New Journey',
      summary: input.summary || null,
      arriving: input.arriving || null,
      leaving: input.leaving || null,
      nights,
      status,
      privacy_level: input.privacyLevel || 'private',
      matching_opt_in: input.matchingOptIn ?? false,
      travel_style_tags: input.travelStyleTags || [],
      flexible_dates: input.flexibleDates ?? false,
      cover_image_url: input.coverImageUrl || null,
      notes: input.notes || null,
    })
    .select('id')
    .single();
  if (error) throw error;

  const tripId = data.id;

  if (input.stops.length > 0) {
    const stopRows = input.stops.map((s, i) => ({
      trip_id: tripId,
      stop_order: i,
      country_iso2: s.countryIso2,
      city_id: s.cityId || null,
      city_name: s.cityName || null,
      start_date: s.startDate || null,
      end_date: s.endDate || null,
    }));
    const { error: stopsError } = await supabase.from('trip_stops').insert(stopRows);
    if (stopsError) throw stopsError;
  }

  if (input.buddyUserIds && input.buddyUserIds.length > 0) {
    const buddyRows = input.buddyUserIds.map((uid) => ({
      trip_id: tripId,
      user_id: uid,
    }));
    await supabase.from('trip_buddies').insert(buddyRows);
  }

  if (input.matchingOptIn) {
    await supabase.from('trip_matching_preferences').insert({
      trip_id: tripId,
      style_tags: input.travelStyleTags || [],
    });
  }

  return tripId;
}

// ── Trip Buddies ─────────────────────────────────────────────────

export async function getTripBuddies(tripId: string): Promise<TripBuddy[]> {
  const { data, error } = await supabase
    .from('trip_buddies')
    .select('*')
    .eq('trip_id', tripId);
  if (error) throw error;
  return rowsToCamel<TripBuddy>(data ?? []);
}

export async function addTripBuddy(tripId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('trip_buddies').insert({
    trip_id: tripId,
    user_id: userId,
  });
  if (error) throw error;
}

export async function removeTripBuddy(tripId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_buddies')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function updateTrip(
  tripId: string,
  updates: Partial<{
    title: string;
    arriving: string | null;
    leaving: string | null;
    status: string;
    privacyLevel: string;
    matchingOptIn: boolean;
    travelStyleTags: string[];
    notes: string | null;
  }>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.arriving !== undefined) dbUpdates.arriving = updates.arriving;
  if (updates.leaving !== undefined) dbUpdates.leaving = updates.leaving;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.privacyLevel !== undefined) dbUpdates.privacy_level = updates.privacyLevel;
  if (updates.matchingOptIn !== undefined) dbUpdates.matching_opt_in = updates.matchingOptIn;
  if (updates.travelStyleTags !== undefined) dbUpdates.travel_style_tags = updates.travelStyleTags;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  if (updates.arriving && updates.leaving) {
    dbUpdates.nights = nightsBetween(updates.arriving, updates.leaving);
  }

  const { error } = await supabase.from('trips').update(dbUpdates).eq('id', tripId);
  if (error) throw error;
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw error;
}

export async function createTripEntry(userId: string, input: CreateEntryInput): Promise<TripEntry> {
  const { data, error } = await supabase
    .from('trip_entries')
    .insert({
      trip_id: input.tripId,
      user_id: userId,
      entry_type: input.entryType,
      title: input.title || null,
      body: input.body || null,
      location_name: input.locationName || null,
      mood_tag: input.moodTag || null,
      visibility: input.visibility || 'private',
      is_shareable_tip: input.isShareableTip ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamel<TripEntry>(data);
}

export async function deleteTripEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('trip_entries').delete().eq('id', entryId);
  if (error) throw error;
}

export async function addTripSavedItem(
  tripId: string,
  entityType: string,
  entityId: string,
  category?: string,
  notes?: string
): Promise<void> {
  const { error } = await supabase.from('trip_saved_items').upsert({
    trip_id: tripId,
    entity_type: entityType,
    entity_id: entityId,
    category: category || 'general',
    notes: notes || null,
  });
  if (error) throw error;
}

export async function removeTripSavedItem(tripId: string, entityType: string, entityId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_saved_items')
    .delete()
    .eq('trip_id', tripId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  if (error) throw error;
}

// ── Connected Profiles (for buddy picker) ───────────────────────

export async function getConnectedProfiles(userId: string, searchQuery?: string): Promise<Profile[]> {
  const connectedIds = await getConnectedUserIds(userId);
  if (connectedIds.length === 0) return [];

  let query = supabase
    .from('profiles')
    .select('*')
    .in('id', connectedIds);

  if (searchQuery && searchQuery.length > 0) {
    query = query.ilike('first_name', `%${searchQuery}%`);
  }

  const { data, error } = await query.limit(10);
  if (error) throw error;
  return rowsToCamel<Profile>(data ?? []);
}
