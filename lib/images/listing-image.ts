// Every listing photo goes through the same pipeline before it's stored:
// decoded by sharp (so a renamed non-image can't get in), turned upright from
// its EXIF orientation, capped at 1280×960 and re-encoded as WebP. Re-encoding
// also drops EXIF, which on phone photos includes the GPS position.

const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp"]);

// Enough for a 48 MP phone original. A tiny, highly compressible PNG can still
// claim enormous dimensions, and decoding it would eat the server's memory.
const MAX_PIXELS = 50_000_000;

export class UnsupportedImageError extends Error {}

export async function toListingWebp(file: File): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const input = Buffer.from(await file.arrayBuffer());

  let meta: { format?: string; width?: number; height?: number };
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new UnsupportedImageError(`${file.name} isn't a readable image`);
  }
  if (!meta.format || !ACCEPTED_FORMATS.has(meta.format)) {
    throw new UnsupportedImageError(`${file.name} isn't a JPG, PNG or WebP image`);
  }
  if ((meta.width ?? 0) * (meta.height ?? 0) > MAX_PIXELS) {
    throw new UnsupportedImageError(`${file.name} is too large (over 50 megapixels)`);
  }

  return sharp(input, { limitInputPixels: MAX_PIXELS })
    .rotate()
    .resize(1280, 960, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
