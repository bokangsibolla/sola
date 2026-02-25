'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface SignupChartProps {
  data: { date: string; count: number }[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface TooltipPayloadItem {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="bg-white border border-sola-border rounded-lg px-3 py-2 shadow-sm">
      <p className="text-xs text-sola-textSecondary">{formatDate(label)}</p>
      <p className="text-sm font-semibold text-sola-text">
        {payload[0].value} signup{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function SignupChart({ data }: SignupChartProps) {
  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-sola-textSecondary mb-4">
        Signups Over Time
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
        >
          <defs>
            <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF5F1" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#FFF5F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F0F0F0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#E5653A"
            strokeWidth={2}
            fill="url(#signupGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
