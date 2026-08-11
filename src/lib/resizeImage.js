/**
 * Client-side image resize/compress via canvas; returns a webp File.
 * Falls back to the original file when decoding/encoding fails
 * (e.g. unsupported format), so uploads never break.
 */
export async function resizeImageFile(file, maxW, maxH) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/webp', 0.85);
  });
  if (blob) return new File([blob], `${file.name.replace(/\.\w+$/, '')}.webp`, { type: 'image/webp' });
  return file;
}

/** resizeImageFile that never throws — returns the original file on failure. */
export async function compressForUpload(file, maxW = 1600, maxH = 1200) {
  try {
    return await resizeImageFile(file, maxW, maxH);
  } catch {
    return file;
  }
}
