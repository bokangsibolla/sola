import React, { useState, useCallback } from 'react';
import { ActionItem, TeamMember } from '../types';
import { generateId } from '../utils';

interface ActionItemsProps {
  tasks: ActionItem[];
  team: TeamMember[];
  standupId: string;
  onAdd: (item: ActionItem) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ActionItems({
  tasks,
  team,
  standupId,
  onAdd,
  onToggle,
  onDelete,
}: ActionItemsProps) {
  const [title, setTitle] = useState('');
  const [ownerId, setOwnerId] = useState(team[0]?.id || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const openTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleAdd = useCallback(() => {
    if (!title.trim()) return;
    onAdd({
      id: generateId(),
      title: title.trim(),
      ownerId,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      standupId,
    });
    setTitle('');
    setDueDate('');
  }, [title, ownerId, priority, dueDate, standupId, onAdd]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const today = new Date().toISOString().slice(0, 10);

  const filteredOpen = filter === 'all'
    ? openTasks
    : openTasks.filter(item => item.ownerId === filter);

  const sortedOpen = [...filteredOpen].sort((a, b) => {
    const prio = { high: 0, medium: 1, low: 2 };
    if (prio[a.priority] !== prio[b.priority]) return prio[a.priority] - prio[b.priority];
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const renderItem = (item: ActionItem) => {
    const owner = team.find(m => m.id === item.ownerId);
    const isOverdue = item.dueDate && item.dueDate < today && !item.completed;

    return (
      <div
        key={item.id}
        className={`action-item ${item.completed ? 'completed' : ''}`}
      >
        <div
          className={`action-checkbox ${item.completed ? 'checked' : ''}`}
          onClick={() => onToggle(item.id)}
          title={item.completed ? 'Mark as incomplete' : 'Mark as done'}
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
          <span className={`action-priority ${item.priority}`}>
            {item.priority}
          </span>
          {item.dueDate && (
            <span className={`action-due ${isOverdue ? 'overdue' : ''}`}>
              {item.dueDate}
            </span>
          )}
        </div>
        <button className="action-delete" onClick={() => onDelete(item.id)}>
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="action-items-section">
      <div className="section-divider">
        <span className="section-divider-text">
          Action Items · {openTasks.length} open
          {completedTasks.length > 0 && ` · ${completedTasks.length} done`}
        </span>
      </div>

      {/* Quick add */}
      <div className="action-add-row">
        <div className="action-add-field title">
          <label>Task</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
          />
        </div>
        <div className="action-add-field">
          <label>Owner</label>
          <select value={ownerId} onChange={e => setOwnerId(e.target.value)}>
            {team.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="action-add-field">
          <label>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
            <option value="high">High</option>
            <option value="medium">Med</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="action-add-field">
          <label>Due</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        <button className="btn-primary btn-small" onClick={handleAdd}>
          Add
        </button>
      </div>

      {/* Filter chips */}
      {openTasks.length > 0 && (
        <div className="action-filter-row">
          <button
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {team.map(m => {
            const count = openTasks.filter(t => t.ownerId === m.id).length;
            if (count === 0) return null;
            return (
              <button
                key={m.id}
                className={`filter-chip ${filter === m.id ? 'active' : ''}`}
                onClick={() => setFilter(m.id)}
              >
                {m.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Open tasks */}
      {sortedOpen.length === 0 ? (
        <div className="action-empty">
          {openTasks.length === 0
            ? 'No open tasks. Add one above or convert a bullet point.'
            : 'No tasks for this filter.'}
        </div>
      ) : (
        <div className="action-list">
          {sortedOpen.map(renderItem)}
        </div>
      )}

      {/* Completed tasks (collapsible) */}
      {completedTasks.length > 0 && (
        <div className="completed-section">
          <button
            className="completed-toggle"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <span className="completed-toggle-icon">
              {showCompleted ? '▾' : '▸'}
            </span>
            {completedTasks.length} completed
          </button>
          {showCompleted && (
            <div className="action-list">
              {completedTasks.map(renderItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
