interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  change,
  prefix,
  suffix,
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-sola-card border border-sola-border rounded-xl p-5 animate-pulse">
        <div className="h-3 w-20 bg-sola-border rounded mb-3" />
        <div className="h-8 w-16 bg-sola-border rounded mb-2" />
        <div className="h-3 w-12 bg-sola-border rounded" />
      </div>
    );
  }

  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-sola-textSecondary mb-1">
        {label}
      </p>
      <p className="text-3xl font-semibold text-sola-text tracking-tight">
        {prefix}
        {formattedValue}
        {suffix && (
          <span className="text-base font-normal text-sola-textSecondary ml-1">
            {suffix}
          </span>
        )}
      </p>
      <ChangeIndicator change={change} />
    </div>
  );
}

function ChangeIndicator({ change }: { change?: number }) {
  if (change === undefined || change === null) {
    return (
      <p className="text-xs text-sola-textSecondary mt-2">&mdash;</p>
    );
  }

  const isPositive = change > 0;
  const isNegative = change < 0;
  const isZero = change === 0;

  if (isZero) {
    return (
      <p className="text-xs text-sola-textSecondary mt-2">0% vs prior</p>
    );
  }

  const arrow = isPositive ? '\u2191' : '\u2193';
  const color = isPositive ? 'text-sola-green' : 'text-sola-red';
  const sign = isPositive ? '+' : '';
  const formatted = `${sign}${change.toFixed(1)}%`;

  return (
    <p className={`text-xs font-medium mt-2 ${color}`}>
      {arrow} {formatted}
      <span className="text-sola-textSecondary font-normal ml-1">vs prior</span>
    </p>
  );
}
