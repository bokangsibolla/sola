import { describe, it, expect } from 'vitest';
import { generateDigestText, formatForEmail } from '../summarizer.js';
import { ArticleRow } from '../db.js';

const mockArticles: ArticleRow[] = [
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
    expect(digest).toContain('OPPORTUNITIES');
    expect(digest).toContain('RISKS');
  });

  it('formats email HTML', () => {
    const digest = generateDigestText(mockArticles, 'daily');
    const html = formatForEmail(digest, 'daily');
    expect(html).toContain('<html');
    expect(html).toContain('Sola');
  });

  it('includes article URLs in digest', () => {
    const digest = generateDigestText(mockArticles, 'daily');
    expect(digest).toContain('https://skift.com/1');
    expect(digest).toContain('https://kate.com/2');
  });

  it('generates weekly label for weekly period', () => {
    const digest = generateDigestText(mockArticles, 'weekly');
    expect(digest).toContain('WEEKLY INTELLIGENCE BRIEF');
  });
});
