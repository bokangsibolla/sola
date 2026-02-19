import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TEAM } from './config';
import { Standup, SpeakerNotes, ActionItem, ViewMode } from './types';
import {
  saveDraft,
  loadDraft,
  archiveStandup,
  getHistory,
  getLastStandup,
  getAllTasks,
  saveTasks,
} from './storage';
import { generateId } from './utils';
import Timer from './components/Timer';
import SpeakerSection from './components/SpeakerSection';
import ActionItems from './components/ActionItems';
import Recorder from './components/Recorder';
import Summary from './components/Summary';
import History from './components/History';
import Tracker from './components/Tracker';
import HelpModal from './components/HelpModal';

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

  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('standup');
  const [showHelp, setShowHelp] = useState(false);
  const [tasks, setTasks] = useState<ActionItem[]>(getAllTasks);
  const [toast, setToast] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const previousStandup = useRef<Standup | null>(getLastStandup());
  const saveTimeout = useRef<number | null>(null);

  // Auto-save standup draft (debounced)
  useEffect(() => {
    if (saveTimeout.current !== null) clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      saveDraft(standup);
    }, 500);
    return () => {
      if (saveTimeout.current !== null) clearTimeout(saveTimeout.current);
    };
  }, [standup]);

  // Save tasks whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Toast helper
  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Speaker notes update
  const updateSpeakerNotes = useCallback((index: number, notes: SpeakerNotes) => {
    setStandup(prev => {
      const speakers = [...prev.speakers];
      speakers[index] = notes;
      return { ...prev, speakers };
    });
  }, []);

  // Task management
  const addTask = useCallback((task: ActionItem) => {
    setTasks(prev => [...prev, task]);
    showToast('Task added');
  }, [showToast]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Convert a bullet to a task
  const handleConvertToTask = useCallback(
    (title: string, speakerIndex: number) => {
      const member = TEAM[speakerIndex];
      const newTask: ActionItem = {
        id: generateId(),
        title,
        ownerId: member.id,
        priority: 'medium',
        dueDate: '',
        completed: false,
        createdAt: new Date().toISOString(),
        standupId: standup.id,
      };
      setTasks(prev => [...prev, newTask]);
      showToast(`Task assigned to ${member.name}`);
    },
    [standup.id, showToast],
  );

  // Add transcript line to active speaker's focus
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

  // Generate summary
  const handleGenerateSummary = useCallback(() => {
    setStandup(prev => ({ ...prev, isComplete: true }));
    setViewMode('summary');
    setIsRecording(false);
  }, []);

  // Start new standup
  const handleNewStandup = useCallback(() => {
    archiveStandup(standup);
    previousStandup.current = standup;
    const newStandup = createEmptyStandup();
    setStandup(newStandup);
    setActiveSpeaker(0);
    setViewMode('standup');
    setIsRecording(false);
    showToast('Previous standup archived');
  }, [standup, showToast]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">SOLA STANDUP</div>
          {isRecording && <span className="recording-badge">REC</span>}
        </div>
        <div className="header-right">
          {viewMode === 'standup' && (
            <>
              <button
                className="btn-ghost"
                onClick={() => setViewMode('tracker')}
              >
                Tracker
              </button>
              <button
                className="btn-ghost"
                onClick={() => setViewMode('history')}
              >
                History
              </button>
            </>
          )}
          {viewMode !== 'standup' && (
            <button className="btn-ghost" onClick={() => setViewMode('standup')}>
              ← Back
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={() => setShowHelp(true)}
            style={{ fontWeight: 600 }}
          >
            ?
          </button>
        </div>
      </header>

      {/* Main standup view */}
      {viewMode === 'standup' && (
        <main>
          <Timer activeSpeaker={activeSpeaker} />

          {/* Recorder */}
          <Recorder
            isRecording={isRecording}
            onToggle={() => setIsRecording(prev => !prev)}
            onAddToNotes={handleAddTranscriptToNotes}
            activeSpeakerName={TEAM[activeSpeaker].name}
          />

          <div className="speakers">
            {TEAM.map((member, i) => (
              <SpeakerSection
                key={member.id}
                member={member}
                index={i}
                notes={standup.speakers[i]}
                isActive={activeSpeaker === i}
                previousFocus={previousStandup.current?.speakers.find(
                  s => s.memberId === member.id,
                )?.focus}
                onNotesChange={notes => updateSpeakerNotes(i, notes)}
                onActivate={() => setActiveSpeaker(i)}
                onConvertToTask={title => handleConvertToTask(title, i)}
                onNext={() => setActiveSpeaker(Math.min(i + 1, TEAM.length - 1))}
                isLast={i === TEAM.length - 1}
              />
            ))}
          </div>

          <ActionItems
            tasks={tasks}
            team={TEAM}
            standupId={standup.id}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />

          <div className="summary-actions">
            <button className="btn-primary" onClick={handleGenerateSummary}>
              Generate Summary
            </button>
          </div>
        </main>
      )}

      {/* Summary view */}
      {viewMode === 'summary' && (
        <Summary
          standup={standup}
          tasks={tasks}
          team={TEAM}
          onBack={() => setViewMode('standup')}
          onNewStandup={handleNewStandup}
        />
      )}

      {/* History view */}
      {viewMode === 'history' && (
        <History
          standups={getHistory()}
          team={TEAM}
          onBack={() => setViewMode('standup')}
        />
      )}

      {/* Tracker view */}
      {viewMode === 'tracker' && (
        <Tracker
          tasks={tasks}
          team={TEAM}
          onBack={() => setViewMode('standup')}
          onUncomplete={toggleTask}
        />
      )}

      {/* Help modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Toast */}
      <div className={`toast ${toast ? 'visible' : ''}`}>
        {toast}
      </div>
    </div>
  );
}
