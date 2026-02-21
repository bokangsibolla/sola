import { describe, it, expect } from 'vitest';
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
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const oldDate = new Date(now);
    oldDate.setDate(oldDate.getDate() - 30);

    const articles = [
      { url: 'a', title: 'New', publisher: 'X', publishedAt: yesterday.toISOString().split('T')[0], summary: '', relevanceScore: 0 },
      { url: 'b', title: 'Old', publisher: 'X', publishedAt: oldDate.toISOString().split('T')[0], summary: '', relevanceScore: 0 },
    ];
    const filtered = filterByDate(articles, 7);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('New');
  });

  it('strips UTM params, ref, source, and hash from URLs', () => {
    const item = {
      title: 'Test',
      link: 'https://example.com/article?utm_source=rss&utm_medium=feed&utm_campaign=daily&ref=homepage&source=rss&valid=1#section',
      pubDate: 'Thu, 20 Feb 2026 10:00:00 GMT',
      contentSnippet: 'Test content here.',
    };
    const article = normalizeArticle(item, 'Test Publisher');
    expect(article.url).toBe('https://example.com/article?valid=1');
  });

  it('extracts first 2 sentences as summary', () => {
    const item = {
      title: 'Test',
      link: 'https://example.com/test',
      pubDate: 'Thu, 20 Feb 2026 10:00:00 GMT',
      contentSnippet: 'First sentence here. Second sentence there. Third sentence everywhere. Fourth.',
    };
    const article = normalizeArticle(item, 'Pub');
    expect(article.summary).toBe('First sentence here. Second sentence there.');
  });

  it('uses title as summary fallback when no content', () => {
    const item = {
      title: 'Breaking News Title',
      link: 'https://example.com/test',
      pubDate: 'Thu, 20 Feb 2026 10:00:00 GMT',
    };
    const article = normalizeArticle(item, 'Pub');
    expect(article.summary).toContain('Breaking News Title');
  });

  it('uses today as publishedAt when pubDate is missing', () => {
    const item = {
      title: 'No Date Article',
      link: 'https://example.com/no-date',
      contentSnippet: 'Some content.',
    };
    const article = normalizeArticle(item, 'Pub');
    const today = new Date().toISOString().split('T')[0];
    expect(article.publishedAt).toBe(today);
  });

  it('handles empty articles array in filterByDate', () => {
    const filtered = filterByDate([], 7);
    expect(filtered).toHaveLength(0);
  });
});
