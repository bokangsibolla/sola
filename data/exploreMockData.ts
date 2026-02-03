// Mock data for Explore Airbnb-style redesign
// This powers the visual redesign of the Explore screen

// ============================================================================
// INTERFACES
// ============================================================================

export interface MockCountry {
  id: string;
  slug: string;
  name: string;
  iso2: string;
  continent: 'asia' | 'europe' | 'africa' | 'south-america' | 'north-america' | 'oceania';
  heroImageUrl: string;
  subtitle: string;
  citiesCount: number;
  rating: number;
  reviewCount: number;
}

export interface MockCity {
  id: string;
  slug: string;
  name: string;
  countryId: string;
  countryName: string;
  category: 'beaches' | 'cities' | 'nature' | 'culture' | 'food';
  heroImageUrl: string;
  rating: number;
  reviewCount: number;
}

export interface MockActivity {
  id: string;
  slug: string;
  name: string;
  cityId: string;
  cityName: string;
  countryName: string;
  category: 'food-tours' | 'nature' | 'nightlife' | 'wellness' | 'culture' | 'adventure';
  heroImageUrl: string;
  priceFrom: number;
  currency: string;
  rating: number;
  reviewCount: number;
  duration: string;
}

// ============================================================================
// LABEL MAPS
// ============================================================================

export const continentLabels: Record<MockCountry['continent'], string> = {
  asia: 'Asia',
  europe: 'Europe',
  africa: 'Africa',
  'south-america': 'South America',
  'north-america': 'North America',
  oceania: 'Oceania',
};

export const cityCategoryLabels: Record<MockCity['category'], string> = {
  beaches: 'Beaches',
  cities: 'Cities',
  nature: 'Nature',
  culture: 'Culture',
  food: 'Food & Wine',
};

export const activityCategoryLabels: Record<MockActivity['category'], string> = {
  'food-tours': 'Food Tours',
  nature: 'Nature & Outdoors',
  nightlife: 'Nightlife',
  wellness: 'Wellness',
  culture: 'Arts & Culture',
  adventure: 'Adventure',
};

// ============================================================================
// MOCK COUNTRIES (16 total)
// ============================================================================

export const mockCountries: MockCountry[] = [
  // Asia (6)
  {
    id: 'country-japan',
    slug: 'japan',
    name: 'Japan',
    iso2: 'JP',
    continent: 'asia',
    heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    subtitle: 'Ancient temples & modern cities',
    citiesCount: 12,
    rating: 4.92,
    reviewCount: 8420,
  },
  {
    id: 'country-thailand',
    slug: 'thailand',
    name: 'Thailand',
    iso2: 'TH',
    continent: 'asia',
    heroImageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800',
    subtitle: 'Tropical beaches & rich culture',
    citiesCount: 8,
    rating: 4.87,
    reviewCount: 6230,
  },
  {
    id: 'country-vietnam',
    slug: 'vietnam',
    name: 'Vietnam',
    iso2: 'VN',
    continent: 'asia',
    heroImageUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800',
    subtitle: 'Stunning landscapes & cuisine',
    citiesCount: 6,
    rating: 4.85,
    reviewCount: 4120,
  },
  {
    id: 'country-indonesia',
    slug: 'indonesia',
    name: 'Indonesia',
    iso2: 'ID',
    continent: 'asia',
    heroImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    subtitle: 'Island paradise & adventures',
    citiesCount: 10,
    rating: 4.89,
    reviewCount: 7340,
  },
  {
    id: 'country-south-korea',
    slug: 'south-korea',
    name: 'South Korea',
    iso2: 'KR',
    continent: 'asia',
    heroImageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
    subtitle: 'K-culture & mountain temples',
    citiesCount: 5,
    rating: 4.88,
    reviewCount: 3890,
  },
  {
    id: 'country-india',
    slug: 'india',
    name: 'India',
    iso2: 'IN',
    continent: 'asia',
    heroImageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
    subtitle: 'Vibrant colors & spirituality',
    citiesCount: 15,
    rating: 4.78,
    reviewCount: 5670,
  },
  // Europe (4)
  {
    id: 'country-portugal',
    slug: 'portugal',
    name: 'Portugal',
    iso2: 'PT',
    continent: 'europe',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    subtitle: 'Coastal charm & historic cities',
    citiesCount: 7,
    rating: 4.91,
    reviewCount: 6890,
  },
  {
    id: 'country-italy',
    slug: 'italy',
    name: 'Italy',
    iso2: 'IT',
    continent: 'europe',
    heroImageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
    subtitle: 'Art, food & la dolce vita',
    citiesCount: 14,
    rating: 4.93,
    reviewCount: 9120,
  },
  {
    id: 'country-spain',
    slug: 'spain',
    name: 'Spain',
    iso2: 'ES',
    continent: 'europe',
    heroImageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
    subtitle: 'Flamenco, tapas & sunshine',
    citiesCount: 11,
    rating: 4.90,
    reviewCount: 7650,
  },
  {
    id: 'country-greece',
    slug: 'greece',
    name: 'Greece',
    iso2: 'GR',
    continent: 'europe',
    heroImageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
    subtitle: 'Island hopping & ancient ruins',
    citiesCount: 9,
    rating: 4.89,
    reviewCount: 5430,
  },
  // Africa (2)
  {
    id: 'country-morocco',
    slug: 'morocco',
    name: 'Morocco',
    iso2: 'MA',
    continent: 'africa',
    heroImageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    subtitle: 'Medinas, deserts & mountains',
    citiesCount: 6,
    rating: 4.82,
    reviewCount: 4210,
  },
  {
    id: 'country-south-africa',
    slug: 'south-africa',
    name: 'South Africa',
    iso2: 'ZA',
    continent: 'africa',
    heroImageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    subtitle: 'Wildlife & coastal beauty',
    citiesCount: 5,
    rating: 4.86,
    reviewCount: 3890,
  },
  // South America (1)
  {
    id: 'country-colombia',
    slug: 'colombia',
    name: 'Colombia',
    iso2: 'CO',
    continent: 'south-america',
    heroImageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800',
    subtitle: 'Coffee, salsa & Caribbean vibes',
    citiesCount: 7,
    rating: 4.84,
    reviewCount: 3560,
  },
  // North America (1)
  {
    id: 'country-mexico',
    slug: 'mexico',
    name: 'Mexico',
    iso2: 'MX',
    continent: 'north-america',
    heroImageUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800',
    subtitle: 'Ancient ruins & beach paradise',
    citiesCount: 12,
    rating: 4.88,
    reviewCount: 6780,
  },
  // Oceania (2)
  {
    id: 'country-australia',
    slug: 'australia',
    name: 'Australia',
    iso2: 'AU',
    continent: 'oceania',
    heroImageUrl: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
    subtitle: 'Outback adventures & beaches',
    citiesCount: 8,
    rating: 4.91,
    reviewCount: 5670,
  },
  {
    id: 'country-new-zealand',
    slug: 'new-zealand',
    name: 'New Zealand',
    iso2: 'NZ',
    continent: 'oceania',
    heroImageUrl: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=800',
    subtitle: 'Epic landscapes & adventure',
    citiesCount: 5,
    rating: 4.97,
    reviewCount: 4320,
  },
];

// ============================================================================
// MOCK CITIES (22 total)
// ============================================================================

export const mockCities: MockCity[] = [
  // Beaches (5)
  {
    id: 'city-bali',
    slug: 'bali',
    name: 'Bali',
    countryId: 'country-indonesia',
    countryName: 'Indonesia',
    category: 'beaches',
    heroImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    rating: 4.91,
    reviewCount: 5430,
  },
  {
    id: 'city-phuket',
    slug: 'phuket',
    name: 'Phuket',
    countryId: 'country-thailand',
    countryName: 'Thailand',
    category: 'beaches',
    heroImageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
    rating: 4.85,
    reviewCount: 3210,
  },
  {
    id: 'city-cancun',
    slug: 'cancun',
    name: 'Cancún',
    countryId: 'country-mexico',
    countryName: 'Mexico',
    category: 'beaches',
    heroImageUrl: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800',
    rating: 4.82,
    reviewCount: 2890,
  },
  {
    id: 'city-santorini',
    slug: 'santorini',
    name: 'Santorini',
    countryId: 'country-greece',
    countryName: 'Greece',
    category: 'beaches',
    heroImageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
    rating: 4.94,
    reviewCount: 4120,
  },
  {
    id: 'city-lagos',
    slug: 'lagos-portugal',
    name: 'Lagos',
    countryId: 'country-portugal',
    countryName: 'Portugal',
    category: 'beaches',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-69c8dd6cca7f?w=800',
    rating: 4.88,
    reviewCount: 1890,
  },
  // Cities (5)
  {
    id: 'city-tokyo',
    slug: 'tokyo',
    name: 'Tokyo',
    countryId: 'country-japan',
    countryName: 'Japan',
    category: 'cities',
    heroImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    rating: 4.95,
    reviewCount: 7890,
  },
  {
    id: 'city-barcelona',
    slug: 'barcelona',
    name: 'Barcelona',
    countryId: 'country-spain',
    countryName: 'Spain',
    category: 'cities',
    heroImageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    rating: 4.92,
    reviewCount: 6540,
  },
  {
    id: 'city-lisbon',
    slug: 'lisbon',
    name: 'Lisbon',
    countryId: 'country-portugal',
    countryName: 'Portugal',
    category: 'cities',
    heroImageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800',
    rating: 4.93,
    reviewCount: 5670,
  },
  {
    id: 'city-seoul',
    slug: 'seoul',
    name: 'Seoul',
    countryId: 'country-south-korea',
    countryName: 'South Korea',
    category: 'cities',
    heroImageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
    rating: 4.89,
    reviewCount: 3450,
  },
  {
    id: 'city-melbourne',
    slug: 'melbourne',
    name: 'Melbourne',
    countryId: 'country-australia',
    countryName: 'Australia',
    category: 'cities',
    heroImageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800',
    rating: 4.90,
    reviewCount: 2980,
  },
  // Nature (4)
  {
    id: 'city-queenstown',
    slug: 'queenstown',
    name: 'Queenstown',
    countryId: 'country-new-zealand',
    countryName: 'New Zealand',
    category: 'nature',
    heroImageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
    rating: 4.96,
    reviewCount: 3210,
  },
  {
    id: 'city-cape-town',
    slug: 'cape-town',
    name: 'Cape Town',
    countryId: 'country-south-africa',
    countryName: 'South Africa',
    category: 'nature',
    heroImageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    rating: 4.91,
    reviewCount: 2870,
  },
  {
    id: 'city-chiang-mai',
    slug: 'chiang-mai',
    name: 'Chiang Mai',
    countryId: 'country-thailand',
    countryName: 'Thailand',
    category: 'nature',
    heroImageUrl: 'https://images.unsplash.com/photo-1512553953852-d97b6b8b3c68?w=800',
    rating: 4.87,
    reviewCount: 2540,
  },
  {
    id: 'city-hanoi',
    slug: 'hanoi',
    name: 'Hanoi',
    countryId: 'country-vietnam',
    countryName: 'Vietnam',
    category: 'nature',
    heroImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    rating: 4.84,
    reviewCount: 2120,
  },
  // Culture (4)
  {
    id: 'city-kyoto',
    slug: 'kyoto',
    name: 'Kyoto',
    countryId: 'country-japan',
    countryName: 'Japan',
    category: 'culture',
    heroImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    rating: 4.97,
    reviewCount: 6780,
  },
  {
    id: 'city-marrakech',
    slug: 'marrakech',
    name: 'Marrakech',
    countryId: 'country-morocco',
    countryName: 'Morocco',
    category: 'culture',
    heroImageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800',
    rating: 4.86,
    reviewCount: 3450,
  },
  {
    id: 'city-rome',
    slug: 'rome',
    name: 'Rome',
    countryId: 'country-italy',
    countryName: 'Italy',
    category: 'culture',
    heroImageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    rating: 4.94,
    reviewCount: 7230,
  },
  {
    id: 'city-jaipur',
    slug: 'jaipur',
    name: 'Jaipur',
    countryId: 'country-india',
    countryName: 'India',
    category: 'culture',
    heroImageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    rating: 4.81,
    reviewCount: 2340,
  },
  // Food (4)
  {
    id: 'city-florence',
    slug: 'florence',
    name: 'Florence',
    countryId: 'country-italy',
    countryName: 'Italy',
    category: 'food',
    heroImageUrl: 'https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?w=800',
    rating: 4.95,
    reviewCount: 4560,
  },
  {
    id: 'city-ho-chi-minh',
    slug: 'ho-chi-minh-city',
    name: 'Ho Chi Minh City',
    countryId: 'country-vietnam',
    countryName: 'Vietnam',
    category: 'food',
    heroImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    rating: 4.88,
    reviewCount: 2890,
  },
  {
    id: 'city-cartagena',
    slug: 'cartagena',
    name: 'Cartagena',
    countryId: 'country-colombia',
    countryName: 'Colombia',
    category: 'food',
    heroImageUrl: 'https://images.unsplash.com/photo-1583531172005-763a424a0f24?w=800',
    rating: 4.87,
    reviewCount: 2120,
  },
  {
    id: 'city-porto',
    slug: 'porto',
    name: 'Porto',
    countryId: 'country-portugal',
    countryName: 'Portugal',
    category: 'food',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    rating: 4.92,
    reviewCount: 3780,
  },
];

// ============================================================================
// MOCK ACTIVITIES (17 total)
// ============================================================================

export const mockActivities: MockActivity[] = [
  // Food Tours (3)
  {
    id: 'activity-tokyo-food-tour',
    slug: 'tokyo-street-food-tour',
    name: 'Tokyo Street Food Tour',
    cityId: 'city-tokyo',
    cityName: 'Tokyo',
    countryName: 'Japan',
    category: 'food-tours',
    heroImageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
    priceFrom: 85,
    currency: 'USD',
    rating: 4.96,
    reviewCount: 1230,
    duration: '3 hours',
  },
  {
    id: 'activity-florence-wine-tasting',
    slug: 'florence-tuscan-wine-tasting',
    name: 'Tuscan Wine & Cheese Tasting',
    cityId: 'city-florence',
    cityName: 'Florence',
    countryName: 'Italy',
    category: 'food-tours',
    heroImageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
    priceFrom: 120,
    currency: 'USD',
    rating: 4.94,
    reviewCount: 890,
    duration: '4 hours',
  },
  {
    id: 'activity-hanoi-food-tour',
    slug: 'hanoi-street-food-adventure',
    name: 'Hanoi Street Food Adventure',
    cityId: 'city-hanoi',
    cityName: 'Hanoi',
    countryName: 'Vietnam',
    category: 'food-tours',
    heroImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    priceFrom: 45,
    currency: 'USD',
    rating: 4.92,
    reviewCount: 670,
    duration: '3.5 hours',
  },
  // Nature (3)
  {
    id: 'activity-queenstown-hiking',
    slug: 'queenstown-milford-sound-hike',
    name: 'Milford Sound Scenic Hike',
    cityId: 'city-queenstown',
    cityName: 'Queenstown',
    countryName: 'New Zealand',
    category: 'nature',
    heroImageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
    priceFrom: 180,
    currency: 'USD',
    rating: 4.97,
    reviewCount: 540,
    duration: 'Full day',
  },
  {
    id: 'activity-bali-rice-terraces',
    slug: 'bali-tegallalang-rice-terraces',
    name: 'Tegallalang Rice Terraces Tour',
    cityId: 'city-bali',
    cityName: 'Bali',
    countryName: 'Indonesia',
    category: 'nature',
    heroImageUrl: 'https://images.unsplash.com/photo-1531592937781-344ad608fabf?w=800',
    priceFrom: 55,
    currency: 'USD',
    rating: 4.89,
    reviewCount: 1120,
    duration: '5 hours',
  },
  {
    id: 'activity-cape-town-table-mountain',
    slug: 'cape-town-table-mountain-hike',
    name: 'Table Mountain Sunrise Hike',
    cityId: 'city-cape-town',
    cityName: 'Cape Town',
    countryName: 'South Africa',
    category: 'nature',
    heroImageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    priceFrom: 75,
    currency: 'USD',
    rating: 4.93,
    reviewCount: 780,
    duration: '4 hours',
  },
  // Nightlife (2)
  {
    id: 'activity-barcelona-tapas-crawl',
    slug: 'barcelona-gothic-quarter-tapas',
    name: 'Gothic Quarter Tapas & Wine Crawl',
    cityId: 'city-barcelona',
    cityName: 'Barcelona',
    countryName: 'Spain',
    category: 'nightlife',
    heroImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    priceFrom: 95,
    currency: 'USD',
    rating: 4.91,
    reviewCount: 650,
    duration: '4 hours',
  },
  {
    id: 'activity-cartagena-salsa-night',
    slug: 'cartagena-salsa-dancing-night',
    name: 'Salsa Dancing Night Experience',
    cityId: 'city-cartagena',
    cityName: 'Cartagena',
    countryName: 'Colombia',
    category: 'nightlife',
    heroImageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
    priceFrom: 65,
    currency: 'USD',
    rating: 4.88,
    reviewCount: 430,
    duration: '4 hours',
  },
  // Wellness (3)
  {
    id: 'activity-bali-yoga-retreat',
    slug: 'bali-ubud-yoga-retreat',
    name: 'Ubud Yoga & Meditation Retreat',
    cityId: 'city-bali',
    cityName: 'Bali',
    countryName: 'Indonesia',
    category: 'wellness',
    heroImageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
    priceFrom: 90,
    currency: 'USD',
    rating: 4.95,
    reviewCount: 890,
    duration: 'Half day',
  },
  {
    id: 'activity-chiang-mai-thai-massage',
    slug: 'chiang-mai-traditional-thai-massage',
    name: 'Traditional Thai Massage Experience',
    cityId: 'city-chiang-mai',
    cityName: 'Chiang Mai',
    countryName: 'Thailand',
    category: 'wellness',
    heroImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    priceFrom: 35,
    currency: 'USD',
    rating: 4.87,
    reviewCount: 560,
    duration: '2 hours',
  },
  {
    id: 'activity-santorini-hot-springs',
    slug: 'santorini-volcanic-hot-springs',
    name: 'Volcanic Hot Springs & Caldera Cruise',
    cityId: 'city-santorini',
    cityName: 'Santorini',
    countryName: 'Greece',
    category: 'wellness',
    heroImageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
    priceFrom: 110,
    currency: 'USD',
    rating: 4.90,
    reviewCount: 720,
    duration: '5 hours',
  },
  // Culture (3)
  {
    id: 'activity-kyoto-tea-ceremony',
    slug: 'kyoto-traditional-tea-ceremony',
    name: 'Traditional Tea Ceremony Experience',
    cityId: 'city-kyoto',
    cityName: 'Kyoto',
    countryName: 'Japan',
    category: 'culture',
    heroImageUrl: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800',
    priceFrom: 70,
    currency: 'USD',
    rating: 4.96,
    reviewCount: 1450,
    duration: '2 hours',
  },
  {
    id: 'activity-marrakech-medina-tour',
    slug: 'marrakech-medina-walking-tour',
    name: 'Medina & Souks Walking Tour',
    cityId: 'city-marrakech',
    cityName: 'Marrakech',
    countryName: 'Morocco',
    category: 'culture',
    heroImageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800',
    priceFrom: 45,
    currency: 'USD',
    rating: 4.85,
    reviewCount: 890,
    duration: '3 hours',
  },
  {
    id: 'activity-rome-colosseum-tour',
    slug: 'rome-colosseum-underground-tour',
    name: 'Colosseum Underground Tour',
    cityId: 'city-rome',
    cityName: 'Rome',
    countryName: 'Italy',
    category: 'culture',
    heroImageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    priceFrom: 95,
    currency: 'USD',
    rating: 4.94,
    reviewCount: 2340,
    duration: '3 hours',
  },
  // Adventure (3)
  {
    id: 'activity-queenstown-bungee',
    slug: 'queenstown-nevis-bungee-jump',
    name: 'Nevis Bungee Jump Experience',
    cityId: 'city-queenstown',
    cityName: 'Queenstown',
    countryName: 'New Zealand',
    category: 'adventure',
    heroImageUrl: 'https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=800',
    priceFrom: 175,
    currency: 'USD',
    rating: 4.92,
    reviewCount: 430,
    duration: '3 hours',
  },
  {
    id: 'activity-cancun-cenote-snorkeling',
    slug: 'cancun-cenote-snorkeling-adventure',
    name: 'Cenote Snorkeling Adventure',
    cityId: 'city-cancun',
    cityName: 'Cancún',
    countryName: 'Mexico',
    category: 'adventure',
    heroImageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
    priceFrom: 85,
    currency: 'USD',
    rating: 4.89,
    reviewCount: 670,
    duration: 'Half day',
  },
  {
    id: 'activity-phuket-island-hopping',
    slug: 'phuket-phi-phi-island-hopping',
    name: 'Phi Phi Islands Speedboat Tour',
    cityId: 'city-phuket',
    cityName: 'Phuket',
    countryName: 'Thailand',
    category: 'adventure',
    heroImageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
    priceFrom: 110,
    currency: 'USD',
    rating: 4.86,
    reviewCount: 1230,
    duration: 'Full day',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all countries for a specific continent
 */
export function getCountriesByContinent(continent: MockCountry['continent']): MockCountry[] {
  return mockCountries.filter((country) => country.continent === continent);
}

/**
 * Get all cities for a specific category
 */
export function getCitiesByCategory(category: MockCity['category']): MockCity[] {
  return mockCities.filter((city) => city.category === category);
}

/**
 * Get all activities for a specific category
 */
export function getActivitiesByCategory(category: MockActivity['category']): MockActivity[] {
  return mockActivities.filter((activity) => activity.category === category);
}

/**
 * Get top-rated activities, sorted by rating descending
 */
export function getTopRatedActivities(limit: number = 5): MockActivity[] {
  return [...mockActivities].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

/**
 * Search across all mock data collections
 * Returns matching countries, cities, and activities
 */
export function searchMockData(query: string): {
  countries: MockCountry[];
  cities: MockCity[];
  activities: MockActivity[];
} {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return { countries: [], cities: [], activities: [] };
  }

  const countries = mockCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(normalizedQuery) ||
      country.subtitle.toLowerCase().includes(normalizedQuery) ||
      continentLabels[country.continent].toLowerCase().includes(normalizedQuery)
  );

  const cities = mockCities.filter(
    (city) =>
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.countryName.toLowerCase().includes(normalizedQuery) ||
      cityCategoryLabels[city.category].toLowerCase().includes(normalizedQuery)
  );

  const activities = mockActivities.filter(
    (activity) =>
      activity.name.toLowerCase().includes(normalizedQuery) ||
      activity.cityName.toLowerCase().includes(normalizedQuery) ||
      activity.countryName.toLowerCase().includes(normalizedQuery) ||
      activityCategoryLabels[activity.category].toLowerCase().includes(normalizedQuery)
  );

  return { countries, cities, activities };
}
