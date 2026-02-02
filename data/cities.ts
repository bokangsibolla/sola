// Top travel cities per popular country. Curated, not exhaustive.
// If a user's destination isn't here, they can type the country name instead.

export interface City {
  name: string;
  country: string; // ISO2
}

const cities: City[] = [
  // Thailand
  { name: 'Bangkok', country: 'TH' },
  { name: 'Chiang Mai', country: 'TH' },
  { name: 'Phuket', country: 'TH' },
  { name: 'Krabi', country: 'TH' },
  { name: 'Koh Samui', country: 'TH' },
  { name: 'Pai', country: 'TH' },
  { name: 'Koh Phangan', country: 'TH' },
  { name: 'Pattaya', country: 'TH' },
  // Japan
  { name: 'Tokyo', country: 'JP' },
  { name: 'Kyoto', country: 'JP' },
  { name: 'Osaka', country: 'JP' },
  { name: 'Hiroshima', country: 'JP' },
  { name: 'Nara', country: 'JP' },
  { name: 'Fukuoka', country: 'JP' },
  { name: 'Sapporo', country: 'JP' },
  // Indonesia
  { name: 'Bali', country: 'ID' },
  { name: 'Jakarta', country: 'ID' },
  { name: 'Yogyakarta', country: 'ID' },
  { name: 'Lombok', country: 'ID' },
  { name: 'Ubud', country: 'ID' },
  { name: 'Komodo', country: 'ID' },
  // Portugal
  { name: 'Lisbon', country: 'PT' },
  { name: 'Porto', country: 'PT' },
  { name: 'Lagos', country: 'PT' },
  { name: 'Sintra', country: 'PT' },
  { name: 'Faro', country: 'PT' },
  // Italy
  { name: 'Rome', country: 'IT' },
  { name: 'Florence', country: 'IT' },
  { name: 'Venice', country: 'IT' },
  { name: 'Milan', country: 'IT' },
  { name: 'Amalfi', country: 'IT' },
  { name: 'Naples', country: 'IT' },
  { name: 'Cinque Terre', country: 'IT' },
  // Spain
  { name: 'Barcelona', country: 'ES' },
  { name: 'Madrid', country: 'ES' },
  { name: 'Seville', country: 'ES' },
  { name: 'Valencia', country: 'ES' },
  { name: 'Granada', country: 'ES' },
  { name: 'Ibiza', country: 'ES' },
  { name: 'Malaga', country: 'ES' },
  // Mexico
  { name: 'Mexico City', country: 'MX' },
  { name: 'Tulum', country: 'MX' },
  { name: 'Cancún', country: 'MX' },
  { name: 'Oaxaca', country: 'MX' },
  { name: 'Playa del Carmen', country: 'MX' },
  { name: 'San Miguel de Allende', country: 'MX' },
  { name: 'Puerto Vallarta', country: 'MX' },
  // South Korea
  { name: 'Seoul', country: 'KR' },
  { name: 'Busan', country: 'KR' },
  { name: 'Jeju', country: 'KR' },
  { name: 'Gyeongju', country: 'KR' },
  // Vietnam
  { name: 'Ho Chi Minh City', country: 'VN' },
  { name: 'Hanoi', country: 'VN' },
  { name: 'Da Nang', country: 'VN' },
  { name: 'Hoi An', country: 'VN' },
  { name: 'Ha Long Bay', country: 'VN' },
  { name: 'Sapa', country: 'VN' },
  // Greece
  { name: 'Athens', country: 'GR' },
  { name: 'Santorini', country: 'GR' },
  { name: 'Mykonos', country: 'GR' },
  { name: 'Crete', country: 'GR' },
  { name: 'Rhodes', country: 'GR' },
  // France
  { name: 'Paris', country: 'FR' },
  { name: 'Nice', country: 'FR' },
  { name: 'Lyon', country: 'FR' },
  { name: 'Marseille', country: 'FR' },
  { name: 'Bordeaux', country: 'FR' },
  { name: 'Strasbourg', country: 'FR' },
  // Germany
  { name: 'Berlin', country: 'DE' },
  { name: 'Munich', country: 'DE' },
  { name: 'Hamburg', country: 'DE' },
  { name: 'Frankfurt', country: 'DE' },
  { name: 'Cologne', country: 'DE' },
  // Turkey
  { name: 'Istanbul', country: 'TR' },
  { name: 'Cappadocia', country: 'TR' },
  { name: 'Antalya', country: 'TR' },
  { name: 'Bodrum', country: 'TR' },
  { name: 'Izmir', country: 'TR' },
  // UK
  { name: 'London', country: 'GB' },
  { name: 'Edinburgh', country: 'GB' },
  { name: 'Bath', country: 'GB' },
  { name: 'Oxford', country: 'GB' },
  { name: 'Manchester', country: 'GB' },
  // Morocco
  { name: 'Marrakech', country: 'MA' },
  { name: 'Fez', country: 'MA' },
  { name: 'Chefchaouen', country: 'MA' },
  { name: 'Essaouira', country: 'MA' },
  // Australia
  { name: 'Sydney', country: 'AU' },
  { name: 'Melbourne', country: 'AU' },
  { name: 'Brisbane', country: 'AU' },
  { name: 'Perth', country: 'AU' },
  { name: 'Gold Coast', country: 'AU' },
  // Colombia
  { name: 'Bogotá', country: 'CO' },
  { name: 'Medellín', country: 'CO' },
  { name: 'Cartagena', country: 'CO' },
  // Brazil
  { name: 'Rio de Janeiro', country: 'BR' },
  { name: 'São Paulo', country: 'BR' },
  { name: 'Salvador', country: 'BR' },
  { name: 'Florianópolis', country: 'BR' },
  // Peru
  { name: 'Lima', country: 'PE' },
  { name: 'Cusco', country: 'PE' },
  { name: 'Machu Picchu', country: 'PE' },
  // Argentina
  { name: 'Buenos Aires', country: 'AR' },
  { name: 'Mendoza', country: 'AR' },
  { name: 'Bariloche', country: 'AR' },
  // India
  { name: 'New Delhi', country: 'IN' },
  { name: 'Mumbai', country: 'IN' },
  { name: 'Jaipur', country: 'IN' },
  { name: 'Goa', country: 'IN' },
  { name: 'Varanasi', country: 'IN' },
  { name: 'Kerala', country: 'IN' },
  // Philippines
  { name: 'Manila', country: 'PH' },
  { name: 'Palawan', country: 'PH' },
  { name: 'Cebu', country: 'PH' },
  { name: 'Siargao', country: 'PH' },
  // Sri Lanka
  { name: 'Colombo', country: 'LK' },
  { name: 'Ella', country: 'LK' },
  { name: 'Galle', country: 'LK' },
  { name: 'Kandy', country: 'LK' },
  // Egypt
  { name: 'Cairo', country: 'EG' },
  { name: 'Luxor', country: 'EG' },
  { name: 'Sharm el-Sheikh', country: 'EG' },
  // South Africa
  { name: 'Cape Town', country: 'ZA' },
  { name: 'Johannesburg', country: 'ZA' },
  { name: 'Durban', country: 'ZA' },
  { name: 'Kruger National Park', country: 'ZA' },
  // Tanzania
  { name: 'Zanzibar', country: 'TZ' },
  { name: 'Dar es Salaam', country: 'TZ' },
  { name: 'Serengeti', country: 'TZ' },
  // Kenya
  { name: 'Nairobi', country: 'KE' },
  { name: 'Mombasa', country: 'KE' },
  { name: 'Masai Mara', country: 'KE' },
  // USA
  { name: 'New York', country: 'US' },
  { name: 'Los Angeles', country: 'US' },
  { name: 'San Francisco', country: 'US' },
  { name: 'Miami', country: 'US' },
  { name: 'Hawaii', country: 'US' },
  { name: 'Chicago', country: 'US' },
  { name: 'Austin', country: 'US' },
  // Croatia
  { name: 'Dubrovnik', country: 'HR' },
  { name: 'Split', country: 'HR' },
  { name: 'Zagreb', country: 'HR' },
  // Czech Republic
  { name: 'Prague', country: 'CZ' },
  // Hungary
  { name: 'Budapest', country: 'HU' },
  // Netherlands
  { name: 'Amsterdam', country: 'NL' },
  // Austria
  { name: 'Vienna', country: 'AT' },
  { name: 'Salzburg', country: 'AT' },
  // Switzerland
  { name: 'Zurich', country: 'CH' },
  { name: 'Interlaken', country: 'CH' },
  // New Zealand
  { name: 'Auckland', country: 'NZ' },
  { name: 'Queenstown', country: 'NZ' },
  // Canada
  { name: 'Toronto', country: 'CA' },
  { name: 'Vancouver', country: 'CA' },
  { name: 'Montreal', country: 'CA' },
  // Singapore
  { name: 'Singapore', country: 'SG' },
  // Malaysia
  { name: 'Kuala Lumpur', country: 'MY' },
  { name: 'Langkawi', country: 'MY' },
  { name: 'Penang', country: 'MY' },
  // Cambodia
  { name: 'Siem Reap', country: 'KH' },
  { name: 'Phnom Penh', country: 'KH' },
  // Nepal
  { name: 'Kathmandu', country: 'NP' },
  { name: 'Pokhara', country: 'NP' },
  // Jordan
  { name: 'Amman', country: 'JO' },
  { name: 'Petra', country: 'JO' },
  // UAE
  { name: 'Dubai', country: 'AE' },
  { name: 'Abu Dhabi', country: 'AE' },
];

export function searchDestinations(query: string): { name: string; detail: string }[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase();

  // Search cities first
  const cityMatches = cities
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map((c) => ({ name: c.name, detail: c.country }));

  return cityMatches;
}
