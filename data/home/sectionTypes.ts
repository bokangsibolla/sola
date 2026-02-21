import type {
  SavedPlacePreview,
  PersonalizedCity,
  HeroState,
  TravelUpdate,
  CommunityHighlightThreadVisual,
} from './types';

// ── DB row types ──────────────────────────────────────────────────────

export type HomeSectionType = 'search' | 'saved' | 'hero' | 'destinations' | 'community';

export interface HomeSectionRow {
  id: string;
  sectionType: HomeSectionType;
  orderIndex: number;
  isActive: boolean;
  title: string | null;
  subtitle: string | null;
  config: Record<string, unknown>;
}

export interface SearchChip {
  id: string;
  label: string;
  chipType: 'tag' | 'route' | 'search';
  value: string;
  surface: 'home' | 'explore' | 'both';
  orderIndex: number;
}

// ── Discriminated union for rendered sections ─────────────────────────

export type HomeSection =
  | { type: 'search'; chips: SearchChip[] }
  | { type: 'saved'; places: SavedPlacePreview[]; totalCount: number }
  | { type: 'hero'; hero: HeroState; travelUpdate: TravelUpdate | null; height: number }
  | { type: 'destinations'; title: string; cities: PersonalizedCity[] }
  | { type: 'community'; title: string; threads: CommunityHighlightThreadVisual[] };
