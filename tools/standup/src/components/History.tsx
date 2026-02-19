import React, { useState, useMemo } from 'react';
import { Standup, TeamMember } from '../types';
import { formatDate, generateMarkdownSummary } from '../utils';
import { getAllTasks } from '../storage';

interface HistoryProps {
  standups: Standup[];
  team: TeamMember[];
  onBack: () => void;
}

export default function History({ standups, team, onBack }: HistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = standups.find(s => s.id === selectedId);
  const tasks = useMemo(() => getAllTasks(), []);

  const getPreview = (standup: Standup): string => {
    const parts: string[] = [];
    for (const speaker of standup.speakers) {
      const member = team.find(m => m.id === speaker.memberId);
      const items = [...speaker.wins, ...speaker.focus].slice(0, 2);
      if (items.length > 0 && member) {
        parts.push(`${member.name}: ${items.join(', ')}`);
      }
    }
    return parts.join(' · ') || 'No notes recorded';
  };

  return (
    <div className="history-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="history-title">
          {selected ? formatDate(selected.date) : 'Standup History'}
        </div>
        <button className="btn-ghost" onClick={selected ? () => setSelectedId(null) : onBack}>
          ← {selected ? 'All standups' : 'Back'}
        </button>
      </div>

      {selected ? (
        <div className="history-detail">
          {generateMarkdownSummary(
            selected,
            tasks.filter(t => t.standupId === selected.id),
            team,
          )
            .replace(/^# (.+)$/gm, '━━━ $1 ━━━')
            .replace(/^## (.+)$/gm, '\n▸ $1')
            .replace(/^### (.+)$/gm, '\n  $1')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\| ?/g, '  ')
            .replace(/-{3,}/g, '')}
        </div>
      ) : standups.length === 0 ? (
        <div className="history-empty">
          No past standups yet. Complete your first standup to see it here.
        </div>
      ) : (
        <div className="history-list">
          {standups.map(standup => (
            <div
              key={standup.id}
              className="history-item"
              onClick={() => setSelectedId(standup.id)}
            >
              <div className="history-item-date">{formatDate(standup.date)}</div>
              <div className="history-item-preview">{getPreview(standup)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
