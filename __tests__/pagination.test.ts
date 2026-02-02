jest.mock('../lib/supabase', () => ({
  supabase: {},
}));

import { buildRange } from '../data/api';

describe('buildRange', () => {
  it('returns correct from/to for page 0', () => {
    expect(buildRange(0, 20)).toEqual({ from: 0, to: 19 });
  });

  it('returns correct from/to for page 2', () => {
    expect(buildRange(2, 20)).toEqual({ from: 40, to: 59 });
  });

  it('uses custom page size', () => {
    expect(buildRange(1, 10)).toEqual({ from: 10, to: 19 });
  });
});
