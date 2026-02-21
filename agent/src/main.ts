import { loadConfig } from './config.js';
import { createDb, insertArticle, insertDigest, linkArticleToDigest, updateDigestStatus, insertSource } from './db.js';
import { fetchAllSources, filterByDate } from './fetcher.js';
import { scoreAndSort } from './scorer.js';
import { dedupeArticles } from './dedupe.js';
import { generateDigestWithLLM, formatForEmail, generateDigestText } from './summarizer.js';
import { buildEmailPayload, sendEmail } from './sender.js';
import { SOURCES } from './sources.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const config = loadConfig();
  console.log(`\nSola Intel Agent — ${config.period} run`);
  console.log(`   ${new Date().toISOString()}\n`);

  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // Initialize database
  const db = createDb();
  console.log('[ok] Database initialized');

  // Seed sources
  for (const source of SOURCES) {
    insertSource(db, source);
  }
  console.log(`[ok] ${SOURCES.length} sources registered`);

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
  console.log(`[ok] Digest #${digestId} saved\n`);

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
    console.log(`[ok] Digest sent to ${config.recipients.join(', ')}`);
  } else {
    updateDigestStatus(db, digestId, 'failed');
    console.error(`[fail] Send failed: ${result.error}`);
    console.log('\n' + digestText);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
