import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { ChatbotWidget } from "@/components/seller/ChatbotWidget";

export default function SellerPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--goun-sand)]">
      <SellerSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      <ChatbotWidget />
    </div>
  );
}
