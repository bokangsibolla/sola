import { describe, it, expect } from 'vitest';
import { buildEmailPayload } from '../sender.js';

describe('sender', () => {
  it('builds a valid email payload', () => {
    const payload = buildEmailPayload(
      '# Test Digest',
      '<html><body>Test</body></html>',
      'daily',
      ['you@solatravel.app'],
    );
    expect(payload.from).toContain('solatravel.app');
    expect(payload.to).toEqual(['you@solatravel.app']);
    expect(payload.subject).toContain('Sola');
    expect(payload.subject).toContain('Daily');
    expect(payload.html).toBe('<html><body>Test</body></html>');
    expect(payload.text).toBe('# Test Digest');
  });

  it('builds weekly subject line', () => {
    const payload = buildEmailPayload('text', 'html', 'weekly', ['a@b.com']);
    expect(payload.subject).toContain('Weekly');
  });
});
