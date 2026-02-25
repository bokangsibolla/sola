'use client';

interface Props {
  data: { screen: string; medianSeconds: number; views: number }[];
}

function formatLabel(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  return `${seconds}s`;
}

export function ScreenTimeTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-sola-card border border-sola-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
          Time on Screen
        </h3>
        <p className="text-sola-textSecondary text-sm">No data yet</p>
      </div>
    );
  }

  const maxTime = Math.max(...data.map((d) => d.medianSeconds));

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        Median Time on Screen
      </h3>
      <div className="space-y-2">
        {data.slice(0, 12).map((row) => (
          <div key={row.screen} className="flex items-center gap-3">
            <span className="text-xs font-medium w-36 truncate shrink-0">
              {formatLabel(row.screen)}
            </span>
            <div className="flex-1 h-6 bg-sola-bg rounded-md overflow-hidden relative">
              <div
                className="h-full rounded-md"
                style={{
                  width: `${maxTime > 0 ? (row.medianSeconds / maxTime) * 100 : 0}%`,
                  backgroundColor: '#E5653A',
                  opacity: 0.7,
                }}
              />
            </div>
            <span className="text-xs text-sola-textSecondary w-14 text-right shrink-0">
              {formatTime(row.medianSeconds)}
            </span>
            <span className="text-xs text-sola-textSecondary w-16 text-right shrink-0">
              {row.views.toLocaleString()} views
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
