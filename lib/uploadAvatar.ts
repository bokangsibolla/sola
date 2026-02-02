import { supabase } from './supabase';
import { Platform } from 'react-native';

const BUCKET = 'avatars';

/**
 * Upload a local image URI to Supabase Storage and return the public URL.
 * If the URI is already a remote URL (http/https), returns it unchanged.
 * Returns null if no URI is provided.
 */
export async function uploadAvatar(
  userId: string,
  localUri: string | null,
): Promise<string | null> {
  if (!localUri) return null;

  // Already a remote URL — nothing to upload
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filePath = `${userId}/avatar.${ext}`;

  // Read the file into a blob for upload
  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, blob, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  // Append cache-buster so the CDN serves the fresh image after re-upload
  return `${data.publicUrl}?t=${Date.now()}`;
}
