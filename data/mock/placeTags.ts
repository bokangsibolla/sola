import { PlaceTag } from '../types';

const T = '2026-01-01T00:00:00Z';

export const mockPlaceTags: PlaceTag[] = [
  // Bangkok - Luka Hostel
  { placeId: 'place-bkk-luka', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-luka', tagId: 'tag-womenonly', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-luka', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-luka', tagId: 'tag-lockers', weight: 1, source: 'editorial', createdAt: T },

  // Bangkok - Featherstone Cafe
  { placeId: 'place-bkk-featherstone', tagId: 'tag-quiet', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-featherstone', tagId: 'tag-wifi', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-featherstone', tagId: 'tag-workcafe', weight: 1, source: 'editorial', createdAt: T },

  // Bangkok - Somsak Noodles
  { placeId: 'place-bkk-somsak', tagId: 'tag-local', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-somsak', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },

  // Bangkok - Maggie Choo's
  { placeId: 'place-bkk-maggie', tagId: 'tag-aesthetic', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-maggie', tagId: 'tag-welllit', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-maggie', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },

  // Bangkok - Wat Pho
  { placeId: 'place-bkk-watpho', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-bkk-watpho', tagId: 'tag-local', weight: 1, source: 'editorial', createdAt: T },

  // Chiang Mai - Ristr8to
  { placeId: 'place-cnx-ristr8to', tagId: 'tag-wifi', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-cnx-ristr8to', tagId: 'tag-workcafe', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-cnx-ristr8to', tagId: 'tag-aesthetic', weight: 1, source: 'editorial', createdAt: T },

  // Chiang Mai - Punspace
  { placeId: 'place-cnx-punspace', tagId: 'tag-wifi', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-cnx-punspace', tagId: 'tag-workcafe', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-cnx-punspace', tagId: 'tag-poweroutlets', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-cnx-punspace', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },

  // Chiang Mai - Lila Massage
  { placeId: 'place-cnx-lila', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-cnx-lila', tagId: 'tag-staffhelpful', weight: 1, source: 'editorial', createdAt: T },

  // Ubud - Yoga Barn
  { placeId: 'place-ubud-yoga', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-ubud-yoga', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-ubud-yoga', tagId: 'tag-chill', weight: 1, source: 'editorial', createdAt: T },

  // Ubud - Seniman Coffee
  { placeId: 'place-ubud-seniman', tagId: 'tag-quiet', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-ubud-seniman', tagId: 'tag-wifi', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-ubud-seniman', tagId: 'tag-workcafe', weight: 1, source: 'editorial', createdAt: T },

  // Canggu - Outpost
  { placeId: 'place-canggu-outpost', tagId: 'tag-wifi', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-canggu-outpost', tagId: 'tag-pool', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-canggu-outpost', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },

  // Canggu - Finn's
  { placeId: 'place-canggu-finns', tagId: 'tag-lively', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-canggu-finns', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-canggu-finns', tagId: 'tag-pool', weight: 1, source: 'editorial', createdAt: T },

  // Hoi An - Lantern Hostel
  { placeId: 'place-hoi-lantern', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-hoi-lantern', tagId: 'tag-staffhelpful', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-hoi-lantern', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },

  // El Nido - Spin Hostel
  { placeId: 'place-elnido-spin', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-elnido-spin', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-elnido-spin', tagId: 'tag-lively', weight: 1, source: 'editorial', createdAt: T },

  // Lisbon - Good Morning Hostel
  { placeId: 'place-lisbon-goodmorning', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-lisbon-goodmorning', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-lisbon-goodmorning', tagId: 'tag-staffhelpful', weight: 1, source: 'editorial', createdAt: T },

  // Lisbon - Fabrica Coffee
  { placeId: 'place-lisbon-fabrica', tagId: 'tag-quiet', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-lisbon-fabrica', tagId: 'tag-wifi', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-lisbon-fabrica', tagId: 'tag-workcafe', weight: 1, source: 'editorial', createdAt: T },

  // Marrakech - Riad Yasmine
  { placeId: 'place-marrakech-riad', tagId: 'tag-womenonly', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-marrakech-riad', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-marrakech-riad', tagId: 'tag-aesthetic', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-marrakech-riad', tagId: 'tag-pool', weight: 1, source: 'editorial', createdAt: T },

  // Marrakech - Heritage Spa
  { placeId: 'place-marrakech-hammam', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-marrakech-hammam', tagId: 'tag-staffhelpful', weight: 1, source: 'editorial', createdAt: T },

  // Tokyo - Nui Hostel
  { placeId: 'place-tokyo-nui', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-tokyo-nui', tagId: 'tag-social', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-tokyo-nui', tagId: 'tag-aesthetic', weight: 1, source: 'editorial', createdAt: T },

  // Kyoto - Fushimi Inari
  { placeId: 'place-kyoto-fushimi', tagId: 'tag-solo', weight: 1, source: 'editorial', createdAt: T },
  { placeId: 'place-kyoto-fushimi', tagId: 'tag-welllit', weight: 1, source: 'editorial', createdAt: T },
];
