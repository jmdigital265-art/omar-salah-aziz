/* ═══════════════════════════════════════════════════════════════
   Client-side image compression — any source size is accepted:
   the picture is decoded (EXIF-aware) with a memory-safe downscale,
   then re-encoded smaller (dimensions and JPEG/WEBP quality) in a
   loop until it passes the server rule (≤ ~1,050,000 base64 chars).
   ═══════════════════════════════════════════════════════════════ */

const MAX_BASE64 = 950_000;

export type EncodeResult = { dataUrl: string; bytes: number };

async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      throw new Error('وێنەکە نەخوێنرایەوە');
    }
  }
}

async function encodeBitmap(
  bitmap: ImageBitmap,
  maxDim: number,
  quality: number,
  preferAlpha: boolean
): Promise<string> {
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas failed');
  if (!preferAlpha) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  return preferAlpha ? canvas.toDataURL('image/webp', quality) : canvas.toDataURL('image/jpeg', quality);
}

function payloadOf(dataUrl: string): string {
  return dataUrl.split(',')[1] ?? '';
}

async function svgToDataUrl(file: File): Promise<EncodeResult> {
  const text = await file.text();
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const payload = btoa(bin);
  if (payload.length > MAX_BASE64) throw new Error('وێنەکە زۆر گەورەیە');
  return { dataUrl: `data:image/svg+xml;base64,${payload}`, bytes: Math.round((payload.length * 3) / 4) };
}

async function fileToDataUrl(file: File): Promise<EncodeResult> {
  if (/^image\/svg\+xml/i.test(file.type)) return svgToDataUrl(file);
  const preferAlpha = /^image\/(png|webp|gif)$/i.test(file.type);
  const bitmap = await loadBitmap(file);
  try {
    let maxDim = 1400;
    let quality = 0.85;
    let dataUrl = '';
    for (let attempt = 0; attempt < 8; attempt++) {
      dataUrl = await encodeBitmap(bitmap, maxDim, quality, preferAlpha);
      if (payloadOf(dataUrl).length <= MAX_BASE64) break;
      // Safari silently ignores image/webp: flatten to JPEG instead of looping
      if (preferAlpha && !/^data:image\/webp/i.test(dataUrl)) {
        return await flattenToJpeg(bitmap);
      }
      maxDim = Math.max(360, Math.round(maxDim * 0.8));
      quality = Math.max(0.45, Math.round((quality - 0.06) * 100) / 100);
    }
    if (payloadOf(dataUrl).length > MAX_BASE64) {
      if (preferAlpha) return await flattenToJpeg(bitmap);
      throw new Error('وێنەکە زۆر گەورەیە — وێنەیەکی بچووکتر هەڵبژێرە');
    }
    return { dataUrl, bytes: Math.round((payloadOf(dataUrl).length * 3) / 4) };
  } finally {
    bitmap.close?.();
  }
}

async function flattenToJpeg(bitmap: ImageBitmap): Promise<EncodeResult> {
  let maxDim = 1400;
  let quality = 0.8;
  let dataUrl = '';
  for (let attempt = 0; attempt < 8; attempt++) {
    dataUrl = await encodeBitmap(bitmap, maxDim, quality, false);
    if (payloadOf(dataUrl).length <= MAX_BASE64) break;
    maxDim = Math.max(360, Math.round(maxDim * 0.8));
    quality = Math.max(0.4, Math.round((quality - 0.07) * 100) / 100);
  }
  if (payloadOf(dataUrl).length > MAX_BASE64) {
    throw new Error('وێنەکە زۆر گەورەیە — وێنەیەکی بچووکتر هەڵبژێرە');
  }
  return { dataUrl, bytes: Math.round((payloadOf(dataUrl).length * 3) / 4) };
}

export function compressImage(file: File): Promise<EncodeResult> {
  return fileToDataUrl(file);
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}
