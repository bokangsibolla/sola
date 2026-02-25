'use client';

interface FunnelResult {
  label: string;
  count: number;
  percentage: number;
  dropoff: number;
}

interface Props {
  title: string;
  data: FunnelResult[];
}

export function FunnelChart({ title, data }: Props) {
  if (data.length === 0 || data[0].count === 0) {
    return (
      <div className="bg-sola-card border border-sola-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
          {title}
        </h3>
        <p className="text-sola-textSecondary text-sm">No funnel data yet</p>
      </div>
    );
  }

  const maxCount = data[0].count;

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        {title}
      </h3>
      <div className="space-y-2">
        {data.map((step, i) => (
          <div key={step.label}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-medium w-28 truncate shrink-0">
                {step.label}
              </span>
              <div className="flex-1 h-7 bg-sola-bg rounded-md overflow-hidden relative">
                <div
                  className="h-full rounded-md flex items-center px-2"
                  style={{
                    width: `${maxCount > 0 ? Math.max((step.count / maxCount) * 100, 4) : 0}%`,
                    backgroundColor:
                      i === 0 ? '#E5653A' : `rgba(229, 101, 58, ${1 - i * 0.15})`,
                  }}
                >
                  <span className="text-xs font-medium text-white whitespace-nowrap">
                    {step.count.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-xs text-sola-textSecondary w-10 text-right shrink-0">
                {step.percentage}%
              </span>
            </div>
            {i > 0 && step.dropoff > 0 && (
              <div className="ml-28 pl-3">
                <span className="text-xs text-sola-red">
                  -{step.dropoff}% drop
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
