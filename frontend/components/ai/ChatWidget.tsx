"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget({ language = "fr" }: { language?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/chat", {
        message: input,
        language,
        conversation_history: messages,
      });
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...history, { role: "assistant", content: "Désolé, réessayez plus tard." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-ochre text-white shadow-lg flex items-center justify-center hover:bg-terracotta min-h-tap min-w-tap"
        aria-label="Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] card-surface flex flex-col shadow-xl">
          <div className="p-4 border-b border-dune bg-sand rounded-t-card">
            <h3 className="font-display text-lg text-ochre">Assistant GOUN</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-3 rounded-card text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-terracotta text-white"
                    : "mr-auto bg-sand text-night"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-dune flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="flex-1 px-3 py-2 rounded-card border border-dune min-h-tap"
              placeholder="Votre message..."
              disabled={loading}
            />
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="min-h-tap min-w-tap p-2 bg-atlantic text-white rounded-card"
              aria-label="Envoyer"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
