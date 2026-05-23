"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import {
  decodeJwt,
  getStoredTokens,
  isAuthenticated,
  setStoredTokens,
  syncAccessTokenCookie,
} from "@/lib/auth";
import { useCartStore } from "@/lib/cart-store";

/** Sync cookie (middleware), refresh JWT role from DB, bind cart to current user. */
export function AuthSync() {
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      syncAccessTokenCookie();

      if (!isAuthenticated()) {
        useCartStore.getState().bindUser(null);
        return;
      }

      try {
        const { refresh, access } = getStoredTokens();
        const { data: me } = await api.get<{ id: string; role: string }>("/auth/me");
        if (cancelled) return;

        useCartStore.getState().bindUser(me.id);

        const tokenRole = access ? decodeJwt(access)?.role : null;
        if (refresh && tokenRole && tokenRole !== me.role) {
          const { data: tokens } = await api.post<{ access_token: string; refresh_token: string }>(
            "/auth/refresh",
            { refresh_token: refresh }
          );
          if (cancelled) return;
          setStoredTokens(tokens.access_token, tokens.refresh_token);
          syncAccessTokenCookie();
        }
      } catch {
        if (!cancelled) {
          useCartStore.getState().bindUser(null);
        }
      }
    };

    sync();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
