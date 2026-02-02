export function getImageUrl(
  url: string | null | undefined,
  opts: { width?: number; height?: number }
): string | null | undefined {
  if (!url) return url as null | undefined;

  const OBJECT_PATH = '/storage/v1/object/public/';
  const RENDER_PATH = '/storage/v1/render/image/public/';

  if (!url.includes(OBJECT_PATH)) return url;

  const [base, query] = url.split('?');
  const transformed = base.replace(OBJECT_PATH, RENDER_PATH);

  const params = new URLSearchParams(query || '');
  if (opts.width) params.set('width', String(opts.width));
  if (opts.height) params.set('height', String(opts.height));

  return `${transformed}?${params.toString()}`;
}
