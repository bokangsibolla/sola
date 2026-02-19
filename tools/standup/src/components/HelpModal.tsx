import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">How to use Sola Standup</div>

        <div className="modal-section">
          <h3>The Flow</h3>
          <ul>
            <li>Hit Start — the 10-minute timer begins</li>
            <li>Click each team member to expand their section</li>
            <li>Type a bullet and press Enter to add it</li>
            <li>Click Next to advance to the next speaker</li>
            <li>When done, hit Generate Summary</li>
          </ul>
        </div>

        <div className="modal-section">
          <h3>Timer</h3>
          <p>
            10 minutes total, ~2:30 per speaker. The timer shows gentle alerts
            at 5 minutes, 2 minutes, and when time is up. The per-speaker
            progress bars are suggestions — not enforced.
          </p>
        </div>

        <div className="modal-section">
          <h3>Quick Task Capture</h3>
          <ul>
            <li>Hover any bullet and click → to convert it to a task</li>
            <li>Or use the quick-add row in the Action Items section</li>
            <li>Tasks persist across standups</li>
          </ul>
        </div>

        <div className="modal-section">
          <h3>Carry-Forward</h3>
          <p>
            Each speaker's card shows what they committed to in the previous
            standup. This makes accountability automatic — no need to remember
            what was said yesterday.
          </p>
        </div>

        <div className="modal-section">
          <h3>Live Recording</h3>
          <p>
            Click the Record button to start live speech-to-text transcription
            (Chrome/Edge only). Spoken words appear in real-time. Click + on any
            line to add it to the active speaker's notes, or "Add all" to capture
            everything at once.
          </p>
        </div>

        <div className="modal-section">
          <h3>Performance Tracker</h3>
          <p>
            Click Tracker in the header to see per-person completion stats.
            Completed tasks stay visible — you can always uncheck them if needed.
          </p>
        </div>

        <div className="modal-section">
          <h3>Export</h3>
          <ul>
            <li>Copy Markdown — paste into Notion, Slack, or anywhere</li>
            <li>Copy for Slack — Slack-formatted plain text</li>
            <li>Download JSON — full standup data backup</li>
            <li>Download CSV — action items for spreadsheets</li>
          </ul>
        </div>

        <div className="modal-section">
          <h3>Data</h3>
          <p>
            Everything is saved in your browser's local storage. Past standups
            are archived automatically when you start a new one. Up to 30
            standups are kept in history.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
