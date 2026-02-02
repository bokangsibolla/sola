import { CityArea } from '../types';

export const mockCityAreas: CityArea[] = [
  // Bangkok
  { id: 'area-bkk-silom', cityId: 'city-bkk', slug: 'silom', name: 'Silom', areaKind: 'district', isPrimary: false, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-bkk-sukhumvit', cityId: 'city-bkk', slug: 'sukhumvit', name: 'Sukhumvit', areaKind: 'district', isPrimary: true, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-bkk-oldtown', cityId: 'city-bkk', slug: 'rattanakosin', name: 'Rattanakosin (Old Town)', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-bkk-khaosan', cityId: 'city-bkk', slug: 'khao-san', name: 'Khao San', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 4, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // Chiang Mai
  { id: 'area-cnx-oldcity', cityId: 'city-cnx', slug: 'old-city', name: 'Old City', areaKind: 'neighborhood', isPrimary: true, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-cnx-nimman', cityId: 'city-cnx', slug: 'nimman', name: 'Nimman', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-cnx-nightbazaar', cityId: 'city-cnx', slug: 'night-bazaar', name: 'Night Bazaar', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // Ubud
  { id: 'area-ubud-central', cityId: 'city-ubud', slug: 'central-ubud', name: 'Central Ubud', areaKind: 'neighborhood', isPrimary: true, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-ubud-tegallalang', cityId: 'city-ubud', slug: 'tegallalang', name: 'Tegallalang', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-ubud-campuhan', cityId: 'city-ubud', slug: 'campuhan', name: 'Campuhan', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // Canggu
  { id: 'area-canggu-batubolong', cityId: 'city-canggu', slug: 'batu-bolong', name: 'Batu Bolong', areaKind: 'neighborhood', isPrimary: true, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-canggu-berawa', cityId: 'city-canggu', slug: 'berawa', name: 'Berawa', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-canggu-echobeach', cityId: 'city-canggu', slug: 'echo-beach', name: 'Echo Beach', areaKind: 'beach', isPrimary: false, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // Hoi An
  { id: 'area-hoi-ancient', cityId: 'city-hoi', slug: 'ancient-town', name: 'Ancient Town', areaKind: 'neighborhood', isPrimary: true, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-hoi-anbang', cityId: 'city-hoi', slug: 'an-bang-beach', name: 'An Bang Beach', areaKind: 'beach', isPrimary: false, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-hoi-camthanh', cityId: 'city-hoi', slug: 'cam-thanh', name: 'Cam Thanh', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // El Nido
  { id: 'area-elnido-town', cityId: 'city-elnido', slug: 'town-proper', name: 'Town Proper', areaKind: 'neighborhood', isPrimary: true, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-elnido-corong', cityId: 'city-elnido', slug: 'corong-corong', name: 'Corong-Corong', areaKind: 'beach', isPrimary: false, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-elnido-nacpan', cityId: 'city-elnido', slug: 'nacpan', name: 'Nacpan', areaKind: 'beach', isPrimary: false, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // Lisbon
  { id: 'area-lisbon-alfama', cityId: 'city-lisbon', slug: 'alfama', name: 'Alfama', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-lisbon-bairroalto', cityId: 'city-lisbon', slug: 'bairro-alto', name: 'Bairro Alto', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-lisbon-baixa', cityId: 'city-lisbon', slug: 'baixa', name: 'Baixa', areaKind: 'neighborhood', isPrimary: true, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-lisbon-belem', cityId: 'city-lisbon', slug: 'belem', name: 'Belem', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 4, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },

  // Marrakech
  { id: 'area-marrakech-medina', cityId: 'city-marrakech', slug: 'medina', name: 'Medina', areaKind: 'neighborhood', isPrimary: true, isActive: true, orderIndex: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-marrakech-gueliz', cityId: 'city-marrakech', slug: 'gueliz', name: 'Gueliz', areaKind: 'district', isPrimary: false, isActive: true, orderIndex: 2, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'area-marrakech-kasbah', cityId: 'city-marrakech', slug: 'kasbah', name: 'Kasbah', areaKind: 'neighborhood', isPrimary: false, isActive: true, orderIndex: 3, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];
