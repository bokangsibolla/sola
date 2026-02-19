import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { SpeechRecognitionEvent } from '../types';

interface RecorderProps {
  isRecording: boolean;
  onToggle: () => void;
  onAddToCategory: (text: string, category: 'wins' | 'focus' | 'blockers') => void;
  onConvertToTask: (text: string) => void;
  activeSpeakerName: string;
}

function getSpeechRecognition(): (new () => any) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function Recorder({
  isRecording,
  onToggle,
  onAddToCategory,
  onConvertToTask,
  activeSpeakerName,
}: RecorderProps) {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [interim, setInterim] = useState('');
  const [supported] = useState(() => !!getSpeechRecognition());
  const recognitionRef = useRef<any>(null);

  const startRecognition = useCallback(() => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) {
            setTranscript(prev => [...prev, text]);
          }
          setInterim('');
        } else {
          interimText += result[0].transcript;
        }
      }
      if (interimText) {
        setInterim(interimText);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      console.warn('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Already started or stopped
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;
      ref.stop();
    }
    setInterim('');
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecognition();
    } else {
      stopRecognition();
    }
    return () => stopRecognition();
  }, [isRecording, startRecognition, stopRecognition]);

  const handleAddLine = (index: number, category: 'wins' | 'focus' | 'blockers') => {
    const line = transcript[index];
    onAddToCategory(line, category);
    setTranscript(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvertLine = (index: number) => {
    const line = transcript[index];
    onConvertToTask(line);
    setTranscript(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAll = () => {
    transcript.forEach(line => onAddToCategory(line, 'focus'));
    setTranscript([]);
  };

  if (!supported) {
    return null;
  }

  return (
    <div className="recorder-section">
      <button
        className={`recorder-toggle ${isRecording ? 'active' : ''}`}
        onClick={onToggle}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <span className="recorder-icon">{isRecording ? '⏸' : '●'}</span>
        <span className="recorder-label">
          {isRecording ? `Recording ${activeSpeakerName}...` : `Record ${activeSpeakerName}`}
        </span>
      </button>

      {(isRecording || transcript.length > 0) && (
        <div className="recorder-panel">
          <div className="recorder-panel-header">
            <span className="recorder-panel-title">
              Transcript
              {isRecording && <span className="recorder-live-dot" />}
            </span>
            {transcript.length > 0 && (
              <div className="recorder-panel-actions">
                <button className="btn-ghost btn-small" onClick={handleAddAll}>
                  All → Focus
                </button>
                <button className="btn-ghost btn-small" onClick={() => setTranscript([])}>
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="recorder-lines">
            {transcript.length === 0 && !interim && isRecording && (
              <div className="recorder-empty">
                Listening... speak and words appear here. Then categorize each line.
              </div>
            )}

            {transcript.map((line, i) => (
              <div key={i} className="recorder-line">
                <span className="recorder-line-text">{line}</span>
                <div className="recorder-line-cats">
                  <button
                    className="cat-btn win"
                    onClick={() => handleAddLine(i, 'wins')}
                    title="Add as win"
                  >W</button>
                  <button
                    className="cat-btn focus"
                    onClick={() => handleAddLine(i, 'focus')}
                    title="Add as today's focus"
                  >F</button>
                  <button
                    className="cat-btn blocker"
                    onClick={() => handleAddLine(i, 'blockers')}
                    title="Add as blocker"
                  >B</button>
                  <button
                    className="cat-btn task"
                    onClick={() => handleConvertLine(i)}
                    title="Create task"
                  >T</button>
                </div>
              </div>
            ))}

            {interim && (
              <div className="recorder-line interim">
                <span className="recorder-line-text">{interim}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
