import { Suspense } from 'react';
import { PulseRow } from '@/components/PulseRow';
import { DateRangePicker } from '@/components/DateRangePicker';

export const revalidate = 300; // 5 min cache

export default function Dashboard() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sola Analytics
          </h1>
          <p className="text-sola-textSecondary text-sm mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
        <Suspense>
          <DateRangePicker />
        </Suspense>
      </div>

      <Suspense fallback={<PulseRowSkeleton />}>
        <PulseRow />
      </Suspense>
    </main>
  );
}

function PulseRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-sola-card border border-sola-border rounded-xl p-5 animate-pulse"
        >
          <div className="h-3 w-20 bg-sola-border rounded mb-3" />
          <div className="h-8 w-16 bg-sola-border rounded" />
        </div>
      ))}
    </div>
  );
}
