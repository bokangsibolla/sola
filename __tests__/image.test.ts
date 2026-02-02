import { getImageUrl } from '../lib/image';

describe('getImageUrl', () => {
  it('appends width and height to a supabase storage URL', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/avatars/123/avatar.jpg';
    const result = getImageUrl(url, { width: 96, height: 96 });
    expect(result).toBe(
      'https://xyz.supabase.co/storage/v1/render/image/public/avatars/123/avatar.jpg?width=96&height=96'
    );
  });

  it('appends only width when height is omitted', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/avatars/123/avatar.jpg';
    const result = getImageUrl(url, { width: 200 });
    expect(result).toBe(
      'https://xyz.supabase.co/storage/v1/render/image/public/avatars/123/avatar.jpg?width=200'
    );
  });

  it('returns the original URL if not a supabase storage URL', () => {
    const url = 'https://example.com/photo.jpg';
    const result = getImageUrl(url, { width: 96 });
    expect(result).toBe('https://example.com/photo.jpg');
  });

  it('returns the original URL if null or empty', () => {
    expect(getImageUrl(null, { width: 96 })).toBeNull();
    expect(getImageUrl('', { width: 96 })).toBe('');
  });

  it('preserves existing query params like cache busters', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/avatars/123/avatar.jpg?t=1234';
    const result = getImageUrl(url, { width: 96, height: 96 });
    expect(result).toBe(
      'https://xyz.supabase.co/storage/v1/render/image/public/avatars/123/avatar.jpg?t=1234&width=96&height=96'
    );
  });
});
