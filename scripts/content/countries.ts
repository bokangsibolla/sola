import { did, upsertBatch } from '../seed-utils';

export async function seedCountries() {
  const countries = [
    {
      key: 'country-th',
      slug: 'thailand',
      name: 'Thailand',
      iso2: 'TH',
      iso3: 'THA',
      currency: 'THB',
      order: 1,
      heroImageId: 'hWU4FnfJqvY', // Grand Palace, Bangkok
    },
    {
      key: 'country-vn',
      slug: 'vietnam',
      name: 'Vietnam',
      iso2: 'VN',
      iso3: 'VNM',
      currency: 'VND',
      order: 2,
      heroImageId: 'cckf4TsHAuw', // Ha Long Bay
    },
    {
      key: 'country-id',
      slug: 'indonesia',
      name: 'Indonesia',
      iso2: 'ID',
      iso3: 'IDN',
      currency: 'IDR',
      order: 3,
      heroImageId: '_yP-a_sICd0', // Bali rice terraces
    },
    {
      key: 'country-ph',
      slug: 'philippines',
      name: 'Philippines',
      iso2: 'PH',
      iso3: 'PHL',
      currency: 'PHP',
      order: 4,
      heroImageId: 'mR1CIDduGLc', // El Nido, Palawan
    },
    {
      key: 'country-my',
      slug: 'malaysia',
      name: 'Malaysia',
      iso2: 'MY',
      iso3: 'MYS',
      currency: 'MYR',
      order: 5,
      heroImageId: 'TVllFyGaLEA', // Petronas Towers, Kuala Lumpur
    },
    {
      key: 'country-sg',
      slug: 'singapore',
      name: 'Singapore',
      iso2: 'SG',
      iso3: 'SGP',
      currency: 'SGD',
      order: 6,
      heroImageId: 'WC6MJ0kRzGw', // Marina Bay Sands
    },
    {
      key: 'country-kh',
      slug: 'cambodia',
      name: 'Cambodia',
      iso2: 'KH',
      iso3: 'KHM',
      currency: 'USD',
      order: 7,
      heroImageId: 'qJ0zGkrE1Zg', // Angkor Wat
    },
    {
      key: 'country-la',
      slug: 'laos',
      name: 'Laos',
      iso2: 'LA',
      iso3: 'LAO',
      currency: 'LAK',
      order: 8,
      heroImageId: 'jBzBioWwZGw', // Luang Prabang
    },
    {
      key: 'country-mm',
      slug: 'myanmar',
      name: 'Myanmar',
      iso2: 'MM',
      iso3: 'MMR',
      currency: 'MMK',
      order: 9,
      heroImageId: 'ZuV4bPalclY', // Bagan temples
    },
    {
      key: 'country-jp',
      slug: 'japan',
      name: 'Japan',
      iso2: 'JP',
      iso3: 'JPN',
      currency: 'JPY',
      order: 10,
      heroImageId: 'TiVPTYCG_3E', // Mount Fuji
    },
    {
      key: 'country-pt',
      slug: 'portugal',
      name: 'Portugal',
      iso2: 'PT',
      iso3: 'PRT',
      currency: 'EUR',
      order: 11,
      heroImageId: 'l3N9Q27zULw', // Lisbon cityscape
    },
    {
      key: 'country-ma',
      slug: 'morocco',
      name: 'Morocco',
      iso2: 'MA',
      iso3: 'MAR',
      currency: 'MAD',
      order: 12,
      heroImageId: 'w2DsS-ZAP4U', // Chefchaouen blue city
    },
  ];

  const rows = countries.map((country) => ({
    id: did(country.key),
    slug: country.slug,
    name: country.name,
    iso2: country.iso2,
    iso3: country.iso3,
    currency_code: country.currency,
    is_active: true,
    order_index: country.order,
    hero_image_url: `https://images.unsplash.com/photo-${country.heroImageId}?w=800`,
  }));

  await upsertBatch('countries', rows, 'id');
}
