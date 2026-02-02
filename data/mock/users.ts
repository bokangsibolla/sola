export interface User {
  id: string;
  firstName: string;
  bio: string;
  photoUrl: string | null;
  countryIso2: string;
  countryName: string;
  interests: string[];
  travelStyle: string;
  placesVisited: string[];     // country ISO codes
  currentCity: string | null;
  isOnline: boolean;
}

export const mockUsers: User[] = [
  {
    id: 'u1',
    firstName: 'Amara',
    bio: 'Slow traveler. Love getting lost in markets.',
    photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    countryIso2: 'NG',
    countryName: 'Nigeria',
    interests: ['🍜 Trying the food', '🏛️ History & culture'],
    travelStyle: 'Budget-friendly',
    placesVisited: ['PT', 'ES', 'MA', 'GH', 'TH'],
    currentCity: 'Lisbon',
    isOnline: true,
  },
  {
    id: 'u2',
    firstName: 'Mei',
    bio: 'Photographer chasing golden hours around the world.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    countryIso2: 'TW',
    countryName: 'Taiwan',
    interests: ['📸 Photo spots', '🌿 Being outdoors'],
    travelStyle: 'Mid-range',
    placesVisited: ['JP', 'KR', 'NZ', 'IS', 'NO'],
    currentCity: 'Kyoto',
    isOnline: false,
  },
  {
    id: 'u3',
    firstName: 'Sofia',
    bio: 'Yoga teacher on a permanent sabbatical.',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    countryIso2: 'AR',
    countryName: 'Argentina',
    interests: ['🧘 Rest & wellness', '🌿 Being outdoors'],
    travelStyle: 'Budget-friendly',
    placesVisited: ['IN', 'ID', 'TH', 'PE', 'MX'],
    currentCity: 'Ubud',
    isOnline: true,
  },
  {
    id: 'u4',
    firstName: 'Priya',
    bio: 'Tech nomad. Always looking for the best co-working spot.',
    photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
    countryIso2: 'IN',
    countryName: 'India',
    interests: ['🌙 Going out at night', '🍜 Trying the food'],
    travelStyle: 'Mid-range',
    placesVisited: ['DE', 'PT', 'TH', 'VN', 'JP', 'MX'],
    currentCity: 'Chiang Mai',
    isOnline: true,
  },
  {
    id: 'u5',
    firstName: 'Emma',
    bio: 'History nerd. Will walk 30k steps for a good ruin.',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    countryIso2: 'GB',
    countryName: 'United Kingdom',
    interests: ['🏛️ History & culture', '🗺️ Hidden gems'],
    travelStyle: 'Treat yourself',
    placesVisited: ['IT', 'GR', 'EG', 'JO', 'TR', 'HR'],
    currentCity: 'Athens',
    isOnline: false,
  },
  {
    id: 'u6',
    firstName: 'Aya',
    bio: 'Solo since 2019. The world is friendlier than you think.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    countryIso2: 'JP',
    countryName: 'Japan',
    interests: ['🚶‍♀️ Solo-friendly', '🛍️ Shopping & markets'],
    travelStyle: 'Mid-range',
    placesVisited: ['FR', 'IT', 'AU', 'KR', 'TH', 'VN', 'US'],
    currentCity: null,
    isOnline: false,
  },
];
