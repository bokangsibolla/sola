import React, { useState, useMemo } from 'react';
import { Standup, ActionItem, TeamMember } from '../types';
import {
  generateMarkdownSummary,
  generateSlackSummary,
  copyToClipboard,
  downloadJSON,
  downloadCSV,
  formatDate,
} from '../utils';

interface SummaryProps {
  standup: Standup;
  tasks: ActionItem[];
  team: TeamMember[];
  onBack: () => void;
  onNewStandup: () => void;
}

export default function Summary({
  standup,
  tasks,
  team,
  onBack,
  onNewStandup,
}: SummaryProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const markdown = useMemo(
    () => generateMarkdownSummary(standup, tasks, team),
    [standup, tasks, team],
  );

  const slackText = useMemo(
    () => generateSlackSummary(standup, tasks, team),
    [standup, tasks, team],
  );

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  // Render markdown as simple formatted text
  const renderPreview = () => {
    return markdown
      .replace(/^# (.+)$/gm, '━━━ $1 ━━━')
      .replace(/^## (.+)$/gm, '\n▸ $1')
      .replace(/^### (.+)$/gm, '\n  $1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\| ?/g, '  ')
      .replace(/-{3,}/g, '');
  };

  return (
    <div className="summary-section">
      <div className="summary-header">
        <div>
          <div className="summary-title">Standup Summary</div>
          <div className="summary-date">{formatDate(standup.date)}</div>
        </div>
        <button className="btn-ghost" onClick={onBack}>
          ← Back to standup
        </button>
      </div>

      <div className="summary-content">
        {renderPreview()}
      </div>

      <div className="summary-export-row">
        <button
          className="btn-secondary"
          onClick={() => handleCopy(markdown, 'markdown')}
        >
          {copied === 'markdown' ? '✓ Copied' : 'Copy Markdown'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => handleCopy(slackText, 'slack')}
        >
          {copied === 'slack' ? '✓ Copied' : 'Copy for Slack'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => downloadJSON(standup, tasks)}
        >
          Download JSON
        </button>
        <button
          className="btn-secondary"
          onClick={() => downloadCSV(tasks, team)}
        >
          Download CSV
        </button>
      </div>

      <div className="summary-new-standup">
        <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 16 }}>
          Archive this standup and start fresh for tomorrow?
        </p>
        <button className="btn-primary" onClick={onNewStandup}>
          Start New Standup
        </button>
      </div>
    </div>
  );
}
