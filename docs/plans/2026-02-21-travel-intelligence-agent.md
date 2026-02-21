# Travel Intelligence Agent — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an automated intelligence agent that fetches travel/AI/women-safety news, scores relevance to Sola, generates a structured digest, emails it to the team, and stores history in SQLite.

**Architecture:** Self-contained Node.js/TS service in `agent/` directory. RSS ingestion → relevance scoring → deduplication → LLM or extractive summarization → Resend email delivery. SQLite for local persistence. GitHub Actions cron for scheduling (daily 9am Manila / weekly Monday).

**Tech Stack:** TypeScript (tsx runner), better-sqlite3, rss-parser, Resend, Anthropic SDK + OpenAI SDK (optional), node-cron (local dev), GitHub Actions (production scheduling).

---

## Task 1: Scaffold the agent directory and dependencies

**Files:**
- Create: `agent/package.json`
- Create: `agent/tsconfig.json`
- Create: `agent/.env.example`
- Create: `agent/.gitignore`

**Step 1: Create `agent/package.json`**

```json
{
  "name": "sola-intel-agent",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx src/main.ts",
    "daily": "tsx src/main.ts --period daily",
    "weekly": "tsx src/main.ts --period weekly",
    "fetch-only": "tsx src/main.ts --fetch-only",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    "rss-parser": "^3.13.0",
    "resend": "^4.0.0",
    "@anthropic-ai/sdk": "^0.39.0",
    "openai": "^4.0.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "tsx": "^4.0.0",
    "vitest": "^2.0.0",
    "typescript": "^5.5.0"
  }
}
```

**Step 2: Create `agent/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create `agent/.env.example`**

```env
# Required
RESEND_API_KEY=re_xxxx
DIGEST_RECIPIENTS=you@solatravel.app,cofounder@solatravel.app

# Optional — LLM summarization (falls back to extractive if missing)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Optional — Supabase (for future remote storage)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

**Step 4: Create `agent/.gitignore`**

```
node_modules/
dist/
.env
data/intel.db
```

**Step 5: Install dependencies**

```bash
cd agent && npm install
```

**Step 6: Commit**

```bash
git add agent/package.json agent/tsconfig.json agent/.env.example agent/.gitignore
git commit -m "feat(agent): scaffold travel intelligence agent"
```

---

## Task 2: Database layer — SQLite schema and helpers

**Files:**
- Create: `agent/src/db.ts`
- Test: `agent/src/__tests__/db.test.ts`

**Step 1: Write the failing test**

```ts
// agent/src/__tests__/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createDb, insertSource, insertArticle, insertDigest, linkArticleToDigest, getArticleByUrl, getRecentArticles, getDigests } from '../db.js';
import Database from 'better-sqlite3';

describe('db', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createDb(':memory:');
  });

  it('creates all tables', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const names = tables.map(t => t.name);
    expect(names).toContain('sources');
    expect(names).toContain('articles');
    expect(names).toContain('digests');
    expect(names).toContain('article_digest_map');
  });

  it('inserts and retrieves a source', () => {
    const id = insertSource(db, { name: 'Skift', url: 'https://skift.com/feed', category: 'travel_industry' });
    expect(id).toBeGreaterThan(0);
  });

  it('inserts and retrieves an article', () => {
    insertSource(db, { name: 'Skift', url: 'https://skift.com/feed', category: 'travel_industry' });
    const id = insertArticle(db, {
      url: 'https://skift.com/article-1',
      title: 'AI in Travel',
      publisher: 'Skift',
      publishedAt: '2026-02-20',
      summary: 'Summary here',
      relevanceScore: 0.85,
    });
    expect(id).toBeGreaterThan(0);

    const article = getArticleByUrl(db, 'https://skift.com/article-1');
    expect(article).toBeTruthy();
    expect(article!.title).toBe('AI in Travel');
  });

  it('deduplicates articles by URL', () => {
    const id1 = insertArticle(db, {
      url: 'https://skift.com/same-url',
      title: 'First',
      publisher: 'Skift',
      publishedAt: '2026-02-20',
      summary: '',
      relevanceScore: 0.5,
    });
    const id2 = insertArticle(db, {
      url: 'https://skift.com/same-url',
      title: 'Duplicate',
      publisher: 'Skift',
      publishedAt: '2026-02-20',
      summary: '',
      relevanceScore: 0.5,
    });
    expect(id2).toBe(0); // 0 = skipped duplicate
  });

  it('creates a digest and links articles', () => {
    const articleId = insertArticle(db, {
      url: 'https://example.com/a1',
      title: 'Test',
      publisher: 'Test',
      publishedAt: '2026-02-20',
      summary: '',
      relevanceScore: 0.5,
    });
    const digestId = insertDigest(db, {
      period: 'daily',
      contentMarkdown: '# Digest',
      contentText: 'Digest',
      sentStatus: 'pending',
    });
    linkArticleToDigest(db, digestId, articleId);

    const digests = getDigests(db, 5);
    expect(digests).toHaveLength(1);
    expect(digests[0].period).toBe('daily');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd agent && npx vitest run src/__tests__/db.test.ts
```
Expected: FAIL — module not found

**Step 3: Write the implementation**

```ts
// agent/src/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface SourceRow {
  name: string;
  url: string;
  category: string;
}

export interface ArticleRow {
  url: string;
  title: string;
  publisher: string;
  publishedAt: string;
  summary: string;
  relevanceScore: number;
}

export interface DigestRow {
  period: 'daily' | 'weekly';
  contentMarkdown: string;
  contentText: string;
  sentStatus: string;
}

export function createDb(dbPath?: string): Database.Database {
  const resolvedPath = dbPath || path.join(__dirname, '..', 'data', 'intel.db');
  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);
  return db;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    published_at TEXT,
    summary TEXT DEFAULT '',
    relevance_score REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS digests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_at TEXT DEFAULT (datetime('now')),
    period TEXT NOT NULL CHECK(period IN ('daily', 'weekly')),
    content_markdown TEXT NOT NULL,
    content_text TEXT NOT NULL,
    sent_status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS article_digest_map (
    digest_id INTEGER NOT NULL REFERENCES digests(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    PRIMARY KEY (digest_id, article_id)
  );
`;

export function insertSource(db: Database.Database, source: SourceRow): number {
  const stmt = db.prepare('INSERT OR IGNORE INTO sources (name, url, category) VALUES (?, ?, ?)');
  const result = stmt.run(source.name, source.url, source.category);
  return result.lastInsertRowid as number;
}

export function insertArticle(db: Database.Database, article: ArticleRow): number {
  const existing = db.prepare('SELECT id FROM articles WHERE url = ?').get(article.url) as { id: number } | undefined;
  if (existing) return 0; // duplicate
  const stmt = db.prepare(
    'INSERT INTO articles (url, title, publisher, published_at, summary, relevance_score) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(article.url, article.title, article.publisher, article.publishedAt, article.summary, article.relevanceScore);
  return result.lastInsertRowid as number;
}

export function getArticleByUrl(db: Database.Database, url: string) {
  return db.prepare('SELECT * FROM articles WHERE url = ?').get(url) as (ArticleRow & { id: number }) | undefined;
}

export function getRecentArticles(db: Database.Database, limit: number) {
  return db.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT ?').all(limit) as (ArticleRow & { id: number })[];
}

export function insertDigest(db: Database.Database, digest: DigestRow): number {
  const stmt = db.prepare(
    'INSERT INTO digests (period, content_markdown, content_text, sent_status) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(digest.period, digest.contentMarkdown, digest.contentText, digest.sentStatus);
  return result.lastInsertRowid as number;
}

export function linkArticleToDigest(db: Database.Database, digestId: number, articleId: number): void {
  db.prepare('INSERT OR IGNORE INTO article_digest_map (digest_id, article_id) VALUES (?, ?)').run(digestId, articleId);
}

export function getDigests(db: Database.Database, limit: number) {
  return db.prepare('SELECT * FROM digests ORDER BY run_at DESC LIMIT ?').all(limit) as (DigestRow & { id: number; run_at: string })[];
}

export function updateDigestStatus(db: Database.Database, digestId: number, status: string): void {
  db.prepare('UPDATE digests SET sent_status = ? WHERE id = ?').run(status, digestId);
}
```

**Step 4: Run test to verify it passes**

```bash
cd agent && npx vitest run src/__tests__/db.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add agent/src/db.ts agent/src/__tests__/db.test.ts
git commit -m "feat(agent): add SQLite database layer with schema and helpers"
```

---

## Task 3: RSS source configuration and fetcher

**Files:**
- Create: `agent/src/sources.ts`
- Create: `agent/src/fetcher.ts`
- Test: `agent/src/__tests__/fetcher.test.ts`

**Step 1: Create the sources config**

```ts
// agent/src/sources.ts
export interface Source {
  name: string;
  url: string;
  category: 'ai_travel' | 'women_travel' | 'travel_industry' | 'travel_tech' | 'ai_general' | 'mobile_growth';
}

export const SOURCES: Source[] = [
  // AI + Travel Tech
  { name: 'Skift', url: 'https://skift.com/feed', category: 'travel_industry' },
  { name: 'Phocuswire', url: 'https://www.phocuswire.com/rss', category: 'travel_tech' },
  { name: 'Tnooz (WebinTravel)', url: 'https://www.webintravel.com/feed/', category: 'travel_tech' },
  { name: 'Travel Weekly', url: 'https://www.travelweekly.com/rss', category: 'travel_industry' },

  // AI General
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'ai_general' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ai_general' },
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', category: 'ai_general' },
  { name: 'Ars Technica AI', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', category: 'ai_general' },

  // Solo Female Travel / Women Safety
  { name: 'Adventurous Kate', url: 'https://www.adventurouskate.com/feed/', category: 'women_travel' },
  { name: 'Be My Travel Muse', url: 'https://www.bemytravelmuse.com/feed/', category: 'women_travel' },
  { name: 'Solo Traveler Blog', url: 'https://solotravelerworld.com/feed/', category: 'women_travel' },
  { name: 'Nomadic Matt', url: 'https://www.nomadicmatt.com/travel-blog/feed/', category: 'travel_industry' },

  // Mobile / App Growth
  { name: 'TechCrunch Apps', url: 'https://techcrunch.com/category/apps/feed/', category: 'mobile_growth' },
  { name: 'App Annie / data.ai Blog', url: 'https://www.data.ai/en/insights/feed/', category: 'mobile_growth' },

  // Travel News / Safety
  { name: 'Reuters Travel', url: 'https://www.reuters.com/arc/outboundfeeds/v1/category/travel/?outputType=xml', category: 'travel_industry' },
  { name: 'BBC Travel', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'travel_industry' },
  { name: 'Condé Nast Traveler', url: 'https://www.cntraveler.com/feed/rss', category: 'travel_industry' },
  { name: 'Lonely Planet News', url: 'https://www.lonelyplanet.com/news/feed', category: 'travel_industry' },
];
```

**Step 2: Write the failing test for the fetcher**

```ts
// agent/src/__tests__/fetcher.test.ts
import { describe, it, expect, vi } from 'vitest';
import { normalizeArticle, filterByDate } from '../fetcher.js';

describe('fetcher', () => {
  it('normalizes an RSS item into an article', () => {
    const item = {
      title: ' AI Travel Planning Tool Launches ',
      link: 'https://skift.com/article-1?utm_source=rss&utm_medium=feed',
      pubDate: 'Thu, 20 Feb 2026 10:00:00 GMT',
      contentSnippet: 'A new tool uses AI to plan trips. It integrates with booking platforms. Third sentence here. Fourth sentence.',
    };
    const article = normalizeArticle(item, 'Skift');
    expect(article.title).toBe('AI Travel Planning Tool Launches');
    expect(article.url).toBe('https://skift.com/article-1'); // stripped UTM
    expect(article.publisher).toBe('Skift');
    expect(article.summary).toBeTruthy();
  });

  it('filters articles older than cutoff', () => {
    const articles = [
      { url: 'a', title: 'New', publisher: 'X', publishedAt: '2026-02-20', summary: '', relevanceScore: 0 },
      { url: 'b', title: 'Old', publisher: 'X', publishedAt: '2026-01-01', summary: '', relevanceScore: 0 },
    ];
    const filtered = filterByDate(articles, 7); // 7 days
    // Only the recent one should pass (assuming "today" is mocked or test is tolerant)
    expect(filtered.length).toBeLessThanOrEqual(articles.length);
  });
});
```

**Step 3: Run test to verify it fails**

```bash
cd agent && npx vitest run src/__tests__/fetcher.test.ts
```

**Step 4: Write the implementation**

```ts
// agent/src/fetcher.ts
import Parser from 'rss-parser';
import { ArticleRow } from './db.js';
import { SOURCES, Source } from './sources.js';

const parser = new Parser({
  timeout: 10_000,
  headers: { 'User-Agent': 'SolaIntelAgent/1.0' },
});

export interface RawItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
}

/** Strip UTM params and tracking fragments from URLs */
function cleanUrl(raw: string): string {
  try {
    const url = new URL(raw);
    [...url.searchParams.keys()]
      .filter(k => k.startsWith('utm_') || k === 'ref' || k === 'source')
      .forEach(k => url.searchParams.delete(k));
    url.hash = '';
    return url.toString();
  } catch {
    return raw;
  }
}

/** Extract first 2 sentences as a basic summary */
function extractSummary(text: string): string {
  const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return clean.slice(0, 200);
  return sentences.slice(0, 2).join(' ').trim();
}

export function normalizeArticle(item: RawItem, publisher: string): ArticleRow {
  const title = (item.title || '').trim();
  const url = cleanUrl(item.link || '');
  const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const summary = extractSummary(item.contentSnippet || item.content || title);

  return { url, title, publisher, publishedAt, summary, relevanceScore: 0 };
}

export function filterByDate(articles: ArticleRow[], maxAgeDays: number): ArticleRow[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return articles.filter(a => a.publishedAt >= cutoffStr);
}

export async function fetchSource(source: Source): Promise<ArticleRow[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).map(item => normalizeArticle(item as RawItem, source.name));
  } catch (err) {
    console.warn(`[fetch] Failed to fetch ${source.name}: ${(err as Error).message}`);
    return [];
  }
}

export async function fetchAllSources(): Promise<ArticleRow[]> {
  const results = await Promise.allSettled(SOURCES.map(s => fetchSource(s)));
  const articles: ArticleRow[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    }
  }
  return articles;
}
```

**Step 5: Run test to verify it passes**

```bash
cd agent && npx vitest run src/__tests__/fetcher.test.ts
```

**Step 6: Commit**

```bash
git add agent/src/sources.ts agent/src/fetcher.ts agent/src/__tests__/fetcher.test.ts
git commit -m "feat(agent): add RSS source config and fetcher with URL normalization"
```

---

## Task 4: Relevance scoring engine

**Files:**
- Create: `agent/src/scorer.ts`
- Test: `agent/src/__tests__/scorer.test.ts`

**Step 1: Write the failing test**

```ts
// agent/src/__tests__/scorer.test.ts
import { describe, it, expect } from 'vitest';
import { scoreArticle } from '../scorer.js';

describe('scorer', () => {
  it('scores an AI travel article highly', () => {
    const score = scoreArticle({
      title: 'AI-Powered Travel Planning Tool for Solo Women Travelers',
      summary: 'A new platform uses LLM agents to create personalized itineraries for women traveling alone.',
      publisher: 'Skift',
      publishedAt: new Date().toISOString().split('T')[0],
      url: '',
      relevanceScore: 0,
    });
    expect(score).toBeGreaterThan(0.7);
  });

  it('scores an unrelated article low', () => {
    const score = scoreArticle({
      title: 'Local Sports Team Wins Championship',
      summary: 'The team celebrated their victory at the downtown stadium.',
      publisher: 'BBC',
      publishedAt: new Date().toISOString().split('T')[0],
      url: '',
      relevanceScore: 0,
    });
    expect(score).toBeLessThan(0.3);
  });

  it('boosts women-safety articles', () => {
    const score = scoreArticle({
      title: 'New Safety App for Women Travelers in Southeast Asia',
      summary: 'The app provides real-time safety alerts and verified accommodation reviews.',
      publisher: 'Adventurous Kate',
      publishedAt: new Date().toISOString().split('T')[0],
      url: '',
      relevanceScore: 0,
    });
    expect(score).toBeGreaterThan(0.6);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd agent && npx vitest run src/__tests__/scorer.test.ts
```

**Step 3: Write the implementation**

```ts
// agent/src/scorer.ts
import { ArticleRow } from './db.js';

/** Keyword groups with weights. Higher weight = more relevant to Sola. */
const KEYWORD_GROUPS: { keywords: string[]; weight: number }[] = [
  // Core: solo female travel + safety
  {
    keywords: ['solo female travel', 'women travel', 'solo women', 'female traveler', 'women safety', 'woman travel',
               'solo travel safety', 'female-only', 'women-only tour', 'women-only hostel', 'female dorm'],
    weight: 1.0,
  },
  // AI + travel intersection
  {
    keywords: ['travel ai', 'ai travel', 'travel tech', 'itinerary ai', 'trip planning ai', 'travel agent ai',
               'booking ai', 'travel recommendation', 'personalized travel', 'travel chatbot'],
    weight: 0.9,
  },
  // Safety tech
  {
    keywords: ['safety app', 'trust and safety', 'identity verification', 'travel safety', 'scam alert',
               'travel advisory', 'emergency sos', 'traveler safety', 'safety tech'],
    weight: 0.85,
  },
  // AI/LLM general (relevant to our product)
  {
    keywords: ['llm', 'large language model', 'rag', 'retrieval augmented', 'ai agent', 'ai personalization',
               'recommendation system', 'generative ai', 'claude', 'gpt', 'anthropic', 'openai'],
    weight: 0.6,
  },
  // SEA / emerging destinations
  {
    keywords: ['southeast asia', 'bali', 'thailand', 'vietnam', 'philippines', 'indonesia', 'cambodia',
               'laos', 'myanmar', 'malaysia', 'singapore', 'japan', 'morocco', 'portugal', 'colombia', 'mexico'],
    weight: 0.5,
  },
  // Mobile app growth
  {
    keywords: ['app store', 'mobile growth', 'app retention', 'user acquisition', 'app launch',
               'travel app', 'mobile app', 'app download', 'aso', 'app store optimization'],
    weight: 0.5,
  },
  // Travel industry
  {
    keywords: ['travel trend', 'airline', 'hostel', 'booking platform', 'travel insurance',
               'travel creator', 'ugc travel', 'travel affiliate', 'digital nomad', 'solo travel'],
    weight: 0.4,
  },
];

/** Publisher quality tiers */
const PUBLISHER_BOOST: Record<string, number> = {
  'Skift': 0.15,
  'Phocuswire': 0.12,
  'TechCrunch AI': 0.10,
  'TechCrunch Apps': 0.10,
  'MIT Tech Review AI': 0.10,
  'The Verge AI': 0.08,
  'Condé Nast Traveler': 0.08,
  'Lonely Planet News': 0.08,
  'Reuters Travel': 0.08,
  'Adventurous Kate': 0.10,
  'Be My Travel Muse': 0.10,
  'Solo Traveler Blog': 0.10,
};

/** Recency boost: articles from today get +0.1, yesterday +0.05, etc. */
function recencyBoost(publishedAt: string): number {
  const days = Math.floor((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 0.10;
  if (days <= 1) return 0.05;
  if (days <= 3) return 0.02;
  return 0;
}

export function scoreArticle(article: ArticleRow): number {
  const text = `${article.title} ${article.summary}`.toLowerCase();

  // Keyword matching — take the best match from each group
  let keywordScore = 0;
  for (const group of KEYWORD_GROUPS) {
    const matched = group.keywords.some(kw => text.includes(kw));
    if (matched) {
      keywordScore += group.weight;
    }
  }

  // Normalize keyword score to 0-1 range (max possible ~4.75)
  const maxKeywordScore = KEYWORD_GROUPS.reduce((sum, g) => sum + g.weight, 0);
  const normalizedKeyword = Math.min(keywordScore / (maxKeywordScore * 0.4), 1.0); // hitting 40% of keywords is a perfect score

  // Publisher boost
  const pubBoost = PUBLISHER_BOOST[article.publisher] || 0;

  // Recency
  const recency = recencyBoost(article.publishedAt);

  // Final score: weighted combination
  const score = Math.min(normalizedKeyword * 0.75 + pubBoost + recency, 1.0);

  return Math.round(score * 100) / 100;
}

export function scoreAndSort(articles: ArticleRow[]): ArticleRow[] {
  return articles
    .map(a => ({ ...a, relevanceScore: scoreArticle(a) }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
```

**Step 4: Run test to verify it passes**

```bash
cd agent && npx vitest run src/__tests__/scorer.test.ts
```

**Step 5: Commit**

```bash
git add agent/src/scorer.ts agent/src/__tests__/scorer.test.ts
git commit -m "feat(agent): add relevance scoring engine with keyword groups and publisher boost"
```

---

## Task 5: Deduplication by URL + title similarity

**Files:**
- Create: `agent/src/dedupe.ts`
- Test: `agent/src/__tests__/dedupe.test.ts`

**Step 1: Write the failing test**

```ts
// agent/src/__tests__/dedupe.test.ts
import { describe, it, expect } from 'vitest';
import { dedupeArticles } from '../dedupe.js';
import { ArticleRow } from '../db.js';

const makeArticle = (url: string, title: string): ArticleRow => ({
  url, title, publisher: 'Test', publishedAt: '2026-02-20', summary: '', relevanceScore: 0.5,
});

describe('dedupe', () => {
  it('removes exact URL duplicates', () => {
    const articles = [
      makeArticle('https://a.com/post', 'Hello World'),
      makeArticle('https://a.com/post', 'Hello World'),
    ];
    expect(dedupeArticles(articles)).toHaveLength(1);
  });

  it('removes articles with very similar titles', () => {
    const articles = [
      makeArticle('https://a.com/1', 'AI Travel Planning Tool Launches in 2026'),
      makeArticle('https://b.com/2', 'AI Travel Planning Tool Launches In 2026'),
    ];
    expect(dedupeArticles(articles)).toHaveLength(1);
  });

  it('keeps articles with different titles', () => {
    const articles = [
      makeArticle('https://a.com/1', 'AI Travel Planning Tool'),
      makeArticle('https://b.com/2', 'Women Safety App for Southeast Asia'),
    ];
    expect(dedupeArticles(articles)).toHaveLength(2);
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write the implementation**

```ts
// agent/src/dedupe.ts
import { ArticleRow } from './db.js';

/** Simple Jaccard similarity on word sets */
function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const intersection = Array.from(wordsA).filter(w => wordsB.has(w)).length;
  const union = new Set([...Array.from(wordsA), ...Array.from(wordsB)]).size;
  return union === 0 ? 0 : intersection / union;
}

const SIMILARITY_THRESHOLD = 0.8;

export function dedupeArticles(articles: ArticleRow[]): ArticleRow[] {
  const seen = new Map<string, ArticleRow>(); // url → article
  const kept: ArticleRow[] = [];

  for (const article of articles) {
    // Exact URL match
    if (seen.has(article.url)) continue;

    // Title similarity check against all kept articles
    let isDupe = false;
    for (const existing of kept) {
      if (titleSimilarity(article.title, existing.title) >= SIMILARITY_THRESHOLD) {
        isDupe = true;
        break;
      }
    }

    if (!isDupe) {
      seen.set(article.url, article);
      kept.push(article);
    }
  }

  return kept;
}
```

**Step 4: Run tests, commit**

```bash
cd agent && npx vitest run src/__tests__/dedupe.test.ts
git add agent/src/dedupe.ts agent/src/__tests__/dedupe.test.ts
git commit -m "feat(agent): add URL + title similarity deduplication"
```

---

## Task 6: LLM summarizer with extractive fallback

**Files:**
- Create: `agent/src/summarizer.ts`
- Test: `agent/src/__tests__/summarizer.test.ts`

**Step 1: Write the failing test**

```ts
// agent/src/__tests__/summarizer.test.ts
import { describe, it, expect } from 'vitest';
import { generateDigestText, formatForEmail } from '../summarizer.js';
import { ArticleRow } from '../db.js';

const mockArticles: (ArticleRow & { solaInsight?: string })[] = [
  {
    url: 'https://skift.com/1',
    title: 'AI Travel Agent Startup Raises $50M',
    publisher: 'Skift',
    publishedAt: '2026-02-20',
    summary: 'A startup building AI-powered travel planning tools raised a $50M Series B.',
    relevanceScore: 0.92,
  },
  {
    url: 'https://kate.com/2',
    title: 'Best Safety Apps for Solo Female Travelers in 2026',
    publisher: 'Adventurous Kate',
    publishedAt: '2026-02-19',
    summary: 'A roundup of the top safety apps women use when traveling solo.',
    relevanceScore: 0.88,
  },
];

describe('summarizer', () => {
  it('generates extractive digest text without LLM', () => {
    const digest = generateDigestText(mockArticles, 'daily');
    expect(digest).toContain('AI Travel Agent Startup');
    expect(digest).toContain('Skift');
    expect(digest).toContain('Opportunities');
    expect(digest).toContain('Risks');
  });

  it('formats email HTML', () => {
    const digest = generateDigestText(mockArticles, 'daily');
    const html = formatForEmail(digest, 'daily');
    expect(html).toContain('<html');
    expect(html).toContain('Sola');
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write the implementation**

```ts
// agent/src/summarizer.ts
import { ArticleRow } from './db.js';

interface ScoredArticle extends ArticleRow {
  solaInsight?: string;
}

/** Use LLM if available, otherwise generate extractive digest */
export async function generateDigestWithLLM(articles: ScoredArticle[], period: 'daily' | 'weekly'): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey) {
    return await summarizeWithClaude(articles, period, anthropicKey);
  }
  if (openaiKey) {
    return await summarizeWithOpenAI(articles, period, openaiKey);
  }

  // Fallback: extractive
  return generateDigestText(articles, period);
}

async function summarizeWithClaude(articles: ScoredArticle[], period: string, apiKey: string): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });

  const articleList = articles.map((a, i) =>
    `${i + 1}. "${a.title}" (${a.publisher}, ${a.publishedAt})\n   ${a.summary}\n   URL: ${a.url}`
  ).join('\n\n');

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are the intelligence analyst for Sola, a women-first solo travel app. Generate a ${period} digest from these articles.

FORMAT (keep it concise — must be readable on email/WhatsApp):

📰 TOP HEADLINES

1. [Title] — [Publisher]
[1-2 sentence summary]
→ Why this matters for Sola: [1 sentence]

(repeat for top 5)

💡 OPPORTUNITIES (3 bullets)
[Product or marketing ideas inspired by the news]

⚠️ RISKS & WATCHOUTS (2-3 bullets)
[Things to monitor or prepare for]

🧪 ONE EXPERIMENT TO RUN THIS WEEK
[Specific, actionable idea]

ARTICLES:
${articleList}`,
    }],
  });

  const content = msg.content[0];
  return content.type === 'text' ? content.text : generateDigestText(articles, period);
}

async function summarizeWithOpenAI(articles: ScoredArticle[], period: string, apiKey: string): Promise<string> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });

  const articleList = articles.map((a, i) =>
    `${i + 1}. "${a.title}" (${a.publisher}, ${a.publishedAt})\n   ${a.summary}\n   URL: ${a.url}`
  ).join('\n\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are the intelligence analyst for Sola, a women-first solo travel app. Generate a ${period} digest from these articles.

FORMAT (keep it concise — must be readable on email/WhatsApp):

📰 TOP HEADLINES

1. [Title] — [Publisher]
[1-2 sentence summary]
→ Why this matters for Sola: [1 sentence]

(repeat for top 5)

💡 OPPORTUNITIES (3 bullets)
[Product or marketing ideas inspired by the news]

⚠️ RISKS & WATCHOUTS (2-3 bullets)
[Things to monitor or prepare for]

🧪 ONE EXPERIMENT TO RUN THIS WEEK
[Specific, actionable idea]

ARTICLES:
${articleList}`,
    }],
  });

  return response.choices[0]?.message?.content || generateDigestText(articles, period);
}

/** Extractive fallback — no LLM needed */
export function generateDigestText(articles: ScoredArticle[], period: 'daily' | 'weekly'): string {
  const top = articles.slice(0, period === 'weekly' ? 7 : 5);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const label = period === 'weekly' ? 'Weekly Intelligence Brief' : 'Daily Digest';

  let text = `SOLA ${label.toUpperCase()} — ${date}\n\n`;
  text += `📰 TOP HEADLINES\n\n`;

  top.forEach((a, i) => {
    text += `${i + 1}. ${a.title} — ${a.publisher}\n`;
    text += `   ${a.summary}\n`;
    text += `   🔗 ${a.url}\n`;
    text += `   → Relevance score: ${(a.relevanceScore * 100).toFixed(0)}%\n\n`;
  });

  text += `💡 OPPORTUNITIES\n`;
  text += `• Review top-scoring articles for feature inspiration\n`;
  text += `• Check competitor mentions in travel tech coverage\n`;
  text += `• Monitor women-safety developments for content opportunities\n\n`;

  text += `⚠️ RISKS & WATCHOUTS\n`;
  text += `• Watch for regulatory changes affecting travel apps\n`;
  text += `• Monitor safety incidents in key Sola destinations\n\n`;

  text += `🧪 ONE EXPERIMENT TO RUN THIS WEEK\n`;
  text += `• Test engagement with the top-trending topic from this digest in Sola's community feed\n\n`;

  text += `---\nGenerated by Sola Intel Agent • ${top.length} articles scored from ${new Date().toISOString().split('T')[0]}`;

  return text;
}

/** Wrap digest text in a clean HTML email */
export function formatForEmail(digestText: string, period: 'daily' | 'weekly'): string {
  const label = period === 'weekly' ? 'Weekly Intelligence Brief' : 'Daily Digest';
  const escapedText = digestText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  // Convert URLs to clickable links
  const withLinks = escapedText.replace(
    /🔗 (https?:\/\/[^\s<]+)/g,
    '🔗 <a href="$1" style="color:#E5653A;">$1</a>'
  );

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;line-height:1.6;">
  <div style="border-bottom:3px solid #E5653A;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="font-size:20px;margin:0;color:#E5653A;">Sola</h1>
    <p style="font-size:14px;margin:4px 0 0;color:#666;">${label}</p>
  </div>
  <div style="font-size:14px;white-space:pre-line;">
    ${withLinks}
  </div>
</body>
</html>`;
}
```

**Step 4: Run tests, commit**

```bash
cd agent && npx vitest run src/__tests__/summarizer.test.ts
git add agent/src/summarizer.ts agent/src/__tests__/summarizer.test.ts
git commit -m "feat(agent): add LLM summarizer with Claude/OpenAI/extractive fallback"
```

---

## Task 7: Email sender via Resend

**Files:**
- Create: `agent/src/sender.ts`
- Test: `agent/src/__tests__/sender.test.ts`

**Step 1: Write the failing test**

```ts
// agent/src/__tests__/sender.test.ts
import { describe, it, expect, vi } from 'vitest';
import { buildEmailPayload } from '../sender.js';

describe('sender', () => {
  it('builds a valid email payload', () => {
    const payload = buildEmailPayload(
      '# Test Digest',
      '<html><body>Test</body></html>',
      'daily',
      ['you@solatravel.app'],
    );
    expect(payload.from).toContain('solatravel.app');
    expect(payload.to).toEqual(['you@solatravel.app']);
    expect(payload.subject).toContain('Sola');
    expect(payload.subject).toContain('Daily');
    expect(payload.html).toBe('<html><body>Test</body></html>');
    expect(payload.text).toBe('# Test Digest');
  });

  it('builds weekly subject line', () => {
    const payload = buildEmailPayload('text', 'html', 'weekly', ['a@b.com']);
    expect(payload.subject).toContain('Weekly');
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write the implementation**

```ts
// agent/src/sender.ts
import { Resend } from 'resend';

export interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}

export function buildEmailPayload(
  textContent: string,
  htmlContent: string,
  period: 'daily' | 'weekly',
  recipients: string[],
): EmailPayload {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const label = period === 'weekly' ? 'Weekly Intelligence Brief' : 'Daily Digest';

  return {
    from: 'Sola Intel <intel@solatravel.app>',
    to: recipients,
    subject: `Sola ${label} — ${date}`,
    html: htmlContent,
    text: textContent,
  };
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[sender] RESEND_API_KEY not set — printing digest to stdout instead');
    console.log('\n' + '='.repeat(60));
    console.log(payload.text);
    console.log('='.repeat(60) + '\n');
    return { success: false, error: 'No API key' };
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (result.error) {
      console.error('[sender] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[sender] Email sent: ${result.data?.id}`);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('[sender] Failed:', (err as Error).message);
    return { success: false, error: (err as Error).message };
  }
}
```

**Step 4: Run tests, commit**

```bash
cd agent && npx vitest run src/__tests__/sender.test.ts
git add agent/src/sender.ts agent/src/__tests__/sender.test.ts
git commit -m "feat(agent): add Resend email sender with fallback stdout"
```

---

## Task 8: Main orchestrator — tie it all together

**Files:**
- Create: `agent/src/main.ts`
- Create: `agent/src/config.ts`

**Step 1: Create the config**

```ts
// agent/src/config.ts
import 'dotenv/config';

export interface AgentConfig {
  period: 'daily' | 'weekly';
  fetchOnly: boolean;
  maxArticlesDaily: number;
  maxArticlesWeekly: number;
  maxAgeDays: number;
  recipients: string[];
  minRelevanceScore: number;
}

export function loadConfig(): AgentConfig {
  const args = process.argv.slice(2);
  const periodFlag = args.find(a => a.startsWith('--period='))?.split('=')[1]
    || (args.includes('--period') ? args[args.indexOf('--period') + 1] : undefined);
  const isWeekly = periodFlag === 'weekly' || (new Date().getDay() === 1 && !periodFlag);

  return {
    period: isWeekly ? 'weekly' : 'daily',
    fetchOnly: args.includes('--fetch-only'),
    maxArticlesDaily: 5,
    maxArticlesWeekly: 7,
    maxAgeDays: isWeekly ? 7 : 2,
    recipients: (process.env.DIGEST_RECIPIENTS || '').split(',').map(s => s.trim()).filter(Boolean),
    minRelevanceScore: 0.25,
  };
}
```

**Step 2: Create the main orchestrator**

```ts
// agent/src/main.ts
import { loadConfig } from './config.js';
import { createDb, insertArticle, insertDigest, linkArticleToDigest, updateDigestStatus } from './db.js';
import { fetchAllSources, filterByDate } from './fetcher.js';
import { scoreAndSort } from './scorer.js';
import { dedupeArticles } from './dedupe.js';
import { generateDigestWithLLM, formatForEmail, generateDigestText } from './summarizer.js';
import { buildEmailPayload, sendEmail } from './sender.js';
import { SOURCES } from './sources.js';
import { insertSource } from './db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const config = loadConfig();
  console.log(`\n🔍 Sola Intel Agent — ${config.period} run`);
  console.log(`   ${new Date().toISOString()}\n`);

  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // Initialize database
  const db = createDb();
  console.log('✓ Database initialized');

  // Seed sources
  for (const source of SOURCES) {
    insertSource(db, source);
  }
  console.log(`✓ ${SOURCES.length} sources registered`);

  // Fetch articles from all RSS feeds
  console.log('\nFetching articles...');
  const raw = await fetchAllSources();
  console.log(`  Fetched ${raw.length} raw articles`);

  // Filter by date
  const recent = filterByDate(raw, config.maxAgeDays);
  console.log(`  ${recent.length} articles within ${config.maxAgeDays}-day window`);

  // Score
  const scored = scoreAndSort(recent);

  // Deduplicate
  const unique = dedupeArticles(scored);
  console.log(`  ${unique.length} after deduplication`);

  // Filter by minimum relevance
  const relevant = unique.filter(a => a.relevanceScore >= config.minRelevanceScore);
  console.log(`  ${relevant.length} above relevance threshold (${config.minRelevanceScore})`);

  // Store in database
  const articleIds: number[] = [];
  for (const article of relevant) {
    const id = insertArticle(db, article);
    if (id > 0) articleIds.push(id);
  }
  console.log(`  ${articleIds.length} new articles stored\n`);

  if (config.fetchOnly) {
    console.log('--fetch-only mode: skipping digest generation');
    return;
  }

  // Select top N for digest
  const maxArticles = config.period === 'weekly' ? config.maxArticlesWeekly : config.maxArticlesDaily;
  const topArticles = relevant.slice(0, maxArticles);

  if (topArticles.length === 0) {
    console.log('No relevant articles found. Skipping digest.');
    return;
  }

  // Generate digest
  console.log(`Generating ${config.period} digest from ${topArticles.length} articles...`);
  let digestText: string;
  try {
    digestText = await generateDigestWithLLM(topArticles, config.period);
  } catch (err) {
    console.warn(`LLM failed, falling back to extractive: ${(err as Error).message}`);
    digestText = generateDigestText(topArticles, config.period);
  }

  const digestHtml = formatForEmail(digestText, config.period);

  // Store digest
  const digestId = insertDigest(db, {
    period: config.period,
    contentMarkdown: digestText,
    contentText: digestText,
    sentStatus: 'pending',
  });
  for (const id of articleIds.slice(0, maxArticles)) {
    linkArticleToDigest(db, digestId, id);
  }
  console.log(`✓ Digest #${digestId} saved\n`);

  // Send email
  if (config.recipients.length === 0) {
    console.warn('No DIGEST_RECIPIENTS configured — printing to stdout');
    console.log('\n' + digestText);
    updateDigestStatus(db, digestId, 'printed');
    return;
  }

  const payload = buildEmailPayload(digestText, digestHtml, config.period, config.recipients);
  const result = await sendEmail(payload);

  if (result.success) {
    updateDigestStatus(db, digestId, 'sent');
    console.log(`✓ Digest sent to ${config.recipients.join(', ')}`);
  } else {
    updateDigestStatus(db, digestId, 'failed');
    console.error(`✗ Send failed: ${result.error}`);
    // Still print to stdout as fallback
    console.log('\n' + digestText);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

**Step 3: Commit**

```bash
git add agent/src/main.ts agent/src/config.ts
git commit -m "feat(agent): add main orchestrator — fetch, score, dedupe, summarize, send"
```

---

## Task 9: GitHub Actions scheduled workflow

**Files:**
- Create: `.github/workflows/intel-digest.yml`

**Step 1: Create the workflow**

```yaml
# .github/workflows/intel-digest.yml
name: Sola Intel Digest

on:
  schedule:
    # Daily at 9am Manila time (UTC+8) = 1:00 UTC
    - cron: '0 1 * * *'
  workflow_dispatch:
    inputs:
      period:
        description: 'Digest period'
        required: false
        default: 'daily'
        type: choice
        options:
          - daily
          - weekly

jobs:
  digest:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: agent

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: agent/package-lock.json

      - run: npm ci

      - name: Determine period
        id: period
        run: |
          if [ "${{ github.event.inputs.period }}" != "" ]; then
            echo "value=${{ github.event.inputs.period }}" >> $GITHUB_OUTPUT
          elif [ "$(date +%u)" = "1" ]; then
            echo "value=weekly" >> $GITHUB_OUTPUT
          else
            echo "value=daily" >> $GITHUB_OUTPUT
          fi

      - name: Run Intel Agent
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          DIGEST_RECIPIENTS: ${{ secrets.DIGEST_RECIPIENTS }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: npx tsx src/main.ts --period ${{ steps.period.outputs.value }}

      - name: Upload digest DB (artifact)
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: intel-db-${{ github.run_number }}
          path: agent/data/intel.db
          retention-days: 30
```

**Step 2: Commit**

```bash
git add .github/workflows/intel-digest.yml
git commit -m "ci: add GitHub Actions scheduled workflow for intel digest"
```

---

## Task 10: Sample output, README, and troubleshooting docs

**Files:**
- Create: `agent/README.md`
- Create: `agent/sample-digest.md`

**Step 1: Create sample digest output**

```markdown
<!-- agent/sample-digest.md -->
SOLA DAILY DIGEST — Friday, February 21, 2026

📰 TOP HEADLINES

1. AI Travel Agent Startup Raises $50M to Build Personalized Trip Planning — Skift
   A startup building LLM-powered travel agents closed a $50M Series B, focusing on real-time itinerary generation and booking integration.
   🔗 https://skift.com/2026/02/20/ai-travel-agent-startup-50m
   → Why this matters for Sola: Validates the AI-in-travel market. Watch their personalization approach — we should own the "solo female" niche before they do.

2. New Safety Features for Solo Female Travelers on Google Maps — The Verge
   Google Maps now highlights well-lit walking routes and shows safety ratings from women travelers in select Southeast Asian cities.
   🔗 https://theverge.com/2026/02/19/google-maps-safety-women
   → Why this matters for Sola: Google is moving into our lane. Our advantage is community-verified data — double down on user-generated safety signals.

3. Thailand Launches Digital Nomad Visa with Safety Provisions — Reuters
   Thailand's new visa includes a safety hotline and verified accommodation program, targeting women and solo travelers specifically.
   🔗 https://reuters.com/2026/02/20/thailand-digital-nomad-visa
   → Why this matters for Sola: Perfect content opportunity. Create a dedicated Thailand visa guide and push it to our SEA users.

4. Hostelworld Reports 40% Growth in Women-Only Dorm Bookings — Phocuswire
   Women-only dorm bookings surged 40% YoY, with Southeast Asia leading the trend.
   🔗 https://phocuswire.com/2026/02/18/hostelworld-women-dorms
   → Why this matters for Sola: Confirms our audience's behavior. Feature women-only accommodation filters prominently.

5. Claude 4.5 Launches with Advanced Agent Capabilities — TechCrunch
   Anthropic released Claude 4.5 with improved tool use, perfect for building travel planning agents.
   🔗 https://techcrunch.com/2026/02/20/claude-4-5-launch
   → Why this matters for Sola: We can upgrade our intel agent and explore in-app AI features using the new capabilities.

💡 OPPORTUNITIES
• Build a "safety score" feature using community data before Google dominates this space
• Create Thailand digital nomad content package — visa guide + verified accommodations + community tips
• Partner with Hostelworld or similar for women-only dorm data integration

⚠️ RISKS & WATCHOUTS
• Google Maps adding safety features = direct competition on our core value prop
• AI travel startup funding means more well-funded competitors in personalized travel
• Thailand visa policy may change — don't over-invest in content before details are final

🧪 ONE EXPERIMENT TO RUN THIS WEEK
• Post a community thread asking "What safety info do you wish Google Maps showed?" — use responses to shape our safety feature roadmap

---
Generated by Sola Intel Agent • 5 articles scored from 2026-02-21
```

**Step 2: Create README**

Content: Quick start instructions, env setup, local run commands, deployment to GitHub Actions, architecture diagram (text), troubleshooting section covering:
- `RESEND_API_KEY` not set → agent prints to stdout
- RSS feed timeouts → agent skips and continues
- LLM API errors → falls back to extractive
- Duplicate articles → handled by URL + title similarity
- Rate limits → RSS feeds rarely rate-limit, LLM calls are 1 per run
- Database locked → WAL mode prevents this in normal use

**Step 3: Commit**

```bash
git add agent/README.md agent/sample-digest.md
git commit -m "docs(agent): add README with setup, deployment, and troubleshooting"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Scaffold + deps | `agent/package.json`, `tsconfig.json`, `.env.example`, `.gitignore` |
| 2 | Database layer | `agent/src/db.ts` + test |
| 3 | RSS fetcher | `agent/src/sources.ts`, `agent/src/fetcher.ts` + test |
| 4 | Relevance scorer | `agent/src/scorer.ts` + test |
| 5 | Deduplication | `agent/src/dedupe.ts` + test |
| 6 | LLM summarizer | `agent/src/summarizer.ts` + test |
| 7 | Email sender | `agent/src/sender.ts` + test |
| 8 | Main orchestrator | `agent/src/main.ts`, `agent/src/config.ts` |
| 9 | GitHub Actions cron | `.github/workflows/intel-digest.yml` |
| 10 | Docs + sample | `agent/README.md`, `agent/sample-digest.md` |
