import React, { useState, useRef, useCallback } from 'react';
import { TeamMember, SpeakerNotes } from '../types';
import { SECTIONS } from '../config';

interface SpeakerSectionProps {
  member: TeamMember;
  notes: SpeakerNotes;
  previousFocus?: string[];
  onNotesChange: (notes: SpeakerNotes) => void;
  onConvertToTask: (title: string) => void;
}

export default function SpeakerSection({
  member,
  notes,
  previousFocus,
  onNotesChange,
  onConvertToTask,
}: SpeakerSectionProps) {
  const [showOptional, setShowOptional] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addItem = useCallback(
    (key: keyof SpeakerNotes, value: string) => {
      if (!value.trim()) return;
      const current = notes[key] as string[];
      onNotesChange({ ...notes, [key]: [...current, value.trim()] });
    },
    [notes, onNotesChange],
  );

  const removeItem = useCallback(
    (key: keyof SpeakerNotes, index: number) => {
      const current = notes[key] as string[];
      onNotesChange({ ...notes, [key]: current.filter((_, i) => i !== index) });
    },
    [notes, onNotesChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: keyof SpeakerNotes) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget;
      addItem(key, input.value);
      input.value = '';
    }
  };

  const hasOptionalContent = notes.decisions.length > 0 || notes.links.length > 0;
  const visibleSections = SECTIONS.filter(
    s => !s.optional || showOptional || hasOptionalContent,
  );

  return (
    <div className="speaker-content">
      {/* Carry-forward from previous standup */}
      {previousFocus && previousFocus.length > 0 && (
        <div className="carry-forward">
          <div className="carry-forward-title">Committed last standup</div>
          {previousFocus.map((item, i) => (
            <div key={i} className="carry-forward-item">
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Note sections */}
      {visibleSections.map(section => {
        const items = notes[section.key] as string[];

        return (
          <div className="note-section" key={section.key}>
            <div className="note-label">{section.label}</div>
            <div className="note-items">
              {items.map((item, i) => (
                <div className="note-item" key={i}>
                  <div className="note-item-bullet" />
                  <span className="note-item-text">{item}</span>
                  <div className="note-item-actions">
                    <button
                      className="note-item-btn task"
                      title="Convert to task"
                      onClick={() => onConvertToTask(item)}
                    >
                      +
                    </button>
                    <button
                      className="note-item-btn"
                      title="Remove"
                      onClick={() => removeItem(section.key, i)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="note-input-row">
                <div className="note-item-bullet" style={{ opacity: 0.3 }} />
                <input
                  ref={el => { inputRefs.current[section.key] = el; }}
                  className="note-input"
                  placeholder={section.placeholder}
                  onKeyDown={e => handleKeyDown(e, section.key)}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Show optional fields toggle */}
      {!showOptional && !hasOptionalContent && (
        <button
          className="more-fields-btn"
          onClick={() => setShowOptional(true)}
        >
          + Decisions & Links
        </button>
      )}
    </div>
  );
}
