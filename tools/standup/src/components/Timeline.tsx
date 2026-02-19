import React from 'react';
import { ActionItem, TeamMember } from '../types';

interface TimelineProps {
  tasks: ActionItem[];
  team: TeamMember[];
  onToggle: (id: string) => void;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Timeline({ tasks, team, onToggle }: TimelineProps) {
  const today = new Date().toISOString().slice(0, 10);

  // Get end of current week (Sunday)
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const endOfWeekStr = endOfWeek.toISOString().slice(0, 10);

  const open = tasks.filter(t => !t.completed);
  const withDates = open.filter(t => t.dueDate);

  const overdue = withDates.filter(t => t.dueDate < today);
  const dueToday = withDates.filter(t => t.dueDate === today);
  const thisWeek = withDates.filter(t => t.dueDate > today && t.dueDate <= endOfWeekStr);
  const later = withDates.filter(t => t.dueDate > endOfWeekStr);

  if (withDates.length === 0) return null;

  const renderGroup = (label: string, items: ActionItem[], className?: string) => {
    if (items.length === 0) return null;
    return (
      <div className="timeline-group">
        <div className={`timeline-group-label ${className || ''}`}>{label}</div>
        {items
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          .map(item => {
            const owner = team.find(m => m.id === item.ownerId);
            return (
              <div key={item.id} className="timeline-task">
                <div
                  className="action-checkbox"
                  onClick={() => onToggle(item.id)}
                  title="Mark as done"
                />
                <span className="timeline-task-title">{item.title}</span>
                {owner && (
                  <span
                    className="action-owner-badge"
                    style={{ background: owner.color }}
                  >
                    {owner.name}
                  </span>
                )}
                <span className={`timeline-task-date ${className || ''}`}>
                  {formatShortDate(item.dueDate)}
                </span>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="dash-timeline">
      <div className="dash-timeline-header">Upcoming</div>
      {renderGroup('Overdue', overdue, 'overdue')}
      {renderGroup('Today', dueToday, 'today')}
      {renderGroup('This week', thisWeek)}
      {renderGroup('Later', later)}
    </div>
  );
}
