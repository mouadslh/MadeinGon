const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export const PRODUCT_IMAGE_PLACEHOLDER = "/placeholder-product.svg";

/** Builds an absolute URL for product images served by FastAPI or external CDNs. */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath || !String(imagePath).trim()) {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }
  const src = String(imagePath).trim();
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  return `${API_BASE}${cleanPath}`;
}
