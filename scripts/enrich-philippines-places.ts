/**
 * Enrich Philippines Places
 *
 * Rule-based enrichment for ~347 places imported via mega-populate-philippines.ts.
 * Fills in tags, highlights, considerations, activity fields, accommodation fields,
 * google_maps_url, and primary_category_id. Zero API cost — all derived from
 * existing data (name, place_type, rating, review count).
 *
 * Usage:
 *   npx tsx scripts/enrich-philippines-places.ts           # run all
 *   npx tsx scripts/enrich-philippines-places.ts --dry-run  # preview changes
 *   npx tsx scripts/enrich-philippines-places.ts --city=manila  # single city
 */

import { did, supabase, upsertBatch } from './seed-utils';

// ═══════════════════════════════════════════════════════════════════
// BATCH UPDATE HELPER
// ═══════════════════════════════════════════════════════════════════

/**
 * Update existing rows in a table by ID. Unlike upsertBatch, this uses
 * .update() so only the provided columns are changed — no NOT NULL violations.
 */
async function updateBatch<T extends { id: string }>(
  table: string,
  rows: T[],
): Promise<void> {
  const BATCH = 50; // Smaller batches for individual updates
  let done = 0;
  for (const row of rows) {
    const { id, ...fields } = row;
    const { error } = await supabase.from(table).update(fields).eq('id', id);
    if (error) {
      console.error(`[${table}] update ${id} FAILED:`, error.message);
      throw error;
    }
    done++;
    if (done % BATCH === 0) {
      console.log(`    ... ${done}/${rows.length}`);
    }
  }
  console.log(`  ✓ ${table}: ${rows.length} rows updated`);
}

// ═══════════════════════════════════════════════════════════════════
// CLI FLAGS
// ═══════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const cityFlag = args.find(a => a.startsWith('--city='))?.split('=')[1]?.toLowerCase();

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface Place {
  id: string;
  name: string;
  description: string | null;
  place_type: string;
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_maps_url: string | null;
  primary_category_id: string | null;
  highlights: string[] | null;
  considerations: string[] | null;
  best_time_of_day: string | null;
  estimated_duration: string | null;
  physical_level: string | null;
  positioning_summary: string | null;
  why_women_choose: string | null;
  cities: { slug: string; name: string; country_id: string } | null;
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORY MAPPING
// ═══════════════════════════════════════════════════════════════════

const CATEGORY_MAP: Record<string, string> = {
  hotel: did('cat-stay'),
  hostel: did('cat-stay'),
  homestay: did('cat-stay'),
  activity: did('cat-activity'),
  tour: did('cat-activity'),
  landmark: did('cat-landmark'),
  wellness: did('cat-wellness'),
  spa: did('cat-wellness'),
  hospital: did('cat-practical'),
  clinic: did('cat-practical'),
  pharmacy: did('cat-practical'),
  restaurant: did('cat-eat'),
  cafe: did('cat-cafe'),
  bar: did('cat-nightlife'),
  club: did('cat-nightlife'),
};

// ═══════════════════════════════════════════════════════════════════
// TAG ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════

const BASE_TAGS: Record<string, string[]> = {
  hostel: ['tag-solo-friendly', 'tag-meeting-people', 'tag-fast-wifi', 'tag-lockers-available'],
  hotel: ['tag-solo-friendly', 'tag-helpful-staff', 'tag-ac'],
  homestay: ['tag-solo-friendly', 'tag-helpful-staff', 'tag-ac'],
  activity: ['tag-active-day'],
  tour: ['tag-active-day', 'tag-learning-culture'],
  landmark: ['tag-learning-culture', 'tag-scenic'],
  wellness: ['tag-self-care-day', 'tag-stress-relief'],
  spa: ['tag-self-care-day', 'tag-stress-relief'],
  hospital: ['tag-24-7', 'tag-english-speaking-staff', 'tag-staff-presence'],
  clinic: ['tag-english-speaking-staff', 'tag-staff-presence'],
  pharmacy: ['tag-english-speaking-staff'],
  restaurant: ['tag-solo-dining', 'tag-local-cuisine'],
  cafe: ['tag-work-friendly', 'tag-fast-wifi', 'tag-power-outlets'],
  bar: ['tag-drinks-conversation', 'tag-lively'],
  club: ['tag-drinks-conversation', 'tag-lively', 'tag-dancing'],
};

const VIBE_ROTATION: Record<string, string[]> = {
  hostel: ['tag-lively', 'tag-cozy', 'tag-chill', 'tag-trendy'],
  hotel: ['tag-aesthetic', 'tag-quiet', 'tag-scenic', 'tag-trendy'],
  homestay: ['tag-cozy', 'tag-local-feel', 'tag-quiet', 'tag-aesthetic'],
  restaurant: ['tag-local-feel', 'tag-cozy', 'tag-lively', 'tag-aesthetic'],
  cafe: ['tag-cozy', 'tag-aesthetic', 'tag-quiet', 'tag-chill'],
  bar: ['tag-dj-electronic', 'tag-live-music', 'tag-pop-commercial', 'tag-hiphop-rnb'],
  club: ['tag-dj-electronic', 'tag-live-music', 'tag-pop-commercial', 'tag-hiphop-rnb'],
  activity: ['tag-scenic', 'tag-lively', 'tag-nature', 'tag-beachfront'],
  landmark: ['tag-easy', 'tag-moderate', 'tag-easy', 'tag-moderate'],
  wellness: ['tag-quiet', 'tag-chill', 'tag-nature', 'tag-cozy'],
  spa: ['tag-quiet', 'tag-chill', 'tag-nature', 'tag-cozy'],
  tour: ['tag-easy', 'tag-moderate', 'tag-challenging', 'tag-easy'],
};

// Keyword → tag mappings (scan name + description)
const KEYWORD_TAGS: [RegExp, string[]][] = [
  [/beach|beachfront/i, ['tag-beachfront']],
  [/mountain|hike|trek|hiking|trekking/i, ['tag-nature', 'tag-active-day']],
  [/pool|swimming/i, ['tag-pool']],
  [/sunset/i, ['tag-sunset-views']],
  [/museum|heritage|church|temple|basilica|cathedral/i, ['tag-learning-culture']],
  [/boutique|luxury/i, ['tag-aesthetic']],
  [/quiet|peaceful|secluded/i, ['tag-quiet', 'tag-chill']],
  [/island\s*hopping/i, ['tag-active-day', 'tag-scenic', 'tag-beachfront']],
  [/div(?:e|ing)|snorkel|surf/i, ['tag-active-day', 'tag-nature']],
  [/24\/7|24\s*hours?/i, ['tag-24-7']],
  [/women\s*only/i, ['tag-women-only-option']],
  [/waterfall|falls/i, ['tag-nature', 'tag-scenic']],
  [/rice\s*terrace|terrace/i, ['tag-scenic', 'tag-nature']],
  [/rooftop/i, ['tag-rooftop-amenity']],
];

function getTagsForPlace(place: Place, typeCounter: number): string[] {
  const tags = new Set<string>();
  const type = place.place_type;

  // Base tags
  const base = BASE_TAGS[type] ?? ['tag-solo-friendly'];
  for (const t of base) tags.add(t);

  // Vibe rotation
  const vibes = VIBE_ROTATION[type];
  if (vibes && vibes.length > 0) {
    tags.add(vibes[typeCounter % vibes.length]);
  }

  // Keyword-signal tags
  const text = `${place.name} ${place.description ?? ''}`.toLowerCase();
  for (const [regex, tagKeys] of KEYWORD_TAGS) {
    if (regex.test(text)) {
      for (const t of tagKeys) tags.add(t);
    }
  }

  // Rating-driven: high-reviewed accommodations get english-speaking-staff
  const isAccommodation = ['hostel', 'hotel', 'homestay'].includes(type);
  if (isAccommodation && (place.google_review_count ?? 0) >= 50) {
    tags.add('tag-english-speaking-staff');
  }

  return Array.from(tags);
}

// ═══════════════════════════════════════════════════════════════════
// HIGHLIGHTS
// ═══════════════════════════════════════════════════════════════════

function getHighlights(place: Place): string[] {
  const hl: string[] = [];
  const type = place.place_type;
  const text = `${place.name} ${place.description ?? ''}`.toLowerCase();
  const rating = place.google_rating;
  const reviews = place.google_review_count;

  if (rating && rating >= 4.3 && reviews && reviews >= 5) {
    hl.push('Highly recommended by travelers');
  }

  switch (type) {
    case 'hostel':
      hl.push('Social atmosphere for meeting fellow travelers');
      hl.push('Secure lockers and common areas');
      if (text.includes('rooftop') || text.includes('terrace')) hl.push('Rooftop or terrace area');
      break;
    case 'hotel':
      hl.push('Private room with reliable WiFi');
      hl.push('Professional front desk service');
      if (text.includes('pool')) hl.push('Swimming pool on site');
      break;
    case 'homestay':
      hl.push('Local host with insider tips');
      hl.push('Authentic neighborhood experience');
      break;
    case 'activity':
    case 'tour':
      if (/div(?:e|ing)|snorkel/i.test(text)) hl.push('Crystal clear waters and marine life');
      if (/island\s*hopping/i.test(text)) hl.push('Multiple island stops throughout the day');
      if (/waterfall|falls/i.test(text)) hl.push('Spectacular natural scenery');
      if (/hike|trek|mountain/i.test(text)) hl.push('Panoramic views from elevated trails');
      if (/surf/i.test(text)) hl.push('Consistent waves for all skill levels');
      if (/whale\s*shark/i.test(text)) hl.push('Close encounters with gentle giants');
      if (/kayak|paddl/i.test(text)) hl.push('Calm waters ideal for paddling');
      if (/cooking\s*class/i.test(text)) hl.push('Hands-on Filipino cooking experience');
      if (/zipline|zip\s*line/i.test(text)) hl.push('Adrenaline-pumping aerial views');
      if (hl.length < 3) hl.push('Popular with solo women travelers');
      break;
    case 'landmark':
      if (/church|basilica|cathedral/i.test(text)) hl.push('Historic religious architecture');
      if (/museum/i.test(text)) hl.push('Engaging cultural exhibits');
      if (/rice\s*terrace/i.test(text)) hl.push('UNESCO-recognized landscape');
      if (/fort|fortress|intramuros/i.test(text)) hl.push('Well-preserved colonial heritage');
      if (/chocolate\s*hills/i.test(text)) hl.push('Unique geological formation');
      if (hl.length < 3) hl.push('Walkable and well-signposted');
      break;
    case 'wellness':
    case 'spa':
      hl.push('Relaxing treatments in a calm setting');
      hl.push('Solo-friendly atmosphere');
      break;
    case 'hospital':
      hl.push('Emergency services available 24/7');
      hl.push('English-speaking medical staff');
      hl.push('Modern medical facilities');
      break;
    case 'clinic':
      hl.push('English-speaking medical staff');
      hl.push('Walk-in consultations available');
      break;
    case 'pharmacy':
      hl.push('Wide range of medications available');
      hl.push('Staff can advise on common ailments');
      break;
    case 'restaurant':
      hl.push('Counter or bar seating ideal for solo diners');
      if (/seafood/i.test(text)) hl.push('Fresh local seafood');
      if (/filipino|pinoy/i.test(text)) hl.push('Authentic Filipino flavors');
      break;
    case 'cafe':
      hl.push('Reliable WiFi for working remotely');
      hl.push('Comfortable seating and good coffee');
      break;
    case 'bar':
    case 'club':
      hl.push('Friendly, social atmosphere');
      hl.push('Popular with other travelers');
      break;
  }

  // Cap at 5
  return hl.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════
// CONSIDERATIONS
// ═══════════════════════════════════════════════════════════════════

function getConsiderations(place: Place): string[] {
  const cons: string[] = [];
  const type = place.place_type;
  const text = `${place.name} ${place.description ?? ''}`.toLowerCase();

  switch (type) {
    case 'hostel':
      cons.push('Bring a padlock for lockers');
      cons.push('WiFi quality can vary during peak hours');
      break;
    case 'hotel':
      cons.push('Confirm cancellation policy before booking');
      cons.push('Check if breakfast is included');
      break;
    case 'homestay':
      cons.push('Communicate arrival time to your host');
      cons.push('Respect house rules and local customs');
      break;
    case 'activity':
    case 'tour':
      if (/div(?:e|ing)|snorkel|island|beach|boat|whale/i.test(text)) {
        cons.push('Bring reef-safe sunscreen and a dry bag');
        cons.push('Check weather and sea conditions before booking');
      } else if (/hike|trek|mountain|canyon|cliff/i.test(text)) {
        cons.push('Wear appropriate footwear with good grip');
        cons.push('Bring plenty of water and sun protection');
      } else if (/surf/i.test(text)) {
        cons.push('Bring reef-safe sunscreen');
        cons.push('Book lessons from licensed instructors');
      } else {
        cons.push('Check weather before booking');
        cons.push('Bring water and sun protection');
      }
      cons.push('Book with licensed, reputable operators');
      break;
    case 'landmark':
      if (/church|basilica|cathedral|temple|mosque/i.test(text)) {
        cons.push('Modest dress required at religious sites');
      }
      cons.push('Visit early to avoid crowds and midday heat');
      cons.push('Bring water — vendors may charge premium prices');
      break;
    case 'wellness':
    case 'spa':
      cons.push('Book in advance during peak season');
      cons.push('Confirm pricing before your session');
      break;
    case 'hospital':
      cons.push('Bring travel insurance documentation');
      cons.push('Cash deposit may be required before treatment');
      cons.push('Save the emergency phone number in your contacts');
      break;
    case 'clinic':
      cons.push('Bring travel insurance documentation');
      cons.push('Walk-in wait times vary — mornings are quieter');
      break;
    case 'pharmacy':
      cons.push('Some medications require a local prescription');
      cons.push('Generic alternatives are usually available');
      break;
    case 'restaurant':
      cons.push('Peak hours can be busy — arrive early or late');
      cons.push('Cash preferred at smaller establishments');
      break;
    case 'cafe':
      cons.push('Outlets may be limited — bring a power bank');
      cons.push('Buy something every couple of hours as courtesy');
      break;
    case 'bar':
    case 'club':
      cons.push('Keep an eye on your drink at all times');
      cons.push('Arrange transport home in advance');
      break;
  }

  return cons.slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVITY FIELDS
// ═══════════════════════════════════════════════════════════════════

function inferBestTimeOfDay(place: Place): string | null {
  const type = place.place_type;
  const text = `${place.name} ${place.description ?? ''}`.toLowerCase();

  if (['bar', 'club'].includes(type)) return 'evening';
  if (type === 'cafe') return 'morning';
  if (/sunset/i.test(text)) return 'evening';
  if (['wellness', 'spa'].includes(type)) return 'afternoon';

  if (/div(?:e|ing)|snorkel|island\s*hopping|hike|trek|waterfall|falls/i.test(text)) return 'morning';
  if (['landmark'].includes(type)) return 'morning';
  if (/surf/i.test(text)) return 'morning';

  return null; // Don't change if we can't infer
}

function inferEstimatedDuration(place: Place): string | null {
  const text = `${place.name} ${place.description ?? ''}`.toLowerCase();
  const type = place.place_type;

  if (/island\s*hopping|full\s*day/i.test(text)) return 'Full day';
  if (/div(?:e|ing)|snorkel/i.test(text)) return '3-4 hours';
  if (/waterfall|falls|hike|trek/i.test(text)) return '2-3 hours';
  if (/whale\s*shark/i.test(text)) return '3-4 hours';
  if (/canyoneering|canyon/i.test(text)) return '4-6 hours';
  if (/cooking\s*class/i.test(text)) return '3-4 hours';
  if (/zipline|zip\s*line/i.test(text)) return '1-2 hours';
  if (/kayak|paddl/i.test(text)) return '2-3 hours';
  if (/surf/i.test(text)) return '2-3 hours';

  if (['landmark'].includes(type)) {
    if (/church|temple|basilica|cathedral|mosque/i.test(text)) return '30-60 minutes';
    if (/museum/i.test(text)) return '1-2 hours';
    return '1-2 hours';
  }
  if (type === 'tour') return '3-4 hours';
  if (type === 'activity') return '2-3 hours';
  if (type === 'restaurant') return '1-2 hours';
  if (['wellness', 'spa'].includes(type)) return '1-2 hours';

  return null;
}

function inferPhysicalLevel(place: Place): string | null {
  const text = `${place.name} ${place.description ?? ''}`.toLowerCase();

  if (/canyoneering|cliff\s*jump|cliff\s*diving/i.test(text)) return 'challenging';
  if (/trek|mountain|div(?:e|ing)|surf|kayak|climb/i.test(text)) return 'moderate';
  if (/hike|hiking|waterfall|falls/i.test(text)) return 'moderate';
  if (/snorkel|swim|boat|beach|walk|museum|church|temple/i.test(text)) return 'easy';
  if (/island\s*hopping/i.test(text)) return 'easy';

  return null;
}

// ═══════════════════════════════════════════════════════════════════
// ACCOMMODATION FIELDS
// ═══════════════════════════════════════════════════════════════════

function getPositioningSummary(place: Place): string {
  const type = place.place_type;
  const cityName = place.cities?.name ?? 'the Philippines';
  const rating = place.google_rating;

  const qualifiers: string[] = [];
  if (rating && rating >= 4.0) qualifiers.push('well-reviewed');
  if ((place as any).price_level === 1 || (place as any).price_level === 2) {
    qualifiers.push('budget-friendly');
  }

  const prefix = qualifiers.length > 0 ? `A ${qualifiers.join(', ')} ` : 'A ';

  return `${prefix}${type} in ${cityName} that works well for solo women travelers.`;
}

function getWhyWomenChoose(place: Place): string {
  switch (place.place_type) {
    case 'hostel':
      return 'Easy to meet fellow solo travelers in common areas. Secure storage and good lighting throughout.';
    case 'hotel':
      return 'Professional service and reliable security. A private, quiet space to recharge between adventures.';
    case 'homestay':
      return 'A more personal, local feel. Hosts often provide insider tips and local recommendations.';
    default:
      return 'A comfortable option that works well for solo women travelers in the Philippines.';
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Enrich Philippines Places');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  if (cityFlag) console.log(`  Filter: city=${cityFlag}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Fetch Philippines places
  // First, get the Philippines country ID
  const { data: countryRow, error: countryErr } = await supabase
    .from('countries')
    .select('id')
    .eq('slug', 'philippines')
    .single();

  if (countryErr || !countryRow) {
    console.error('Failed to find Philippines country:', countryErr?.message);
    process.exit(1);
  }

  let query = supabase
    .from('places')
    .select(`
      id, name, description, place_type,
      google_place_id, google_rating, google_review_count,
      google_maps_url, primary_category_id,
      highlights, considerations,
      best_time_of_day, estimated_duration, physical_level,
      positioning_summary, why_women_choose, price_level,
      cities!inner ( slug, name, country_id )
    `)
    .eq('cities.country_id', countryRow.id)
    .eq('is_active', true);

  if (cityFlag) {
    query = query.ilike('cities.slug', `%${cityFlag}%`);
  }

  const { data: places, error } = await query;
  if (error) {
    console.error('Failed to fetch places:', error.message);
    process.exit(1);
  }
  if (!places || places.length === 0) {
    console.log('No Philippines places found.');
    return;
  }

  console.log(`Found ${places.length} Philippines places\n`);

  // ── Counters ──
  const stats = {
    googleMapsUrl: 0,
    primaryCategory: 0,
    tags: 0,
    highlights: 0,
    considerations: 0,
    bestTimeOfDay: 0,
    estimatedDuration: 0,
    physicalLevel: 0,
    positioningSummary: 0,
    whyWomenChoose: 0,
  };

  // ── Step 1: google_maps_url ──
  console.log('Step 1: google_maps_url...');
  const urlUpdates: { id: string; google_maps_url: string }[] = [];
  for (const p of places as Place[]) {
    if (!p.google_maps_url && p.google_place_id) {
      urlUpdates.push({
        id: p.id,
        google_maps_url: `https://www.google.com/maps/place/?q=place_id:${p.google_place_id}`,
      });
    }
  }
  stats.googleMapsUrl = urlUpdates.length;
  console.log(`  → ${urlUpdates.length} places need google_maps_url`);
  if (!DRY_RUN && urlUpdates.length > 0) {
    await updateBatch('places', urlUpdates);
  }

  // ── Step 2: primary_category_id ──
  console.log('Step 2: primary_category_id...');
  const catUpdates: { id: string; primary_category_id: string }[] = [];
  for (const p of places as Place[]) {
    if (!p.primary_category_id) {
      const catId = CATEGORY_MAP[p.place_type];
      if (catId) {
        catUpdates.push({ id: p.id, primary_category_id: catId });
      }
    }
  }
  stats.primaryCategory = catUpdates.length;
  console.log(`  → ${catUpdates.length} places need primary_category_id`);
  if (!DRY_RUN && catUpdates.length > 0) {
    await updateBatch('places', catUpdates);
  }

  // ── Step 3: Tags ──
  console.log('Step 3: Tag assignment...');
  const typeCounters: Record<string, number> = {};
  const tagRows: { place_id: string; tag_id: string; source: string }[] = [];

  for (const p of places as Place[]) {
    const counter = typeCounters[p.place_type] ?? 0;
    typeCounters[p.place_type] = counter + 1;

    const tagKeys = getTagsForPlace(p, counter);
    for (const tagKey of tagKeys) {
      tagRows.push({
        place_id: p.id,
        tag_id: did(tagKey),
        source: 'editorial',
      });
    }
  }
  stats.tags = tagRows.length;
  console.log(`  → ${tagRows.length} tag assignments for ${places.length} places (avg ${(tagRows.length / places.length).toFixed(1)}/place)`);
  if (!DRY_RUN && tagRows.length > 0) {
    await upsertBatch('place_tags', tagRows, 'place_id,tag_id');
  }

  // ── Step 4: Highlights ──
  console.log('Step 4: Highlights...');
  const hlUpdates: { id: string; highlights: string[] }[] = [];
  for (const p of places as Place[]) {
    if (!p.highlights || (Array.isArray(p.highlights) && p.highlights.length === 0)) {
      const hl = getHighlights(p);
      if (hl.length > 0) {
        hlUpdates.push({ id: p.id, highlights: hl });
      }
    }
  }
  stats.highlights = hlUpdates.length;
  console.log(`  → ${hlUpdates.length} places need highlights`);
  if (!DRY_RUN && hlUpdates.length > 0) {
    await updateBatch('places', hlUpdates);
  }

  // ── Step 5: Considerations ──
  console.log('Step 5: Considerations...');
  const consUpdates: { id: string; considerations: string[] }[] = [];
  for (const p of places as Place[]) {
    if (!p.considerations || (Array.isArray(p.considerations) && p.considerations.length === 0)) {
      const cons = getConsiderations(p);
      if (cons.length > 0) {
        consUpdates.push({ id: p.id, considerations: cons });
      }
    }
  }
  stats.considerations = consUpdates.length;
  console.log(`  → ${consUpdates.length} places need considerations`);
  if (!DRY_RUN && consUpdates.length > 0) {
    await updateBatch('places', consUpdates);
  }

  // ── Step 6: Activity fields ──
  console.log('Step 6: Activity fields (best_time_of_day, estimated_duration, physical_level)...');
  const actUpdates: { id: string; [key: string]: unknown }[] = [];

  for (const p of places as Place[]) {
    const updates: Record<string, unknown> = { id: p.id };
    let changed = false;

    // best_time_of_day: only update if currently 'any'
    if (p.best_time_of_day === 'any') {
      const btod = inferBestTimeOfDay(p);
      if (btod) {
        updates.best_time_of_day = btod;
        changed = true;
      }
    }

    // estimated_duration: only update if NULL
    if (!p.estimated_duration) {
      const dur = inferEstimatedDuration(p);
      if (dur) {
        updates.estimated_duration = dur;
        changed = true;
      }
    }

    // physical_level: only update if NULL
    if (!p.physical_level) {
      const pl = inferPhysicalLevel(p);
      if (pl) {
        updates.physical_level = pl;
        changed = true;
      }
    }

    if (changed) actUpdates.push(updates);
  }

  // Count per-field
  const btodCount = actUpdates.filter(u => u.best_time_of_day).length;
  const durCount = actUpdates.filter(u => u.estimated_duration).length;
  const plCount = actUpdates.filter(u => u.physical_level).length;
  stats.bestTimeOfDay = btodCount;
  stats.estimatedDuration = durCount;
  stats.physicalLevel = plCount;
  console.log(`  → best_time_of_day: ${btodCount}, estimated_duration: ${durCount}, physical_level: ${plCount}`);
  if (!DRY_RUN && actUpdates.length > 0) {
    await updateBatch('places', actUpdates as { id: string }[]);
  }

  // ── Step 7: Accommodation fields (positioning_summary, why_women_choose) ──
  console.log('Step 7: Accommodation fields...');
  const accomTypes = ['hostel', 'hotel', 'homestay'];
  const accomUpdates: { id: string; positioning_summary?: string; why_women_choose?: string }[] = [];

  for (const p of places as Place[]) {
    if (!accomTypes.includes(p.place_type)) continue;

    const updates: Record<string, unknown> = { id: p.id };
    let changed = false;

    // positioning_summary: only update if it looks auto-generated (ends with brief description slice)
    // or is NULL
    if (!p.positioning_summary || !p.positioning_summary.includes('solo women')) {
      updates.positioning_summary = getPositioningSummary(p);
      changed = true;
    }

    if (!p.why_women_choose) {
      updates.why_women_choose = getWhyWomenChoose(p);
      changed = true;
    }

    if (changed) accomUpdates.push(updates);
  }
  stats.positioningSummary = accomUpdates.filter(u => u.positioning_summary).length;
  stats.whyWomenChoose = accomUpdates.filter(u => u.why_women_choose).length;
  console.log(`  → positioning_summary: ${stats.positioningSummary}, why_women_choose: ${stats.whyWomenChoose}`);
  if (!DRY_RUN && accomUpdates.length > 0) {
    await updateBatch('places', accomUpdates as { id: string }[]);
  }

  // ── Summary ──
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Total places processed: ${places.length}`);
  console.log(`  google_maps_url:        ${stats.googleMapsUrl}`);
  console.log(`  primary_category_id:    ${stats.primaryCategory}`);
  console.log(`  tag assignments:        ${stats.tags} (${(stats.tags / places.length).toFixed(1)} avg/place)`);
  console.log(`  highlights:             ${stats.highlights}`);
  console.log(`  considerations:         ${stats.considerations}`);
  console.log(`  best_time_of_day:       ${stats.bestTimeOfDay}`);
  console.log(`  estimated_duration:     ${stats.estimatedDuration}`);
  console.log(`  physical_level:         ${stats.physicalLevel}`);
  console.log(`  positioning_summary:    ${stats.positioningSummary}`);
  console.log(`  why_women_choose:       ${stats.whyWomenChoose}`);
  if (DRY_RUN) {
    console.log('\n  ⚠️  DRY RUN — no changes written to database');
  } else {
    console.log('\n  ✅ All changes written to database');
  }
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
