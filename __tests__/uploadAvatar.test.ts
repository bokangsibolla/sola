const mockUpload = jest.fn().mockResolvedValue({ error: null });
const mockGetPublicUrl = jest.fn().mockReturnValue({
  data: { publicUrl: 'https://storage.example.com/avatars/user1/avatar.jpg' },
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: (...args: any[]) => mockUpload(...args),
        getPublicUrl: (...args: any[]) => mockGetPublicUrl(...args),
      })),
    },
  },
}));

// Mock fetch for blob conversion
global.fetch = jest.fn().mockResolvedValue({
  blob: jest.fn().mockResolvedValue(new Blob(['image-data'])),
}) as any;

import { uploadAvatar } from '../lib/uploadAvatar';

describe('uploadAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null for null URI', async () => {
    const result = await uploadAvatar('user1', null);
    expect(result).toBeNull();
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('returns the URL unchanged for http:// URIs', async () => {
    const url = 'http://example.com/photo.jpg';
    const result = await uploadAvatar('user1', url);
    expect(result).toBe(url);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('returns the URL unchanged for https:// URIs', async () => {
    const url = 'https://cdn.example.com/avatar.png';
    const result = await uploadAvatar('user1', url);
    expect(result).toBe(url);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('uploads local file URI and returns public URL', async () => {
    mockUpload.mockResolvedValue({ error: null });
    const result = await uploadAvatar('user1', 'file:///tmp/photo.jpg');
    expect(mockUpload).toHaveBeenCalledWith(
      'user1/avatar.jpg',
      expect.any(Blob),
      { contentType: 'image/jpeg', upsert: true },
    );
    expect(result).toMatch(/^https:\/\/storage\.example\.com\/avatars\/user1\/avatar\.jpg\?t=\d+$/);
  });

  it('handles png extension correctly', async () => {
    mockUpload.mockResolvedValue({ error: null });
    await uploadAvatar('user1', 'file:///tmp/photo.png');
    expect(mockUpload).toHaveBeenCalledWith(
      'user1/avatar.png',
      expect.any(Blob),
      { contentType: 'image/png', upsert: true },
    );
  });

  it('throws on upload error', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'Bucket not found' } });
    await expect(uploadAvatar('user1', 'file:///tmp/photo.jpg')).rejects.toEqual({
      message: 'Bucket not found',
    });
  });
});
