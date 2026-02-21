import { ArticleRow } from './db.js';

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
  // AI/LLM general
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

function recencyBoost(publishedAt: string): number {
  const days = Math.floor((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 0.10;
  if (days <= 1) return 0.05;
  if (days <= 3) return 0.02;
  return 0;
}

export function scoreArticle(article: ArticleRow): number {
  const text = `${article.title} ${article.summary}`.toLowerCase();

  let keywordScore = 0;
  for (const group of KEYWORD_GROUPS) {
    const matched = group.keywords.some(kw => text.includes(kw));
    if (matched) {
      keywordScore += group.weight;
    }
  }

  const maxKeywordScore = KEYWORD_GROUPS.reduce((sum, g) => sum + g.weight, 0);
  const normalizedKeyword = Math.min(keywordScore / (maxKeywordScore * 0.4), 1.0);

  const pubBoost = PUBLISHER_BOOST[article.publisher] || 0;
  const recency = recencyBoost(article.publishedAt);
  const score = Math.min(normalizedKeyword * 0.75 + pubBoost + recency, 1.0);

  return Math.round(score * 100) / 100;
}

export function scoreAndSort(articles: ArticleRow[]): ArticleRow[] {
  return articles
    .map(a => ({ ...a, relevanceScore: scoreArticle(a) }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
