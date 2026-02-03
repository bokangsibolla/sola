/**
 * Curated Accommodation List for Sola
 *
 * Each entry needs:
 * - googlePlaceId: Get from Google Maps (see instructions below)
 * - citySlug: Must match a city slug from cities.ts
 * - type: 'hotel' | 'hostel' | 'homestay'
 * - name: Optional, for reference (will be fetched from Google)
 * - description: Optional short description
 *
 * HOW TO FIND GOOGLE PLACE IDs:
 * 1. Go to Google Maps (maps.google.com)
 * 2. Search for the accommodation
 * 3. Click on the place
 * 4. Look at the URL - it contains the Place ID after "place/"
 *    Example: https://www.google.com/maps/place/.../@13.7563,100.5018,17z/data=!3m1!4b1!4m6!3m5!1s0x30e29e1f9e0d5c69:0x1f9e8d2b3a4c5e6f
 *    The part after "!1s" and before ":" is similar but not exact
 * 5. Better: Use the Place ID Finder:
 *    https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
 *
 * CURATION CRITERIA (what makes a good Sola accommodation):
 * - Clear room types (private/shared explicitly stated)
 * - Good reviews from solo female travelers
 * - Safe neighborhood
 * - Clear check-in process
 * - Female-only options for hostels (preferred)
 * - Central location or good transport access
 */

export interface AccommodationEntry {
  googlePlaceId: string;
  citySlug: string;
  type: 'hotel' | 'hostel' | 'homestay';
  name?: string;
  description?: string;
}

export const ACCOMMODATIONS: AccommodationEntry[] = [
  // ===========================================================================
  // THAILAND
  // ===========================================================================

  // Bangkok (5 accommodations)
  {
    googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Example - replace with real ID
    citySlug: 'bangkok',
    type: 'hostel',
    name: 'Lub d Bangkok Silom',
    description: 'Modern hostel with female-only dorms, central location',
  },
  {
    googlePlaceId: 'ChIJgUbEo8cfqokR5lP9_Wh_DaM', // Example - replace with real ID
    citySlug: 'bangkok',
    type: 'hostel',
    name: 'The Yard Hostel',
    description: 'Popular with solo travelers, social atmosphere',
  },
  {
    googlePlaceId: 'ChIJN2T_tDeuEmsRdqsH2g83fr8', // Example - replace with real ID
    citySlug: 'bangkok',
    type: 'hostel',
    name: 'NapPark Hostel',
    description: 'Award-winning hostel, great for first-time solo travelers',
  },
  {
    googlePlaceId: 'ChIJN3T_tDeuEmsRUsoyG83frZ9', // Example - replace with real ID
    citySlug: 'bangkok',
    type: 'hotel',
    name: 'ibis Bangkok Riverside',
    description: 'Budget-friendly hotel, safe area, river views',
  },
  {
    googlePlaceId: 'ChIJN4T_tDeuEmsRUsoyG83frA1', // Example - replace with real ID
    citySlug: 'bangkok',
    type: 'hotel',
    name: 'Anantara Sathorn Bangkok',
    description: 'Mid-range hotel, excellent for solo travelers',
  },

  // Chiang Mai (5 accommodations)
  {
    googlePlaceId: 'ChIJBzT_tDeuEmsRUsoyG83frB2', // Example - replace with real ID
    citySlug: 'chiang-mai',
    type: 'hostel',
    name: 'Stamps Backpackers',
    description: 'Female-only dorms available, Old City location',
  },
  {
    googlePlaceId: 'ChIJCzT_tDeuEmsRUsoyG83frC3', // Example - replace with real ID
    citySlug: 'chiang-mai',
    type: 'hostel',
    name: 'Hug Hostel',
    description: 'Social hostel, rooftop bar, walking distance to temples',
  },
  {
    googlePlaceId: 'ChIJDzT_tDeuEmsRUsoyG83frD4', // Example - replace with real ID
    citySlug: 'chiang-mai',
    type: 'homestay',
    name: 'Baan Hanibah',
    description: 'Boutique guesthouse, quiet neighborhood, female owner',
  },
  {
    googlePlaceId: 'ChIJEzT_tDeuEmsRUsoyG83frE5', // Example - replace with real ID
    citySlug: 'chiang-mai',
    type: 'hotel',
    name: 'U Chiang Mai',
    description: 'Boutique hotel, central location, excellent service',
  },
  {
    googlePlaceId: 'ChIJFzT_tDeuEmsRUsoyG83frF6', // Example - replace with real ID
    citySlug: 'chiang-mai',
    type: 'hostel',
    name: 'Deejai Backpackers',
    description: 'Budget-friendly, great for meeting other travelers',
  },

  // ===========================================================================
  // INDONESIA (Bali)
  // ===========================================================================

  // Ubud (5 accommodations)
  {
    googlePlaceId: 'ChIJGzT_tDeuEmsRUsoyG83frG7', // Example - replace with real ID
    citySlug: 'ubud',
    type: 'hostel',
    name: 'Outpost Ubud',
    description: 'Co-living space, great for digital nomads',
  },
  {
    googlePlaceId: 'ChIJHzT_tDeuEmsRUsoyG83frH8', // Example - replace with real ID
    citySlug: 'ubud',
    type: 'homestay',
    name: 'Tegal Sari Accommodation',
    description: 'Traditional Balinese homestay, rice field views',
  },
  {
    googlePlaceId: 'ChIJIzT_tDeuEmsRUsoyG83frI9', // Example - replace with real ID
    citySlug: 'ubud',
    type: 'hotel',
    name: 'Bisma Eight',
    description: 'Boutique hotel, infinity pool, central Ubud',
  },
  {
    googlePlaceId: 'ChIJJzT_tDeuEmsRUsoyG83frJ0', // Example - replace with real ID
    citySlug: 'ubud',
    type: 'hostel',
    name: 'Puri Garden Hotel',
    description: 'Budget-friendly with pool, quiet location',
  },
  {
    googlePlaceId: 'ChIJKzT_tDeuEmsRUsoyG83frK1', // Example - replace with real ID
    citySlug: 'ubud',
    type: 'homestay',
    name: 'Pondok Pundi Village Inn',
    description: 'Family-run guesthouse, authentic experience',
  },

  // Canggu (5 accommodations)
  {
    googlePlaceId: 'ChIJLzT_tDeuEmsRUsoyG83frL2', // Example - replace with real ID
    citySlug: 'canggu',
    type: 'hostel',
    name: 'The Farm Hostel',
    description: 'Popular surf hostel, social atmosphere',
  },
  {
    googlePlaceId: 'ChIJMzT_tDeuEmsRUsoyG83frM3', // Example - replace with real ID
    citySlug: 'canggu',
    type: 'hostel',
    name: 'Kos One Hostel',
    description: 'Female-only dorms, close to beach',
  },
  {
    googlePlaceId: 'ChIJNzT_tDeuEmsRUsoyG83frN4', // Example - replace with real ID
    citySlug: 'canggu',
    type: 'hotel',
    name: 'Theanna Eco Villa',
    description: 'Eco-friendly villa, quiet area',
  },
  {
    googlePlaceId: 'ChIJOzT_tDeuEmsRUsoyG83frO5', // Example - replace with real ID
    citySlug: 'canggu',
    type: 'hostel',
    name: 'Sedasa Canggu',
    description: 'Design hostel, great common areas',
  },
  {
    googlePlaceId: 'ChIJPzT_tDeuEmsRUsoyG83frP6', // Example - replace with real ID
    citySlug: 'canggu',
    type: 'homestay',
    name: 'Serenity Eco Guesthouse',
    description: 'Peaceful retreat, yoga classes available',
  },

  // ===========================================================================
  // JAPAN
  // ===========================================================================

  // Tokyo (5 accommodations)
  {
    googlePlaceId: 'ChIJQzT_tDeuEmsRUsoyG83frQ7', // Example - replace with real ID
    citySlug: 'tokyo',
    type: 'hostel',
    name: 'Nui. HOSTEL & BAR LOUNGE',
    description: 'Stylish hostel, Kuramae area, female-only floor',
  },
  {
    googlePlaceId: 'ChIJRzT_tDeuEmsRUsoyG83frR8', // Example - replace with real ID
    citySlug: 'tokyo',
    type: 'hostel',
    name: 'UNPLAN Shinjuku',
    description: 'Modern capsule-style, women-only section',
  },
  {
    googlePlaceId: 'ChIJSzT_tDeuEmsRUsoyG83frS9', // Example - replace with real ID
    citySlug: 'tokyo',
    type: 'hotel',
    name: 'The Millennials Shibuya',
    description: 'Smart pods, tech-forward, excellent location',
  },
  {
    googlePlaceId: 'ChIJTzT_tDeuEmsRUsoyG83frT0', // Example - replace with real ID
    citySlug: 'tokyo',
    type: 'hostel',
    name: 'Kaisu Hostel',
    description: 'Traditional meets modern, Asakusa area',
  },
  {
    googlePlaceId: 'ChIJUzT_tDeuEmsRUsoyG83frU1', // Example - replace with real ID
    citySlug: 'tokyo',
    type: 'hotel',
    name: 'Tokyu Stay Shinjuku',
    description: 'Apartment-style hotel, great for longer stays',
  },

  // Kyoto (5 accommodations)
  {
    googlePlaceId: 'ChIJVzT_tDeuEmsRUsoyG83frV2', // Example - replace with real ID
    citySlug: 'kyoto',
    type: 'hostel',
    name: 'Piece Hostel Sanjo',
    description: 'Design hostel, female dorms, central location',
  },
  {
    googlePlaceId: 'ChIJWzT_tDeuEmsRUsoyG83frW3', // Example - replace with real ID
    citySlug: 'kyoto',
    type: 'homestay',
    name: 'Guesthouse Soi',
    description: 'Traditional machiya townhouse experience',
  },
  {
    googlePlaceId: 'ChIJXzT_tDeuEmsRUsoyG83frX4', // Example - replace with real ID
    citySlug: 'kyoto',
    type: 'hostel',
    name: 'The Millennials Kyoto',
    description: 'Smart pods, women-only floor available',
  },
  {
    googlePlaceId: 'ChIJYzT_tDeuEmsRUsoyG83frY5', // Example - replace with real ID
    citySlug: 'kyoto',
    type: 'hotel',
    name: 'Hotel Kanra Kyoto',
    description: 'Boutique hotel, traditional aesthetic',
  },
  {
    googlePlaceId: 'ChIJZzT_tDeuEmsRUsoyG83frZ6', // Example - replace with real ID
    citySlug: 'kyoto',
    type: 'hostel',
    name: 'Len Kyoto Kawaramachi',
    description: 'Social hostel, bar and cafe, riverside',
  },

  // ===========================================================================
  // PORTUGAL
  // ===========================================================================

  // Lisbon (5 accommodations)
  {
    googlePlaceId: 'ChIJazT_tDeuEmsRUsoyG83fra7', // Example - replace with real ID
    citySlug: 'lisbon',
    type: 'hostel',
    name: 'Home Lisbon Hostel',
    description: 'Award-winning hostel, family dinners, great atmosphere',
  },
  {
    googlePlaceId: 'ChIJbzT_tDeuEmsRUsoyG83frb8', // Example - replace with real ID
    citySlug: 'lisbon',
    type: 'hostel',
    name: 'Lisbon Destination Hostel',
    description: 'In train station, super central, female dorms',
  },
  {
    googlePlaceId: 'ChIJczT_tDeuEmsRUsoyG83frc9', // Example - replace with real ID
    citySlug: 'lisbon',
    type: 'hotel',
    name: 'Hotel Pessoa Lisboa',
    description: 'Boutique hotel, Baixa area, literary themed',
  },
  {
    googlePlaceId: 'ChIJdzT_tDeuEmsRUsoyG83frd0', // Example - replace with real ID
    citySlug: 'lisbon',
    type: 'hostel',
    name: 'Living Lounge Hostel',
    description: 'Cozy hostel, Bairro Alto location',
  },
  {
    googlePlaceId: 'ChIJezT_tDeuEmsRUsoyG83fre1', // Example - replace with real ID
    citySlug: 'lisbon',
    type: 'homestay',
    name: 'Casa do Bairro',
    description: 'Charming guesthouse, Alfama neighborhood',
  },

  // Porto (5 accommodations)
  {
    googlePlaceId: 'ChIJfzT_tDeuEmsRUsoyG83frf2', // Example - replace with real ID
    citySlug: 'porto',
    type: 'hostel',
    name: 'Gallery Hostel',
    description: 'Art-focused hostel, female dorms, breakfast included',
  },
  {
    googlePlaceId: 'ChIJgzT_tDeuEmsRUsoyG83frg3', // Example - replace with real ID
    citySlug: 'porto',
    type: 'hostel',
    name: 'Pilot Design Hostel',
    description: 'Design hostel, rooftop terrace',
  },
  {
    googlePlaceId: 'ChIJhzT_tDeuEmsRUsoyG83frh4', // Example - replace with real ID
    citySlug: 'porto',
    type: 'hotel',
    name: 'Hotel Carris Porto Ribeira',
    description: 'Riverside hotel, historic building',
  },
  {
    googlePlaceId: 'ChIJizT_tDeuEmsRUsoyG83fri5', // Example - replace with real ID
    citySlug: 'porto',
    type: 'hostel',
    name: 'Yes! Porto Hostel',
    description: 'Social hostel, walking tours included',
  },
  {
    googlePlaceId: 'ChIJjzT_tDeuEmsRUsoyG83frj6', // Example - replace with real ID
    citySlug: 'porto',
    type: 'homestay',
    name: 'Guest House Douro',
    description: 'Traditional guesthouse, river views',
  },

  // ===========================================================================
  // CAMBODIA
  // ===========================================================================

  // Siem Reap (5 accommodations)
  {
    googlePlaceId: 'ChIJkzT_tDeuEmsRUsoyG83frk7', // Example - replace with real ID
    citySlug: 'siem-reap',
    type: 'hostel',
    name: 'Onederz Hostel',
    description: 'Social hostel, pool, popular with solo travelers',
  },
  {
    googlePlaceId: 'ChIJlzT_tDeuEmsRUsoyG83frl8', // Example - replace with real ID
    citySlug: 'siem-reap',
    type: 'hostel',
    name: 'Mad Monkey Siem Reap',
    description: 'Party hostel, pool, female dorms',
  },
  {
    googlePlaceId: 'ChIJmzT_tDeuEmsRUsoyG83frm9', // Example - replace with real ID
    citySlug: 'siem-reap',
    type: 'hotel',
    name: 'Lynnaya Urban River Resort',
    description: 'Boutique hotel, riverside, peaceful',
  },
  {
    googlePlaceId: 'ChIJnzT_tDeuEmsRUsoyG83frn0', // Example - replace with real ID
    citySlug: 'siem-reap',
    type: 'homestay',
    name: 'Angkor Rural Boutique Resort',
    description: 'Countryside retreat, authentic experience',
  },
  {
    googlePlaceId: 'ChIJozT_tDeuEmsRUsoyG83fro1', // Example - replace with real ID
    citySlug: 'siem-reap',
    type: 'hostel',
    name: 'Siem Reap Hostel',
    description: 'Budget-friendly, good base for temples',
  },

  // ===========================================================================
  // Add more cities as needed...
  // ===========================================================================
];

/**
 * ADDING NEW ACCOMMODATIONS:
 *
 * 1. Research accommodations that are popular with solo female travelers
 * 2. Check reviews for safety mentions, female-only options, location
 * 3. Find the Google Place ID using the Place ID Finder
 * 4. Add to this file with the appropriate citySlug
 *
 * QUALITY CHECKLIST:
 * ✓ Has female-only dorm option (for hostels)
 * ✓ Good reviews from solo female travelers
 * ✓ Safe neighborhood
 * ✓ Clear check-in process
 * ✓ Good location / transport access
 * ✓ Active Google listing with photos
 */
