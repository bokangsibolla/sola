'use client';

import type { RetentionCohortRow } from '@/lib/queries/growth';

interface RetentionCohortProps {
  data: RetentionCohortRow[];
}

function getCellColor(pct: number): { bg: string; text: string } {
  if (pct >= 70) return { bg: '#E5653A', text: '#FFFFFF' };
  if (pct >= 50) return { bg: '#FFF5F1', text: '#1A1A1A' };
  if (pct >= 30) return { bg: '#FDDCC8', text: '#1A1A1A' };
  if (pct >= 10) return { bg: '#FEE8DA', text: '#1A1A1A' };
  return { bg: '#FEF2F2', text: '#6B7280' };
}

const HEADERS = ['Cohort', 'Users', 'Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 30'];
const DAY_KEYS = ['day1', 'day3', 'day7', 'day14', 'day30'] as const;

export function RetentionCohort({ data }: RetentionCohortProps) {
  if (!data.length) {
    return (
      <div className="bg-sola-card border border-sola-border rounded-xl p-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-sola-textSecondary mb-4">
          Retention Cohorts
        </p>
        <p className="text-sm text-sola-textSecondary">
          Not enough data to display retention cohorts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5 overflow-x-auto">
      <p className="text-[11px] font-medium uppercase tracking-wide text-sola-textSecondary mb-4">
        Retention Cohorts
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="text-left text-[11px] font-medium uppercase tracking-wide text-sola-textSecondary pb-3 pr-3 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.cohort} className="border-t border-sola-border">
              <td className="py-2.5 pr-3 text-sola-text font-medium whitespace-nowrap">
                {row.cohort}
              </td>
              <td className="py-2.5 pr-3 text-sola-textSecondary tabular-nums">
                {row.users}
              </td>
              {DAY_KEYS.map((key) => {
                const pct = row[key];
                const { bg, text } = getCellColor(pct);
                return (
                  <td key={key} className="py-2.5 pr-3">
                    <span
                      className="inline-block px-2.5 py-1 rounded-md text-xs font-medium tabular-nums min-w-[40px] text-center"
                      style={{ backgroundColor: bg, color: text }}
                    >
                      {pct}%
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
