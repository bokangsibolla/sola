import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { SpeechRecognitionEvent } from '../types';

interface RecorderProps {
  isRecording: boolean;
  onToggle: () => void;
  onAddToNotes: (text: string) => void;
  activeSpeakerName: string;
}

// Get the SpeechRecognition constructor (Chrome/Edge)
function getSpeechRecognition(): (new () => any) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function Recorder({
  isRecording,
  onToggle,
  onAddToNotes,
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
      if (event.error === 'no-speech') return; // Normal — just silence
      console.warn('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Auto-restart if still recording
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

  const handleAddLine = (index: number) => {
    const line = transcript[index];
    onAddToNotes(line);
    setTranscript(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAll = () => {
    transcript.forEach(line => onAddToNotes(line));
    setTranscript([]);
  };

  if (!supported) {
    return null; // Don't show anything if browser doesn't support it
  }

  return (
    <div className="recorder-section">
      {/* Mic toggle button */}
      <button
        className={`recorder-toggle ${isRecording ? 'active' : ''}`}
        onClick={onToggle}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <span className="recorder-icon">{isRecording ? '⏸' : '●'}</span>
        <span className="recorder-label">
          {isRecording ? 'Recording' : 'Record'}
        </span>
      </button>

      {/* Transcript panel */}
      {(isRecording || transcript.length > 0) && (
        <div className="recorder-panel">
          <div className="recorder-panel-header">
            <span className="recorder-panel-title">
              Live Transcript
              {isRecording && <span className="recorder-live-dot" />}
            </span>
            {transcript.length > 0 && (
              <div className="recorder-panel-actions">
                <button
                  className="btn-ghost btn-small"
                  onClick={handleAddAll}
                >
                  Add all to {activeSpeakerName}
                </button>
                <button
                  className="btn-ghost btn-small"
                  onClick={() => setTranscript([])}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="recorder-lines">
            {transcript.map((line, i) => (
              <div key={i} className="recorder-line">
                <span className="recorder-line-text">{line}</span>
                <button
                  className="recorder-line-add"
                  onClick={() => handleAddLine(i)}
                  title={`Add to ${activeSpeakerName}'s notes`}
                >
                  +
                </button>
              </div>
            ))}
            {interim && (
              <div className="recorder-line interim">
                <span className="recorder-line-text">{interim}</span>
              </div>
            )}
            {transcript.length === 0 && !interim && isRecording && (
              <div className="recorder-empty">
                Listening... speak and your words will appear here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
