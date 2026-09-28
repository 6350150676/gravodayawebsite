// Shared by the Sell form (checks before upload) and its server action (checks
// again, since the browser can't be trusted). The server re-encodes every photo
// to WebP, so these limits are about what we'll accept, not what we store.

export const LISTING_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const LISTING_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

export const MAX_SUBMISSION_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

// All photos travel in one server-action request. next.config.ts allows 10 MB,
// but Vercel rejects request bodies over 4.5 MB before Next sees them. The form
// compresses photos first (ten usually come to 2–3 MB), so this only trips on
// unusually detailed shots or if compression fell back to an original.
export const MAX_UPLOAD_TOTAL_BYTES = 4 * 1024 * 1024;

export function isListingImageType(file: File): boolean {
  if (LISTING_IMAGE_TYPES.includes(file.type)) return true;
  // some browsers leave `type` empty for files picked from cloud drives
  return !file.type && /\.(jpe?g|png|webp)$/i.test(file.name);
}
