import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TEAM, TIMER_DURATION, SPEAKER_TIME, ALERT_TIMES } from '../config';
import { formatTime, playAlert } from '../utils';

interface TimerProps {
  activeSpeaker: number;
}

export default function Timer({ activeSpeaker }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const alertedRef = useRef<Set<number>>(new Set());

  const elapsed = TIMER_DURATION - timeLeft;
  const progress = (elapsed / TIMER_DURATION) * 100;

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (timeLeft <= 0) return;
    setIsRunning(true);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timeLeft, stop]);

  const reset = useCallback(() => {
    stop();
    setTimeLeft(TIMER_DURATION);
    alertedRef.current = new Set();
  }, [stop]);

  // Sound alerts
  useEffect(() => {
    for (const alertTime of ALERT_TIMES) {
      if (timeLeft === alertTime && !alertedRef.current.has(alertTime) && isRunning) {
        alertedRef.current.add(alertTime);
        if (alertTime === 0) {
          playAlert('end');
        } else if (alertTime <= 120) {
          playAlert('warning');
        } else {
          playAlert('soft');
        }
      }
    }
  }, [timeLeft, isRunning]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  const timerClass = timeLeft === 0
    ? 'ended'
    : timeLeft <= 120
    ? 'urgent'
    : timeLeft <= 300
    ? 'warning'
    : isRunning
    ? 'running'
    : '';

  const progressClass = timeLeft <= 120 ? 'urgent' : timeLeft <= 300 ? 'warning' : '';

  return (
    <div className="timer-section">
      <div className={`timer-display ${timerClass}`}>
        {formatTime(timeLeft)}
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <button className="btn-primary" onClick={start} disabled={timeLeft === 0}>
            {timeLeft === TIMER_DURATION ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button className="btn-secondary" onClick={stop}>
            Pause
          </button>
        )}
        <button className="btn-ghost" onClick={reset}>
          Reset
        </button>
      </div>

      <div className="timer-progress">
        <div
          className={`timer-progress-bar ${progressClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="speaker-times">
        {TEAM.map((member, i) => {
          const speakerStart = i * SPEAKER_TIME;
          const speakerEnd = (i + 1) * SPEAKER_TIME;
          const speakerElapsed = Math.max(0, Math.min(elapsed - speakerStart, SPEAKER_TIME));
          const speakerProgress = (speakerElapsed / SPEAKER_TIME) * 100;

          return (
            <div className="speaker-time" key={member.id}>
              <span className={`speaker-time-name ${activeSpeaker === i ? 'active' : ''}`}>
                {member.name}
              </span>
              <div className="speaker-time-bar">
                <div
                  className="speaker-time-fill"
                  style={{
                    width: `${speakerProgress}%`,
                    background: member.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
