# Sola Travel Intelligence Agent

Automated intelligence agent that monitors travel, AI, and women-safety news, scores relevance to Sola, generates a structured digest, and emails it to the team.

Runs daily (5 top articles) and weekly on Mondays (7 top articles). Powered by RSS ingestion, keyword-based relevance scoring, LLM summarization (with extractive fallback), and Resend for email delivery.

## Quick Start

```bash
cd agent
cp .env.example .env
# Edit .env with your API keys
npm install
npm run dev          # Run once (daily digest)
npm run weekly       # Run once (weekly digest)
npm run fetch-only   # Fetch + score only, no digest
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes (for email) | API key from [resend.com](https://resend.com). Without it, digest prints to stdout. |
| `DIGEST_RECIPIENTS` | Yes (for email) | Comma-separated email addresses (e.g. `you@solatravel.app,cofounder@solatravel.app`) |
| `ANTHROPIC_API_KEY` | No | Enables Claude-powered digest summaries (uses `claude-haiku-4-5-20251001`) |
| `OPENAI_API_KEY` | No | Enables GPT-powered digest summaries (uses `gpt-4o-mini`) |
| `SUPABASE_URL` | No | For future remote storage integration |
| `SUPABASE_SERVICE_ROLE_KEY` | No | For future remote storage integration |

**LLM priority:** Claude > OpenAI > extractive fallback. If no LLM key is set, the agent falls back to extractive summarization that pulls the top headlines with relevance scores.

## Architecture

```
main.ts → config.ts (CLI flags + env parsing)
        → fetcher.ts (18 RSS feeds via rss-parser)
        → scorer.ts (keyword groups + publisher boost + recency)
        → dedupe.ts (URL + Jaccard title similarity)
        → summarizer.ts (Claude → OpenAI → extractive fallback)
        → sender.ts (Resend email → stdout fallback)
        → db.ts (SQLite: sources, articles, digests, article_digest_map)
```

### Pipeline

1. **Config** (`config.ts`) — Parses CLI flags (`--period daily|weekly`, `--fetch-only`) and environment variables. Auto-detects Monday for weekly mode.
2. **Fetch** (`fetcher.ts`) — Hits all 18 RSS feeds in parallel via `Promise.allSettled`. Failed feeds are skipped with a warning. URLs are cleaned (UTM params stripped).
3. **Score** (`scorer.ts`) — Each article is scored 0.0-1.0 based on:
   - Keyword group matches (7 groups: solo female travel, AI+travel, safety tech, AI/LLM general, SEA destinations, mobile growth, travel industry)
   - Publisher boost (trusted sources like Skift, Phocuswire, Adventurous Kate get +0.08 to +0.15)
   - Recency boost (today: +0.10, yesterday: +0.05, within 3 days: +0.02)
4. **Dedupe** (`dedupe.ts`) — Removes duplicates by exact URL match, then by Jaccard title similarity (threshold: 0.8).
5. **Summarize** (`summarizer.ts`) — Sends top articles to an LLM with a Sola-specific prompt that generates headlines, "why this matters" insights, opportunities, risks, and an experiment idea. Falls back to extractive text if no LLM key is available.
6. **Send** (`sender.ts`) — Formats as HTML email (Sola orange branding) and sends via Resend. Falls back to stdout if no API key.
7. **Store** (`db.ts`) — All articles, digests, and mappings are persisted to a local SQLite database (`data/intel.db`) with WAL mode enabled.

## RSS Sources (18 feeds)

### Travel Industry
| Source | URL |
|--------|-----|
| Skift | `https://skift.com/feed` |
| Travel Weekly | `https://www.travelweekly.com/rss` |
| Nomadic Matt | `https://www.nomadicmatt.com/travel-blog/feed/` |
| Reuters Travel | `https://www.reuters.com/arc/outboundfeeds/v1/category/travel/?outputType=xml` |
| BBC Travel | `https://feeds.bbci.co.uk/news/world/rss.xml` |
| Conde Nast Traveler | `https://www.cntraveler.com/feed/rss` |
| Lonely Planet News | `https://www.lonelyplanet.com/news/feed` |

### Travel Tech
| Source | URL |
|--------|-----|
| Phocuswire | `https://www.phocuswire.com/rss` |
| Tnooz (WebinTravel) | `https://www.webintravel.com/feed/` |

### AI General
| Source | URL |
|--------|-----|
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` |
| The Verge AI | `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` |
| MIT Tech Review AI | `https://www.technologyreview.com/topic/artificial-intelligence/feed` |
| Ars Technica AI | `https://feeds.arstechnica.com/arstechnica/technology-lab` |

### Solo Female Travel / Women Safety
| Source | URL |
|--------|-----|
| Adventurous Kate | `https://www.adventurouskate.com/feed/` |
| Be My Travel Muse | `https://www.bemytravelmuse.com/feed/` |
| Solo Traveler Blog | `https://solotravelerworld.com/feed/` |

### Mobile / App Growth
| Source | URL |
|--------|-----|
| TechCrunch Apps | `https://techcrunch.com/category/apps/feed/` |
| App Annie / data.ai Blog | `https://www.data.ai/en/insights/feed/` |

## Database Schema

SQLite database stored at `agent/data/intel.db` with four tables:

- **sources** — Registered RSS feed sources (name, url, category)
- **articles** — Every fetched article (url unique, title, publisher, published_at, summary, relevance_score)
- **digests** — Generated digests (period, content_markdown, content_text, sent_status)
- **article_digest_map** — Many-to-many link between articles and the digests they appeared in

## Deployment

### GitHub Actions (recommended)

The workflow is defined in `.github/workflows/intel-digest.yml`.

1. Add these secrets to your GitHub repository:
   - `RESEND_API_KEY`
   - `DIGEST_RECIPIENTS`
   - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` (at least one recommended)
2. The workflow runs automatically every day at **9:00 AM Manila time** (1:00 UTC).
3. On Mondays, it automatically runs a **weekly** digest (7 articles, 7-day lookback).
4. Manual trigger is available via **workflow_dispatch** — you can choose `daily` or `weekly` from the Actions tab.
5. The SQLite database is uploaded as a build artifact after each run (retained for 30 days).

### Manual / Render / Fly

```bash
# Daily digest
npm run daily

# Weekly digest
npm run weekly

# Fetch and score only (no email)
npm run fetch-only
```

You can wrap any of these in a cron job or systemd timer:

```bash
# crontab example: daily at 9am
0 9 * * * cd /path/to/sola/agent && npm run daily >> /var/log/sola-intel.log 2>&1
```

## Sample Output

See `sample-digest.md` for a realistic example of what the agent produces. Each digest includes:

- **TOP HEADLINES** — 5 articles (daily) or 7 (weekly) with source attribution, summaries, and "why this matters for Sola" insights
- **OPPORTUNITIES** — 3 actionable product or marketing ideas
- **RISKS & WATCHOUTS** — 2-3 things to monitor
- **ONE EXPERIMENT TO RUN THIS WEEK** — A specific, actionable idea

## Troubleshooting

**No email received**
Check that `RESEND_API_KEY` is set in your `.env` or GitHub secrets. Without it, the digest prints to stdout instead. Verify that the `solatravel.app` domain is verified in your [Resend dashboard](https://resend.com/domains).

**RSS feed timeout**
The agent skips failed feeds and continues with the rest. Check logs for `[fetch] Failed to fetch` warnings. The 10-second timeout per feed is hardcoded in `fetcher.ts`.

**LLM API errors**
The agent falls back to extractive summarization automatically. Check that `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` are valid and have sufficient quota. The fallback produces a functional digest with relevance scores instead of editorial insights.

**Duplicate articles**
Handled by URL dedup + Jaccard title similarity (0.8 threshold). Stored articles are also deduped by the unique URL constraint in SQLite. If you see duplicates, they likely have different URLs but similar content — consider lowering the similarity threshold in `dedupe.ts`.

**Rate limits**
RSS feeds rarely rate-limit. LLM calls are 1 per run (single prompt with all articles). Resend free tier allows 100 emails/day, which is more than enough for daily digests.

**Database locked**
SQLite uses WAL mode which prevents this in normal use. If it happens, delete `data/intel.db` and re-run — the agent will recreate the schema and re-fetch articles.

**No relevant articles found**
If the digest is skipped with "No relevant articles found", the minimum relevance threshold (0.25) filtered out everything. This can happen on slow news days. Check `scorer.ts` keyword groups to ensure they match current terminology.
