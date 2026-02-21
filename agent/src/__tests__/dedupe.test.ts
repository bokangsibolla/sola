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
