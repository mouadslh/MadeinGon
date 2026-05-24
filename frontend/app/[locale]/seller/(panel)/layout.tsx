import { SellerPanelShell } from "@/components/seller/SellerPanelShell";

export default function SellerPanelLayout({ children }: { children: React.ReactNode }) {
  return <SellerPanelShell>{children}</SellerPanelShell>;
}
