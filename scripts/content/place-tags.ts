import { did, upsertBatch } from '../seed-utils';

type PlaceEntry = { key: string; type: string };

const places: PlaceEntry[] = [
  // THAILAND
  { key: 'place-bkk-lub-d-silom', type: 'hostel' },
  { key: 'place-bkk-somtam-nua', type: 'restaurant' },
  { key: 'place-bkk-roast', type: 'cafe' },
  { key: 'place-bkk-grand-palace', type: 'landmark' },
  { key: 'place-bkk-khaosan-market', type: 'activity' },
  { key: 'place-bkk-health-land', type: 'wellness' },
  { key: 'place-cnx-stamps-hostel', type: 'hostel' },
  { key: 'place-cnx-khao-soi-khun-yai', type: 'restaurant' },
  { key: 'place-cnx-ristr8to', type: 'cafe' },
  { key: 'place-cnx-doi-suthep', type: 'landmark' },
  { key: 'place-cnx-elephant-nature-park', type: 'activity' },
  { key: 'place-cnx-punspace-nimman', type: 'coworking' },
  { key: 'place-cnx-night-bazaar', type: 'activity' },
  { key: 'place-krabi-slumber-party', type: 'hostel' },
  { key: 'place-krabi-krua-thara', type: 'restaurant' },
  { key: 'place-krabi-railay-beach', type: 'landmark' },
  { key: 'place-krabi-rock-climbing', type: 'activity' },
  { key: 'place-krabi-four-islands', type: 'activity' },
  { key: 'place-pai-common-grounds', type: 'hostel' },
  { key: 'place-pai-nong-beer', type: 'restaurant' },
  { key: 'place-pai-canyon', type: 'landmark' },
  { key: 'place-pai-hot-springs', type: 'wellness' },
  { key: 'place-pai-walking-street', type: 'activity' },
  { key: 'place-kpg-beachlove', type: 'hostel' },
  { key: 'place-kpg-fishermans-restaurant', type: 'restaurant' },
  { key: 'place-kpg-pantip-market', type: 'activity' },
  { key: 'place-kpg-bottle-beach', type: 'landmark' },
  { key: 'place-kpg-orion-healing', type: 'wellness' },

  // VIETNAM
  { key: 'place-sgn-hideout-hostel', type: 'hostel' },
  { key: 'place-sgn-pho-2000', type: 'restaurant' },
  { key: 'place-sgn-workshop-coffee', type: 'cafe' },
  { key: 'place-sgn-war-museum', type: 'landmark' },
  { key: 'place-sgn-ben-thanh-market', type: 'activity' },
  { key: 'place-sgn-bui-vien-walking', type: 'bar' },
  { key: 'place-sgn-mekong-delta', type: 'activity' },
  { key: 'place-han-nexy-hostel', type: 'hostel' },
  { key: 'place-han-bun-cha-dac-kim', type: 'restaurant' },
  { key: 'place-han-cong-caphe', type: 'cafe' },
  { key: 'place-han-hoan-kiem-lake', type: 'landmark' },
  { key: 'place-han-temple-of-literature', type: 'landmark' },
  { key: 'place-han-halong-bay', type: 'activity' },
  { key: 'place-han-west-lake', type: 'landmark' },
  { key: 'place-hoi-tribee-bana', type: 'hostel' },
  { key: 'place-hoi-morning-glory', type: 'restaurant' },
  { key: 'place-hoi-reaching-out', type: 'cafe' },
  { key: 'place-hoi-ancient-town', type: 'landmark' },
  { key: 'place-hoi-an-bang-beach', type: 'landmark' },
  { key: 'place-hoi-basket-boat', type: 'activity' },
  { key: 'place-hoi-cooking-class', type: 'activity' },
  { key: 'place-dad-memory-hostel', type: 'hostel' },
  { key: 'place-dad-bun-cha-ca', type: 'restaurant' },
  { key: 'place-dad-my-khe-beach', type: 'landmark' },
  { key: 'place-dad-marble-mountains', type: 'landmark' },
  { key: 'place-dad-dragon-bridge', type: 'landmark' },
  { key: 'place-dad-son-tra', type: 'activity' },
  { key: 'place-dlat-dalat-family-hostel', type: 'hostel' },
  { key: 'place-dlat-one-more-cafe', type: 'cafe' },
  { key: 'place-dlat-crazy-house', type: 'landmark' },
  { key: 'place-dlat-dalat-market', type: 'activity' },
  { key: 'place-dlat-tuyen-lam', type: 'landmark' },
  { key: 'place-dlat-canyoning', type: 'activity' },
  { key: 'place-dlat-linh-phuoc', type: 'landmark' },

  // INDONESIA
  { key: 'place-ubud-komaneka-bisma', type: 'hotel' },
  { key: 'place-ubud-locavore', type: 'restaurant' },
  { key: 'place-ubud-seniman', type: 'cafe' },
  { key: 'place-ubud-hubud', type: 'coworking' },
  { key: 'place-ubud-yoga-barn', type: 'wellness' },
  { key: 'place-ubud-tegallalang', type: 'landmark' },
  { key: 'place-ubud-karsa-kafe', type: 'cafe' },
  { key: 'place-ubud-campuhan-ridge', type: 'activity' },
  { key: 'place-canggu-thewave', type: 'hotel' },
  { key: 'place-canggu-deus', type: 'cafe' },
  { key: 'place-canggu-finns-beach-club', type: 'bar' },
  { key: 'place-canggu-motion', type: 'cafe' },
  { key: 'place-canggu-practice', type: 'wellness' },
  { key: 'place-canggu-tropical-nomad', type: 'coworking' },
  { key: 'place-canggu-mason', type: 'restaurant' },
  { key: 'place-canggu-echo-beach', type: 'activity' },
  { key: 'place-seminyak-potato-head', type: 'bar' },
  { key: 'place-seminyak-w-bali', type: 'hotel' },
  { key: 'place-seminyak-merah-putih', type: 'restaurant' },
  { key: 'place-seminyak-revolver', type: 'cafe' },
  { key: 'place-seminyak-motel-mexicola', type: 'bar' },
  { key: 'place-seminyak-seminyak-beach', type: 'activity' },
  { key: 'place-seminyak-kynd', type: 'cafe' },
  { key: 'place-yogya-phoenix-hotel', type: 'hotel' },
  { key: 'place-yogya-house-raminten', type: 'restaurant' },
  { key: 'place-yogya-kopi-klotok', type: 'cafe' },
  { key: 'place-yogya-borobudur', type: 'landmark' },
  { key: 'place-yogya-prambanan', type: 'landmark' },
  { key: 'place-yogya-malioboro', type: 'shop' },
  { key: 'place-gili-villa-almarik', type: 'hotel' },
  { key: 'place-gili-scallywags', type: 'bar' },
  { key: 'place-gili-kayu-cafe', type: 'cafe' },
  { key: 'place-gili-freedive-gili', type: 'shop' },
  { key: 'place-gili-trawangan-night-market', type: 'shop' },
  { key: 'place-gili-air-pemedal', type: 'activity' },
  { key: 'place-gili-sunset-point', type: 'landmark' },

  // PHILIPPINES
  { key: 'place-elnido-spin-designer', type: 'hostel' },
  { key: 'place-elnido-artcafe', type: 'restaurant' },
  { key: 'place-elnido-trattoria-altrove', type: 'restaurant' },
  { key: 'place-elnido-happiness-beach', type: 'cafe' },
  { key: 'place-elnido-tour-a', type: 'tour' },
  { key: 'place-elnido-nacpan-beach', type: 'activity' },
  { key: 'place-elnido-corong-corong', type: 'activity' },
  { key: 'place-siargao-nay-palad', type: 'hotel' },
  { key: 'place-siargao-bravo', type: 'restaurant' },
  { key: 'place-siargao-kermit', type: 'restaurant' },
  { key: 'place-siargao-shaka', type: 'cafe' },
  { key: 'place-siargao-cloud9', type: 'activity' },
  { key: 'place-siargao-sugba-lagoon', type: 'activity' },
  { key: 'place-siargao-naked-island', type: 'activity' },
  { key: 'place-siargao-jungle', type: 'hostel' },
  { key: 'place-cebu-radisson-blu', type: 'hotel' },
  { key: 'place-cebu-anzani', type: 'restaurant' },
  { key: 'place-cebu-bo-coffee', type: 'cafe' },
  { key: 'place-cebu-oslob-whale-sharks', type: 'tour' },
  { key: 'place-cebu-kawasan-falls', type: 'landmark' },
  { key: 'place-cebu-tops-lookout', type: 'landmark' },
  { key: 'place-cebu-malapascua', type: 'activity' },
  { key: 'place-manila-peninsula', type: 'hotel' },
  { key: 'place-manila-toyo-eatery', type: 'restaurant' },
  { key: 'place-manila-comune', type: 'cafe' },
  { key: 'place-manila-intramuros', type: 'landmark' },
  { key: 'place-manila-poblacion', type: 'landmark' },
  { key: 'place-manila-bgc-art-walk', type: 'landmark' },
  { key: 'place-bohol-amorita', type: 'hotel' },
  { key: 'place-bohol-bohol-bee-farm', type: 'restaurant' },
  { key: 'place-bohol-chocolate-hills', type: 'landmark' },
  { key: 'place-bohol-tarsier-sanctuary', type: 'activity' },
  { key: 'place-bohol-balicasag', type: 'activity' },
  { key: 'place-bohol-loboc-river', type: 'tour' },
  { key: 'place-bohol-alona-beach', type: 'activity' },
  { key: 'place-bohol-anda-beach', type: 'activity' },

  // MALAYSIA
  { key: 'place-kl-capsule-transit', type: 'hostel' },
  { key: 'place-kl-reggae-mansion', type: 'hostel' },
  { key: 'place-kl-jalan-alor', type: 'restaurant' },
  { key: 'place-kl-vcr', type: 'cafe' },
  { key: 'place-kl-batu-caves', type: 'activity' },
  { key: 'place-kl-petronas-towers', type: 'activity' },
  { key: 'place-kl-central-market', type: 'activity' },
  { key: 'place-penang-Frame-Guest-House', type: 'hostel' },
  { key: 'place-penang-tek-sen', type: 'restaurant' },
  { key: 'place-penang-china-house', type: 'cafe' },
  { key: 'place-penang-street-art-tour', type: 'activity' },
  { key: 'place-penang-yoga-district', type: 'wellness' },
  { key: 'place-penang-gurney-drive', type: 'restaurant' },
  { key: 'place-langkawi-tubotel', type: 'hostel' },
  { key: 'place-langkawi-wonderland', type: 'restaurant' },
  { key: 'place-langkawi-nest', type: 'cafe' },
  { key: 'place-langkawi-skycab', type: 'activity' },
  { key: 'place-langkawi-mangrove-tour', type: 'activity' },
  { key: 'place-malacca-rucksack-caratel', type: 'hostel' },
  { key: 'place-malacca-nancy-kitchen', type: 'restaurant' },
  { key: 'place-malacca-calanthe-art-cafe', type: 'cafe' },
  { key: 'place-malacca-dutch-square', type: 'activity' },
  { key: 'place-malacca-river-cruise', type: 'activity' },
  { key: 'place-malacca-jonker-walk', type: 'activity' },
  { key: 'place-kk-akinabalu-youth-hostel', type: 'hostel' },
  { key: 'place-kk-welcome-seafood', type: 'restaurant' },
  { key: 'place-kk-kawa-kawa-cafe', type: 'cafe' },
  { key: 'place-kk-tunku-abdul-rahman-park', type: 'activity' },
  { key: 'place-kk-filipino-market', type: 'activity' },
  { key: 'place-kk-signal-hill', type: 'activity' },

  // SINGAPORE
  { key: 'place-sg-capsule-pod-boutique', type: 'hostel' },
  { key: 'place-sg-five-stones-hostel', type: 'hostel' },
  { key: 'place-sg-lau-pa-sat', type: 'restaurant' },
  { key: 'place-sg-tiong-bahru-market', type: 'restaurant' },
  { key: 'place-sg-common-man-coffee', type: 'cafe' },
  { key: 'place-sg-tiong-bahru-bakery', type: 'cafe' },
  { key: 'place-sg-gardens-by-the-bay', type: 'activity' },
  { key: 'place-sg-arab-street', type: 'activity' },
  { key: 'place-sg-sentosa-island', type: 'activity' },
  { key: 'place-sg-pulau-ubin', type: 'activity' },
  { key: 'place-sg-chinatown-complex', type: 'restaurant' },
  { key: 'place-sg-yoga-movement', type: 'wellness' },

  // CAMBODIA
  { key: 'place-siemreap-lub-d-hostel', type: 'hostel' },
  { key: 'place-siemreap-the-hive', type: 'hostel' },
  { key: 'place-siemreap-chanrey-tree', type: 'restaurant' },
  { key: 'place-siemreap-brown-coffee', type: 'cafe' },
  { key: 'place-siemreap-angkor-wat', type: 'activity' },
  { key: 'place-siemreap-pub-street', type: 'bar' },
  { key: 'place-siemreap-phare-circus', type: 'activity' },
  { key: 'place-phnompenh-mad-monkey', type: 'hostel' },
  { key: 'place-phnompenh-malis', type: 'restaurant' },
  { key: 'place-phnompenh-brown-coffee-pp', type: 'cafe' },
  { key: 'place-phnompenh-royal-palace', type: 'activity' },
  { key: 'place-phnompenh-russian-market', type: 'activity' },
  { key: 'place-phnompenh-sunset-cruise', type: 'activity' },
  { key: 'place-kampot-banyan-tree', type: 'hostel' },
  { key: 'place-kampot-rikitikitavi', type: 'restaurant' },
  { key: 'place-kampot-karma-traders', type: 'cafe' },
  { key: 'place-kampot-pepper-farm', type: 'activity' },
  { key: 'place-kampot-bokor-mountain', type: 'activity' },
  { key: 'place-kohrong-onederz', type: 'hostel' },
  { key: 'place-kohrong-treehouse-bungalows', type: 'hostel' },
  { key: 'place-kohrong-the-island-bar', type: 'restaurant' },
  { key: 'place-kohrong-bioluminescent-plankton', type: 'activity' },
  { key: 'place-kohrong-snorkeling-tour', type: 'activity' },

  // LAOS
  { key: 'place-luangprabang-spicylao-backpackers', type: 'hostel' },
  { key: 'place-luangprabang-tamarind', type: 'restaurant' },
  { key: 'place-luangprabang-joma-bakery', type: 'cafe' },
  { key: 'place-luangprabang-kuang-si-falls', type: 'activity' },
  { key: 'place-luangprabang-alms-giving', type: 'activity' },
  { key: 'place-luangprabang-night-market', type: 'activity' },
  { key: 'place-luangprabang-mount-phousi', type: 'activity' },
  { key: 'place-vientiane-mixok-hostel', type: 'hostel' },
  { key: 'place-vientiane-kualao-restaurant', type: 'restaurant' },
  { key: 'place-vientiane-joma-vientiane', type: 'cafe' },
  { key: 'place-vientiane-pha-that-luang', type: 'activity' },
  { key: 'place-vientiane-buddha-park', type: 'activity' },
  { key: 'place-vangvieng-nana-backpackers', type: 'hostel' },
  { key: 'place-vangvieng-smile-beach-bar', type: 'restaurant' },
  { key: 'place-vangvieng-gary-cafe', type: 'cafe' },
  { key: 'place-vangvieng-blue-lagoon', type: 'activity' },
  { key: 'place-vangvieng-tubing', type: 'activity' },
  { key: 'place-vangvieng-hot-air-balloon', type: 'activity' },

  // MYANMAR
  { key: 'place-bagan-ostello-bello', type: 'hostel' },
  { key: 'place-bagan-star-beam', type: 'restaurant' },
  { key: 'place-bagan-moon-vegetarian', type: 'restaurant' },
  { key: 'place-bagan-weather-spoon', type: 'cafe' },
  { key: 'place-bagan-temples', type: 'activity' },
  { key: 'place-bagan-hot-air-balloon', type: 'activity' },
  { key: 'place-bagan-cooking-class', type: 'activity' },
  { key: 'place-yangon-little-yangon-hostel', type: 'hostel' },
  { key: 'place-yangon-rangoon-tea-house', type: 'restaurant' },
  { key: 'place-yangon-999-shan-noodle', type: 'restaurant' },
  { key: 'place-yangon-cafe-unlock', type: 'cafe' },
  { key: 'place-yangon-shwedagon-pagoda', type: 'activity' },
  { key: 'place-yangon-bogyoke-market', type: 'activity' },
  { key: 'place-yangon-chinatown-night-market', type: 'activity' },
  { key: 'place-inlelake-ostello-bello-inle', type: 'hostel' },
  { key: 'place-inlelake-viewpoint-lodge', type: 'restaurant' },
  { key: 'place-inlelake-unique-superb-food', type: 'restaurant' },
  { key: 'place-inlelake-kayah-cafe', type: 'cafe' },
  { key: 'place-inlelake-boat-tour', type: 'activity' },
  { key: 'place-inlelake-red-mountain-vineyard', type: 'activity' },
  { key: 'place-inlelake-indein-pagodas', type: 'activity' },

  // JAPAN
  { key: 'place-tokyo-book-and-bed', type: 'hostel' },
  { key: 'place-tokyo-tsukiji-outer-market', type: 'shop' },
  { key: 'place-tokyo-streamer-coffee', type: 'cafe' },
  { key: 'place-tokyo-teamlab-borderless', type: 'landmark' },
  { key: 'place-tokyo-senso-ji', type: 'landmark' },
  { key: 'place-tokyo-omoide-yokocho', type: 'restaurant' },
  { key: 'place-tokyo-bunka-hostel', type: 'hostel' },
  { key: 'place-tokyo-harajuku-gyoza', type: 'restaurant' },
  { key: 'place-kyoto-len-hostel', type: 'hostel' },
  { key: 'place-kyoto-nishiki-market', type: 'shop' },
  { key: 'place-kyoto-weekenders-coffee', type: 'cafe' },
  { key: 'place-kyoto-fushimi-inari', type: 'landmark' },
  { key: 'place-kyoto-arashiyama-bamboo', type: 'landmark' },
  { key: 'place-kyoto-ippudo-ramen', type: 'restaurant' },
  { key: 'place-kyoto-kurasu-coffee', type: 'cafe' },
  { key: 'place-kyoto-gion-district', type: 'landmark' },
  { key: 'place-osaka-hostel-64', type: 'hostel' },
  { key: 'place-osaka-dotonbori-street', type: 'restaurant' },
  { key: 'place-osaka-mel-coffee-roasters', type: 'cafe' },
  { key: 'place-osaka-castle', type: 'landmark' },
  { key: 'place-osaka-kuromon-market', type: 'shop' },
  { key: 'place-osaka-shinsekai', type: 'landmark' },
  { key: 'place-osaka-brooklyn-roasting', type: 'cafe' },
  { key: 'place-osaka-sumiyoshi-taisha', type: 'landmark' },

  // PORTUGAL
  { key: 'place-lisbon-the-independente', type: 'hostel' },
  { key: 'place-lisbon-timeout-market', type: 'restaurant' },
  { key: 'place-lisbon-fabrica-coffee', type: 'cafe' },
  { key: 'place-lisbon-tram-28', type: 'landmark' },
  { key: 'place-lisbon-alfama-district', type: 'landmark' },
  { key: 'place-lisbon-cervejaria-ramiro', type: 'restaurant' },
  { key: 'place-lisbon-lx-factory', type: 'coworking' },
  { key: 'place-lisbon-belem-tower', type: 'landmark' },
  { key: 'place-porto-selina-hostel', type: 'hostel' },
  { key: 'place-porto-mercado-do-bolhao', type: 'shop' },
  { key: 'place-porto-claus-coffee', type: 'cafe' },
  { key: 'place-porto-livraria-lello', type: 'shop' },
  { key: 'place-porto-douro-river-cruise', type: 'tour' },
  { key: 'place-porto-cantina-32', type: 'restaurant' },
  { key: 'place-porto-cafe-candelabro', type: 'cafe' },
  { key: 'place-porto-clerigos-tower', type: 'landmark' },

  // MOROCCO
  { key: 'place-marrakech-riad-dar-anika', type: 'homestay' },
  { key: 'place-marrakech-jemaa-el-fnaa', type: 'landmark' },
  { key: 'place-marrakech-nomad-restaurant', type: 'restaurant' },
  { key: 'place-marrakech-cafe-clock', type: 'cafe' },
  { key: 'place-marrakech-jardin-majorelle', type: 'landmark' },
  { key: 'place-marrakech-souk-semmarine', type: 'shop' },
  { key: 'place-marrakech-koutoubia-mosque', type: 'landmark' },
  { key: 'place-marrakech-le-jardin', type: 'restaurant' },
  { key: 'place-fes-riad-rcif', type: 'homestay' },
  { key: 'place-fes-chouara-tannery', type: 'landmark' },
  { key: 'place-fes-cafe-clock-fes', type: 'cafe' },
  { key: 'place-fes-bou-inania-madrasa', type: 'landmark' },
  { key: 'place-fes-nejjarine-museum', type: 'landmark' },
  { key: 'place-fes-ruined-garden', type: 'restaurant' },
  { key: 'place-fes-fes-cooking-class', type: 'activity' },
  { key: 'place-fes-jnan-sbil-gardens', type: 'landmark' },
  { key: 'place-chefchaouen-dar-echchaouen', type: 'homestay' },
  { key: 'place-chefchaouen-plaza-uta-el-hammam', type: 'landmark' },
  { key: 'place-chefchaouen-cafe-clock-chef', type: 'cafe' },
  { key: 'place-chefchaouen-ras-el-maa', type: 'landmark' },
  { key: 'place-chefchaouen-spanish-mosque', type: 'landmark' },
  { key: 'place-chefchaouen-restaurant-beldi-bab-ssour', type: 'restaurant' },
  { key: 'place-chefchaouen-akchour-waterfalls', type: 'activity' },
  { key: 'place-chefchaouen-sophia-cafe', type: 'cafe' },
];

// Vibe tags to rotate through per type
const vibeRotation: Record<string, string[]> = {
  hostel: ['tag-lively', 'tag-cozy', 'tag-chill', 'tag-trendy'],
  hotel: ['tag-aesthetic', 'tag-quiet', 'tag-scenic', 'tag-trendy'],
  homestay: ['tag-cozy', 'tag-local-feel', 'tag-quiet', 'tag-aesthetic'],
  restaurant: ['tag-local-feel', 'tag-cozy', 'tag-lively', 'tag-aesthetic'],
  cafe: ['tag-cozy', 'tag-aesthetic', 'tag-quiet', 'tag-chill'],
  bar: ['tag-dj-electronic', 'tag-live-music', 'tag-pop-commercial', 'tag-hiphop-rnb'],
  activity: ['tag-scenic', 'tag-lively', 'tag-nature', 'tag-beachfront'],
  landmark: ['tag-easy', 'tag-moderate', 'tag-easy', 'tag-moderate'],
  wellness: ['tag-quiet', 'tag-chill', 'tag-nature', 'tag-cozy'],
  coworking: [],
  shop: [],
  tour: ['tag-easy', 'tag-moderate', 'tag-challenging', 'tag-easy'],
};

// Physical level rotation for activities
const physicalRotation = ['tag-easy', 'tag-moderate', 'tag-challenging'];

function getTagsForPlace(p: PlaceEntry, index: number): string[] {
  const tags: string[] = [];

  switch (p.type) {
    case 'hostel':
      tags.push('tag-solo-friendly', 'tag-meeting-people', 'tag-fast-wifi', 'tag-lockers-available');
      tags.push(vibeRotation.hostel[index % vibeRotation.hostel.length]);
      break;
    case 'hotel':
      tags.push('tag-solo-friendly', 'tag-helpful-staff', 'tag-ac');
      tags.push(vibeRotation.hotel[index % vibeRotation.hotel.length]);
      break;
    case 'homestay':
      tags.push('tag-solo-friendly', 'tag-helpful-staff', 'tag-ac');
      tags.push(vibeRotation.homestay[index % vibeRotation.homestay.length]);
      break;
    case 'restaurant':
      tags.push('tag-solo-dining', 'tag-local-cuisine');
      tags.push(vibeRotation.restaurant[index % vibeRotation.restaurant.length]);
      break;
    case 'cafe':
      tags.push('tag-work-friendly', 'tag-fast-wifi', 'tag-power-outlets');
      tags.push(vibeRotation.cafe[index % vibeRotation.cafe.length]);
      break;
    case 'bar':
      tags.push('tag-drinks-conversation', 'tag-lively');
      tags.push(vibeRotation.bar[index % vibeRotation.bar.length]);
      break;
    case 'activity':
      tags.push('tag-active-day');
      tags.push(physicalRotation[index % physicalRotation.length]);
      tags.push(vibeRotation.activity[index % vibeRotation.activity.length]);
      break;
    case 'landmark':
      tags.push('tag-learning-culture', 'tag-scenic');
      tags.push(vibeRotation.landmark[index % vibeRotation.landmark.length]);
      break;
    case 'wellness':
      tags.push('tag-self-care-day', 'tag-stress-relief');
      tags.push(vibeRotation.wellness[index % vibeRotation.wellness.length]);
      break;
    case 'coworking':
      tags.push('tag-work-friendly', 'tag-fast-wifi', 'tag-power-outlets');
      break;
    case 'shop':
      tags.push('tag-local-feel');
      break;
    case 'tour':
      tags.push('tag-active-day', 'tag-learning-culture');
      tags.push(vibeRotation.tour[index % vibeRotation.tour.length]);
      break;
    default:
      tags.push('tag-solo-friendly');
      break;
  }

  return tags;
}

const placeTags: { place_id: string; tag_id: string; source: string }[] = [];

// Use per-type counters for deterministic rotation
const typeCounters: Record<string, number> = {};

for (const p of places) {
  const counter = typeCounters[p.type] ?? 0;
  typeCounters[p.type] = counter + 1;

  const tagKeys = getTagsForPlace(p, counter);
  for (const tagKey of tagKeys) {
    placeTags.push({
      place_id: did(p.key),
      tag_id: did(tagKey),
      source: 'editorial',
    });
  }
}

export async function seedPlaceTags() {
  await upsertBatch('place_tags', placeTags, 'place_id,tag_id');
}
