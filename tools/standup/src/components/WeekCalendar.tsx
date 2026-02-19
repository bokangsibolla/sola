import React from 'react';
import { ActionItem, TeamMember } from '../types';

interface WeekCalendarProps {
  tasks: ActionItem[];
  team: TeamMember[];
  onToggle: (id: string) => void;
}

function getWeekDays(): { label: string; short: string; date: string; isToday: boolean; isPast: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Go to Monday

  const days = [];
  const todayStr = today.toISOString().slice(0, 10);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      short: d.getDate().toString(),
      date: dateStr,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
    });
  }

  return days;
}

export default function WeekCalendar({ tasks, team, onToggle }: WeekCalendarProps) {
  const days = getWeekDays();
  const openTasks = tasks.filter(t => !t.completed && t.dueDate);

  // Group tasks by date
  const tasksByDate: Record<string, ActionItem[]> = {};
  for (const task of openTasks) {
    if (!tasksByDate[task.dueDate]) tasksByDate[task.dueDate] = [];
    tasksByDate[task.dueDate].push(task);
  }

  // Count overdue (before this week)
  const weekStart = days[0].date;
  const overdueTasks = openTasks.filter(t => t.dueDate < weekStart);

  return (
    <div className="week-calendar">
      <div className="week-calendar-header">
        <span className="week-calendar-title">This week</span>
        {overdueTasks.length > 0 && (
          <span className="week-calendar-overdue">
            {overdueTasks.length} overdue
          </span>
        )}
      </div>
      <div className="week-calendar-grid">
        {days.map(day => {
          const dayTasks = tasksByDate[day.date] || [];
          return (
            <div
              key={day.date}
              className={`week-day ${day.isToday ? 'today' : ''} ${day.isPast ? 'past' : ''}`}
            >
              <div className="week-day-label">{day.label}</div>
              <div className={`week-day-number ${day.isToday ? 'today' : ''}`}>
                {day.short}
              </div>
              <div className="week-day-tasks">
                {dayTasks.slice(0, 3).map(task => {
                  const owner = team.find(m => m.id === task.ownerId);
                  return (
                    <div
                      key={task.id}
                      className={`week-day-task ${task.priority}`}
                      title={`${task.title} (${owner?.name || ''})`}
                      onClick={() => onToggle(task.id)}
                    >
                      <span
                        className="week-day-task-dot"
                        style={{ background: owner?.color || '#999' }}
                      />
                      <span className="week-day-task-text">{task.title}</span>
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="week-day-more">+{dayTasks.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
