/**
 * Shared Supabase mock for tests.
 * Each test can override specific return values via jest.spyOn or mockImplementation.
 */

const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
const mockSelect = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      maybeSingle: mockMaybeSingle,
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    maybeSingle: mockMaybeSingle,
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
    ilike: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    contains: jest.fn().mockResolvedValue({ data: [], error: null }),
  }),
  order: jest.fn().mockResolvedValue({ data: [], error: null }),
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
});

const mockInsert = jest.fn().mockReturnValue({
  select: jest.fn().mockReturnValue({
    single: mockSingle,
  }),
});

const mockUpdate = jest.fn().mockReturnValue({
  eq: jest.fn().mockResolvedValue({ data: null, error: null }),
});

const mockDelete = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
});

const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: null });

const mockFrom = jest.fn().mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  upsert: mockUpsert,
});

const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'test/avatar.jpg' }, error: null });
const mockGetPublicUrl = jest.fn().mockReturnValue({
  data: { publicUrl: 'https://storage.example.com/avatars/test/avatar.jpg' },
});

const mockStorage = {
  from: jest.fn().mockReturnValue({
    upload: mockUpload,
    getPublicUrl: mockGetPublicUrl,
  }),
};

const mockAuth = {
  signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
  signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  }),
};

export const supabase = {
  from: mockFrom,
  storage: mockStorage,
  auth: mockAuth,
};

export const mockHelpers = {
  mockFrom,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockUpsert,
  mockSingle,
  mockMaybeSingle,
  mockUpload,
  mockGetPublicUrl,
  mockAuth,
};
