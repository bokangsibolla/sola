'use client';

import { useState } from 'react';

type EntityType = 'country' | 'city' | 'place' | 'collection' | 'thread';

interface ContentRow {
  id: string;
  name: string;
  views: number;
  conversions: number;
  conversionRate: number;
}

interface Props {
  data: Record<string, ContentRow[]>;
}

const TABS: { key: EntityType; label: string }[] = [
  { key: 'country', label: 'Countries' },
  { key: 'city', label: 'Cities' },
  { key: 'place', label: 'Places' },
  { key: 'collection', label: 'Collections' },
  { key: 'thread', label: 'Threads' },
];

function rateColor(rate: number): string {
  if (rate >= 20) return '#22C55E';
  if (rate >= 10) return '#E5653A';
  return '#EF4444';
}

export function ContentLeaderboard({ data }: Props) {
  const [activeTab, setActiveTab] = useState<EntityType>('place');

  const rows = data[activeTab] ?? [];

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        Top Content by Conversion
      </h3>
      <div className="flex gap-1 mb-4 border-b border-sola-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-sola-orange border-b-2 border-sola-orange'
                : 'text-sola-textSecondary hover:text-sola-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="text-sola-textSecondary text-sm py-4">No data yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-sola-textSecondary">
                <th className="pb-2 font-medium w-8">#</th>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium text-right">Views</th>
                <th className="pb-2 font-medium text-right">Conv.</th>
                <th className="pb-2 font-medium text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-t border-sola-border">
                  <td className="py-2 text-sola-textSecondary">{i + 1}</td>
                  <td className="py-2 font-medium truncate max-w-[200px]">
                    {row.name}
                  </td>
                  <td className="py-2 text-right text-sola-textSecondary">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-sola-textSecondary">
                    {row.conversions.toLocaleString()}
                  </td>
                  <td className="py-2 text-right font-medium">
                    <span style={{ color: rateColor(row.conversionRate) }}>
                      {row.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
