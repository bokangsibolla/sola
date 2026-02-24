export interface InterestOption {
  slug: string;
  label: string;
  group: string;
}

export interface InterestGroup {
  key: string;
  question: string;
  options: InterestOption[];
}

export const INTEREST_GROUPS: InterestGroup[] = [
  {
    key: 'travel_draw',
    question: 'What draws you to a place?',
    options: [
      { slug: 'history-culture', label: 'History & culture', group: 'travel_draw' },
      { slug: 'nature-outdoors', label: 'Nature & outdoors', group: 'travel_draw' },
      { slug: 'beach-coast', label: 'Beach & coast', group: 'travel_draw' },
      { slug: 'city-life', label: 'City life', group: 'travel_draw' },
      { slug: 'wellness-spiritual', label: 'Wellness & spiritual', group: 'travel_draw' },
      { slug: 'adventure-adrenaline', label: 'Adventure & adrenaline', group: 'travel_draw' },
      { slug: 'art-design', label: 'Art & design', group: 'travel_draw' },
      { slug: 'nightlife-social', label: 'Nightlife & social', group: 'travel_draw' },
    ],
  },
  {
    key: 'cuisine_pref',
    question: 'What do you love eating?',
    options: [
      { slug: 'street-food', label: 'Street food', group: 'cuisine_pref' },
      { slug: 'local-cuisine', label: 'Local cuisine', group: 'cuisine_pref' },
      { slug: 'fine-dining', label: 'Fine dining', group: 'cuisine_pref' },
      { slug: 'vegetarian-vegan', label: 'Vegetarian & vegan', group: 'cuisine_pref' },
      { slug: 'seafood', label: 'Seafood', group: 'cuisine_pref' },
      { slug: 'coffee-cafe', label: 'Coffee & cafe culture', group: 'cuisine_pref' },
      { slug: 'market-food', label: 'Market food', group: 'cuisine_pref' },
      { slug: 'cooking-classes', label: 'Cooking classes', group: 'cuisine_pref' },
    ],
  },
  {
    key: 'travel_vibe',
    question: 'Your travel vibe?',
    options: [
      { slug: 'slow-intentional', label: 'Slow & intentional', group: 'travel_vibe' },
      { slug: 'packed-itinerary', label: 'Packed itinerary', group: 'travel_vibe' },
      { slug: 'spontaneous', label: 'Spontaneous', group: 'travel_vibe' },
      { slug: 'photography-driven', label: 'Photography-driven', group: 'travel_vibe' },
      { slug: 'budget-backpacker', label: 'Budget backpacker', group: 'travel_vibe' },
      { slug: 'comfort-luxury', label: 'Comfort & luxury', group: 'travel_vibe' },
      { slug: 'solo-by-choice', label: 'Solo by choice', group: 'travel_vibe' },
      { slug: 'open-to-connections', label: 'Open to connections', group: 'travel_vibe' },
    ],
  },
];

/** Flat list of all interest options */
export const ALL_INTERESTS: InterestOption[] = INTEREST_GROUPS.flatMap((g) => g.options);

/** Map old text[] interest values to new slugs */
export const LEGACY_INTEREST_MAP: Record<string, string> = {
  'History & culture': 'history-culture',
  'Being outdoors': 'nature-outdoors',
  'Trying the food': 'local-cuisine',
  'Going out at night': 'nightlife-social',
  'Rest & wellness': 'wellness-spiritual',
  'Adventure & sports': 'adventure-adrenaline',
  'Shopping & markets': 'market-food',
  'Art & creativity': 'art-design',
};
