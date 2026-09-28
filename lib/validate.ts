/* Shared server-side validators for editable values. */

export const MAX_IMAGE_CHARS = 1_050_000; // ≈ 780 KB binary as base64

/** Accepts either a remote https? URL or a compact base64 image data-URL. */
export function isSafeImageValue(v: string): boolean {
  if (/^https:\/\/\S+$/i.test(v) && v.length <= 2000) return true;
  if (/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(v)) {
    return v.length <= MAX_IMAGE_CHARS;
  }
  return false;
}

/** Public-facing links must be absolute http(s) URLs. */
export function isSafeHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return (u.protocol === 'https:' || u.protocol === 'http:') && v.length <= 2000;
  } catch {
    return false;
  }
}
