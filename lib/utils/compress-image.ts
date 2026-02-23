/**
 * Compress a File/Blob to JPEG using the Canvas API.
 * Keeps the image as small as possible for the free-tier Supabase bucket.
 *
 * Defaults: max 800 px on the longest edge, JPEG quality 0.75
 * Typical output: 50–150 KB
 */
export async function compressImage(
  file: File | Blob,
  {
    maxPx = 800,
    quality = 0.75,
    outputType = "image/jpeg",
  }: { maxPx?: number; quality?: number; outputType?: string } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const { width, height } = bitmap;
  const scale = Math.min(1, maxPx / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))), outputType, quality);
  });
}
