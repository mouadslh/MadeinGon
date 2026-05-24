import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { ChatbotWidget } from "@/components/seller/ChatbotWidget";

export default function SellerPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--goun-sand)]">
      <SellerSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8">{children}</main>
      <ChatbotWidget />
    </div>
  );
}
