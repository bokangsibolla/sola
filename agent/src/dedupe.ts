import { ArticleRow } from './db.js';

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const intersection = Array.from(wordsA).filter(w => wordsB.has(w)).length;
  const union = new Set([...Array.from(wordsA), ...Array.from(wordsB)]).size;
  return union === 0 ? 0 : intersection / union;
}

const SIMILARITY_THRESHOLD = 0.8;

export function dedupeArticles(articles: ArticleRow[]): ArticleRow[] {
  const seen = new Map<string, ArticleRow>();
  const kept: ArticleRow[] = [];

  for (const article of articles) {
    if (seen.has(article.url)) continue;

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
