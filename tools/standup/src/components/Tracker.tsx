import React from 'react';
import { ActionItem, TeamMember } from '../types';

interface TrackerProps {
  tasks: ActionItem[];
  team: TeamMember[];
  onBack: () => void;
  onUncomplete: (id: string) => void;
}

export default function Tracker({
  tasks,
  team,
  onBack,
  onUncomplete,
}: TrackerProps) {
  const completed = tasks.filter(t => t.completed);
  const open = tasks.filter(t => !t.completed);

  // Sort completed by completedAt descending
  const recentlyCompleted = [...completed].sort((a, b) => {
    const aTime = a.completedAt || a.createdAt;
    const bTime = b.completedAt || b.createdAt;
    return bTime.localeCompare(aTime);
  });

  return (
    <div className="tracker-section">
      <div className="tracker-header">
        <div>
          <div className="tracker-title">Performance Tracker</div>
          <div className="tracker-subtitle">
            {completed.length} completed · {open.length} open · {tasks.length} total
          </div>
        </div>
        <button className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Per-person stats */}
      <div className="tracker-grid">
        {team.map(member => {
          const memberTotal = tasks.filter(t => t.ownerId === member.id).length;
          const memberDone = completed.filter(t => t.ownerId === member.id).length;
          const memberOpen = open.filter(t => t.ownerId === member.id).length;
          const pct = memberTotal > 0 ? Math.round((memberDone / memberTotal) * 100) : 0;

          return (
            <div key={member.id} className="tracker-card">
              <div className="tracker-card-header">
                <div
                  className="tracker-card-avatar"
                  style={{ background: member.color }}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="tracker-card-name">{member.name}</div>
                  <div className="tracker-card-role">{member.role}</div>
                </div>
              </div>

              <div className="tracker-stats-row">
                <div className="tracker-stat">
                  <div className="tracker-stat-value">{memberDone}</div>
                  <div className="tracker-stat-label">Done</div>
                </div>
                <div className="tracker-stat">
                  <div className="tracker-stat-value">{memberOpen}</div>
                  <div className="tracker-stat-label">Open</div>
                </div>
                <div className="tracker-stat">
                  <div className="tracker-stat-value">{pct}%</div>
                  <div className="tracker-stat-label">Rate</div>
                </div>
              </div>

              <div className="tracker-progress">
                <div
                  className="tracker-progress-bar"
                  style={{
                    width: `${pct}%`,
                    background: member.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recently completed */}
      {recentlyCompleted.length > 0 && (
        <div className="tracker-completed">
          <div className="tracker-completed-title">Completed Tasks</div>
          <div className="action-list">
            {recentlyCompleted.map(item => {
              const owner = team.find(m => m.id === item.ownerId);
              const completedDate = item.completedAt
                ? new Date(item.completedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '';

              return (
                <div key={item.id} className="action-item completed">
                  <div
                    className="action-checkbox checked"
                    onClick={() => onUncomplete(item.id)}
                    title="Mark as incomplete"
                  />
                  <span className="action-title">{item.title}</span>
                  <div className="action-meta">
                    {owner && (
                      <span
                        className="action-owner-badge"
                        style={{ background: owner.color }}
                      >
                        {owner.name}
                      </span>
                    )}
                    {completedDate && (
                      <span className="action-due">{completedDate}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completed.length === 0 && (
        <div className="tracker-empty">
          No completed tasks yet. Check off tasks during standup to track progress here.
        </div>
      )}
    </div>
  );
}
