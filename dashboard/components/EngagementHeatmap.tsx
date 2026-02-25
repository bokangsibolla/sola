'use client';

interface Props {
  data: {
    entityTypes: string[];
    eventTypes: string[];
    grid: number[][];
  };
}

function formatLabel(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getCellColor(value: number, max: number): string {
  if (value === 0 || max === 0) return 'transparent';
  const intensity = value / max;
  if (intensity > 0.7) return '#E5653A';
  if (intensity > 0.4) return '#F4A68C';
  if (intensity > 0.15) return '#FCD5C8';
  return '#FFF5F1';
}

function getTextColor(value: number, max: number): string {
  if (max === 0) return '#6B7280';
  const intensity = value / max;
  return intensity > 0.7 ? '#FFFFFF' : '#1A1A1A';
}

export function EngagementHeatmap({ data }: Props) {
  if (data.entityTypes.length === 0) {
    return (
      <div className="bg-sola-card border border-sola-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
          Engagement Heatmap
        </h3>
        <p className="text-sola-textSecondary text-sm">No data yet</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.grid.flat());

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5 overflow-x-auto">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        Content x Action Heatmap
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 text-sola-textSecondary font-medium text-xs">
              Entity
            </th>
            {data.eventTypes.map((et) => (
              <th
                key={et}
                className="py-2 px-2 text-sola-textSecondary font-medium text-xs text-center"
              >
                {formatLabel(et)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.entityTypes.map((entity, i) => (
            <tr key={entity}>
              <td className="py-2 pr-3 font-medium text-xs">
                {formatLabel(entity)}
              </td>
              {data.grid[i].map((value, j) => (
                <td key={j} className="py-1 px-1 text-center">
                  <div
                    className="rounded-md py-1.5 px-2 text-xs font-medium"
                    style={{
                      backgroundColor: getCellColor(value, maxValue),
                      color: getTextColor(value, maxValue),
                    }}
                  >
                    {value > 0 ? value.toLocaleString() : '—'}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
