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
