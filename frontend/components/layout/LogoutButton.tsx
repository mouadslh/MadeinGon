"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearStoredTokens } from "@/lib/auth";
import { api } from "@/lib/api";

type Props = {
  className?: string;
  showLabel?: boolean;
};

export function LogoutButton({ className = "", showLabel = true }: Props) {
  const router = useRouter();

  const logout = () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      api.post("/auth/logout", { refresh_token: refresh }).catch(() => {});
    }
    clearStoredTokens();
    window.location.href = "/fr/auth/login";
  };

  return (
    <button
      type="button"
      onClick={logout}
      className={`inline-flex items-center gap-2 rounded-card bg-red-600 text-white hover:bg-red-700 px-3 py-2 text-sm font-medium min-h-tap ${className}`}
      aria-label="Deconnexion"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      {showLabel ? <span>Deconnexion</span> : null}
    </button>
  );
}
