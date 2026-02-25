import { MetricCard } from './MetricCard';

interface ActivationMetricsProps {
  activationRate: number;
  activated: number;
  total: number;
  resurrectionCount: number;
  medianMinutes: number | null;
  sampleSize: number;
  stickiness: { ratio: number; dau: number; mau: number };
}

export function ActivationMetrics({
  activationRate,
  resurrectionCount,
  medianMinutes,
  stickiness,
}: ActivationMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="Activation Rate"
        value={activationRate}
        suffix="%"
      />
      <MetricCard
        label="DAU/MAU"
        value={stickiness.ratio}
        suffix="%"
      />
      <MetricCard
        label="Time to Value"
        value={medianMinutes ?? '---'}
        suffix={medianMinutes !== null ? 'min' : undefined}
      />
      <MetricCard
        label="Resurrected Users"
        value={resurrectionCount}
      />
    </div>
  );
}
