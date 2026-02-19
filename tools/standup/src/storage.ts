import { Standup, ActionItem } from './types';
import { SEED_TASKS } from './config';

const DRAFT_KEY = 'sola-standup-draft';
const HISTORY_KEY = 'sola-standup-history';
const TASKS_KEY = 'sola-standup-tasks';

// ─── Draft (current standup) ─────────────────────────────────────────

export function saveDraft(standup: Standup): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(standup));
  } catch {
    // localStorage full — silently fail
  }
}

export function loadDraft(): Standup | null {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

// ─── History (archived standups) ─────────────────────────────────────

export function archiveStandup(standup: Standup): void {
  const history = getHistory();
  history.unshift({ ...standup, isComplete: true });
  // Keep last 30 standups
  if (history.length > 30) history.length = 30;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage full
  }
  clearDraft();
}

export function getHistory(): Standup[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getLastStandup(): Standup | null {
  const history = getHistory();
  return history.length > 0 ? history[0] : null;
}

// ─── Tasks (persistent action items) ────────────────────────────────

export function getAllTasks(): ActionItem[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    if (data) return JSON.parse(data);
    // First load — seed with initial tasks
    saveTasks(SEED_TASKS);
    return [...SEED_TASKS];
  } catch {
    return [...SEED_TASKS];
  }
}

export function saveTasks(tasks: ActionItem[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // localStorage full
  }
}
