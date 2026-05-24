"use client";

import { useParams } from "next/navigation";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { ChatbotWidget } from "@/components/seller/ChatbotWidget";

export function SellerPanelShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const rtl = locale === "ar";

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="flex h-screen overflow-hidden bg-[var(--goun-sand)]"
    >
      <SellerSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8">{children}</main>
      <ChatbotWidget />
    </div>
  );
}
