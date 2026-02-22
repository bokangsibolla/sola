# Sola Image Acquisition Pipeline

Automatically finds and processes hero-quality images for countries, cities, and neighborhoods using Google APIs.

## APIs Used

| API | Purpose | Cost |
|-----|---------|------|
| Google Places API (New) | Primary image source — landmarks, entities, scenic spots | ~$32/1K text searches |
| Google Custom Search JSON API | Editorial hero images — cinematic, travel photography | Free: 100/day, then $5/1K |
| Google Knowledge Graph Search API | Entity disambiguation — correct place matching | Free: 100K/day |

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Required — already used by existing enrichment scripts
GOOGLE_PLACES_API_KEY=your-google-api-key
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional — enables Custom Search for editorial hero images
GOOGLE_CSE_ID=your-custom-search-engine-id
GOOGLE_CSE_API_KEY=your-cse-api-key    # Falls back to GOOGLE_PLACES_API_KEY if not set
```

### 2. Google Custom Search Engine (Optional)

To enable editorial image search:

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Create a new search engine
3. Set "Search the entire web" = ON
4. Enable "Image search" = ON
5. Copy the Search Engine ID → `GOOGLE_CSE_ID`
6. Get an API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → `GOOGLE_CSE_API_KEY`

### 3. Database Migration

Run the migration to add gallery/quality columns:

```bash
supabase migration up
# or apply manually:
# supabase/migrations/20260222_add_image_pipeline_columns.sql
```

## Usage

```bash
# Basic — process all destination types
npm run images:sync -- --type=all --limit=10

# Countries only
npm run images:sync -- --type=country --limit=5

# Cities in a specific country
npm run images:sync -- --type=city --country=thailand

# Neighborhoods in a specific city
npm run images:sync -- --type=neighborhood --city=bangkok

# Dry run (shows what would be done)
npm run images:sync -- --type=country --dry-run

# Refresh existing images
npm run images:sync -- --type=city --refresh --limit=5

# Places API only (no Custom Search)
npm run images:sync -- --type=country --skip-custom-search

# Verbose logging
npm run images:sync -- --type=city --limit=3 --verbose

# Export CSV for manual review
npm run images:sync -- --type=all --review-csv

# Full direct command
npx tsx scripts/image-pipeline/index.ts --type=city --limit=50 --verbose
```

### All Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--type=` | `all` | `country`, `city`, `neighborhood`, or `all` |
| `--limit=N` | `50` | Max destinations to process |
| `--offset=N` | `0` | Skip first N destinations |
| `--country=NAME` | — | Filter by country name (partial match) |
| `--city=NAME` | — | Filter by city name (partial match) |
| `--dry-run` | `false` | Show plan without executing |
| `--refresh` | `false` | Re-process even if already cached |
| `--review-csv` | `false` | Export results to CSV |
| `--skip-custom-search` | `false` | Use only Google Places API |
| `--threshold=N` | `55` | Quality score threshold for CSE fallback |
| `--delay=MS` | `500` | Delay between API calls |
| `--verbose` / `-v` | `false` | Show detailed API logs |

## How It Works

### Search Strategy by Type

**Countries:**
1. Knowledge Graph → disambiguate entity
2. Custom Search → cinematic/editorial hero queries
3. Places API → landmark photos for gallery
4. Best hero from all sources, diverse gallery of 4

**Cities:**
1. Knowledge Graph → disambiguate entity
2. Places API first → viewpoints, landmarks, skylines
3. Custom Search only if Places hero < quality threshold
4. Select best hero + diverse gallery

**Neighborhoods:**
1. Knowledge Graph → disambiguate (avoids wrong matches)
2. Places API → POIs, parks, cafes
3. Custom Search only if Places produces < 3 candidates
4. Select best hero + diverse gallery

### Scoring System (0-100)

| Dimension | Hero Weight | Gallery Weight |
|-----------|-------------|----------------|
| Resolution & aspect ratio | 30 | 25 |
| Sharpness proxy | 15 | 10 |
| Source trust / domain | 15 | 20 |
| Relevance to location | 15 | 25 |
| Sola vibe alignment | 25 | 20 |

Candidates are automatically rejected if:
- Resolution < 600x400
- Portrait orientation (for Custom Search)
- Title contains stock/watermark/clipart keywords
- URL contains thumbnail/favicon patterns
- Domain trust ≤ 0.15 (stock photo sites)

### Licensing

| Status | Meaning |
|--------|---------|
| `ok_internal_testing` | Google Places photos — covered by Places API ToS |
| `needs_review` | Custom Search results — manual review required |
| `unknown` | Default — not yet evaluated |

**Important:** Never assume an image is free to use. Places API photos require attribution. Custom Search images may be copyrighted. Always display `image_attribution` where available.

## Output

### Database Columns Updated

**Countries & Cities:**
- `hero_image_url` — primary hero image (Supabase Storage URL)
- `image_gallery_urls` — array of 4 gallery images
- `image_source` — `google` or `custom_search`
- `image_attribution` — photographer/publisher credit
- `image_quality_score` — 0-100 computed score
- `image_license_hint` — `unknown`, `likely_restricted`, `gov_tourism`, `wikimedia_like`
- `usage_rights_status` — `unknown`, `needs_review`, `ok_internal_testing`
- `canonical_query` — disambiguated search query from Knowledge Graph
- `image_cached_at` — timestamp

**Neighborhoods (city_areas):**
- `hero_image_url`, `image_source`, `image_attribution`, `image_cached_at`

### File Cache

Results are cached in `.image-pipeline-cache/` (gitignored). Cache expires after 72 hours. Use `--refresh` to bypass.

### CSV Review

Use `--review-csv` to export `image-pipeline-review.csv` with all candidates for manual review.

## Cost Optimization

- Places API is the primary source (most destinations only use Places)
- Custom Search is used only when Places quality is below threshold
- Knowledge Graph is free (100K/day) and always runs
- File caching prevents duplicate API calls
- Rate limiting via `--delay` flag

Estimated cost for 100 destinations:
- Places only: ~$3-5
- With Custom Search: ~$5-10
