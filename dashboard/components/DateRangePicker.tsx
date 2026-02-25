'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const RANGES = [
  { label: 'Today', value: 'today' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'All', value: 'all' },
] as const;

const DEFAULT_RANGE = '7d';

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRange = searchParams.get('range') ?? DEFAULT_RANGE;

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_RANGE) {
      params.delete('range');
    } else {
      params.set('range', value);
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : '/');
  }

  return (
    <div className="flex items-center gap-1.5">
      {RANGES.map(({ label, value }) => {
        const isActive = activeRange === value;
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              isActive
                ? 'bg-sola-orange text-white'
                : 'bg-sola-card text-sola-textSecondary border border-sola-border hover:border-sola-orange/30'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
