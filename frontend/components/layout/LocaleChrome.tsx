"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { IntroAnimation } from "@/components/IntroAnimation";
import { AuthSync } from "@/components/auth/AuthSync";

function pathWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/(fr|ar)(?=\/|$)/, "") || "/";
}

function isGounPublicRoute(path: string): boolean {
  return (
    path === "/" ||
    path === "" ||
    path.startsWith("/catalogue") ||
    path.startsWith("/product/")
  );
}

export function LocaleChrome({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const path = pathWithoutLocale(pathname);
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/auth");
  const hideGlobalChrome =
    path.startsWith("/seller/") || path.startsWith("/admin") || isAuthRoute;
  const useGounTheme = isGounPublicRoute(path);

  useEffect(() => {
    document.documentElement.classList.toggle("goun-theme", useGounTheme);
    return () => document.documentElement.classList.remove("goun-theme");
  }, [useGounTheme]);

  if (hideGlobalChrome || path === "/" || path === "") {
    return (
      <>
        <AuthSync />
        <IntroAnimation locale={locale} />
        {children}
      </>
    );
  }

  return (
    <>
      <AuthSync />
      <IntroAnimation locale={locale} />
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      <Footer />
      <ChatWidget language={locale} />
    </>
  );
}
