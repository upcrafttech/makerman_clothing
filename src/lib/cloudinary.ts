// Helpers for delivering Cloudinary images at a sensible size.
// Cloudinary's free plan runs out on delivered bandwidth, and the originals can be several MB each.

const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";
const CLOUDINARY_HOST = "res.cloudinary.com";
// Matches a transformation segment such as "w_400,c_limit" or "f_auto", so it is never added twice.
const EXISTING_TRANSFORMATION_PATTERN = /^[a-z]{1,3}_[^/]*$/;
const FILE_EXTENSION_PATTERN = /\.(jpe?g|png|webp|gif|avif)$/i;

/** Width used for product images shown in cards, galleries and the cart. */
export const PRODUCT_IMAGE_WIDTH = 900;

/**
 * Returns a Cloudinary delivery URL that is resized to at most `width` pixels and served in the best
 * format and quality for the visitor's browser. Any other URL (Unsplash, local files, empty values) is
 * returned unchanged, so it is safe to call on every image.
 *
 * The file extension is removed because Cloudinary only picks the best format (f_auto) when the URL
 * has no extension.
 */
export function optimizeImageUrl(imageUrl: string | undefined | null, width: number): string {
  if (!imageUrl) {
    return "";
  }
  const markerIndex = imageUrl.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (!imageUrl.includes(CLOUDINARY_HOST) || markerIndex === -1) {
    return imageUrl;
  }

  const prefix = imageUrl.slice(0, markerIndex + CLOUDINARY_UPLOAD_MARKER.length);
  const rest = imageUrl.slice(markerIndex + CLOUDINARY_UPLOAD_MARKER.length);
  const firstSegment = rest.split("/")[0] ?? "";
  if (EXISTING_TRANSFORMATION_PATTERN.test(firstSegment)) {
    return imageUrl;
  }

  const transformation = `f_auto,q_auto,c_limit,w_${width}`;
  return `${prefix}${transformation}/${rest.replace(FILE_EXTENSION_PATTERN, "")}`;
}
