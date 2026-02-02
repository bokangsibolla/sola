jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), storage: { from: jest.fn() }, auth: {} },
}));

import { toCamel, rowsToCamel, escapeIlike } from '../data/api';

describe('toCamel', () => {
  it('converts snake_case keys to camelCase', () => {
    const result = toCamel<{ firstName: string; homeCountryIso2: string }>({
      first_name: 'Alice',
      home_country_iso2: 'US',
    });
    expect(result).toEqual({ firstName: 'Alice', homeCountryIso2: 'US' });
  });

  it('handles keys with no underscores', () => {
    const result = toCamel<{ name: string; id: string }>({
      name: 'Test',
      id: '123',
    });
    expect(result).toEqual({ name: 'Test', id: '123' });
  });

  it('handles multiple underscores', () => {
    const result = toCamel<{ someDeepKey: string }>({
      some_deep_key: 'value',
    });
    expect(result).toEqual({ someDeepKey: 'value' });
  });

  it('preserves values including arrays and nulls', () => {
    const result = toCamel<{ interests: string[]; bio: null }>({
      interests: ['food', 'culture'],
      bio: null,
    });
    expect(result).toEqual({ interests: ['food', 'culture'], bio: null });
  });

  it('handles empty object', () => {
    expect(toCamel({})).toEqual({});
  });
});

describe('rowsToCamel', () => {
  it('converts an array of rows', () => {
    const rows = [
      { first_name: 'A', is_active: true },
      { first_name: 'B', is_active: false },
    ];
    const result = rowsToCamel<{ firstName: string; isActive: boolean }>(rows);
    expect(result).toEqual([
      { firstName: 'A', isActive: true },
      { firstName: 'B', isActive: false },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(rowsToCamel([])).toEqual([]);
  });
});

describe('escapeIlike', () => {
  it('escapes percent signs', () => {
    expect(escapeIlike('100%')).toBe('100\\%');
  });

  it('escapes underscores', () => {
    expect(escapeIlike('hello_world')).toBe('hello\\_world');
  });

  it('escapes backslashes', () => {
    expect(escapeIlike('path\\to')).toBe('path\\\\to');
  });

  it('escapes multiple special characters', () => {
    expect(escapeIlike('50%_off\\')).toBe('50\\%\\_off\\\\');
  });

  it('returns unchanged string with no special characters', () => {
    expect(escapeIlike('hello world')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(escapeIlike('')).toBe('');
  });
});
