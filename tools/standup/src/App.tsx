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

  const handleAddTranscriptToNotes = useCallback(
    (text: string) => {
      setStandup(prev => {
        const speakers = [...prev.speakers];
        const speaker = { ...speakers[activeSpeaker] };
        speaker.focus = [...speaker.focus, text];
        speakers[activeSpeaker] = speaker;
        return { ...prev, speakers };
      });
      showToast(`Added to ${TEAM[activeSpeaker].name}'s focus`);
    },
    [activeSpeaker, showToast],
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
      {/* ─── IDLE: Landing ─────────────────────────────────────────── */}
      {phase === 'idle' && (
        <div className="landing">
          <div className="landing-hero">
            <div className="landing-brand">sola standup</div>

            <div className="landing-date">
              <div className="landing-day">{dayName}</div>
              <div className="landing-full-date">{dateStr}</div>
            </div>

            <div className="landing-tagline">
              {formatTime(TIMER_DURATION)} &middot; {TEAM.length} speakers &middot; Full alignment
            </div>

            <div className="landing-team">
              {TEAM.map(member => (
                <div key={member.id} className="landing-member">
                  <div className="landing-avatar" style={{ background: member.color }}>
                    {member.name.charAt(0)}
                  </div>
                  <span className="landing-member-name">{member.name}</span>
                  <span className="landing-member-role">{member.role}</span>
                </div>
              ))}
            </div>

            {hasDraftContent ? (
              <button className="landing-cta" onClick={resumeStandup}>
                Resume Standup
              </button>
            ) : (
              <button className="landing-cta" onClick={beginStandup}>
                Begin Standup
              </button>
            )}
          </div>

          {/* Open tasks preview */}
          {openTasks.length > 0 && (
            <div className="landing-tasks">
              <div className="landing-tasks-header">
                {openTasks.length} open task{openTasks.length !== 1 ? 's' : ''}
              </div>
              <div className="landing-tasks-list">
                {openTasks
                  .sort((a, b) => {
                    const p = { high: 0, medium: 1, low: 2 };
                    return p[a.priority] - p[b.priority];
                  })
                  .slice(0, 6)
                  .map(task => {
                    const owner = TEAM.find(m => m.id === task.ownerId);
                    return (
                      <div key={task.id} className="landing-task-item">
                        <span
                          className="landing-task-dot"
                          style={{ background: owner?.color }}
                        />
                        <span className="landing-task-title">{task.title}</span>
                        <span className="landing-task-owner">{owner?.name}</span>
                      </div>
                    );
                  })}
                {openTasks.length > 6 && (
                  <div className="landing-task-more">
                    +{openTasks.length - 6} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="landing-footer">
            <button className="btn-ghost" onClick={() => setPhase('tracker')}>
              Tracker
            </button>
            <button className="btn-ghost" onClick={() => setPhase('history')}>
              History
            </button>
            <button className="btn-ghost" onClick={() => setShowHelp(true)}>
              Help
            </button>
          </div>
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
              onAddToNotes={handleAddTranscriptToNotes}
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
