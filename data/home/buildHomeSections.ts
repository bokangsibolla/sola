import type {
  PersonalizedCity,
  HeroState,
  TravelUpdate,
  CommunityHighlightThreadVisual,
  SavedPlacePreview,
} from './types';
import type { HomeSectionRow, HomeSection, SearchChip } from './sectionTypes';

interface BuildInput {
  rows: HomeSectionRow[];
  chips: SearchChip[];
  heroState: HeroState;
  travelUpdate: TravelUpdate | null;
  savedPlaces: SavedPlacePreview[];
  personalizedCities: PersonalizedCity[];
  communityHighlights: CommunityHighlightThreadVisual[];
}

/** Default section order when the homepage_sections table is empty or missing. */
const DEFAULT_ROWS: HomeSectionRow[] = [
  { id: 'default-search',       sectionType: 'search',       orderIndex: 10, isActive: true, title: null, subtitle: null, config: {} },
  { id: 'default-saved',        sectionType: 'saved',        orderIndex: 20, isActive: true, title: null, subtitle: null, config: {} },
  { id: 'default-hero',         sectionType: 'hero',         orderIndex: 30, isActive: true, title: null, subtitle: null, config: { height: 240 } },
  { id: 'default-destinations', sectionType: 'destinations', orderIndex: 40, isActive: true, title: 'Go Anywhere', subtitle: null, config: { limit: 10 } },
  { id: 'default-community',    sectionType: 'community',    orderIndex: 50, isActive: true, title: 'From the community', subtitle: null, config: { limit: 3 } },
];

/**
 * Build the ordered list of HomeSection items from DB rows + fetched data.
 * Falls back to a hardcoded default order when the DB table is empty/missing.
 * Sections with no data are skipped.
 */
export function buildHomeSections({
  rows,
  chips,
  heroState,
  travelUpdate,
  savedPlaces,
  personalizedCities,
  communityHighlights,
}: BuildInput): HomeSection[] {
  const sections: HomeSection[] = [];
  const effectiveRows = rows.length > 0 ? rows : DEFAULT_ROWS;

  for (const row of effectiveRows) {
    switch (row.sectionType) {
      case 'search': {
        sections.push({ type: 'search', chips });
        break;
      }
      case 'saved': {
        if (savedPlaces.length > 0) {
          sections.push({
            type: 'saved',
            places: savedPlaces,
            totalCount: savedPlaces.length,
          });
        }
        break;
      }
      case 'hero': {
        const height = typeof row.config.height === 'number' ? row.config.height : 240;
        sections.push({
          type: 'hero',
          hero: heroState,
          travelUpdate,
          height,
        });
        break;
      }
      case 'destinations': {
        if (personalizedCities.length > 0) {
          const limit = typeof row.config.limit === 'number' ? row.config.limit : 10;
          sections.push({
            type: 'destinations',
            title: row.title ?? 'Go Anywhere',
            cities: personalizedCities.slice(0, limit),
          });
        }
        break;
      }
      case 'community': {
        if (communityHighlights.length > 0) {
          const limit = typeof row.config.limit === 'number' ? row.config.limit : 3;
          sections.push({
            type: 'community',
            title: row.title ?? 'From the community',
            threads: communityHighlights.slice(0, limit),
          });
        }
        break;
      }
      default:
        break;
    }
  }

  return sections;
}
