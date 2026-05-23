"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { clearStoredTokens } from "@/lib/auth";
import { api } from "@/lib/api";

export default function LogoutPage() {
  const params = useParams();
  const locale = (params.locale as string) || "fr";

  useEffect(() => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      api.post("/auth/logout", { refresh_token: refresh }).catch(() => {});
    }
    clearStoredTokens();
    window.location.replace(`/${locale}/auth/login`);
  }, [locale]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-night/70">Deconnexion en cours...</p>
    </div>
  );
}
