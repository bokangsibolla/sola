import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

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

  // Determine file extension from URI
  const uriParts = localUri.split('.');
  const rawExt = uriParts.length > 1 ? uriParts.pop()?.toLowerCase() : 'jpg';
  const ext = rawExt === 'jpeg' || rawExt === 'jpg' || rawExt === 'png' || rawExt === 'webp' ? rawExt : 'jpg';
  const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const filePath = `${userId}/avatar.${ext}`;

  // Read file as base64 and convert to ArrayBuffer for reliable RN upload
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: 'base64',
  });

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, decode(base64), {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  // Append cache-buster so the CDN serves the fresh image after re-upload
  return `${data.publicUrl}?t=${Date.now()}`;
}
