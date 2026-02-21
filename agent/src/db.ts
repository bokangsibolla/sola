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
  if (existing) return 0;
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
