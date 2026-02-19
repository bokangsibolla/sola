import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TEAM, TIMER_DURATION, SPEAKER_TIME, ALERT_TIMES } from './config';
import { Standup, SpeakerNotes, ActionItem } from './types';
import {
  saveDraft,
  loadDraft,
  archiveStandup,
  getHistory,
  getLastStandup,
  getAllTasks,
  saveTasks,
} from './storage';
import { generateId, formatTime, playAlert } from './utils';
import SpeakerSection from './components/SpeakerSection';
import ActionItems from './components/ActionItems';
import Recorder from './components/Recorder';
import Summary from './components/Summary';
import History from './components/History';
import Tracker from './components/Tracker';
import Timeline from './components/Timeline';
import WeekCalendar from './components/WeekCalendar';
import HelpModal from './components/HelpModal';

type Phase = 'idle' | 'active' | 'wrapup' | 'summary' | 'history' | 'tracker';

function createEmptyStandup(): Standup {
  return {
    id: generateId(),
    date: new Date().toISOString().slice(0, 10),
    speakers: TEAM.map(m => ({
      memberId: m.id,
      wins: [],
      focus: [],
      blockers: [],
      decisions: [],
      links: [],
    })),
    actionItems: [],
    isComplete: false,
  };
}

export default function App() {
  const [standup, setStandup] = useState<Standup>(() => {
    const draft = loadDraft();
    const today = new Date().toISOString().slice(0, 10);
    if (draft && draft.date !== today) {
      archiveStandup(draft);
      return createEmptyStandup();
    }
    return draft || createEmptyStandup();
  });

  const [phase, setPhase] = useState<Phase>('idle');
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const [tasks, setTasks] = useState<ActionItem[]>(getAllTasks);
  const [isRecording, setIsRecording] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Timer state (managed here for full layout control)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const alertedRef = useRef<Set<number>>(new Set());

  const previousStandup = useRef<Standup | null>(getLastStandup());
  const saveTimeout = useRef<number | null>(null);

  // Detect if there's an in-progress draft
  const hasDraftContent = standup.speakers.some(
    s => s.wins.length > 0 || s.focus.length > 0 || s.blockers.length > 0,
  );

  // ─── Timer logic ───────────────────────────────────────────────────

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          // Check alerts
          if (ALERT_TIMES.includes(next) && !alertedRef.current.has(next)) {
            alertedRef.current.add(next);
            if (next === 0) playAlert('end');
            else if (next <= 120) playAlert('warning');
            else playAlert('soft');
          }
          if (next <= 0) {
            setTimerRunning(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning, timeLeft]);

  // ─── Auto-save ─────────────────────────────────────────────────────

  useEffect(() => {
    if (saveTimeout.current !== null) clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => saveDraft(standup), 500);
    return () => {
      if (saveTimeout.current !== null) clearTimeout(saveTimeout.current);
    };
  }, [standup]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // ─── Helpers ───────────────────────────────────────────────────────

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const updateSpeakerNotes = useCallback((index: number, notes: SpeakerNotes) => {
    setStandup(prev => {
      const speakers = [...prev.speakers];
      speakers[index] = notes;
      return { ...prev, speakers };
    });
  }, []);

  const addTask = useCallback((task: ActionItem) => {
    setTasks(prev => [...prev, task]);
    showToast('Task added');
  }, [showToast]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
          : t,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<ActionItem>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const handleConvertToTask = useCallback(
    (title: string, speakerIndex: number) => {
      const member = TEAM[speakerIndex];
      setTasks(prev => [
        ...prev,
        {
          id: generateId(),
          title,
          ownerId: member.id,
          priority: 'medium' as const,
          dueDate: '',
          completed: false,
          createdAt: new Date().toISOString(),
          standupId: standup.id,
        },
      ]);
      showToast(`Task → ${member.name}`);
    },
    [standup.id, showToast],
  );

  const handleAddToCategory = useCallback(
    (text: string, category: 'wins' | 'focus' | 'blockers') => {
      setStandup(prev => {
        const speakers = [...prev.speakers];
        const speaker = { ...speakers[activeSpeaker] };
        speaker[category] = [...speaker[category], text];
        speakers[activeSpeaker] = speaker;
        return { ...prev, speakers };
      });
      const labels = { wins: 'wins', focus: 'focus', blockers: 'blockers' };
      showToast(`Added to ${TEAM[activeSpeaker].name}'s ${labels[category]}`);
    },
    [activeSpeaker, showToast],
  );

  const handleTranscriptToTask = useCallback(
    (text: string) => {
      const member = TEAM[activeSpeaker];
      setTasks(prev => [
        ...prev,
        {
          id: generateId(),
          title: text,
          ownerId: member.id,
          priority: 'medium' as const,
          dueDate: '',
          completed: false,
          createdAt: new Date().toISOString(),
          standupId: standup.id,
        },
      ]);
      showToast(`Task → ${member.name}`);
    },
    [activeSpeaker, standup.id, showToast],
  );

  // ─── Phase transitions ────────────────────────────────────────────

  const beginStandup = useCallback(() => {
    setPhase('active');
    setActiveSpeaker(0);
    setTimeLeft(TIMER_DURATION);
    setTimerRunning(true);
    alertedRef.current = new Set();
  }, []);

  const resumeStandup = useCallback(() => {
    setPhase('active');
    // Find first speaker without content
    const idx = standup.speakers.findIndex(
      s => s.wins.length === 0 && s.focus.length === 0 && s.blockers.length === 0,
    );
    setActiveSpeaker(idx >= 0 ? idx : 0);
    setTimerRunning(true);
  }, [standup.speakers]);

  const nextSpeaker = useCallback(() => {
    if (activeSpeaker < TEAM.length - 1) {
      setActiveSpeaker(prev => prev + 1);
    } else {
      setPhase('wrapup');
      setTimerRunning(false);
      setIsRecording(false);
    }
  }, [activeSpeaker]);

  const prevSpeaker = useCallback(() => {
    if (activeSpeaker > 0) setActiveSpeaker(prev => prev - 1);
  }, [activeSpeaker]);

  const handleGenerateSummary = useCallback(() => {
    setStandup(prev => ({ ...prev, isComplete: true }));
    setPhase('summary');
    setIsRecording(false);
    setTimerRunning(false);
  }, []);

  const handleNewStandup = useCallback(() => {
    archiveStandup(standup);
    previousStandup.current = standup;
    setStandup(createEmptyStandup());
    setActiveSpeaker(0);
    setPhase('idle');
    setTimeLeft(TIMER_DURATION);
    setIsRecording(false);
    showToast('Standup archived');
  }, [standup, showToast]);

  // ─── Timer derived state ──────────────────────────────────────────

  const elapsed = TIMER_DURATION - timeLeft;
  const progress = (elapsed / TIMER_DURATION) * 100;
  const timerColorClass =
    timeLeft === 0 ? 'ended' : timeLeft <= 120 ? 'urgent' : timeLeft <= 300 ? 'warning' : '';

  // ─── Render ────────────────────────────────────────────────────────

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const openTasks = tasks.filter(t => !t.completed);

  return (
    <div className="app">
      {/* ─── IDLE: Dashboard ────────────────────────────────────────── */}
      {phase === 'idle' && (
        <div className="dashboard">
          <div className="dash-header">
            <div className="dash-brand">sola standup</div>
            <div className="dash-header-right">
              <button className="btn-ghost btn-small" onClick={() => setPhase('tracker')}>
                Tracker
              </button>
              <button className="btn-ghost btn-small" onClick={() => setPhase('history')}>
                History
              </button>
              <button className="btn-ghost btn-small" onClick={() => setShowHelp(true)}>
                ?
              </button>
            </div>
          </div>

          <div className="dash-launcher">
            <div className="dash-launcher-left">
              <div className="dash-launcher-date">{dayName}, {dateStr}</div>
              <div className="dash-launcher-title">
                {hasDraftContent ? 'Standup in progress' : 'Daily standup'}
              </div>
              <div className="dash-launcher-meta">
                <div className="dash-launcher-team">
                  {TEAM.map(m => (
                    <div
                      key={m.id}
                      className="dash-launcher-avatar"
                      style={{ background: m.color }}
                      title={`${m.name} — ${m.role}`}
                    >
                      {m.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="dash-launcher-info">
                  {formatTime(TIMER_DURATION)} &middot; {TEAM.length} speakers
                </span>
              </div>
            </div>
            <button className="dash-cta" onClick={hasDraftContent ? resumeStandup : beginStandup}>
              {hasDraftContent ? 'Resume' : 'Begin'} →
            </button>
          </div>

          {/* Yesterday's standup summary */}
          {previousStandup.current && previousStandup.current.speakers.some(
            s => s.wins.length > 0 || s.focus.length > 0 || s.blockers.length > 0,
          ) && (
            <div className="dash-yesterday">
              <div className="dash-yesterday-header">Yesterday's focus</div>
              {previousStandup.current.speakers.map(speaker => {
                const member = TEAM.find(m => m.id === speaker.memberId);
                if (!member) return null;
                const items = [...speaker.focus, ...speaker.wins].slice(0, 3);
                if (items.length === 0) return null;
                return (
                  <div key={speaker.memberId} className="dash-yesterday-item">
                    <span
                      className="dash-yesterday-dot"
                      style={{ background: member.color }}
                    />
                    <span className="dash-yesterday-name">{member.name}</span>
                    <span className="dash-yesterday-text">{items.join(' · ')}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Week calendar — visual accountability */}
          <WeekCalendar
            tasks={tasks}
            team={TEAM}
            onToggle={toggleTask}
          />

          {/* Upcoming timeline — accountability view */}
          <Timeline
            tasks={tasks}
            team={TEAM}
            onToggle={toggleTask}
          />

          {/* Full task board */}
          <ActionItems
            tasks={tasks}
            team={TEAM}
            standupId={standup.id}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        </div>
      )}

      {/* ─── ACTIVE: Running standup ───────────────────────────────── */}
      {phase === 'active' && (
        <>
          <header className="active-bar">
            <button
              className="btn-ghost"
              onClick={() => {
                setTimerRunning(false);
                setPhase('idle');
              }}
            >
              ← End
            </button>
            <div className="active-timer-group">
              {isRecording && <span className="recording-badge">REC</span>}
              <span className={`active-timer ${timerColorClass}`}>
                {formatTime(timeLeft)}
              </span>
              {timerRunning ? (
                <button
                  className="btn-ghost btn-small"
                  onClick={() => setTimerRunning(false)}
                >
                  Pause
                </button>
              ) : timeLeft > 0 ? (
                <button
                  className="btn-ghost btn-small"
                  onClick={() => setTimerRunning(true)}
                >
                  Resume
                </button>
              ) : null}
            </div>
            <button
              className="btn-ghost"
              onClick={() => setShowHelp(true)}
              style={{ fontWeight: 600 }}
            >
              ?
            </button>
          </header>

          <div className="active-progress">
            <div
              className={`active-progress-fill ${timerColorClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Speaker navigation */}
          <div className="speaker-nav">
            {TEAM.map((member, i) => {
              const state =
                i === activeSpeaker ? 'active' : i < activeSpeaker ? 'done' : 'upcoming';
              return (
                <button
                  key={member.id}
                  className={`speaker-nav-item ${state}`}
                  onClick={() => setActiveSpeaker(i)}
                >
                  <div
                    className="speaker-nav-avatar"
                    style={{
                      background: state === 'active' ? member.color : undefined,
                      borderColor: member.color,
                    }}
                  >
                    {state === 'done' ? '✓' : member.name.charAt(0)}
                  </div>
                  <span className="speaker-nav-name">{member.name}</span>
                  <span className="speaker-nav-role">{member.role}</span>
                </button>
              );
            })}
          </div>

          {/* Speaker heading */}
          <div className="speaker-heading">
            <div className="speaker-heading-bar" style={{ background: TEAM[activeSpeaker].color }} />
            <div>
              <div className="speaker-heading-name">{TEAM[activeSpeaker].name}</div>
              <div className="speaker-heading-role">{TEAM[activeSpeaker].role}</div>
            </div>
          </div>

          {/* Recorder */}
          <div className="active-recorder">
            <Recorder
              isRecording={isRecording}
              onToggle={() => setIsRecording(prev => !prev)}
              onAddToCategory={handleAddToCategory}
              onConvertToTask={handleTranscriptToTask}
              activeSpeakerName={TEAM[activeSpeaker].name}
            />
          </div>

          {/* Speaker content */}
          <div className="active-content">
            <SpeakerSection
              key={TEAM[activeSpeaker].id}
              member={TEAM[activeSpeaker]}
              notes={standup.speakers[activeSpeaker]}
              previousFocus={
                previousStandup.current?.speakers.find(
                  s => s.memberId === TEAM[activeSpeaker].id,
                )?.focus
              }
              onNotesChange={notes => updateSpeakerNotes(activeSpeaker, notes)}
              onConvertToTask={title => handleConvertToTask(title, activeSpeaker)}
            />
          </div>

          {/* Bottom navigation */}
          <div className="active-nav">
            <button
              className="btn-ghost"
              onClick={prevSpeaker}
              style={{ visibility: activeSpeaker === 0 ? 'hidden' : 'visible' }}
            >
              ← {activeSpeaker > 0 ? TEAM[activeSpeaker - 1].name : ''}
            </button>
            <span className="active-nav-count">
              {activeSpeaker + 1} / {TEAM.length}
            </span>
            <button className="btn-primary" onClick={nextSpeaker}>
              {activeSpeaker < TEAM.length - 1
                ? `${TEAM[activeSpeaker + 1].name} →`
                : 'Finish →'}
            </button>
          </div>
        </>
      )}

      {/* ─── WRAPUP: Post-standup ─────────────────────────────────── */}
      {phase === 'wrapup' && (
        <div className="wrapup">
          <div className="wrapup-header">
            <div className="wrapup-icon">✓</div>
            <div className="wrapup-title">Standup Complete</div>
            <div className="wrapup-subtitle">
              Capture action items, then generate your summary.
            </div>
          </div>

          <ActionItems
            tasks={tasks}
            team={TEAM}
            standupId={standup.id}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />

          <div className="wrapup-actions">
            <button className="btn-ghost" onClick={() => setPhase('active')}>
              ← Back to standup
            </button>
            <button className="btn-primary" onClick={handleGenerateSummary}>
              Generate Summary
            </button>
          </div>
        </div>
      )}

      {/* ─── SUMMARY ──────────────────────────────────────────────── */}
      {phase === 'summary' && (
        <Summary
          standup={standup}
          tasks={tasks}
          team={TEAM}
          onBack={() => setPhase('wrapup')}
          onNewStandup={handleNewStandup}
        />
      )}

      {/* ─── HISTORY ──────────────────────────────────────────────── */}
      {phase === 'history' && (
        <History
          standups={getHistory()}
          team={TEAM}
          onBack={() => setPhase('idle')}
        />
      )}

      {/* ─── TRACKER ──────────────────────────────────────────────── */}
      {phase === 'tracker' && (
        <Tracker
          tasks={tasks}
          team={TEAM}
          onBack={() => setPhase('idle')}
          onUncomplete={toggleTask}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <div className={`toast ${toast ? 'visible' : ''}`}>{toast}</div>
    </div>
  );
}
