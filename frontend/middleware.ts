import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const SELLER_PATHS = ["/seller"];
const ADMIN_PATHS = ["/admin"];

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathWithoutLocale = pathname.replace(/^\/(fr|ar)/, "") || "/";
  const role = getRoleFromCookie(request);

  const isSellerRoute = SELLER_PATHS.some((p) => pathWithoutLocale.startsWith(p));
  const isAdminRoute = ADMIN_PATHS.some((p) => pathWithoutLocale.startsWith(p));
  const isCheckout = pathWithoutLocale.startsWith("/checkout");

  if (isCheckout && !role) {
    const locale = pathname.split("/")[1] || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isSellerRoute && role !== "SELLER" && role !== "ADMIN") {
    const locale = pathname.split("/")[1] || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
  }

  if (isAdminRoute && role !== "ADMIN") {
    const locale = pathname.split("/")[1] || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
