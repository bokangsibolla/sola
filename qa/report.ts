/**
 * QA Testing Agent — Report Format
 *
 * Defines the structure Claude uses to build the markdown report.
 * This file is READ by Claude during QA runs, not executed as Node.
 */

export interface TestResult {
  /** Test number (1-34) */
  id: number;
  /** Group name (e.g., "Tab Loading") */
  group: string;
  /** Test description */
  name: string;
  /** Pass or fail */
  status: 'pass' | 'fail';
  /** What was expected */
  expected?: string;
  /** What actually happened (on failure) */
  actual?: string;
  /** Screenshot filename (on failure, or on pass if captureOnPass=true) */
  screenshot?: string;
  /** Likely file/area where the bug lives */
  likelyArea?: string;
}

export interface CleanupResult {
  item: string;
  success: boolean;
}

export interface QAReport {
  date: string;
  time: string;
  duration: string;
  totalChecks: number;
  passed: number;
  failed: number;
  results: TestResult[];
  cleanup: CleanupResult[];
}

/**
 * Report template — Claude fills this in and writes to qa/reports/YYYY-MM-DD-qa-report.md
 *
 * ```markdown
 * # Sola QA Report — {date} {time}
 *
 * ## Summary
 * ✅ {passed}/{totalChecks} checks passed | ❌ {failed} failures | ⏱ {duration}
 *
 * ## Results
 *
 * ### 1. {groupName} ({groupPassed}/{groupTotal}) ✅/❌
 * - ✅ {testName}
 * - ❌ **{testName}** — {actual}
 *   → `screenshots/{screenshot}`
 *
 * ## Failures Detail
 *
 * ### ❌ #{id} — {name}
 * - **Expected**: {expected}
 * - **Got**: {actual}
 * - **Screenshot**: screenshots/{screenshot}
 * - **Likely area**: {likelyArea}
 *
 * ## Cleanup
 * - ✅/❌ {item}
 * ```
 */
