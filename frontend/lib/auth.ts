export type UserRole = "USER" | "SELLER" | "ADMIN";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  exp: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getStoredTokens(): { access: string | null; refresh: string | null } {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
  };
}

export function setStoredTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearStoredTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getRoleFromToken(): UserRole | null {
  const { access } = getStoredTokens();
  if (!access) return null;
  const payload = decodeJwt(access);
  return payload?.role ?? null;
}

export function isAuthenticated(): boolean {
  const { access } = getStoredTokens();
  if (!access) return false;
  const payload = decodeJwt(access);
  if (!payload?.exp) return true;
  return payload.exp * 1000 > Date.now();
}

export function syncAccessTokenCookie(): void {
  if (typeof document === "undefined") return;
  const { access } = getStoredTokens();
  if (access) {
    document.cookie = `access_token=${access}; path=/; max-age=3600; SameSite=Lax`;
  } else {
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  }
}
