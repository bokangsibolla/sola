export interface CountryGuide {
  slug: string;
  name: string;
  iso2: string;
  heroImageUrl: string;
  tagline: string;
  safetyRating: 'very safe' | 'generally safe' | 'use caution';
  soloFriendly: boolean;
  bestMonths: string;
  currency: string;
  language: string;
  visaNote: string;
  highlights: string[];
  cities: CityGuide[];
}

export interface CityGuide {
  slug: string;
  name: string;
  countrySlug: string;
  heroImageUrl: string;
  tagline: string;
  neighborhoods: string[];
  mustDo: PlaceEntry[];
  eats: PlaceEntry[];
  stays: PlaceEntry[];
}

export interface PlaceEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  priceLevel?: '$' | '$$' | '$$$' | '$$$$';
  tip?: string;
}

export const mockCountryGuides: CountryGuide[] = [
  {
    slug: 'portugal',
    name: 'Portugal',
    iso2: 'PT',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=800',
    tagline: 'Affordable, safe, and endlessly charming',
    safetyRating: 'very safe',
    soloFriendly: true,
    bestMonths: 'Apr–Oct',
    currency: 'EUR (€)',
    language: 'Portuguese',
    visaNote: 'Schengen area — 90 days visa-free for most passports',
    highlights: ['Pastel de nata trail', 'Fado nights in Alfama', 'Surfing in Ericeira', 'Day trip to Sintra'],
    cities: [
      {
        slug: 'lisbon',
        name: 'Lisbon',
        countrySlug: 'portugal',
        heroImageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=800',
        tagline: 'Hilly, sunny, and full of pastéis',
        neighborhoods: ['Alfama', 'Bairro Alto', 'Belém', 'Príncipe Real'],
        mustDo: [
          { id: 'p1', name: 'Tram 28 ride', category: 'Experience', description: 'The iconic yellow tram through the oldest neighborhoods', imageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=600', tip: 'Go early morning to avoid crowds' },
          { id: 'p2', name: 'Castelo de São Jorge', category: 'History', description: 'Hilltop castle with panoramic views of the city', imageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=600', priceLevel: '$' },
          { id: 'p3', name: 'LX Factory', category: 'Culture', description: 'Creative hub with shops, food, and art in a converted factory', imageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=600' },
        ],
        eats: [
          { id: 'e1', name: 'Time Out Market', category: 'Food hall', description: 'Best of Lisbon\'s food scene under one roof', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', priceLevel: '$$' },
          { id: 'e2', name: 'Pastéis de Belém', category: 'Bakery', description: 'The original pastel de nata since 1837', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', priceLevel: '$' },
        ],
        stays: [
          { id: 's1', name: 'The Lumiares', category: 'Boutique Hotel', description: 'Converted 18th-century palace in Bairro Alto', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', priceLevel: '$$$' },
          { id: 's2', name: 'Lisbon Destination Hostel', category: 'Hostel', description: 'Social hostel inside a gorgeous train station', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', priceLevel: '$' },
        ],
      },
    ],
  },
  {
    slug: 'japan',
    name: 'Japan',
    iso2: 'JP',
    heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    tagline: 'Safe, clean, and utterly fascinating',
    safetyRating: 'very safe',
    soloFriendly: true,
    bestMonths: 'Mar–May, Oct–Nov',
    currency: 'JPY (¥)',
    language: 'Japanese',
    visaNote: '90 days visa-free for most Western passports',
    highlights: ['Cherry blossom season', 'Temple stays', 'Street food in Osaka', 'Onsen culture'],
    cities: [
      {
        slug: 'kyoto',
        name: 'Kyoto',
        countrySlug: 'japan',
        heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
        tagline: 'Temples, gardens, and tea ceremonies',
        neighborhoods: ['Gion', 'Arashiyama', 'Higashiyama', 'Fushimi'],
        mustDo: [
          { id: 'p4', name: 'Fushimi Inari Shrine', category: 'Temple', description: 'Thousands of vermillion torii gates up the mountain', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600', tip: 'Start at sunrise to have it to yourself' },
          { id: 'p5', name: 'Arashiyama Bamboo Grove', category: 'Nature', description: 'Walk through towering bamboo stalks', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600' },
        ],
        eats: [
          { id: 'e3', name: 'Nishiki Market', category: 'Market', description: 'Kyoto\'s 400-year-old kitchen — sample as you walk', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', priceLevel: '$' },
        ],
        stays: [
          { id: 's3', name: 'Traditional Ryokan', category: 'Ryokan', description: 'Tatami floors, futon beds, kaiseki dinner included', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', priceLevel: '$$$' },
        ],
      },
    ],
  },
  {
    slug: 'morocco',
    name: 'Morocco',
    iso2: 'MA',
    heroImageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    tagline: 'Sensory overload in the best way',
    safetyRating: 'generally safe',
    soloFriendly: true,
    bestMonths: 'Mar–May, Sep–Nov',
    currency: 'MAD (د.م.)',
    language: 'Arabic, French, Berber',
    visaNote: '90 days visa-free for most passports',
    highlights: ['Getting lost in the medina', 'Sahara desert camping', 'Hammam ritual', 'Atlas Mountains trekking'],
    cities: [
      {
        slug: 'marrakech',
        name: 'Marrakech',
        countrySlug: 'morocco',
        heroImageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
        tagline: 'Chaos, color, and incredible hospitality',
        neighborhoods: ['Medina', 'Gueliz', 'Mellah', 'Palmerie'],
        mustDo: [
          { id: 'p6', name: 'Jardin Majorelle', category: 'Garden', description: 'Yves Saint Laurent\'s cobalt-blue botanical garden', imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=600', priceLevel: '$' },
        ],
        eats: [
          { id: 'e4', name: 'Jemaa el-Fnaa food stalls', category: 'Street food', description: 'The main square transforms into an open-air restaurant at sunset', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', priceLevel: '$' },
        ],
        stays: [
          { id: 's4', name: 'Riad Yasmine', category: 'Riad', description: 'That famous Instagram pool — and it\'s even better in person', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', priceLevel: '$$' },
        ],
      },
    ],
  },
];
