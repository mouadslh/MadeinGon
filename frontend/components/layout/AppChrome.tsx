"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FaqWidget } from "@/components/ai/FaqWidget";

/** Buyer marketplace chrome — hidden on admin and seller dashboards. */
export function AppChrome({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const isSeller = pathname.includes("/seller/");

  if (isAdmin || isSeller) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      <Footer />
      <FaqWidget />
    </>
  );
}
