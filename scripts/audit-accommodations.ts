/**
 * Accommodation Classification Audit
 *
 * Verifies every accommodation's place_type (hotel/hostel/homestay) is correct
 * by cross-referencing with Google Places API.
 *
 * Two-phase approach to minimize API cost:
 *   Phase 1 (free):  Enhanced name-based heuristics flag mismatches
 *   Phase 2 (API):   Google Places API confirms flagged + ambiguous items
 *
 * Usage:
 *   npx tsx scripts/audit-accommodations.ts                 # full audit (name + API)
 *   npx tsx scripts/audit-accommodations.ts --name-only     # name check only (free)
 *   npx tsx scripts/audit-accommodations.ts --budget 5      # cap API spend at $5
 *   npx tsx scripts/audit-accommodations.ts --fix            # auto-fix confirmed mismatches
 *   npx tsx scripts/audit-accommodations.ts --city bangkok   # audit one city only
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const RATE_LIMIT_MS = 300;

/**
 * Google Places API (New) cost for the fields we request:
 * - Basic (displayName, types, primaryType): ~$0.005
 * - Advanced (editorialSummary): ~$0.005
 * Total: ~$0.01 per call
 */
const COST_PER_CALL = 0.01;

// ---------------------------------------------------------------------------
// Known brand / keyword mappings
// ---------------------------------------------------------------------------

const HOSTEL_BRANDS = [
  'mad monkey', 'lub d', 'slumber party', 'selina', 'zostel',
  'the hive', 'bodega', 'che lagarto', 'wild rover', 'loki',
  'reggae mansion', 'nook hostel', 'tropica bungalow', 'bed station',
  'sleep club', 'snooze', 'doze', 'bunk', 'urban slumber',
  'hostelworld', 'a&o', 'generator', 'st christopher', 'meininger',
  'wombats', 'hatters', 'clink', 'flying pig', 'kabuki',
];

const HOSTEL_KEYWORDS = [
  'hostel', 'backpacker', 'capsule', 'pod hotel', 'dorm',
  'dormitory', 'bunk bed', 'shared room', 'party hostel',
];

const HOMESTAY_KEYWORDS = [
  'guesthouse', 'guest house', 'homestay', 'home stay',
  'riad', 'ryokan', 'pension', 'villa', 'b&b', 'bed and breakfast',
  'bnb', 'minshuku', 'hanok', 'casa particular',
];

const HOTEL_KEYWORDS = [
  'hotel', 'resort', 'suites', 'inn', 'motel', 'lodge',
  'palace', 'grand', 'marriott', 'hilton', 'hyatt', 'accor',
  'intercontinental', 'novotel', 'ibis', 'mercure', 'pullman',
  'sheraton', 'westin', 'four seasons', 'ritz', 'mandarin oriental',
  'shangri-la', 'fairmont', 'sofitel', 'radisson', 'crowne plaza',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AccomType = 'hotel' | 'hostel' | 'homestay';

interface PlaceRow {
  id: string;
  name: string;
  google_place_id: string | null;
  place_type: AccomType;
  city_slug: string;
}

interface AuditResult {
  id: string;
  name: string;
  city: string;
  currentType: AccomType;
  suggestedType: AccomType;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

interface GoogleSignals {
  primaryType: string | null;
  types: string[];
  editorialSummary: string | null;
  displayName: string | null;
}

// ---------------------------------------------------------------------------
// Phase 1: Name-based classification
// ---------------------------------------------------------------------------

function classifyByName(name: string): { type: AccomType; confidence: 'high' | 'medium' | 'low' } | null {
  const nl = name.toLowerCase();

  // Check hostel brands first (high confidence)
  if (HOSTEL_BRANDS.some(brand => nl.includes(brand))) {
    return { type: 'hostel', confidence: 'high' };
  }

  // Check explicit keywords
  const hostelMatch = HOSTEL_KEYWORDS.some(kw => nl.includes(kw));
  const homestayMatch = HOMESTAY_KEYWORDS.some(kw => nl.includes(kw));
  const hotelMatch = HOTEL_KEYWORDS.some(kw => nl.includes(kw));

  // If only one category matches, high confidence
  const matchCount = [hostelMatch, homestayMatch, hotelMatch].filter(Boolean).length;

  if (matchCount === 1) {
    if (hostelMatch) return { type: 'hostel', confidence: 'high' };
    if (homestayMatch) return { type: 'homestay', confidence: 'high' };
    if (hotelMatch) return { type: 'hotel', confidence: 'high' };
  }

  // Multiple matches — e.g., "Hostel & Hotel" — medium confidence, pick most specific
  if (matchCount > 1) {
    if (hostelMatch) return { type: 'hostel', confidence: 'medium' };
    if (homestayMatch) return { type: 'homestay', confidence: 'medium' };
    return { type: 'hotel', confidence: 'medium' };
  }

  // No keywords matched — can't classify from name alone
  return null;
}

// ---------------------------------------------------------------------------
// Phase 2: Google Places API verification
// ---------------------------------------------------------------------------

async function fetchGoogleSignals(googlePlaceId: string): Promise<GoogleSignals | null> {
  const url = `https://places.googleapis.com/v1/places/${googlePlaceId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': [
        'displayName',
        'types',
        'primaryType',
        'editorialSummary',
      ].join(','),
    },
  });

  if (!res.ok) {
    if (res.status === 404 || res.status === 400) return null;
    const text = await res.text();
    console.warn(`  ⚠ API error (${res.status}): ${text.slice(0, 100)}`);
    return null;
  }

  const data = await res.json();
  return {
    primaryType: data.primaryType ?? null,
    types: data.types ?? [],
    editorialSummary: data.editorialSummary?.text ?? null,
    displayName: data.displayName?.text ?? null,
  };
}

function classifyFromGoogle(signals: GoogleSignals): { type: AccomType; confidence: 'high' | 'medium' | 'low'; reason: string } | null {
  const reasons: string[] = [];
  let hostelScore = 0;
  let hotelScore = 0;
  let homestayScore = 0;

  // 1. Check primaryType from Google
  if (signals.primaryType) {
    const pt = signals.primaryType.toLowerCase();
    if (pt === 'hostel') { hostelScore += 3; reasons.push(`primaryType="${signals.primaryType}"`); }
    else if (pt === 'hotel') { hotelScore += 3; reasons.push(`primaryType="${signals.primaryType}"`); }
    else if (pt === 'guest_house' || pt === 'bed_and_breakfast') { homestayScore += 3; reasons.push(`primaryType="${signals.primaryType}"`); }
    else if (pt === 'resort_hotel') { hotelScore += 3; reasons.push(`primaryType="${signals.primaryType}"`); }
    else if (pt === 'lodging') { reasons.push('primaryType=lodging (generic)'); }
  }

  // 2. Check types array
  for (const t of signals.types) {
    const tl = t.toLowerCase();
    if (tl === 'hostel') { hostelScore += 2; reasons.push('types includes "hostel"'); }
    if (tl === 'hotel') { hotelScore += 1; } // Don't add to reasons, noisy
    if (tl === 'guest_house' || tl === 'bed_and_breakfast') { homestayScore += 2; reasons.push(`types includes "${t}"`); }
  }

  // 3. Check editorial summary for keywords
  if (signals.editorialSummary) {
    const summary = signals.editorialSummary.toLowerCase();
    const hostelHits = ['hostel', 'dorm', 'backpacker', 'bunk bed', 'shared room', 'dormitory'].filter(kw => summary.includes(kw));
    const homestayHits = ['guesthouse', 'guest house', 'homestay', 'bed and breakfast', 'b&b', 'villa'].filter(kw => summary.includes(kw));
    const hotelHits = ['hotel', 'resort', 'luxury', 'suite'].filter(kw => summary.includes(kw));

    if (hostelHits.length > 0) { hostelScore += 2; reasons.push(`summary mentions: ${hostelHits.join(', ')}`); }
    if (homestayHits.length > 0) { homestayScore += 2; reasons.push(`summary mentions: ${homestayHits.join(', ')}`); }
    if (hotelHits.length > 0) { hotelScore += 1; } // Hotels often mentioned generically
  }

  // 4. Check Google's display name (might differ from ours)
  if (signals.displayName) {
    const nameClassification = classifyByName(signals.displayName);
    if (nameClassification) {
      const score = nameClassification.confidence === 'high' ? 2 : 1;
      if (nameClassification.type === 'hostel') { hostelScore += score; reasons.push(`Google name="${signals.displayName}"`); }
      else if (nameClassification.type === 'homestay') { homestayScore += score; reasons.push(`Google name="${signals.displayName}"`); }
      else if (nameClassification.type === 'hotel') { hotelScore += score; }
    }
  }

  // Determine winner
  const max = Math.max(hostelScore, hotelScore, homestayScore);
  if (max === 0) return null;

  let type: AccomType;
  if (hostelScore === max) type = 'hostel';
  else if (homestayScore === max) type = 'homestay';
  else type = 'hotel';

  // Confidence based on score gap
  const scores = [hostelScore, hotelScore, homestayScore].sort((a, b) => b - a);
  const gap = scores[0] - scores[1];
  const confidence = gap >= 3 ? 'high' : gap >= 1 ? 'medium' : 'low';

  return { type, confidence, reason: reasons.join('; ') };
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const nameOnly = args.includes('--name-only');
const autoFix = args.includes('--fix');
const budgetIdx = args.indexOf('--budget');
const maxBudget = budgetIdx >= 0 ? parseFloat(args[budgetIdx + 1]) : 10;
const cityIdx = args.indexOf('--city');
const cityFilter = cityIdx >= 0 ? args[cityIdx + 1] : null;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     ACCOMMODATION CLASSIFICATION AUDIT          ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  // Fetch all accommodations
  let query = supabase
    .from('places')
    .select('id, name, google_place_id, place_type, city:cities!inner(slug)')
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .eq('is_active', true)
    .order('name');

  if (cityFilter) {
    query = query.eq('city.slug' as any, cityFilter);
  }

  const { data: places, error } = await query;
  if (error) { console.error('DB error:', error.message); process.exit(1); }
  if (!places?.length) { console.log('No accommodations found.'); return; }

  const rows: PlaceRow[] = places.map((p: any) => ({
    id: p.id,
    name: p.name,
    google_place_id: p.google_place_id,
    place_type: p.place_type,
    city_slug: (p.city as any)?.slug ?? 'unknown',
  }));

  console.log(`Found ${rows.length} accommodations${cityFilter ? ` in ${cityFilter}` : ''}`);
  console.log(`  Hotels: ${rows.filter(r => r.place_type === 'hotel').length}`);
  console.log(`  Hostels: ${rows.filter(r => r.place_type === 'hostel').length}`);
  console.log(`  Homestays: ${rows.filter(r => r.place_type === 'homestay').length}`);
  console.log();

  // ── Phase 1: Name-based audit ──────────────────────────────────────────

  console.log('═══ PHASE 1: Name-Based Check (free) ═══');
  console.log();

  const mismatches: AuditResult[] = [];
  const ambiguous: PlaceRow[] = [];   // No name signal — need API
  let nameConfirmed = 0;

  for (const row of rows) {
    const nameResult = classifyByName(row.name);
    if (!nameResult) {
      // Name alone can't classify — ambiguous, needs API
      ambiguous.push(row);
      continue;
    }

    if (nameResult.type !== row.place_type) {
      mismatches.push({
        id: row.id,
        name: row.name,
        city: row.city_slug,
        currentType: row.place_type,
        suggestedType: nameResult.type,
        confidence: nameResult.confidence,
        reason: `Name contains ${nameResult.type} keyword`,
      });
    } else {
      nameConfirmed++;
    }
  }

  console.log(`  ✓ ${nameConfirmed} confirmed correct by name`);
  console.log(`  ✗ ${mismatches.length} mismatches detected by name`);
  console.log(`  ? ${ambiguous.length} ambiguous (no keywords in name)`);
  console.log();

  if (mismatches.length > 0) {
    console.log('  NAME-BASED MISMATCHES:');
    console.log('  ' + '─'.repeat(70));
    for (const m of mismatches) {
      const arrow = `${m.currentType} → ${m.suggestedType}`;
      const conf = m.confidence === 'high' ? '●●●' : m.confidence === 'medium' ? '●●○' : '●○○';
      console.log(`  ${conf} ${m.name} (${m.city})`);
      console.log(`      ${arrow} — ${m.reason}`);
    }
    console.log();
  }

  // ── Phase 2: Google API verification ───────────────────────────────────

  if (nameOnly) {
    console.log('Skipping Phase 2 (--name-only mode)');
  } else {
    // Check both: name mismatches (to confirm) + ambiguous (to classify)
    const toCheck = [
      ...mismatches.map(m => rows.find(r => r.id === m.id)!),
      ...ambiguous.filter(r => r.google_place_id), // Only those with Google IDs
    ];

    const maxCalls = Math.floor(maxBudget / COST_PER_CALL);
    const willCheck = Math.min(toCheck.length, maxCalls);
    const estimatedCost = (willCheck * COST_PER_CALL).toFixed(2);

    console.log(`═══ PHASE 2: Google API Verification ═══`);
    console.log(`  Items to check: ${toCheck.length}`);
    console.log(`  Budget cap: $${maxBudget} (max ${maxCalls} calls)`);
    console.log(`  Will check: ${willCheck} (~$${estimatedCost})`);
    console.log();

    if (toCheck.length > maxCalls) {
      console.log(`  ⚠ Budget limits check to ${maxCalls} of ${toCheck.length} items.`);
      console.log(`  Run with --budget ${(toCheck.length * COST_PER_CALL * 1.1).toFixed(0)} to check all.`);
      console.log();
    }

    const apiMismatches: AuditResult[] = [];
    let apiConfirmed = 0;
    let apiErrors = 0;
    let spent = 0;

    for (let i = 0; i < willCheck; i++) {
      const row = toCheck[i];
      if (!row.google_place_id) continue;

      process.stdout.write(`  [${i + 1}/${willCheck}] ${row.name.slice(0, 40).padEnd(40)} `);

      const signals = await fetchGoogleSignals(row.google_place_id);
      spent += COST_PER_CALL;

      if (!signals) {
        console.log('⚠ no data');
        apiErrors++;
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      const googleResult = classifyFromGoogle(signals);

      if (!googleResult) {
        console.log('? inconclusive');
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      if (googleResult.type !== row.place_type) {
        console.log(`✗ ${row.place_type} → ${googleResult.type} (${googleResult.confidence})`);
        apiMismatches.push({
          id: row.id,
          name: row.name,
          city: row.city_slug,
          currentType: row.place_type,
          suggestedType: googleResult.type,
          confidence: googleResult.confidence,
          reason: googleResult.reason,
        });
      } else {
        console.log(`✓ ${row.place_type}`);
        apiConfirmed++;
      }

      await sleep(RATE_LIMIT_MS);
    }

    console.log();
    console.log(`  API spend: ~$${spent.toFixed(2)}`);
    console.log(`  ✓ ${apiConfirmed} confirmed correct`);
    console.log(`  ✗ ${apiMismatches.length} mismatches`);
    console.log(`  ⚠ ${apiErrors} errors/missing`);
    console.log();

    // Merge API results into main mismatches
    // Upgrade confidence for name mismatches confirmed by API
    for (const apiM of apiMismatches) {
      const existing = mismatches.find(m => m.id === apiM.id);
      if (existing) {
        existing.confidence = 'high'; // Name + API agree
        existing.reason += ` + Google: ${apiM.reason}`;
      } else {
        mismatches.push(apiM);
      }
    }

    // Remove name mismatches that API says are actually correct
    const apiConfirmedIds = new Set(
      toCheck
        .filter(r => !apiMismatches.some(m => m.id === r.id))
        .filter(r => r.google_place_id)
        .map(r => r.id),
    );
    // Only remove if the API was actually consulted and confirmed
    for (let i = mismatches.length - 1; i >= 0; i--) {
      if (apiConfirmedIds.has(mismatches[i].id) && mismatches[i].reason.startsWith('Name')) {
        console.log(`  ↩ Overridden by API: ${mismatches[i].name} stays as ${mismatches[i].currentType}`);
        mismatches.splice(i, 1);
      }
    }
  }

  // ── Final Report ───────────────────────────────────────────────────────

  console.log();
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║                FINAL REPORT                     ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  if (mismatches.length === 0) {
    console.log('  ✓ All accommodations appear correctly classified!');
    return;
  }

  // Group by confidence
  const high = mismatches.filter(m => m.confidence === 'high');
  const medium = mismatches.filter(m => m.confidence === 'medium');
  const low = mismatches.filter(m => m.confidence === 'low');

  console.log(`  Total mismatches: ${mismatches.length}`);
  console.log(`    High confidence:   ${high.length}`);
  console.log(`    Medium confidence: ${medium.length}`);
  console.log(`    Low confidence:    ${low.length}`);
  console.log();

  if (high.length > 0) {
    console.log('  HIGH CONFIDENCE (safe to auto-fix):');
    console.log('  ' + '─'.repeat(70));
    for (const m of high) {
      console.log(`  ● ${m.name} (${m.city})`);
      console.log(`    ${m.currentType} → ${m.suggestedType}`);
      console.log(`    ${m.reason}`);
    }
    console.log();
  }

  if (medium.length > 0) {
    console.log('  MEDIUM CONFIDENCE (review recommended):');
    console.log('  ' + '─'.repeat(70));
    for (const m of medium) {
      console.log(`  ○ ${m.name} (${m.city})`);
      console.log(`    ${m.currentType} → ${m.suggestedType}`);
      console.log(`    ${m.reason}`);
    }
    console.log();
  }

  if (low.length > 0) {
    console.log('  LOW CONFIDENCE (manual check needed):');
    console.log('  ' + '─'.repeat(70));
    for (const m of low) {
      console.log(`  ? ${m.name} (${m.city})`);
      console.log(`    ${m.currentType} → ${m.suggestedType}`);
      console.log(`    ${m.reason}`);
    }
    console.log();
  }

  // ── Auto-fix ───────────────────────────────────────────────────────────

  if (autoFix && high.length > 0) {
    console.log('═══ AUTO-FIXING high-confidence mismatches ═══');
    console.log();

    let fixed = 0;
    let fixErrors = 0;
    for (const m of high) {
      const { error } = await supabase
        .from('places')
        .update({ place_type: m.suggestedType })
        .eq('id', m.id);

      if (error) {
        console.log(`  ✗ ${m.name}: ${error.message}`);
        fixErrors++;
      } else {
        console.log(`  ✓ ${m.name}: ${m.currentType} → ${m.suggestedType}`);
        fixed++;
      }
    }

    console.log();
    console.log(`  Fixed: ${fixed}, Errors: ${fixErrors}`);
  } else if (!autoFix && mismatches.length > 0) {
    console.log('  Run with --fix to auto-correct high-confidence mismatches.');
    console.log(`  This would fix ${high.length} of ${mismatches.length} items.`);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => { console.error(err); process.exit(1); });
