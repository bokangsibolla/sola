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

function extractSummary(text: string): string {
  const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return clean.slice(0, 200);
  return sentences.slice(0, 2).map(s => s.trim()).join(' ');
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
