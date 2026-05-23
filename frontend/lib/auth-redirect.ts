import type { UserRole } from "@/lib/auth";

/** Post-login redirect by JWT role and locale prefix. */
export function getPostLoginRedirect(role: UserRole | null, locale: string): string {
  const prefix = locale === "ar" ? "/ar" : "/fr";
  switch (role) {
    case "ADMIN":
      return `${prefix}/admin/dashboard`;
    case "SELLER":
      return `${prefix}/seller/dashboard`;
    case "USER":
    default:
      return `${prefix}/`;
  }
}
