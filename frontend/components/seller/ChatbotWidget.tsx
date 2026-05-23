"use client";

import { useParams } from "next/navigation";
import { ChatWidget } from "@/components/ai/ChatWidget";

/** Seller panel — same AI assistant as buyer chrome, seller language context. */
export function ChatbotWidget() {
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  return <ChatWidget language={locale} />;
}
