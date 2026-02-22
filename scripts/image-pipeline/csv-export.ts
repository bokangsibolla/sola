/**
 * CSV export for manual review of image pipeline candidates.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PipelineResult } from './types';

function csvEscape(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export pipeline results to a CSV file for manual review.
 */
export function exportReviewCsv(
  results: PipelineResult[],
  outputPath: string = 'image-pipeline-review.csv',
): string {
  const fullPath = path.resolve(outputPath);

  const headers = [
    'destination_id',
    'destination_type',
    'name',
    'status',
    'hero_url',
    'hero_source',
    'hero_score',
    'hero_license_hint',
    'hero_attribution',
    'gallery_count',
    'gallery_urls',
    'gallery_scores',
    'canonical_query',
    'reason',
  ];

  const rows = results.map((r) => [
    r.destinationId,
    r.destinationType,
    csvEscape(r.name),
    r.status,
    r.heroImage?.url ?? '',
    r.heroImage?.source ?? '',
    String(r.heroImage?.qualityScore ?? ''),
    r.heroImage?.licenseHint ?? '',
    csvEscape(r.heroImage?.attribution ?? ''),
    String(r.galleryImages.length),
    csvEscape(r.galleryImages.map((g) => g.url).join(' | ')),
    r.galleryImages.map((g) => g.qualityScore).join(' | '),
    csvEscape(r.canonicalQuery ?? ''),
    csvEscape(r.reason ?? ''),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  fs.writeFileSync(fullPath, csv, 'utf-8');
  return fullPath;
}
