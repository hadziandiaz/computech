export const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 10;

export const PRODUCT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const PRODUCT_IMAGE_ACCEPT = PRODUCT_IMAGE_MIME_TYPES.join(",");

export function isAllowedProductImage(file: Pick<File, "type" | "size">) {
  return (
    (PRODUCT_IMAGE_MIME_TYPES as readonly string[]).includes(file.type) &&
    file.size > 0 &&
    file.size <= MAX_PRODUCT_IMAGE_BYTES
  );
}

export function productImageExtension(mime: string) {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "jpg";
  }
}

/** Convert a public Storage URL back into an object path for cleanup. */
export function productImagePathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const prefix = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
    if (!parsed.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    return path && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}
