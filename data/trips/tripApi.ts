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
  TripAccommodation,
  CreateAccommodationInput,
  UpdateAccommodationInput,
  TripTransport,
  CreateTransportInput,
  UpdateTransportInput,
  TripNotificationSettings,
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

// ── Public Trip Reads (for traveler profiles) ────────────────

export async function getPublicTripsGrouped(
  targetUserId: string,
): Promise<GroupedTrips> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', targetUserId)
    .order('arriving', { ascending: true, nullsFirst: false });
  if (error) throw error;

  const trips = rowsToCamel<TripFull>(data ?? []);

  const tripIds = trips.map((t) => t.id);
  if (tripIds.length === 0) return { current: null, upcoming: [], past: [] };

  const { data: stopsData } = await supabase
    .from('trip_stops')
    .select('*')
    .in('trip_id', tripIds)
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
    } else if (trip.status === 'planned') {
      upcoming.push(trip);
    }
  }

  past.sort((a, b) => (b.leaving ?? '').localeCompare(a.leaving ?? ''));

  return { current, upcoming, past };
}

export interface VisitedCountry {
  countryIso2: string;
  countryName: string;
  tripCount: number;
}

// ── Accommodations ──────────────────────────────────────────

export async function getTripAccommodations(tripId: string): Promise<TripAccommodation[]> {
  const { data, error } = await supabase
    .from('trip_accommodations')
    .select('*')
    .eq('trip_id', tripId)
    .order('check_in', { ascending: true });
  if (error) throw error;
  return rowsToCamel<TripAccommodation>(data ?? []);
}

export async function getAccommodationForDate(
  tripId: string,
  date: string,
): Promise<TripAccommodation | null> {
  const { data, error } = await supabase
    .from('trip_accommodations')
    .select('*')
    .eq('trip_id', tripId)
    .lte('check_in', date)
    .gt('check_out', date)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<TripAccommodation>(data) : null;
}

export async function createAccommodation(input: CreateAccommodationInput): Promise<TripAccommodation> {
  const { data, error } = await supabase
    .from('trip_accommodations')
    .insert({
      trip_id: input.tripId,
      place_id: input.placeId || null,
      name: input.name,
      check_in: input.checkIn,
      check_out: input.checkOut,
      address: input.address || null,
      location_lat: input.locationLat ?? null,
      location_lng: input.locationLng ?? null,
      booking_url: input.bookingUrl || null,
      booking_ref: input.bookingRef || null,
      cost: input.cost ?? null,
      currency: input.currency || 'USD',
      status: input.status || 'planned',
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamel<TripAccommodation>(data);
}

export async function updateAccommodation(
  id: string,
  updates: UpdateAccommodationInput,
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.checkIn !== undefined) dbUpdates.check_in = updates.checkIn;
  if (updates.checkOut !== undefined) dbUpdates.check_out = updates.checkOut;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.locationLat !== undefined) dbUpdates.location_lat = updates.locationLat;
  if (updates.locationLng !== undefined) dbUpdates.location_lng = updates.locationLng;
  if (updates.bookingUrl !== undefined) dbUpdates.booking_url = updates.bookingUrl;
  if (updates.bookingRef !== undefined) dbUpdates.booking_ref = updates.bookingRef;
  if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { error } = await supabase
    .from('trip_accommodations')
    .update(dbUpdates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAccommodation(id: string): Promise<void> {
  const { error } = await supabase
    .from('trip_accommodations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Transports ──────────────────────────────────────────────

export async function getTripTransports(tripId: string): Promise<TripTransport[]> {
  const { data, error } = await supabase
    .from('trip_transports')
    .select('*')
    .eq('trip_id', tripId)
    .order('departure_at', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return rowsToCamel<TripTransport>(data ?? []);
}

export async function createTransport(input: CreateTransportInput): Promise<TripTransport> {
  const { data, error } = await supabase
    .from('trip_transports')
    .insert({
      trip_id: input.tripId,
      from_stop_order: input.fromStopOrder ?? null,
      to_stop_order: input.toStopOrder ?? null,
      transport_type: input.transportType,
      carrier: input.carrier || null,
      reference: input.reference || null,
      departure_at: input.departureAt || null,
      arrival_at: input.arrivalAt || null,
      departure_location: input.departureLocation || null,
      arrival_location: input.arrivalLocation || null,
      booking_url: input.bookingUrl || null,
      cost: input.cost ?? null,
      currency: input.currency || 'USD',
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamel<TripTransport>(data);
}

export async function updateTransport(
  id: string,
  updates: UpdateTransportInput,
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.fromStopOrder !== undefined) dbUpdates.from_stop_order = updates.fromStopOrder;
  if (updates.toStopOrder !== undefined) dbUpdates.to_stop_order = updates.toStopOrder;
  if (updates.transportType !== undefined) dbUpdates.transport_type = updates.transportType;
  if (updates.carrier !== undefined) dbUpdates.carrier = updates.carrier;
  if (updates.reference !== undefined) dbUpdates.reference = updates.reference;
  if (updates.departureAt !== undefined) dbUpdates.departure_at = updates.departureAt;
  if (updates.arrivalAt !== undefined) dbUpdates.arrival_at = updates.arrivalAt;
  if (updates.departureLocation !== undefined) dbUpdates.departure_location = updates.departureLocation;
  if (updates.arrivalLocation !== undefined) dbUpdates.arrival_location = updates.arrivalLocation;
  if (updates.bookingUrl !== undefined) dbUpdates.booking_url = updates.bookingUrl;
  if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { error } = await supabase
    .from('trip_transports')
    .update(dbUpdates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTransport(id: string): Promise<void> {
  const { error } = await supabase
    .from('trip_transports')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Notification Settings ───────────────────────────────────

export async function getTripNotificationSettings(
  tripId: string,
): Promise<TripNotificationSettings | null> {
  const { data, error } = await supabase
    .from('trip_notification_settings')
    .select('*')
    .eq('trip_id', tripId)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<TripNotificationSettings>(data) : null;
}

export async function upsertTripNotificationSettings(
  tripId: string,
  settings: Partial<Omit<TripNotificationSettings, 'tripId'>>,
): Promise<void> {
  const { error } = await supabase
    .from('trip_notification_settings')
    .upsert({
      trip_id: tripId,
      morning_summary: settings.morningSummary,
      stop_reminders: settings.stopReminders,
      evening_journal: settings.eveningJournal,
      departure_alerts: settings.departureAlerts,
      reminder_minutes: settings.reminderMinutes,
      morning_hour: settings.morningHour,
      evening_hour: settings.eveningHour,
    });
  if (error) throw error;
}

// ── Public Trip Reads (for traveler profiles) ────────────────

export async function getVisitedCountries(
  targetUserId: string,
): Promise<VisitedCountry[]> {
  const { data: tripsData, error } = await supabase
    .from('trips')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('status', 'completed');
  if (error) throw error;

  const tripIds = (tripsData ?? []).map((t: { id: string }) => t.id);
  if (tripIds.length === 0) return [];

  const { data: stopsData } = await supabase
    .from('trip_stops')
    .select('country_iso2, trip_id')
    .in('trip_id', tripIds);

  if (!stopsData || stopsData.length === 0) return [];

  const countryMap = new Map<string, Set<string>>();
  const iso2s: string[] = [];
  for (const stop of stopsData) {
    const iso = stop.country_iso2;
    if (!countryMap.has(iso)) {
      countryMap.set(iso, new Set<string>());
      iso2s.push(iso);
    }
    countryMap.get(iso)!.add(stop.trip_id);
  }
  const { data: countriesData } = await supabase
    .from('countries')
    .select('iso2, name')
    .in('iso2', iso2s);

  const nameMap = new Map<string, string>();
  for (const c of countriesData ?? []) {
    nameMap.set(c.iso2, c.name);
  }

  const result: VisitedCountry[] = iso2s.map((iso) => ({
    countryIso2: iso,
    countryName: nameMap.get(iso) ?? iso,
    tripCount: countryMap.get(iso)?.size ?? 0,
  }));

  result.sort((a, b) => b.tripCount - a.tripCount);
  return result;
}
