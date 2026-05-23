/** Hostnames allowed for next/image — keep in sync with next.config.mjs */
export const remoteImagePatterns = [
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
  { protocol: "https", hostname: "**.cloudinary.com", pathname: "/**" },
  { protocol: "http", hostname: "localhost", port: "8000", pathname: "/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
];

/** @param {string | null | undefined} src */
export function isValidImageUrl(src) {
  if (!src || typeof src !== "string") return false;
  try {
    const protocol = new URL(src).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

/** @deprecated use isValidImageUrl */
export function isValidHttpsImageUrl(src) {
  return isValidImageUrl(src);
}

function hostMatchesPattern(hostname, pattern) {
  if (pattern.startsWith("**.")) {
    const suffix = pattern.slice(1);
    return hostname === pattern.slice(3) || hostname.endsWith(suffix);
  }
  return hostname === pattern;
}

/** @param {string | null | undefined} src */
export function isAllowedRemoteImage(src) {
  if (!src || typeof src !== "string") return false;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;

    if (url.hostname.includes("cloudinary.com") || url.hostname === "images.unsplash.com") {
      return true;
    }

    return remoteImagePatterns.some((p) => {
      const protocolMatch = url.protocol === `${p.protocol}:`;
      const hostMatch = hostMatchesPattern(url.hostname, p.hostname);
      const portMatch = p.port == null || p.port === "" || String(url.port || "") === String(p.port);
      const pathPattern = p.pathname?.replace("/**", "") ?? "";
      const pathMatch = !pathPattern || url.pathname.startsWith(pathPattern);
      return protocolMatch && hostMatch && portMatch && pathMatch;
    });
  } catch {
    return false;
  }
}
