/** Normalize and detect CIN document URLs (Cloudinary, direct images, PDF). */
export function normalizeCinUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : null;
}

export function isDisplayableCinImage(url: string): boolean {
  if (/\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url)) return true;
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload")) return true;
  return false;
}

export function isCinPdf(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url) || url.includes("/raw/upload") || url.includes("format=pdf");
}
