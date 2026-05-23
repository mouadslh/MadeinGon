import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const SELLER_PANEL_PREFIXES = [
  "/seller/dashboard",
  "/seller/products",
  "/seller/orders",
  "/seller/wallet",
  "/seller/notifications",
  "/seller/reviews",
  "/seller/settings",
  "/seller/products/new",
];

const ADMIN_PATHS = ["/admin"];
const AUTH_REQUIRED_PREFIXES = ["/orders", "/checkout", "/favoris"];

function getRoleFromCookie(request: NextRequest): string | null {
  const token = request.cookies.get("access_token")?.value;
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const json = Buffer.from(base64, "base64url").toString();
    const payload = JSON.parse(json);
    return payload.role ?? null;
  } catch {
    return null;
  }
}

function isSellerPanelRoute(path: string): boolean {
  return SELLER_PANEL_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function isPublicSellerProfile(path: string): boolean {
  return /^\/seller\/[0-9a-f-]{36}$/i.test(path);
}

function localeFromPath(pathname: string): string {
  const seg = pathname.split("/")[1];
  return seg === "ar" || seg === "fr" ? seg : defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPath(pathname);
  const pathWithoutLocale = pathname.replace(/^\/(fr|ar)/, "") || "/";
  const role = getRoleFromCookie(request);

  const needsAuth = AUTH_REQUIRED_PREFIXES.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
  const isSellerPanel = isSellerPanelRoute(pathWithoutLocale) && !isPublicSellerProfile(pathWithoutLocale);
  const isAdminRoute = ADMIN_PATHS.some((p) => pathWithoutLocale.startsWith(p));

  if ((needsAuth || isSellerPanel) && !role) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isSellerPanel && role !== "SELLER" && role !== "ADMIN") {
    const unauthorizedUrl = new URL(`/${locale}/unauthorized`, request.url);
    unauthorizedUrl.searchParams.set("reason", "seller");
    return NextResponse.redirect(unauthorizedUrl);
  }

  if (isAdminRoute && role !== "ADMIN") {
    const unauthorizedUrl = new URL(`/${locale}/unauthorized`, request.url);
    unauthorizedUrl.searchParams.set("reason", "admin");
    return NextResponse.redirect(unauthorizedUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
