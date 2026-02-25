'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Props {
  data: { bucket: string; count: number }[];
}

export function SessionDepthChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-sola-card border border-sola-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
          Session Depth
        </h3>
        <p className="text-sola-textSecondary text-sm">No session data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        Events per Session
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #F0F0F0',
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value) => [String(value), 'Sessions']}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === 0 ? '#FCD5C8' : i < 3 ? '#E5653A' : '#C44A28'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
