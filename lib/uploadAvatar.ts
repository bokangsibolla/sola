import { supabase } from './supabase';

const BUCKET = 'avatars';

/**
 * Upload a local image URI to Supabase Storage and return the public URL.
 * Uses FormData with the file URI — the most reliable approach on React Native.
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

  // Get a fresh access token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No auth session');

  // Upload via REST API with FormData — most reliable on React Native
  const formData = new FormData();
  formData.append('', {
    uri: localUri,
    name: `avatar.${ext}`,
    type: contentType,
  } as any);

  const supabaseUrl = 'https://bfyewxgdfkmkviajmfzp.supabase.co';
  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/${BUCKET}/${filePath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'x-upsert': 'true',
      },
      body: formData,
    },
  );

  if (!uploadResponse.ok) {
    const body = await uploadResponse.text();
    throw new Error(`Storage upload failed (${uploadResponse.status}): ${body}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}
