import { PlaceMedia } from '../types';

const T = '2026-01-01T00:00:00Z';

export const mockPlaceMedia: PlaceMedia[] = [
  // Bangkok
  { id: 'pm-bkk-luka-1', placeId: 'place-bkk-luka', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', mediaType: 'image', caption: 'Rooftop hangout area', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-bkk-luka-2', placeId: 'place-bkk-luka', url: 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800', mediaType: 'image', caption: 'Dorm room with pod beds', source: 'editorial', orderIndex: 1, createdAt: T },
  { id: 'pm-bkk-somsak-1', placeId: 'place-bkk-somsak', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', mediaType: 'image', caption: 'Boat noodles', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-bkk-featherstone-1', placeId: 'place-bkk-featherstone', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800', mediaType: 'image', caption: 'Garden seating area', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-bkk-watpho-1', placeId: 'place-bkk-watpho', url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800', mediaType: 'image', caption: 'Reclining Buddha', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-bkk-maggie-1', placeId: 'place-bkk-maggie', url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800', mediaType: 'image', caption: 'Speakeasy interior', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-bkk-chatuchak-1', placeId: 'place-bkk-chatuchak', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800', mediaType: 'image', caption: 'Market stalls', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-bkk-roast-1', placeId: 'place-bkk-roast', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', mediaType: 'image', caption: 'Brunch spread', source: 'editorial', orderIndex: 0, createdAt: T },

  // Chiang Mai
  { id: 'pm-cnx-hug-1', placeId: 'place-cnx-hug', url: 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800', mediaType: 'image', caption: 'Hostel courtyard', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-cnx-khao-1', placeId: 'place-cnx-khao', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', mediaType: 'image', caption: 'Khao soi bowl', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-cnx-ristr8to-1', placeId: 'place-cnx-ristr8to', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', mediaType: 'image', caption: 'Latte art', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-cnx-punspace-1', placeId: 'place-cnx-punspace', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', mediaType: 'image', caption: 'Coworking space', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-cnx-doisuthep-1', placeId: 'place-cnx-doisuthep', url: 'https://images.unsplash.com/photo-1512553617847-65e4dbfa721b?w=800', mediaType: 'image', caption: 'Golden pagoda at sunset', source: 'editorial', orderIndex: 0, createdAt: T },

  // Ubud
  { id: 'pm-ubud-purist-1', placeId: 'place-ubud-purist', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', mediaType: 'image', caption: 'Private pool villa', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-ubud-locavore-1', placeId: 'place-ubud-locavore', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', mediaType: 'image', caption: 'Tasting menu course', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-ubud-seniman-1', placeId: 'place-ubud-seniman', url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800', mediaType: 'image', caption: 'Pour-over bar', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-ubud-yoga-1', placeId: 'place-ubud-yoga', url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800', mediaType: 'image', caption: 'Open-air yoga shala', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-ubud-tegallalang-1', placeId: 'place-ubud-tegallalang', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', mediaType: 'image', caption: 'Rice terraces', source: 'editorial', orderIndex: 0, createdAt: T },

  // Canggu
  { id: 'pm-canggu-outpost-1', placeId: 'place-canggu-outpost', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', mediaType: 'image', caption: 'Poolside workspace', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-canggu-crate-1', placeId: 'place-canggu-crate', url: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=800', mediaType: 'image', caption: 'Smoothie bowl', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-canggu-theslow-1', placeId: 'place-canggu-theslow', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', mediaType: 'image', caption: 'Boutique room', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-canggu-deus-1', placeId: 'place-canggu-deus', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', mediaType: 'image', caption: 'Cafe and gallery space', source: 'editorial', orderIndex: 0, createdAt: T },

  // Hoi An
  { id: 'pm-hoi-lantern-1', placeId: 'place-hoi-lantern', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', mediaType: 'image', caption: 'Lantern-lit facade', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-hoi-banh-1', placeId: 'place-hoi-banh', url: 'https://images.unsplash.com/photo-1600454021915-de8a76e16138?w=800', mediaType: 'image', caption: 'Fresh banh mi', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-hoi-cooking-1', placeId: 'place-hoi-cooking', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', mediaType: 'image', caption: 'Cooking class in action', source: 'editorial', orderIndex: 0, createdAt: T },

  // El Nido
  { id: 'pm-elnido-spin-1', placeId: 'place-elnido-spin', url: 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800', mediaType: 'image', caption: 'Rooftop bar view', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-elnido-toura-1', placeId: 'place-elnido-toura', url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800', mediaType: 'image', caption: 'Big Lagoon from the boat', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-elnido-nacpan-1', placeId: 'place-elnido-nacpan', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', mediaType: 'image', caption: 'Golden sand beach', source: 'editorial', orderIndex: 0, createdAt: T },

  // Lisbon
  { id: 'pm-lisbon-goodmorning-1', placeId: 'place-lisbon-goodmorning', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', mediaType: 'image', caption: 'Hostel common area', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-lisbon-timeout-1', placeId: 'place-lisbon-timeout', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', mediaType: 'image', caption: 'Food hall interior', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-lisbon-belem-1', placeId: 'place-lisbon-belem', url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', mediaType: 'image', caption: 'Torre de Belem at sunset', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-lisbon-fado-1', placeId: 'place-lisbon-fado', url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', mediaType: 'image', caption: 'Fado performance', source: 'editorial', orderIndex: 0, createdAt: T },

  // Marrakech
  { id: 'pm-marrakech-riad-1', placeId: 'place-marrakech-riad', url: 'https://images.unsplash.com/photo-1539437829697-1b4ed5aebd19?w=800', mediaType: 'image', caption: 'Riad courtyard pool', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-marrakech-nomad-1', placeId: 'place-marrakech-nomad', url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800', mediaType: 'image', caption: 'Rooftop terrace dining', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-marrakech-jardin-1', placeId: 'place-marrakech-jardin', url: 'https://images.unsplash.com/photo-1545860358-cc06a4e6b5f3?w=800', mediaType: 'image', caption: 'Majorelle blue villa', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-marrakech-jemaa-1', placeId: 'place-marrakech-jemaa', url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800', mediaType: 'image', caption: 'Evening food stalls', source: 'editorial', orderIndex: 0, createdAt: T },

  // Tokyo
  { id: 'pm-tokyo-nui-1', placeId: 'place-tokyo-nui', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', mediaType: 'image', caption: 'Bar lounge area', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-tokyo-tsukiji-1', placeId: 'place-tokyo-tsukiji', url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800', mediaType: 'image', caption: 'Fresh sashimi stall', source: 'editorial', orderIndex: 0, createdAt: T },

  // Kyoto
  { id: 'pm-kyoto-fushimi-1', placeId: 'place-kyoto-fushimi', url: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800', mediaType: 'image', caption: 'Torii gate tunnel', source: 'editorial', orderIndex: 0, createdAt: T },
  { id: 'pm-kyoto-len-1', placeId: 'place-kyoto-len', url: 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800', mediaType: 'image', caption: 'Tatami common area', source: 'editorial', orderIndex: 0, createdAt: T },
];
