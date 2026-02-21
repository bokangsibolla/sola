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
