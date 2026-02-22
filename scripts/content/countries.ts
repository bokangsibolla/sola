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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'asia',
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
      continent: 'europe',
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
      continent: 'africa',
      order: 12,
      heroImageId: 'w2DsS-ZAP4U', // Chefchaouen blue city
    },

    // Southern Africa
    {
      key: 'country-za',
      slug: 'south-africa',
      name: 'South Africa',
      iso2: 'ZA',
      iso3: 'ZAF',
      currency: 'ZAR',
      continent: 'africa',
      order: 13,
      heroImageId: '1563656157432-67560011e209', // Cape Town coastline
    },
    {
      key: 'country-ls',
      slug: 'lesotho',
      name: 'Lesotho',
      iso2: 'LS',
      iso3: 'LSO',
      currency: 'LSL',
      continent: 'africa',
      order: 14,
      heroImageId: '1653842045754-59b63ea5a58e', // Lesotho mountains
    },
    {
      key: 'country-zw',
      slug: 'zimbabwe',
      name: 'Zimbabwe',
      iso2: 'ZW',
      iso3: 'ZWE',
      currency: 'USD',
      continent: 'africa',
      order: 15,
      heroImageId: '1636291549333-1f52cbd09393', // Victoria Falls
    },
    {
      key: 'country-na',
      slug: 'namibia',
      name: 'Namibia',
      iso2: 'NA',
      iso3: 'NAM',
      currency: 'NAD',
      continent: 'africa',
      order: 16,
      heroImageId: '1652599720885-abf363ed2992', // Sossusvlei dunes
    },
    {
      key: 'country-mz',
      slug: 'mozambique',
      name: 'Mozambique',
      iso2: 'MZ',
      iso3: 'MOZ',
      currency: 'MZN',
      continent: 'africa',
      order: 17,
      heroImageId: '1658872739589-0691c8039617', // Mozambique coast
    },
  ];

  const rows = countries.map((country) => ({
    id: did(country.key),
    slug: country.slug,
    name: country.name,
    iso2: country.iso2,
    iso3: country.iso3,
    currency_code: country.currency,
    continent: country.continent,
    is_active: true,
    order_index: country.order,
    hero_image_url: `https://images.unsplash.com/photo-${country.heroImageId}?w=800`,
  }));

  await upsertBatch('countries', rows, 'id');
}
