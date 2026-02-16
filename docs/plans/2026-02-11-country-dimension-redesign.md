# Country Page Dimension Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure all country information around 6 dimensions that justify a women's travel app, making every country page a briefing that prepares women to travel anywhere.

**Architecture:** Replace the current category-based country content (visa, money, SIM, culture, safety) with dimension-first sections (sovereignty, infrastructure, health, experience, community, cost). Add structured data for practical links (immigration URLs, SIM providers). Populate health facility places via Google Places API. Rebuild the country detail page UI around the new structure.

**Tech Stack:** React Native, Expo Router, Supabase (Postgres), TypeScript, Google Places API (Text Search)

**Design Principles:**
- **Never rate, always brief.** No scores, no stars, no "2/5 dangerous". Every destination is travelable; your preparation just looks different.
- **Source from travelers.** Frame observations as "Women who've traveled here describe..." or "Solo travelers often find..." rather than stating as fact.
- **Encourage, never discourage.** Morocco isn't a warning. It's a briefing. Japan isn't "safe". It's "low-prep."
- **No em dashes.** Use commas, periods, or restructure sentences instead.
- **Premium, intellectual tone.** Never cheesy, never patronizing.

---

## Phase 1: Database Schema Migration

### Task 1: Add dimension columns and practical link fields to countries table

**Files:**
- Create: `supabase/migrations/20260211_country_dimensions.sql`
- Modify: `data/types.ts` (Country interface)
- Modify: `data/api.ts` (mapCountry function)

**Step 1: Write the migration**

```sql
-- Migration: Add 6-dimension columns and practical link fields
-- Date: 2026-02-11
-- Purpose: Restructure country content around dimensions that matter
--          specifically to women traveling solo.

-- =========================================================================
-- 1. New dimension markdown columns
-- =========================================================================
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS sovereignty_md text,
  ADD COLUMN IF NOT EXISTS solo_infrastructure_md text,
  ADD COLUMN IF NOT EXISTS health_access_md text,
  ADD COLUMN IF NOT EXISTS experience_density_md text,
  ADD COLUMN IF NOT EXISTS community_connection_md text,
  ADD COLUMN IF NOT EXISTS cost_reality_md text;

-- =========================================================================
-- 2. Structured practical link fields
-- =========================================================================
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS immigration_url text,
  ADD COLUMN IF NOT EXISTS arrival_card_url text,
  ADD COLUMN IF NOT EXISTS sim_providers jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS health_search_terms text[] DEFAULT '{}';

-- =========================================================================
-- 3. Column comments
-- =========================================================================
COMMENT ON COLUMN countries.sovereignty_md IS 'How it feels to exist here as a woman. Social texture, attention levels, local norms. Sourced from traveler reports.';
COMMENT ON COLUMN countries.solo_infrastructure_md IS 'Can you navigate independently? Transit, apps, connectivity, language reality.';
COMMENT ON COLUMN countries.health_access_md IS 'Medical care quality, pharmacy access, reproductive health, what to pack.';
COMMENT ON COLUMN countries.experience_density_md IS 'What draws women here. Richness, pacing, variety of experiences.';
COMMENT ON COLUMN countries.community_connection_md IS 'Where and how solo women meet people. Traveler scene, social infrastructure.';
COMMENT ON COLUMN countries.cost_reality_md IS 'Real daily costs including safety premium. The midnight taxi, the solo room, the guided tour.';
COMMENT ON COLUMN countries.immigration_url IS 'Official government immigration/visa portal URL';
COMMENT ON COLUMN countries.arrival_card_url IS 'Digital arrival card URL if required (e.g. Visit Japan Web)';
COMMENT ON COLUMN countries.sim_providers IS 'JSON array of {name, url, note} for tourist SIM providers';
COMMENT ON COLUMN countries.health_search_terms IS 'Google Places Text Search queries for finding women health facilities in this country';
```

**Step 2: Expand place_type to include hospital**

```sql
-- =========================================================================
-- 4. Add 'hospital' to places place_type CHECK constraint
-- =========================================================================
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_place_type_check;
ALTER TABLE places ADD CONSTRAINT places_place_type_check CHECK (place_type IN (
  'hotel', 'hostel', 'homestay', 'restaurant', 'cafe', 'bakery', 'bar', 'club', 'rooftop',
  'activity', 'coworking', 'landmark', 'transport', 'shop',
  'wellness', 'spa', 'salon', 'gym',
  'laundry', 'pharmacy', 'clinic', 'hospital', 'atm', 'police', 'tour'
));
```

**Step 3: Update TypeScript Country interface in `data/types.ts`**

Add to the Country interface:
```typescript
  // Dimension content (markdown)
  sovereigntyMd: string | null;
  soloInfrastructureMd: string | null;
  healthAccessMd: string | null;
  experienceDensityMd: string | null;
  communityConnectionMd: string | null;
  costRealityMd: string | null;
  // Practical links
  immigrationUrl: string | null;
  arrivalCardUrl: string | null;
  simProviders: Array<{ name: string; url: string; note?: string }> | null;
  healthSearchTerms: string[] | null;
```

**Step 4: Update `mapCountry` in `data/api.ts`**

Add to the mapCountry function's return object:
```typescript
  sovereigntyMd: raw.sovereignty_md ?? null,
  soloInfrastructureMd: raw.solo_infrastructure_md ?? null,
  healthAccessMd: raw.health_access_md ?? null,
  experienceDensityMd: raw.experience_density_md ?? null,
  communityConnectionMd: raw.community_connection_md ?? null,
  costRealityMd: raw.cost_reality_md ?? null,
  immigrationUrl: raw.immigration_url ?? null,
  arrivalCardUrl: raw.arrival_card_url ?? null,
  simProviders: raw.sim_providers ?? null,
  healthSearchTerms: raw.health_search_terms ?? null,
```

**Step 5: Run migration locally**

```bash
npx supabase db reset
```

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 7: Commit**

```bash
git add supabase/migrations/20260211_country_dimensions.sql data/types.ts data/api.ts
git commit -m "feat: add 6-dimension columns and practical links to countries schema"
```

---

## Phase 2: Content Rewrite (All 12 Countries)

### Task 2: Rewrite geo-content.ts with dimension-first content

**Files:**
- Modify: `scripts/content/geo-content.ts` (the `countryContent` array)

This is the bulk content rewrite. Each country gets new fields populated. The old fields (`safety_women_md`, `why_we_love_md`, `money_md`, etc.) remain for backwards compatibility but the new dimension fields become primary.

**Content Guidelines:**

1. **sovereignty_md** format: "Women who've traveled [country] describe [X]. [Specific observations about social texture]. [How local women navigate the same space]. [What shifts between cities/regions]."

2. **solo_infrastructure_md** format: "[Transit reality]. [App availability]. [Connectivity]. [Language barrier practical tips]. [What independence looks like here]."

3. **health_access_md** format: "[Medical care quality]. [Pharmacy access and what's available OTC]. [Reproductive health specifics]. [What to pack that you can't buy there]. [Insurance reality]."

4. **experience_density_md** format: "[What draws women here specifically]. [The pacing]. [Range of experiences per day/dollar]. [What surprised travelers most]."

5. **community_connection_md** format: "[Traveler scene description]. [Where solo women naturally meet people]. [Hostel/coworking culture]. [Local social infrastructure]. [Your app's community here]."

6. **cost_reality_md** format: "[Honest daily budget at comfort threshold]. [Where safety costs money and what those tradeoffs look like]. [Value assessment]. [Where to splurge vs save]."

**Step 1: Write new content for all 12 countries**

Each country entry in the `countryContent` array gets these new fields added. Here is the content for each country:

#### THAILAND
```typescript
sovereignty_md: `Women who have traveled Thailand consistently describe feeling at ease moving through public spaces. Thai culture values politeness and non-confrontation, which translates to minimal street attention. Eye contact and smiling are normal, friendly gestures rather than invitations. In tourist areas like Koh San Road or Patong, the atmosphere shifts after dark toward a more party-oriented crowd, but the overall social texture remains relaxed. Temples and rural villages are more conservative about dress, and local women typically cover shoulders and knees in these settings. Solo women travelers often note Thailand as the place where they stopped thinking about being a woman traveling alone and just started traveling.`,

solo_infrastructure_md: `Thailand makes independent navigation straightforward. Bangkok's BTS Skytrain and MRT run until midnight with clear English signage. Grab (ride-hailing) covers the entire country and works reliably at any hour. Between cities, domestic flights are frequent and affordable, overnight trains run on schedule, and intercity buses are well-organized. 4G/5G coverage from AIS, TrueMove, or DTAC is strong across the country, and tourist SIM cards cost under $10 at any airport. Google Maps is accurate and up-to-date. English signage exists in all tourist areas, and younger Thais in cities speak conversational English. In northern hill towns and smaller islands, a few Thai phrases help, but offline translation apps fill the gaps easily.`,

health_access_md: `Thailand has some of the best medical infrastructure in Southeast Asia and is a major medical tourism destination. Bangkok hospitals like Bumrungrad and BNH operate at international standards with English-speaking staff. Pharmacies (look for green cross signs) are everywhere and stock a wide range of medications over the counter, including antibiotics, contraception, and UTI treatments that would require prescriptions elsewhere. Menstrual products (pads widely available, tampons in pharmacies and convenience stores in tourist areas) are easy to find. For anything beyond basics, private hospitals in Bangkok, Chiang Mai, and Phuket provide same-day appointments. Travel insurance with medical coverage is straightforward to use here. Pack any specific prescription medications you rely on, plus your preferred brand of sunscreen (local options run high on whitening agents).`,

experience_density_md: `Thailand packs an unusual range of experiences into a single trip. A week can hold temple exploration in the morning, a Thai cooking class at midday, a market crawl in the afternoon, and a rooftop sunset. The north offers mountains, hill tribe villages, and elephant sanctuaries. The south splits between Andaman Sea limestone karsts and Gulf islands with different personalities (party, wellness, remote). Bangkok alone could fill weeks between street food, contemporary art, canal neighborhoods, and weekend markets. The food is the constant thread, with regional specialties that change dramatically between cities. Travelers frequently describe Thailand as the destination where one trip became three because every region revealed something they did not expect.`,

community_connection_md: `Thailand has one of the most established solo traveler communities in the world. Hostels in Bangkok, Chiang Mai, and the islands run regular social events, group excursions, and communal dinners. Coworking spaces in Chiang Mai (Punspace, CAMP) and Bangkok function as social hubs for digital nomads and long-term travelers. Yoga retreats in Koh Phangan and Pai create instant communities. Muay Thai gyms in Chiang Mai and Bangkok attract a regular crowd of solo women training together. The backpacker trail through Thailand is so well-worn that meeting other solo travelers happens naturally at hostels, cooking classes, and island ferries. For women traveling alone for the first time, this built-in social infrastructure removes one of the biggest anxieties.`,

cost_reality_md: `A comfortable daily budget in Thailand runs $35 to $50. That covers a private room in a guesthouse ($15 to $25), three meals mixing street food and sit-down restaurants ($10 to $15), local transport ($3 to $5), and one activity or entrance fee ($5 to $10). Where comfort costs more: a private taxi from the airport to your hotel ($15) versus the bus ($2), a women-only dorm bed versus a mixed dorm ($3 to $5 difference), and a Grab at 2am versus walking ($5 to $8). Islands are 20 to 30 percent more expensive than mainland. Bangkok is affordable for a capital city. The north (Chiang Mai, Pai) is the best value region. Splurge-worthy: a spa day ($30 to $50 for treatments that cost $200 elsewhere), cooking classes ($25 to $35), and island boat tours ($20 to $40).`,

immigration_url: 'https://www.thaievisa.go.th/',
arrival_card_url: null,
sim_providers: JSON.stringify([
  { name: 'AIS', url: 'https://www.ais.th/travellersim/', note: 'Largest carrier. Traveller SIM at airports.' },
  { name: 'TrueMove H', url: 'https://www.true.th/truemoveh/', note: 'Strong 5G. Tourist SIM at airports and 7-Eleven.' },
]),
health_search_terms: ['gynecologist', 'women health clinic', 'international hospital', 'pharmacy'],
```

#### VIETNAM
```typescript
sovereignty_md: `Women who have traveled Vietnam describe a culture that is curious and direct. Vendors in tourist areas can be persistent, and a firm but friendly "khong, cam on" (no, thank you) is the standard local way to decline. Staring is common but culturally neutral rather than aggressive. In cities, motorbike traffic creates a constant energy that some travelers find overwhelming on day one and exhilarating by day three. Outside tourist zones, solo women travelers report very little unwanted attention. Vietnamese women are visible in every part of public and business life, and local social norms do not restrict where women go or when. The north tends to be slightly more reserved in interaction style than the south, where conversations with strangers start easily.`,

solo_infrastructure_md: `Vietnam rewards preparation but is navigable independently. Grab covers Hanoi, Ho Chi Minh City, Da Nang, and major tourist cities reliably. Intercity travel runs on an efficient network of domestic flights (VietJet, Bamboo Airways), overnight sleeper buses, and the Reunification Express train. Google Maps is accurate in cities but less reliable on rural roads. Viettel, Vinaphone, and Mobifone sell tourist SIMs at airports with strong 4G coverage. English is widely spoken in tourist areas and by younger Vietnamese, but drops off quickly outside hotels and restaurants. Offline translation apps (Google Translate with Vietnamese downloaded) make a significant difference. Street addresses follow a logical numbering system, but finding specific locations in alleys (hẻm) takes patience. Crossing streets in traffic is a learned skill: walk at a steady pace and let motorbikes flow around you.`,

health_access_md: `Vietnam has two tiers of healthcare. International clinics in Hanoi and Ho Chi Minh City (Family Medical Practice, Raffles Medical) offer English-speaking care at international standards. Public hospitals are crowded but competent for emergencies. Pharmacies (nhà thuốc) are abundant and sell many medications without prescription, including antibiotics and some contraceptives. Availability of specific contraceptive brands varies, so bring your own supply if you rely on a particular one. Menstrual products (pads everywhere, tampons in pharmacies in major cities) are accessible. For dental emergencies, both cities have well-reviewed international dental clinics. Travel insurance is essential here, and international clinics will often work directly with your insurer. Pack: any prescription medications, preferred contraception, sunscreen (local options emphasize whitening), and insect repellent for rural areas.`,

experience_density_md: `Vietnam is one of the most experience-dense countries in Southeast Asia. The food alone justifies the trip: each region has distinct specialties that change every few hundred kilometers, from pho in Hanoi to banh mi in Hoi An to broken rice in Saigon. Beyond food, the landscape variety is striking. Ha Long Bay's limestone karsts, Sapa's terraced rice paddies, Hoi An's lantern-lit old town, the sand dunes of Mui Ne, and the floating markets of the Mekong Delta all feel like different countries. A two-week trip can hold city energy, mountain trekking, beach time, and river cruising. The pace moves fast in the south and slows in the north. Travelers frequently highlight Hoi An (where you can get clothes custom-tailored in 24 hours) and the overnight train from Hanoi to Sapa as defining memories.`,

community_connection_md: `Vietnam's solo travel community is growing rapidly, particularly in Ho Chi Minh City, Hanoi, Da Nang, and Hoi An. Hostels in all four cities run social programs, walking tours, and motorbike adventures. Coworking spaces in Da Nang and HCMC (Dreamplex, Toong) attract a steady digital nomad crowd. Cooking classes and street food tours are natural connection points where solo travelers meet. Hoi An's small-town scale makes repeat encounters with the same travelers likely. The backpacker scene is strongest on the "north to south" or "south to north" route, where you will keep running into the same people at the next stop. Vietnamese coffee culture (sit-down cafes with slow drip coffee) creates a social rhythm that invites conversation with both locals and travelers.`,

cost_reality_md: `Vietnam is one of the most affordable destinations in Southeast Asia. A comfortable daily budget runs $30 to $45. That covers a private room ($10 to $20), excellent food all day ($8 to $12, with street food meals under $2), local transport ($3 to $5), and activities ($5 to $10). Where comfort costs more: internal flights between Hanoi and HCMC ($40 to $80 versus a 36-hour bus), a Grab instead of walking after dark in unfamiliar areas ($2 to $5), and private boats versus group tours in Ha Long Bay ($80 to $150 difference). Hoi An and Da Nang offer the best value for quality of life. HCMC nightlife districts charge tourist prices. The biggest budget trap is organized tours, many of which can be replicated independently for a fraction of the cost with a bit of research.`,

immigration_url: 'https://evisa.xuatnhapcanh.gov.vn/',
arrival_card_url: null,
sim_providers: JSON.stringify([
  { name: 'Viettel', url: 'https://www.viettel.com.vn/', note: 'Largest carrier. Best rural coverage.' },
  { name: 'Mobifone', url: 'https://www.mobifone.vn/', note: 'Good tourist packages. Available at airports.' },
]),
health_search_terms: ['international clinic', 'women health', 'gynecologist', 'pharmacy'],
```

#### INDONESIA
```typescript
sovereignty_md: `Women who have traveled Indonesia describe a spectrum that shifts dramatically between islands. Bali operates almost entirely on tourism economics, and solo women move through spaces with minimal friction. The wellness and digital nomad scene means women traveling alone are the norm, not the exception. Outside Bali, the experience changes. Java and Sumatra are majority Muslim, and dress norms are more conservative (covering shoulders and knees). In Yogyakarta and Jakarta, interactions are warm and curious rather than intrusive. Aceh province in northern Sumatra follows Sharia law and requires modest dress including head covering for women. Lombok falls between Bali and Java in social texture. Solo women travelers consistently note that reading the specific region you are visiting, rather than "Indonesia" as a monolith, is essential to preparation.`,

solo_infrastructure_md: `Indonesia's infrastructure varies island to island. Bali has excellent coverage: Grab and Gojek (local ride-hailing) work reliably, scooter rental is the default transport, and English signage is widespread. Java's major cities have good public transit (Jakarta's TransJakarta bus network, Yogyakarta's growing ride-hail coverage). Between islands, domestic flights (Lion Air, Garuda, Citilink) are the practical option and run frequently. Ferry services connect nearby islands but schedules shift. Telkomsel has the strongest cellular coverage across the archipelago, including smaller islands. Wi-Fi quality in Bali coworking spaces and cafes is excellent. On smaller islands (Flores, Komodo area, Raja Ampat), connectivity drops and offline maps become essential. Google Maps is accurate in Bali and Java, less so on remote islands.`,

health_access_md: `Healthcare quality in Indonesia concentrates in Bali and Jakarta. BIMC Hospital in Bali operates at international standards with English-speaking staff and handles everything from minor injuries to emergency surgery. Jakarta has several international-standard hospitals (Siloam, Pondok Indah). Pharmacies (apotek) in tourist areas stock a reasonable range of over-the-counter medications, including basic antibiotics and some contraceptives. Menstrual products (pads widely available, tampons in pharmacies in tourist areas) are accessible in Bali and major cities. Outside these areas, medical care is more basic. For remote island trips (Komodo, Raja Ampat), pack a comprehensive first-aid kit and ensure your travel insurance includes medical evacuation. Bali belly (traveler's stomach) is common in the first few days. Pharmacies sell Imodium and rehydration salts without prescription.`,

experience_density_md: `Indonesia contains multitudes. Bali alone offers temple ceremonies at dawn, surf lessons at midday, rice terrace walks in the afternoon, and fire dance performances at sunset. Ubud draws a wellness-seeking crowd with yoga, meditation, and traditional healing. Uluwatu and Canggu bring surf culture and beach clubs. But the country beyond Bali is where the depth lies: Yogyakarta's Borobudur temple at sunrise is transcendent. Komodo National Park puts you face-to-face with actual dragons. Raja Ampat has some of the richest marine biodiversity on earth. Sulawesi's Toraja highlands host elaborate funeral ceremonies. Each island feels like a separate country with its own culture, cuisine, and landscape. Travelers who make it beyond Bali consistently describe it as the point where Indonesia went from "nice beach trip" to "life-changing."`,

community_connection_md: `Bali has one of the strongest solo traveler communities in Asia. Canggu is the epicenter: coworking spaces (Dojo Bali, Outpost), surf schools, and cafe culture create a walkable social ecosystem where meeting people happens without effort. Ubud draws a wellness-oriented crowd with group yoga, sound healing circles, and plant-based cooking classes. Gili Islands (especially Gili Air) have a small-island social dynamic where everyone meets everyone within days. Hostels across Bali run social events, volcano sunrise trips, and island-hopping tours that function as built-in friend-making. Beyond Bali, the traveler community thins out but becomes more tight-knit. Flores, Lombok, and Yogyakarta attract a more experienced, connection-seeking traveler who is easy to bond with.`,

cost_reality_md: `Bali offers unusual value for the quality of experience. A comfortable daily budget runs $35 to $55. A private room in a guesthouse or villa ($15 to $30), three meals ($8 to $15), scooter rental ($4 to $6), and activities ($5 to $15) cover a full day. The comfort premium: Grab from clubs at night versus scooter ($5 to $10 difference), a private villa with pool versus hostel ($30 to $50), and guided volcano sunrise trips versus DIY ($20 difference). Canggu and Seminyak are the most expensive areas. Ubud and Sidemen offer better value. Outside Bali, costs drop: Yogyakarta and Flores run 30 to 40 percent cheaper. Island hopping costs add up (boat transfers $15 to $30 each), and Komodo tours start at $50 to $80 per day. The best value in Indonesia is the combination of quality accommodation, spa treatments ($10 to $20), and fresh food that would cost five times more in any Western country.`,

immigration_url: 'https://molina.imigrasi.go.id/',
arrival_card_url: null,
sim_providers: JSON.stringify([
  { name: 'Telkomsel', url: 'https://www.telkomsel.com/', note: 'Best coverage across islands. Tourist SIM at airports.' },
  { name: 'XL Axiata', url: 'https://www.xl.co.id/', note: 'Good data packages. Available at minimarts.' },
]),
health_search_terms: ['BIMC Hospital', 'international clinic Bali', 'gynecologist', 'pharmacy apotek'],
```

#### PHILIPPINES
```typescript
sovereignty_md: `Women who have traveled the Philippines describe one of the warmest social environments in Southeast Asia. Filipino culture is expressive, hospitable, and genuinely curious about visitors. English is an official language, which removes the communication barrier that amplifies discomfort elsewhere. Solo women report feeling welcomed rather than observed. Filipinas are visible in leadership across business, government, and daily life, and there is less gender-based social friction than in many neighboring countries. In tourist areas, attention from local men tends to be conversational rather than aggressive, and a friendly but clear response is well-understood. Some areas of Mindanao have active security advisories worth checking before planning routes (Siargao and Camiguin are exceptions with established tourist infrastructure and relaxed atmospheres).`,

solo_infrastructure_md: `Infrastructure in the Philippines varies significantly by island. Metro Manila and Cebu City have Grab, modern malls, and efficient domestic air connections. Between islands, Cebu Pacific and Philippine Airlines run frequent, affordable flights. Inter-island ferries connect major routes but schedules shift and delays are common. Building buffer days between island connections reduces stress. Jeepneys (colorful local buses) cover urban routes cheaply but can be confusing for newcomers. Tricycles handle last-mile transport in smaller towns. Globe and Smart sell tourist SIMs at airports with decent LTE in cities, though coverage on remote islands is patchy. Google Maps works well in populated areas. On more remote islands, asking locals for directions is often more reliable than GPS. The biggest infrastructure gap is inter-island logistics: getting from point A to point B can involve a flight, a van, and a boat, each on its own schedule.`,

health_access_md: `Metro Manila has excellent medical facilities. St. Luke's Medical Center and Makati Medical Center operate at international standards with English-speaking staff across all specialties. Cebu City has strong hospital coverage. Pharmacies (Mercury Drug is the dominant chain) stock a wide range of medications. Contraception (pills, some emergency contraception) is available at pharmacies, though the Philippines is a Catholic-majority country and pharmacist willingness to sell varies by location. Bring your own supply of preferred contraception. Menstrual products (pads everywhere, tampons harder to find outside Manila and Cebu) should be stocked before heading to islands. On remote islands, medical facilities are basic: pack a first-aid kit with antibiotics, rehydration salts, and antihistamines. Travel insurance with medical evacuation coverage is essential for island-hopping itineraries. Jellyfish stings and coral cuts are the most common medical issues for travelers.`,

experience_density_md: `The Philippines is defined by its islands. Palawan (El Nido, Coron) delivers lagoons, limestone cliffs, and underwater caves that travelers describe as the most beautiful water they have seen anywhere. Siargao has world-class surfing and a laid-back island rhythm. Bohol offers the otherworldly Chocolate Hills and tarsier encounters. Cebu has Kawasan Falls canyoneering and whale shark encounters. Each island has its own personality and pace. The food is comfort-oriented (adobo, sinigang, lechon) and increasingly celebrated by international chefs. Karaoke is a national pastime and an instant social connector. The density of Instagram-worthy natural landscapes per square kilometer is among the highest in Asia. Travelers consistently highlight the water: snorkeling, diving, island hopping, and underwater photography are world-class here.`,

community_connection_md: `Filipinos are among the most naturally social people you will encounter traveling. Conversations start easily: in jeepneys, at restaurants, waiting for ferries. The backpacker scene is strongest in El Nido, Siargao, and Cebu. Hostels on these islands run group island-hopping tours, sunset sessions, and communal dinners. Siargao has a growing surf and wellness community where solo travelers stay for weeks and form lasting connections. Coworking spaces are less developed than in Thailand or Bali, but Makati (Manila) and Cebu IT Park have growing digital nomad infrastructure. The island-hopping dynamic naturally creates travel groups: you will share boats, ferries, and vans with the same people for days, creating bonds quickly. Local homestays and community tourism projects on smaller islands offer genuine connection with Filipino families.`,

cost_reality_md: `The Philippines offers strong value, though island-hopping logistics add up. A comfortable daily budget runs $35 to $50. A private room ($12 to $25), three meals ($8 to $12), local transport ($3 to $5), and one activity ($8 to $15) cover a full day. Where costs climb: inter-island flights ($30 to $80), private boat tours in El Nido ($25 to $50 per person), and dive certifications ($250 to $350). The comfort premium shows in accommodation on remote islands, where a private room with AC and reliable Wi-Fi costs $30 to $50 versus a fan room at $10. ATMs can be scarce on smaller islands, so carrying cash when heading off the main routes is practical. Manila is the most expensive city, while Bohol and smaller Visayan islands offer the best value. The biggest hidden cost is tips and service charges, which are more expected here than in other Southeast Asian countries (10 percent is standard).`,

immigration_url: 'https://immigration.gov.ph/',
arrival_card_url: 'https://etravel.gov.ph/',
sim_providers: JSON.stringify([
  { name: 'Globe', url: 'https://www.globe.com.ph/', note: 'Major carrier. Tourist SIM at airports.' },
  { name: 'Smart', url: 'https://smart.com.ph/', note: 'Best rural coverage. Traveler SIM available.' },
]),
health_search_terms: ['international hospital', 'OB-GYN clinic', 'Mercury Drug pharmacy', 'women health'],
```

#### MALAYSIA
```typescript
sovereignty_md: `Women who have traveled Malaysia describe a modern, multicultural environment where the social texture varies by community and region. Kuala Lumpur is cosmopolitan, and solo women navigate the city with minimal friction. The mix of Malay, Chinese, and Indian communities means diverse norms coexist: some neighborhoods are lively and liberal, others more conservative. In Malay-majority areas and when visiting mosques, covering shoulders and knees aligns with local norms and is appreciated. Penang and Langkawi are relaxed tourist destinations where dress and behavior norms are casual. East Malaysia (Borneo) has a different cultural character entirely, with indigenous communities who are generally welcoming and curious about visitors. Malaysia has strong legal protections and public infrastructure that contribute to a comfortable baseline for solo women.`,

solo_infrastructure_md: `Malaysia is one of the easiest countries in Southeast Asia to navigate independently. Kuala Lumpur's LRT, MRT, and monorail system is modern, clean, and runs until midnight with English signage throughout. Grab covers the entire country reliably at any hour. Domestic flights (AirAsia is based here) connect Peninsular Malaysia, Borneo, and the islands affordably. Long-distance buses are comfortable and run on schedule. Maxis, CelcomDigi, or Hotlink sell tourist SIMs at airports with strong 4G/5G coverage even in smaller towns. English is widely spoken across all three major communities, especially in cities and tourist areas. Google Maps is accurate and up-to-date. The combination of reliable public transit, universal ride-hailing, widespread English, and strong connectivity makes Malaysia one of the lowest-friction solo travel destinations in the region.`,

health_access_md: `Malaysia has excellent healthcare infrastructure and is a major medical tourism destination. KPJ Healthcare and Pantai Hospital chains operate modern facilities across the country with English-speaking staff. Pharmacies (Guardian and Watsons chains) are everywhere and stock a wide range of over-the-counter medications. Contraception (pills and emergency contraception) is available at pharmacies without prescription. Menstrual products (all types) are widely available at pharmacies and convenience stores. For specialist care, KL has hospitals that attract patients from across the region. Public hospitals are competent but slower. Private hospital visits are affordable by international standards ($20 to $50 for a GP consultation). Travel insurance works smoothly here. Pack: any specific prescription medications and preferred sunscreen brands.`,

experience_density_md: `Malaysia's multicultural identity creates an experience density that is unique in the region. KL holds Malay, Chinese, and Indian neighborhoods within walking distance of each other, each with distinct food, markets, and architecture. Penang is frequently cited as having the best street food in Asia, full stop. The Cameron Highlands offer colonial-era tea plantations and cool mountain air. Langkawi delivers beaches and duty-free shopping. And then there is Borneo: Sabah and Sarawak hold ancient rainforests, orangutan encounters, and Kinabalu, the tallest peak in Southeast Asia. The food is the thread that connects everything, and the variety within a single hawker center (Malay, Chinese, Indian, Nonya fusion) means you can eat world-class meals three times a day without repeating a cuisine.`,

community_connection_md: `KL has a growing digital nomad and expat community centered around coworking spaces in Bangsar and KLCC. The diversity of the city means finding your people is straightforward: there are communities organized around food tours, hiking groups, language exchanges, and creative industries. Penang has a smaller but tight-knit traveler scene centered in Georgetown's heritage zone. Hostels across the country are well-run and social. Borneo attracts a more adventure-oriented traveler, and group treks, dive trips, and wildlife tours create natural bonding opportunities. Malaysia's position as a regional hub means KL is full of people passing through on their way somewhere else, which creates a constantly refreshing social pool. Local Malaysians are friendly and often happy to recommend food spots and hidden neighborhoods.`,

cost_reality_md: `Malaysia sits in the sweet spot between Southeast Asian budget destinations and expensive city-states. A comfortable daily budget runs $40 to $55. A clean private room ($15 to $30), three outstanding meals ($10 to $15), local transport ($3 to $5), and activities ($5 to $10) cover a full day. KL's food is extraordinary value: a hawker center meal costs $2 to $4, and even upscale restaurants are moderate by international standards. Where comfort costs more: taxis to and from the airport ($15 to $20 versus the train at $4), beachfront accommodation on Langkawi or Perhentians ($40 to $80), and Borneo activities (Kinabalu climb permits $50 to $100, dive trips $30 to $50). The strongest value is in Penang and Ipoh, where food quality is world-class and costs are low. Borneo is more expensive due to logistics but worth the premium for what you experience.`,

immigration_url: 'https://www.imi.gov.my/',
arrival_card_url: 'https://imigresen-online.imi.gov.my/mdac/main',
sim_providers: JSON.stringify([
  { name: 'Hotlink (Maxis)', url: 'https://www.hotlink.com.my/', note: 'Popular prepaid brand. Tourist plans at airports.' },
  { name: 'CelcomDigi', url: 'https://www.celcomdigi.com/', note: 'Largest carrier after merger. Strong nationwide.' },
]),
health_search_terms: ['KPJ women specialist hospital', 'gynecologist', 'pharmacy Guardian', 'international clinic'],
```

#### SINGAPORE
```typescript
sovereignty_md: `Women who have traveled Singapore consistently describe it as one of the most comfortable places in the world to exist as a solo woman. Strict enforcement of public conduct laws means street harassment is rare. Public spaces are well-lit, well-maintained, and busy at most hours. The city-state's small size and efficient design mean there are few situations where you feel isolated or far from help. The multicultural social fabric (Chinese, Malay, Indian, expat) is cosmopolitan and tolerant. LGBTQ+ visibility is growing. Solo women travelers often describe Singapore as the destination where they felt least conscious of traveling alone, because the infrastructure and social environment make solo navigation completely unremarkable.`,

solo_infrastructure_md: `Singapore may be the most efficiently navigable city in the world for a solo traveler. The MRT (metro) covers the entire island, runs from 5:30am to midnight, is spotlessly clean, and has English signage and announcements. Buses fill every gap the MRT misses. Grab is available everywhere but often unnecessary given the transit quality. The EZ-Link card (tap-on, tap-off transit card) simplifies everything. 5G coverage is universal. Singtel, StarHub, and M1 sell tourist SIMs at Changi Airport. English is one of four official languages and is used in all signage, menus, and daily business. Google Maps is precise to the building entrance. Free public Wi-Fi exists in many places. The city is compact enough that you can walk between major areas. Everything runs on time. Everything is signposted. The biggest challenge is not navigation but the heat and humidity, which makes air-conditioned transit preferable to walking at midday.`,

health_access_md: `Singapore has world-class healthcare. KK Women's and Children's Hospital is a public specialist facility dedicated to women's health. Private hospitals (Mount Elizabeth, Thomson Medical, Raffles Hospital) offer same-day appointments with English-speaking specialists. Pharmacies (Guardian, Watsons, Unity) stock everything you would find at home. Contraception, menstrual products (all types), and most over-the-counter medications are readily available. GP visits at private clinics cost $30 to $60 SGD. Specialist appointments run higher but are still reasonable by international standards. The main consideration is cost: Singapore healthcare is excellent but expensive without insurance. Travel insurance is essential. Emergency care (dial 995) is responsive and professional. Pack: nothing special needed. Singapore has everything.`,

experience_density_md: `Singapore packs remarkable variety into 733 square kilometers. In a single day, you can explore a hawker center for breakfast ($3 for world-class laksa), wander through the ethnic neighborhoods of Little India, Chinatown, and Kampong Glam, visit the futuristic Gardens by the Bay, browse the National Gallery's Southeast Asian art collection, and end with cocktails at a rooftop bar overlooking Marina Bay. The food scene ranges from $2 hawker stalls (several have Michelin stars) to innovative fine dining. Cultural experiences rotate through the calendar: Lunar New Year, Deepavali, Hari Raya, and Christmas each transform different neighborhoods. Day trips to Sentosa Island, Pulau Ubin (rural island), and the Southern Ridges walking trail add nature to the urban mix. What Singapore lacks in geographic scale, it compensates with density of quality.`,

community_connection_md: `Singapore's expat and digital nomad community is large and well-organized. Coworking spaces (WeWork, JustCo, The Great Room) host regular networking events. Meetup groups cover everything from hiking to book clubs to women-in-tech. The bar and cafe scene in neighborhoods like Tiong Bahru, Keong Saik, and Holland Village facilitates organic connection. Hostels in the Chinatown and Little India areas run social programs for budget travelers. The city's position as a business hub means many visitors are traveling solo for work and are open to meeting people. Singapore is also a natural gateway city, so travelers passing through on their way to Bali, Bangkok, or Borneo often overlap for a few days and connect. The local community is welcoming but tends to be reserved in public, social connection happens more through organized activities and shared spaces than spontaneous street encounters.`,

cost_reality_md: `Singapore is the most expensive destination on this list. A comfortable daily budget runs $80 to $120 SGD ($60 to $90 USD). Accommodation is the biggest cost: a hostel dorm bed runs $25 to $40, a private room $60 to $100. Food is where Singapore surprises: hawker center meals cost $3 to $6 and are genuinely world-class. A full day of excellent eating costs $15 to $20 if you stick to hawker centers and coffee shops. MRT transit costs $2 to $4 per day. Many of the best experiences (Gardens by the Bay outdoor areas, neighborhood walks, temple visits, park trails) are free. Where the premium hits: cocktails ($18 to $25), taxis at peak hours (surge pricing), and Sentosa Island attractions ($30 to $50). The best strategy is to eat at hawkers, use transit instead of Grab, visit free attractions during the day, and allocate your splurge budget to one or two memorable meals or experiences.`,

immigration_url: 'https://www.ica.gov.sg/',
arrival_card_url: 'https://eservices.ica.gov.sg/sgarrivalcard/',
sim_providers: JSON.stringify([
  { name: 'Singtel', url: 'https://www.singtel.com/personal/products-plans/mobile/prepaid-plans/hi-tourist', note: 'hi!Tourist SIM at Changi Airport.' },
  { name: 'StarHub', url: 'https://www.starhub.com/', note: 'Happy Prepaid tourist SIM. Airport kiosks.' },
]),
health_search_terms: ['KK Women Children Hospital', 'gynecologist', 'women health clinic', 'pharmacy'],
```

#### CAMBODIA
```typescript
sovereignty_md: `Women who have traveled Cambodia describe a country where warmth and directness coexist. Khmer people are generally gentle and respectful in interactions. In Siem Reap and Phnom Penh's tourist areas, tuk-tuk drivers and vendors are persistent but not aggressive, and a clear "no thank you" is well understood. Bag snatching from passing motorbikes is the most commonly reported concern in Phnom Penh, and solo women travelers who have been there recommend wearing bags cross-body on the side away from the road as standard practice. Outside tourist zones, staring is common but reflects curiosity rather than hostility. Cambodia's difficult history (the Khmer Rouge era) is still present in the culture, and approaching historical topics with respect is important. The overall social texture is quieter and more subdued than neighboring Thailand or Vietnam.`,

solo_infrastructure_md: `Cambodia's infrastructure is developing but functional for the main tourist circuit. Siem Reap, Phnom Penh, and Sihanoukville are connected by improving roads and affordable domestic flights. PassApp (local ride-hailing) is the go-to transport app and works reliably in major cities. Tuk-tuks are the default local transport, and negotiating a fair price beforehand avoids confusion. Metfone, Smart, and Cellcard sell tourist SIMs at airports with reasonable 4G coverage in cities and tourist areas, though connectivity drops in rural regions. English is moderately spoken in tourist infrastructure (hotels, restaurants, tour guides) but limited elsewhere. Google Maps is useful in cities but less reliable on rural roads. The road between Siem Reap and Phnom Penh is now a smooth highway (5 to 6 hours by bus). Some rural roads remain rough, especially in rainy season. Boats connect Siem Reap and Phnom Penh via Tonle Sap, though the trip is long and varies with water levels.`,

health_access_md: `Medical facilities in Cambodia are improving but still limited compared to neighbors. Phnom Penh has several international clinics (SOS International, Royal Phnom Penh Hospital) that handle most medical needs in English. Siem Reap has basic international clinic coverage. For serious medical issues, evacuation to Bangkok (a 1-hour flight) is standard practice and should be covered by your travel insurance. Pharmacies in major cities stock basic medications, antibiotics, and pain relief. Contraception availability is inconsistent, so bring your own supply. Menstrual products (pads widely available, tampons harder to find) should be stocked in major cities before heading to rural areas or islands. Koh Rong and other southern islands have minimal medical facilities. Pack a comprehensive first-aid kit, prescription medications, insect repellent (dengue is present), and rehydration salts. Note: some rural and border areas still have unexploded ordnance from past conflicts, so stick to established paths.`,

experience_density_md: `Angkor Wat alone makes Cambodia worth the trip. The temple complex is vast (buy a multi-day pass), and sunrise over the main temple is one of those travel moments that lives up to every photo you have seen. Beyond Angkor, Cambodia offers a different kind of depth. Phnom Penh's Killing Fields and S21 museum provide confronting, important historical context. The Royal Palace and National Museum balance the heaviness with beauty. Southern islands like Koh Rong are developing but still have stretches of empty beach. Battambang has a growing art scene and the bamboo railway. Kampot offers riverside calm, pepper plantations, and Bokor Hill Station. Khmer cuisine (fish amok, lok lak, morning noodle soups) is distinctive and underrated. The experience here is less about packing activities and more about the emotional resonance of a country rebuilding itself with dignity.`,

community_connection_md: `The backpacker scene in Cambodia is well-established along the Siem Reap to Phnom Penh to Islands route. Siem Reap's Pub Street area is the social hub, where hostels organize temple tours, cooking classes, and pub crawls. Phnom Penh has a growing digital nomad community centered around the BKK1 neighborhood, with cafes and coworking spaces. Kampot attracts a more alternative, long-stay crowd. On Koh Rong and Koh Rong Samloem, the island vibe creates tight communities within days. Cambodia also has a strong NGO and volunteer community, and some travelers connect through short-term teaching or community projects (research organizations carefully to avoid voluntourism pitfalls). The overall social dynamic is more intimate than Thailand or Vietnam, as fewer tourists mean tighter connections.`,

cost_reality_md: `Cambodia is one of the most affordable destinations in Southeast Asia. A comfortable daily budget runs $25 to $40. A private room ($8 to $18), three meals ($6 to $10), tuk-tuk transport ($3 to $8 per day), and activities ($5 to $15) cover a full day. The Angkor Wat multi-day pass is the biggest single expense ($62 for three days, worth every dollar). USD is the primary currency in tourist areas, and ATMs dispense dollars. Where comfort costs more: a private tuk-tuk for temple touring ($15 to $20 versus sharing at $8), AC rooms versus fan rooms ($5 to $10 difference), and the southern islands (30 to 40 percent higher than the mainland). Phnom Penh is slightly more expensive than Siem Reap for accommodation. The biggest value is food: a full Khmer meal at a local restaurant costs $2 to $4, and the quality is excellent.`,

immigration_url: 'https://www.evisa.gov.kh/',
arrival_card_url: null,
sim_providers: JSON.stringify([
  { name: 'Smart Axiata', url: 'https://www.smart.com.kh/', note: 'Largest carrier. Tourist SIM at airports.' },
  { name: 'Cellcard', url: 'https://www.cellcard.com.kh/', note: 'Oldest carrier. Good urban coverage.' },
]),
health_search_terms: ['international clinic', 'SOS clinic', 'hospital', 'pharmacy'],
```

#### LAOS
```typescript
sovereignty_md: `Women who have traveled Laos describe one of the gentlest social environments in Southeast Asia. Laotian culture is reserved, Buddhist-influenced, and non-confrontational. Interactions tend to be quiet and respectful. Solo women travelers consistently note the absence of the persistent attention that exists in more tourist-heavy neighbors. Vientiane and Luang Prabang are small enough that you become a familiar face quickly. In rural areas, curiosity about visitors is genuine and non-intrusive. The biggest practical considerations are not social but physical: road conditions in mountain areas can be challenging, and the Vang Vieng tubing/party scene involves alcohol and river currents that require self-awareness. Laos moves at a slower pace than its neighbors, and that pace extends to how people interact with you.`,

solo_infrastructure_md: `Laos requires more self-reliance than Thailand or Vietnam. Vientiane and Luang Prabang have basic tourist infrastructure, but ride-hailing apps are limited or nonexistent. Tuk-tuks and songthaews (shared trucks) handle local transport, with price negotiation before boarding. The new China-Laos Railway connects Vientiane to Luang Prabang in under two hours (a game-changer for what used to be a winding 6-hour bus ride). Other intercity travel is by bus on mountain roads that are slow and winding. Domestic flights exist but are limited. Unitel and Lao Telecom sell tourist SIMs with 3G/4G coverage in cities, but connectivity drops quickly outside urban areas. Wi-Fi in guesthouses varies from functional to frustrating. English is spoken in tourist-facing businesses in Luang Prabang and Vientiane, but limited elsewhere. Download offline maps and a translation app before heading to rural areas. The reward for the extra logistical effort is a country that feels genuinely uncrowded and authentic.`,

health_access_md: `Healthcare in Laos is the most limited of any country on this list. Vientiane has a few international clinics (Alliance International Medical Center) that handle basic care. For anything beyond basics, medical evacuation to Udon Thani, Thailand (25km from Vientiane by road) or Bangkok is standard practice. This should be a specific consideration when choosing travel insurance: ensure your policy covers cross-border medical evacuation. Pharmacies in Vientiane and Luang Prabang stock basic medications, but selection is limited and expiry dates should be checked. Contraception availability is inconsistent. Menstrual products (pads available in towns, tampons rare) should be stocked before leaving major cities. For trips to remote areas, pack a thorough first-aid kit including antibiotics, rehydration salts, water purification, and any medications you might need. The nearest reliable women's health specialist care is in Thailand.`,

experience_density_md: `Laos offers something rare in modern travel: genuinely uncrowded experiences in stunning natural settings. Luang Prabang is a UNESCO World Heritage town where saffron-robed monks collect alms at dawn, waterfalls cascade through turquoise pools (Kuang Si), and French colonial architecture sits alongside ornate temples. The pace is contemplative rather than frenetic. Vang Vieng has evolved from pure party town to include kayaking, rock climbing, and cave exploration surrounded by limestone karsts. The Mekong River runs through the country and can be traveled by slow boat from the Thai border to Luang Prabang, a two-day journey through mountain scenery. The Bolaven Plateau in the south has coffee plantations and waterfalls. The experience density per day is lower than Thailand or Vietnam, but the quality of each experience, the absence of crowds, and the meditative pace make up for it.`,

community_connection_md: `Laos attracts a particular kind of traveler: less first-timer, more experienced and seeking something quieter. The traveler community is smaller but warmer than in busier destinations. Luang Prabang's guesthouses and cafes create natural meeting points. The slow boat from Thailand is a two-day communal experience where friendships form quickly. Vang Vieng has social infrastructure around the tubing and activity scene. The digital nomad community is minimal compared to neighbors. Connection in Laos happens more organically, through shared meals at guesthouses, chance encounters on bus rides, and the intimacy of small towns where you see the same faces daily. Laotian people are friendly but reserved, and connection with locals builds through repeated, gentle interaction rather than instant warmth.`,

cost_reality_md: `Laos is one of the most affordable destinations in Southeast Asia. A comfortable daily budget runs $25 to $35. A guesthouse room ($8 to $15), three meals ($5 to $8), local transport ($2 to $5), and activities ($3 to $8) cover a full day. Luang Prabang is the most expensive area due to its UNESCO status and tourist pricing, but still affordable by international standards. Vientiane and the south are cheaper. Where costs add up: the slow boat trip ($25 to $35 including overnight accommodation at Pak Beng), organized trekking tours ($20 to $40 per day), and Vang Vieng adventure activities ($10 to $20 each). ATMs exist in major towns but carry cash when heading rural. Lao Kip is the currency, but Thai Baht and USD are accepted in tourist areas. The biggest hidden cost is transport time: bus journeys are long and sometimes worth replacing with domestic flights ($50 to $80) if your time budget is tight.`,

immigration_url: 'https://laoevisa.gov.la/',
arrival_card_url: null,
sim_providers: JSON.stringify([
  { name: 'Unitel', url: 'https://www.unitel.com.la/', note: 'Largest carrier. Best 4G coverage.' },
  { name: 'Lao Telecom', url: 'https://www.laotelecom.com/', note: 'State telecom. Available at airports.' },
]),
health_search_terms: ['international clinic Vientiane', 'hospital', 'pharmacy'],
```

#### MYANMAR
```typescript
sovereignty_md: `Myanmar presents a complex situation that requires current research before travel. Since the 2021 military coup, conditions have shifted significantly. In periods when travel is possible, women who have been to Myanmar describe Burmese people as among the warmest and most respectful they have encountered anywhere. Interactions tend to be gentle, curious, and hospitable. Burmese culture is deeply Buddhist, and the social environment for women in accessible areas (Yangon, Bagan, Inle Lake) was historically comfortable. However, the political situation creates unpredictability that affects daily logistics, communication (internet shutdowns are frequent), and regional access. Some areas have active armed conflict and are restricted for foreigners. This is a destination where checking current travel advisories from multiple governments before and during travel is essential, and where plans must remain flexible.`,

solo_infrastructure_md: `Infrastructure in Myanmar was developing rapidly before 2021 and has since deteriorated in some areas. When accessible, Yangon has taxis and the Grab-like app "oway." Domestic flights connect Yangon, Mandalay, Bagan, and Inle Lake when operating. Buses connect major cities but roads are slow. MPT (the state telecom) has the widest coverage, though internet censorship is heavy and VPN use is essential. Internet shutdowns and throttling occur unpredictably. Download offline maps, a VPN, and offline translation tools before arrival. English is limited outside tourist-facing businesses. Myanmar's currency (Kyat) fluctuates significantly, ATMs can be unreliable, and bringing clean USD cash is still recommended. This is a destination that requires significantly more advance preparation and comfort with changing plans than its neighbors. The infrastructure gap compared to Thailand (which is next door) is substantial.`,

health_access_md: `Medical infrastructure in Myanmar is limited and has been further strained since 2021. Yangon has a few private hospitals (Asia Royal Hospital, Pun Hlaing International Hospital) that provide reasonable care. Outside Yangon, medical facilities are basic. For any serious medical needs, evacuation to Bangkok is the standard approach and should be covered by your travel insurance. Check that your policy specifically covers Myanmar, as some insurers have exclusions due to the political situation. Pharmacies in Yangon stock basic medications, but availability is inconsistent for specialized items. Bring all prescription medications, contraception, a comprehensive first-aid kit, and any over-the-counter medications you might need. Menstrual products (pads in towns, tampons very rare) should be stocked before leaving Yangon. Water purification is essential outside hotels. The medical evacuation consideration is the single most important health planning factor for Myanmar.`,

experience_density_md: `When accessible, Myanmar offers experiences found nowhere else. Bagan's temple plain, with thousands of ancient structures spreading across a dusty landscape, rivals Angkor Wat in scale and surpasses it in solitude. Inle Lake's floating gardens, stilt villages, and one-leg rowing fishermen exist in a world of their own. Yangon's Shwedagon Pagoda at sunset is transcendent. The hill tribes of Shan State offer trekking through landscapes and communities largely unchanged by modern tourism. Burmese cuisine (tea leaf salad, mohinga noodle soup, shan noodles) is distinctive and increasingly recognized internationally. The country's partial isolation from mass tourism means the experiences feel raw and unpackaged in a way that is increasingly rare in Southeast Asia. Travelers who visited during accessible periods frequently describe it as the most moving destination they have experienced.`,

community_connection_md: `The solo travel community in Myanmar is small and mostly consists of experienced, independent travelers comfortable with uncertainty. When tourism is open, guesthouses in Bagan, Inle Lake, and Yangon create natural social points. Group tours are common for temple circuits and lake trips, creating connection opportunities. The traveler dynamic here is different from the backpacker party circuit: people who choose Myanmar tend to be thoughtful, curious, and open to deep conversation. Connection with local Burmese people, when it happens, is often described as some of the most genuine cross-cultural exchange travelers experience anywhere. The country's isolation and challenges create a sense of shared experience among visitors.`,

cost_reality_md: `Myanmar, when accessible, is moderately affordable. A comfortable daily budget runs $30 to $50. Accommodation ranges from $10 to $25 for a private room, food costs $5 to $10 per day, and domestic flights (the practical way to cover distances) run $40 to $80 per segment. The currency situation is the biggest practical challenge: the Kyat fluctuates significantly, and there is often a gap between official and street exchange rates. ATMs may not work with all foreign cards. Bringing clean, undamaged USD bills (2006 series or newer, no folds or marks) is still the standard recommendation. Where costs add up: temple entrance fees (Bagan zone fee $25), guided boat trips on Inle Lake ($15 to $25), and the premium for any service during low-availability periods. The cost-to-experience ratio in Myanmar is unusual: experiences are priceless, but the logistical overhead (advance planning, cash management, schedule flexibility) represents a real investment of energy.`,

immigration_url: 'https://evisa.moip.gov.mm/',
arrival_card_url: null,
sim_providers: JSON.stringify([
  { name: 'MPT', url: 'https://www.mpt.com.mm/', note: 'State carrier. Widest coverage. SIM at airport.' },
  { name: 'Atom (formerly Telenor)', url: 'https://www.atom.com.mm/', note: 'Available in cities. Coverage varies.' },
]),
health_search_terms: ['international hospital Yangon', 'clinic', 'pharmacy'],
```

#### JAPAN
```typescript
sovereignty_md: `Women who have traveled Japan describe an environment where personal space is deeply respected. Japanese social norms prioritize non-intrusion, and solo women move through public spaces largely unnoticed. Street harassment is uncommon. The main consideration is crowded trains during rush hours, where physical proximity is unavoidable and women-only cars are available on major lines (look for pink signage on platforms). These dedicated cars exist because the issue is acknowledged and addressed with infrastructure rather than denied. Nightlife districts like Kabukicho in Tokyo and parts of Osaka can be rowdy late at night with touts outside bars, but these areas are easy to avoid or navigate around. Japan's social contract emphasizes order, quiet, and mutual respect, which creates an environment where solo women consistently report feeling less self-conscious about being alone than almost anywhere else they have traveled.`,

solo_infrastructure_md: `Japan may be the best country in the world for independent navigation. The train system is precise to the minute, covers virtually the entire country, and is clean, safe, and well-signposted in English. The JR Pass (Japan Rail Pass) provides unlimited travel on JR trains including the Shinkansen (bullet train). Tokyo and Osaka's subway systems are complex but well-mapped, and apps like Google Maps and Navitime provide exact train times and platform numbers. Suica/Pasmo IC cards work across all transit and many shops. 7-Eleven ATMs accept foreign cards. Pocket Wi-Fi rental at the airport provides reliable connectivity everywhere. The language barrier is the primary challenge: English signage exists at stations and tourist sites, but conversational English is limited. Offline translation apps (Google Translate's camera feature works well with Japanese text) are essential. Despite the language gap, the infrastructure is so well-designed that you rarely need to ask for help, and when you do, Japanese people will go to remarkable lengths to assist you.`,

health_access_md: `Japan has excellent healthcare. Hospitals are modern, well-equipped, and clean. The challenge is language: English-speaking medical staff are concentrated in international clinics in Tokyo (St. Luke's International Hospital, Tokyo Midtown Medical Center) and Osaka. Outside major cities, finding English-speaking care requires more effort. Pharmacies (yakkyoku) are everywhere and stock familiar medications, though brands and dosages may differ. Contraception is available: the pill requires a prescription from a Japanese clinic ($25 to $50 for consultation), and condoms are widely available at convenience stores and drugstores. Emergency contraception requires a clinic visit. Menstrual products (all types, excellent quality) are available at every convenience store and drugstore. For dental emergencies, Tokyo and Osaka have English-speaking dental clinics. Travel insurance is essential and works well with Japanese hospitals. Pack: any prescription medications, as Japanese pharmacies may not stock your specific brand.`,

experience_density_md: `Japan is arguably the most experience-dense country on this list. Tokyo alone could fill months: Shibuya Crossing, Tsukiji Outer Market, Harajuku street fashion, Akihabara electronics, Asakusa temple district, Shinjuku Golden Gai, TeamLab digital art, and a different world-class meal in every neighborhood. Then there is Kyoto with 2,000 temples and shrines, Nara with friendly wild deer, Osaka with street food that rivals any city on earth (takoyaki, okonomiyaki, kushikatsu). Cherry blossom season (late March to mid-April) and autumn colors (mid-November to early December) transform the entire country. Onsen (hot springs) culture is a unique experience. The Shinkansen itself is an experience, moving at 320 km/h while Mount Fuji slides past the window. Japan's cultural layers, from ancient tradition to cutting-edge technology, create a depth that reveals new things on every visit.`,

community_connection_md: `Japan's traveler community is substantial but operates differently than in Southeast Asia. Hostels in Tokyo (Nui., K's House), Kyoto, and Osaka run social events, sake nights, and walking tours. The bar culture in Golden Gai (Shinjuku) and Pontocho (Kyoto) creates intimate settings where conversations with strangers, both local and foreign, happen naturally in tiny 8-seat bars. Coworking spaces in Tokyo and Osaka serve a growing remote work community. Onsen towns and ryokan stays create shared experiences with other guests. The language barrier can make deep connection with locals challenging, but shared activities (cooking classes, tea ceremonies, sumo tournaments) bridge the gap. Tokyo's international community is large and active on Meetup and social apps. Solo dining is completely normalized in Japan (ramen counters, conveyor-belt sushi, single-seat restaurants exist specifically for individual diners), which removes the social discomfort of eating alone.`,

cost_reality_md: `Japan has a reputation for being expensive that is only partially deserved. A comfortable daily budget runs $70 to $100. Accommodation is the biggest variable: hostel dorms ($25 to $35), capsule hotels ($30 to $50), business hotels ($50 to $80), and ryokan stays ($80 to $150+). Food is extraordinary value: a superb ramen bowl costs $8, a conveyor-belt sushi lunch $10 to $15, a convenience store (7-Eleven, Lawson, FamilyMart) bento box $4 to $6. The JR Pass saves money on intercity travel ($275 for 7 days of unlimited Shinkansen). Where costs add up: temple entrance fees ($3 to $8 each, and there are many), specialty experiences (tea ceremonies $30 to $50, sumo tickets $30 to $100), and Tokyo nightlife. The 7-Eleven strategy is a real budget tool: Japan's convenience stores sell restaurant-quality meals, excellent coffee, and functional daily essentials at low prices. Vending machines ($1 to $2) cover beverages everywhere. The yen exchange rate as of early 2026 has made Japan notably more affordable than in previous years.`,

immigration_url: 'https://www.mofa.go.jp/j_info/visit/visa/',
arrival_card_url: 'https://www.vjw.digital.go.jp/',
sim_providers: JSON.stringify([
  { name: 'IIJmio (Japan Travel SIM)', url: 'https://www.iijmio.jp/en/', note: 'Data-only travel SIM. Available at airports.' },
  { name: 'Sakura Mobile', url: 'https://www.sakuramobile.jp/', note: 'SIM and pocket Wi-Fi for tourists.' },
]),
health_search_terms: ['English speaking clinic', 'ladies clinic', 'women health', 'gynecologist', 'pharmacy'],
```

#### PORTUGAL
```typescript
sovereignty_md: `Women who have traveled Portugal describe an environment that feels safe, warm, and socially relaxed. Portuguese culture is friendly without being intrusive, and solo women report moving through cities and towns with minimal unwanted attention. Lisbon and Porto are cosmopolitan, walkable cities where being a woman alone is completely unremarkable. Portugal has strong LGBTQ+ protections and a generally progressive social atmosphere. Pickpocketing in tourist-heavy areas (Tram 28, Alfama, Bairro Alto) is the most commonly reported concern, which is a property issue rather than a personal safety one. The Algarve coast and smaller towns have a quieter, more traditional character but remain comfortable. Portuguese people are proud of their hospitality and often go out of their way to help visitors. The overall social texture is one of the most relaxed in Europe for solo women.`,

solo_infrastructure_md: `Portugal is straightforward to navigate independently. Lisbon and Porto have modern metro systems, extensive bus networks, and iconic trams. Uber is widely available throughout the country and often cheaper than taxis. The CP train network connects major cities efficiently (Lisbon to Porto in about 3 hours by Alfa Pendular). The Algarve is best explored by rental car, which is affordable and easy to arrange. MEO, Vodafone, and NOS sell tourist SIMs with strong 4G coverage nationwide, and EU visitors can roam on their home plans. English is widely spoken, particularly among younger Portuguese and in tourist areas. Portuguese people appreciate any attempt to speak Portuguese, even basic phrases. Google Maps is accurate. The country is compact: Lisbon to the Algarve is a 3-hour drive, and no point in mainland Portugal is far from another. For EU citizens, this feels like traveling at home. For non-EU visitors, the infrastructure quality is comparable to any Western European country.`,

health_access_md: `Portugal has universal healthcare and modern medical facilities. Public hospitals handle emergencies well, though wait times can be long. Private hospitals (CUF chain is the largest) offer faster access with English-speaking staff and reasonable consultation fees ($40 to $80 for a GP visit). Pharmacies (farmácias, marked with a green cross) are abundant throughout the country and staff are knowledgeable. They sell most common medications over the counter or with a local prescription that a private GP can provide. Contraception (pills, emergency contraception) is available at pharmacies. Menstrual products (all types) are available at every supermarket and pharmacy. EU citizens can use the European Health Insurance Card (EHIC) for public healthcare. Non-EU visitors should have travel insurance. Dental care is affordable and high quality. The main health consideration in Portugal is sun exposure: pack strong sunscreen and stay hydrated, especially in the Algarve during summer.`,

experience_density_md: `Portugal delivers disproportionate variety for a small country. Lisbon layers Moorish architecture, tile-covered buildings, rooftop bars, world-class museums, and a food scene that balances tradition with innovation. Porto offers port wine cellars, the Livraria Lello bookshop, and a riverfront that glows at sunset. Sintra's fairytale palaces are a 40-minute train ride from Lisbon. The Algarve's cliffs and sea caves are dramatic. Peniche and Ericeira attract surfers from around the world. The Douro Valley's terraced vineyards produce port and some of the best wine experiences in Europe. Azores (a 2-hour flight) adds volcanic lakes, hot springs, and whale watching. Portuguese food (pastéis de nata, bacalhau, fresh seafood, wine) is a constant highlight. Fado music in Lisbon's Alfama neighborhood is one of those experiences that needs to be heard live to be understood. The country punches well above its weight in experience per kilometer.`,

community_connection_md: `Portugal, especially Lisbon, has become one of Europe's major digital nomad and solo traveler hubs. Coworking spaces (Second Home, Outsite, Selina) host active communities. The Lisbon Meetup scene covers everything from language exchanges to surf groups to women's networking events. Porto's Ribeira neighborhood and the LX Factory in Lisbon are social magnets. Hostels throughout the country are well-run, social, and attract a diverse international crowd. The surf communities along the coast (Ericeira, Peniche, Lagos) create instant social circles. The Algarve draws a slightly older, more independent crowd. Portuguese people are generally reserved in public but warm once connection is made, and they take pride in sharing food and wine recommendations. The expat community in Lisbon is large and well-established, making it easy to find English-speaking social groups and professional networks.`,

cost_reality_md: `Portugal offers strong value for Western Europe. A comfortable daily budget runs $50 to $70. A private room ($25 to $45), three meals ($15 to $20), public transport ($3 to $5), and one activity or entrance fee ($5 to $10) cover a full day. Lisbon and Porto are more expensive than the rest of the country, and both have risen in price with their popularity, but remain affordable compared to Paris, London, or Barcelona. Where comfort costs more: Uber from the airport versus the metro ($15 versus $2), beachfront accommodation in the Algarve during summer ($60 to $100 versus $30 to $50 in shoulder season), and Sintra day trips via organized tour versus DIY train ($40 versus $15). The best value: wine (excellent bottles for $5 to $10), pastéis de nata ($1.50), and seafood restaurants in Porto and fishing villages. Tipping is appreciated but 5 to 10 percent is sufficient. Portugal rewards off-season travel: September and October offer warm weather, smaller crowds, and lower prices.`,

immigration_url: 'https://www.vistos.mne.gov.pt/',
arrival_card_url: null,
sim_providers: JSON.stringify([
  { name: 'Vodafone Portugal', url: 'https://www.vodafone.pt/', note: 'Strong coverage. Prepaid at airport kiosks.' },
  { name: 'MEO', url: 'https://www.meo.pt/', note: 'Largest carrier. Tourist SIM at airports and shops.' },
]),
health_search_terms: ['gynecologist', 'ginecologista', 'women health clinic', 'hospital CUF', 'farmácia'],
```

#### MOROCCO
```typescript
sovereignty_md: `Women who have traveled Morocco describe an experience that requires adjustment but becomes navigable with local knowledge. Verbal attention from men in public spaces, particularly in medinas and tourist areas, is common and is the most frequently discussed aspect of traveling here as a woman. Solo women travelers who have spent time in Morocco report that walking with purpose, avoiding sustained eye contact with strangers, and a firm "la shukran" (no, thank you) are effective local strategies. Conservative dress (covering shoulders, knees, and avoiding tight clothing) significantly reduces attention. The experience varies by city: Marrakech medinas are the most intense, while Chefchaouen, Essaouira, and smaller towns are notably more relaxed. Many riads (traditional guesthouses) are women-owned and operated, and offer airport pickup, neighborhood introductions, and local navigation tips. Thousands of solo women travel Morocco each year, and the gap between expectation and reality, after the first day of adjustment, is frequently described as significant.`,

solo_infrastructure_md: `Morocco has solid infrastructure along the main tourist route. The ONCF train network connects Marrakech, Casablanca, Rabat, Fes, and Tangier reliably and affordably. CTM and Supratours buses cover longer routes. Within cities, petit taxis (insist on the meter or agree on a price before starting) handle urban transport. Maroc Telecom, Orange, and Inwi sell tourist SIMs at airports with good 4G coverage in cities and tourist areas. Google Maps works well in cities but is less reliable in medinas, which are intentionally labyrinthine. Download offline maps of medinas before arrival. English is spoken in tourist-facing businesses, and French is widely understood. Arabic and Amazigh (Berber) are the local languages. For desert trips, organized tours are the practical option and handle all logistics. The new Al Boraq high-speed train between Tangier and Casablanca is modern and efficient. The biggest navigation challenge is the medinas themselves: accept that getting slightly lost is part of the experience, and asking shopkeepers for directions is the standard approach.`,

health_access_md: `Morocco has a two-tier healthcare system. Private clinics (cliniques) in Marrakech, Casablanca, Rabat, and Fes provide good care with French-speaking staff (English available at international clinics). Polyclinique du Sud and Clinique Internationale de Marrakech are well-reviewed. Public hospitals vary in quality. Pharmacies (pharmacies, marked with a green crescent) are well-stocked and staffed by trained pharmacists who can advise on common ailments. Many medications available by prescription elsewhere are accessible over the counter. Contraception (pills available at pharmacies, emergency contraception available in larger cities) is accessible. Menstrual products (pads widely available, tampons at pharmacies in tourist cities) should be stocked before heading to rural areas or the desert. For specialized women's health care, Casablanca and Rabat have the broadest specialist availability. French is the language of medicine in Morocco. Travel insurance with medical coverage is recommended, though healthcare costs are relatively affordable even self-pay.`,

experience_density_md: `Morocco is a sensory experience unlike anything in Europe or Southeast Asia. Marrakech's Jemaa el-Fnaa square transforms from a daytime market to a nightly carnival of food stalls, musicians, and storytellers. The medinas of Fes and Marrakech are living medieval cities with artisan workshops producing leather, ceramics, and textiles. Chefchaouen's blue-painted streets are otherworldly. The Sahara Desert, accessed via organized tours from Marrakech or Fes, puts you on camelback watching sunset over sand dunes and sleeping under more stars than you knew existed. Essaouira delivers Atlantic coast wind, surf culture, and a laid-back port town atmosphere. The Atlas Mountains offer trekking through Berber villages. Moroccan food (tagine, couscous, pastilla, fresh mint tea) is a cuisine worth traveling for. Hammam (traditional bathhouse) visits are a cultural experience that most women travelers highlight as a trip-defining moment.`,

community_connection_md: `Morocco's solo travel community is growing, centered in Marrakech, Essaouira, and Chefchaouen. Hostels in all three cities run social programs, cooking classes, and day trips. Riad culture is inherently social: communal breakfasts and rooftop terraces create natural meeting points. Organized desert tours (2 to 3 days) are the primary social connector, as small groups share camps, meals, and the desert experience. Essaouira's surf and yoga scene attracts a community-oriented crowd. Chefchaouen's compact size means you run into the same travelers repeatedly. The growing digital nomad scene in Marrakech and Taghazout (surf town near Agadir) is adding coworking options. Moroccan people, once initial commercial interactions are past, can be remarkably hospitable, and invitations to mint tea are genuine gestures of welcome. Women-run riads and cooperatives (argan oil cooperatives, cooking classes, weaving workshops) offer connection with local women specifically.`,

cost_reality_md: `Morocco offers excellent value. A comfortable daily budget runs $40 to $55. A riad room ($15 to $35), three meals ($10 to $15), local transport ($3 to $8), and activities ($5 to $15) cover a full day. Marrakech and Fes are the most expensive cities. The comfort premium is clear here: a riad with a pool and breakfast ($40 to $70) versus a basic hotel ($10 to $15), a private guide through the medina ($20 to $30) versus navigating solo, and a quality desert tour ($60 to $100 per day) versus budget options ($30 to $40, with corresponding quality differences). Haggling is expected and standard in souks; starting at one-third of the asking price is the common approach. Fixed-price shops and restaurants exist in tourist areas for those who prefer transparency. The biggest hidden cost is tipping: small tips are expected for guides, drivers, riad staff, and anyone who provides a service ($1 to $2 per interaction adds up). Morocco rewards travelers who research prices beforehand so they can negotiate from knowledge rather than anxiety.`,

immigration_url: 'https://www.consulat.ma/',
arrival_card_url: null,
sim_providers: JSON.stringify([
  { name: 'Maroc Telecom (IAM)', url: 'https://www.iam.ma/', note: 'Largest carrier. Best coverage including rural/desert.' },
  { name: 'Orange Morocco', url: 'https://www.orange.ma/', note: 'Good tourist packages. Available at airports.' },
]),
health_search_terms: ['clinique internationale', 'gynécologue', 'gynecologist', 'pharmacie', 'hospital'],
```

**Step 2: Add the new fields to each country object in the `countryContent` array**

Each country entry in `countryContent` already has `id`, `country_id`, `scope`, etc. Append the new dimension fields to each object alongside the existing fields. Keep the old fields (safety_women_md, why_we_love_md, etc.) for backward compatibility.

**Step 3: Verify the seed script handles the new fields**

Check `scripts/seed.ts` and the migration `00019_merge_geocontent_to_countries.sql` pattern to ensure the new columns are populated during seeding.

**Step 4: Commit**

```bash
git add scripts/content/geo-content.ts
git commit -m "feat: add 6-dimension content for all 12 countries"
```

---

## Phase 3: Country Page UI Redesign

### Task 3: Create new dimension section components

**Files:**
- Create: `components/explore/country/SovereigntySection.tsx`
- Create: `components/explore/country/InfrastructureSection.tsx`
- Create: `components/explore/country/HealthAccessSection.tsx`
- Create: `components/explore/country/ExperienceSection.tsx`
- Create: `components/explore/country/CommunitySection.tsx`
- Create: `components/explore/country/CostRealitySection.tsx`
- Create: `components/explore/country/QuickReference.tsx`

Each dimension section follows this pattern:
1. Section heading (clean, sans-serif, 18-20px semibold)
2. Body text (15px regular, line-height 24, textPrimary)
3. Optional sub-components (cards for places, tappable links for resources)

**Design tokens from `constants/design.ts`:**
- Section headings: `fonts.semiBold`, `fontSize: 18`, `colors.textPrimary`
- Body text: `fonts.regular`, `fontSize: 15`, `lineHeight: 24`, `colors.textPrimary`
- Section spacing: `marginBottom: spacing.xl`
- Divider: `height: 1`, `backgroundColor: colors.borderSubtle`, `marginBottom: spacing.xl`
- Cards: `backgroundColor: colors.neutralFill`, `borderRadius: radius.card`
- Tappable links: `color: colors.orange`, `fontSize: 14`, `fonts.medium`

**SovereigntySection** renders the `sovereigntyMd` content as clean text paragraphs.

**HealthAccessSection** renders the `healthAccessMd` content PLUS a horizontal scroll of health facility places (from places table, filtered by `place_type IN ('hospital', 'clinic', 'pharmacy')` for that country).

**ExperienceSection** renders `experienceDensityMd` plus horizontal scroll of top activities (existing `topPlaces` data).

**CommunitySection** renders `communityConnectionMd` plus horizontal scroll of social places (filtered by `place_type IN ('hostel', 'coworking', 'cafe')` for that country).

**CostRealitySection** renders `costRealityMd` as clean text.

**QuickReference** is a compact card with tappable rows:
- Visa: `immigration_url` opens in browser
- SIM: each provider from `sim_providers` as a tappable link
- Currency: existing `currency` field
- Emergency: existing emergency numbers from `data/safety.ts`
- Best time: existing `bestMonths` field

Each row is: icon + label + value/link, in the same style as the current PracticalGuide but more compact.

### Task 4: Rebuild country detail page layout

**Files:**
- Modify: `app/(tabs)/discover/country/[slug].tsx`

Replace the current section order:
```
Hero → Editorial → KnowBeforeYouGo → Cities → TravelingAsAWoman → Places → Community → PracticalGuide
```

With the new dimension-first order:
```
Hero → Opening line → "How it feels to be here" (Sovereignty)
     → "Getting around on your own" (Infrastructure)
     → "Your health here" (Health + health facility cards)
     → "What you'll do here" (Experience + activity cards)
     → Where to Go (Cities, existing horizontal scroll)
     → "Meeting people" (Community + social place cards)
     → "What it costs (really)" (Cost)
     → Quick Reference (visa link, SIM links, currency, emergency, best time)
```

Add new data fetches:
- Health facilities: `getPlacesByCountryAndType(countryId, ['hospital', 'clinic', 'pharmacy'])`
- Social places: `getPlacesByCountryAndType(countryId, ['hostel', 'coworking', 'cafe'])`

These use a new API function:

```typescript
// data/api.ts
export async function getPlacesByCountryAndType(
  countryId: string,
  placeTypes: string[],
  limit = 8,
): Promise<PlaceWithCity[]> {
  const { data } = await supabase
    .from('places')
    .select('*, cities!inner(name)')
    .eq('cities.country_id', countryId)
    .in('place_type', placeTypes)
    .eq('is_active', true)
    .order('curation_score', { ascending: false, nullsFirst: false })
    .limit(limit);

  return (data ?? []).map((p: any) => ({
    ...mapPlace(p),
    cityName: p.cities?.name ?? '',
    imageUrl: null,
  }));
}
```

**Step 1: Create the dimension section components**

Follow the pattern from existing `TravelingAsAWoman.tsx` (cleanMarkdown + text rendering) for text-only sections, and the pattern from the existing horizontal scroll for card-based sections.

**Step 2: Update the country detail page imports and layout**

Remove old section components, add new ones, reorder the ScrollView content.

**Step 3: Add new API function for type-filtered places**

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 5: Commit**

```bash
git add components/explore/country/ app/(tabs)/discover/country/[slug].tsx data/api.ts
git commit -m "feat: rebuild country page around 6-dimension briefing structure"
```

---

## Phase 4: Populate Health Facility Places

### Task 5: Create a script to add health facilities via Google Places API

**Files:**
- Create: `scripts/populate-health-facilities.mjs`

This script:
1. Reads all countries and their cities from Supabase
2. For each city, uses Google Places Text Search to find:
   - Hospitals with women's health / OB-GYN
   - International clinics
   - Pharmacies (top 3 per city)
3. Inserts results into the `places` table with:
   - `place_type: 'hospital'` or `'clinic'` or `'pharmacy'`
   - `google_place_id` from API response
   - `google_maps_url` constructed from the place ID
   - `why_selected`: brief note about why this place is relevant for women travelers
   - `is_active: true`

**Environment:** Requires `GOOGLE_PLACES_API_KEY` in `.env`

**Step 1: Write the script**

Follow the pattern from existing scripts like `scripts/update-hero-images.mjs`.

**Step 2: Run the script on a test city first**

```bash
node scripts/populate-health-facilities.mjs --city bangkok --dry-run
```

**Step 3: Run for all cities**

```bash
node scripts/populate-health-facilities.mjs
```

**Step 4: Verify data in Supabase**

**Step 5: Commit**

```bash
git add scripts/populate-health-facilities.mjs
git commit -m "feat: add health facility population script using Google Places API"
```

---

## Phase 5: Migration to Populate New Content

### Task 6: Write SQL migration to populate dimension content for all countries

**Files:**
- Create: `supabase/migrations/20260211_populate_country_dimensions.sql`

This migration takes the content from the geo-content.ts rewrite (Task 2) and populates the new columns directly in SQL, so the data is available without re-seeding.

**Step 1: Write the migration with UPDATE statements for all 12 countries**

Each country gets an UPDATE with all 6 dimension texts, immigration URLs, SIM providers, and health search terms.

**Step 2: Run migration**

```bash
npx supabase db reset
```

**Step 3: Verify content appears on country pages**

**Step 4: Commit**

```bash
git add supabase/migrations/20260211_populate_country_dimensions.sql
git commit -m "feat: populate 6-dimension content for all 12 countries"
```

---

## Verification Checklist

Before marking complete:

- [ ] `npx tsc --noEmit` passes (filtering pre-existing errors)
- [ ] All 12 countries have all 6 dimension fields populated
- [ ] No em dashes in any content
- [ ] No ratings, scores, or judgmental language
- [ ] All observations sourced as traveler reports ("Women who have traveled X describe...")
- [ ] Immigration URLs present for all 12 countries
- [ ] SIM provider data present for all 12 countries
- [ ] Health search terms present for all 12 countries
- [ ] Country detail page renders new sections in correct order
- [ ] Health facility cards appear (where data exists)
- [ ] Social place cards appear (where data exists)
- [ ] Quick Reference links are tappable and open in browser
- [ ] No existing functionality broken (community threads, city cards, etc.)
- [ ] Content tone is premium, intellectual, never patronizing
- [ ] Every destination is framed as travelable with appropriate preparation
