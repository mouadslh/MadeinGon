import type { UserRole } from "@/lib/auth";

/**
 * Cible de redirection après login/register/OAuth réussi.
 *
 * Règles :
 *  1. ADMIN  → `/{locale}/admin/dashboard`
 *  2. SELLER → `/{locale}/seller/dashboard`
 *  3. USER   → `/{locale}/catalogue` (changement Étape 8)
 *
 * Si un paramètre `redirect=` valide est présent (chemin relatif sur le
 * même domaine), il prend la priorité sur la cible par rôle.
 */
export function getPostLoginRedirect(
  role: UserRole | null,
  locale: string,
  rawRedirect?: string | null,
): string {
  const safeRedirect = sanitizeRedirect(rawRedirect);
  if (safeRedirect) return safeRedirect;

  const prefix = locale === "ar" ? "/ar" : "/fr";
  switch (role) {
    case "ADMIN":
      return `${prefix}/admin/dashboard`;
    case "SELLER":
      return `${prefix}/seller/dashboard`;
    case "USER":
    default:
      return `${prefix}/catalogue`;
  }
}

function sanitizeRedirect(value: string | null | undefined): string | null {
  if (!value) return null;
  let candidate = value.trim();
  if (!candidate) return null;
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    return null;
  }
  if (!candidate.startsWith("/")) return null;
  if (candidate.startsWith("//")) return null;
  if (candidate.startsWith("/api")) return null;
  return candidate;
}
