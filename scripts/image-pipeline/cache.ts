/**
 * File-based cache for image pipeline results.
 * Prevents redundant API calls on re-runs.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { StrategyResult } from './strategies';

const CACHE_DIR = path.join(process.cwd(), '.image-pipeline-cache');

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function cacheKey(destId: string): string {
  return path.join(CACHE_DIR, `${destId}.json`);
}

interface CacheEntry {
  timestamp: string;
  result: StrategyResult;
}

/**
 * Get a cached result for a destination.
 * Returns null if not cached or cache is expired.
 */
export function getCached(destId: string, maxAgeHours: number = 72): StrategyResult | null {
  const file = cacheKey(destId);
  if (!fs.existsSync(file)) return null;

  try {
    const entry: CacheEntry = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const age = Date.now() - new Date(entry.timestamp).getTime();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    if (age > maxAge) return null;
    return entry.result;
  } catch {
    return null;
  }
}

/**
 * Save a result to cache.
 */
export function setCache(destId: string, result: StrategyResult): void {
  ensureCacheDir();
  const entry: CacheEntry = {
    timestamp: new Date().toISOString(),
    result,
  };
  fs.writeFileSync(cacheKey(destId), JSON.stringify(entry, null, 2));
}

/**
 * Clear all cached results.
 */
export function clearCache(): void {
  if (fs.existsSync(CACHE_DIR)) {
    const files = fs.readdirSync(CACHE_DIR);
    for (const f of files) {
      fs.unlinkSync(path.join(CACHE_DIR, f));
    }
  }
}
