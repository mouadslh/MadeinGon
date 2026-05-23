"use client";

import { useCallback, useEffect, useState } from "react";
import { create } from "zustand";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

type FavoritesState = {
  ids: Set<string>;
  hydrated: boolean;
  hydrating: boolean;
  hydrate: () => Promise<void>;
  set: (productId: string, value: boolean) => void;
  clear: () => void;
};

/**
 * Store global zustand des IDs de produits favoris pour l'utilisateur courant.
 * Hydraté au premier accès via `GET /favorites/ids`.
 */
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set<string>(),
  hydrated: false,
  hydrating: false,
  hydrate: async () => {
    if (get().hydrated || get().hydrating) return;
    if (!isAuthenticated()) {
      set({ hydrated: true });
      return;
    }
    set({ hydrating: true });
    try {
      const { data } = await api.get<string[]>("/favorites/ids");
      set({ ids: new Set(data.map(String)), hydrated: true });
    } catch {
      set({ hydrated: true });
    } finally {
      set({ hydrating: false });
    }
  },
  set: (productId, value) => {
    const next = new Set(get().ids);
    if (value) next.add(productId);
    else next.delete(productId);
    set({ ids: next });
  },
  clear: () => set({ ids: new Set<string>(), hydrated: false }),
}));

interface UseFavoriteResult {
  isFavorited: boolean;
  loading: boolean;
  toggle: () => Promise<boolean>;
}

/**
 * Hook par produit. Optimistic UI : on flip d'abord, on rollback si l'API échoue.
 *
 * - Si l'utilisateur n'est pas authentifié, `toggle()` renvoie `false`
 *   et ne fait aucune requête (le composant appelant doit gérer le redirect).
 */
export function useFavorite(productId: string | undefined | null): UseFavoriteResult {
  const ids = useFavoritesStore((s) => s.ids);
  const hydrated = useFavoritesStore((s) => s.hydrated);
  const hydrate = useFavoritesStore((s) => s.hydrate);
  const setLocal = useFavoritesStore((s) => s.set);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const id = productId ? String(productId) : "";
  const isFavorited = id ? ids.has(id) : false;

  const toggle = useCallback(async (): Promise<boolean> => {
    if (!id) return false;
    if (!isAuthenticated()) return false;
    const next = !isFavorited;
    setLocal(id, next);
    setLoading(true);
    try {
      if (next) await api.post(`/favorites/${id}`);
      else await api.delete(`/favorites/${id}`);
      return true;
    } catch {
      setLocal(id, !next);
      return false;
    } finally {
      setLoading(false);
    }
  }, [id, isFavorited, setLocal]);

  return {
    isFavorited,
    loading: loading || !hydrated,
    toggle,
  };
}
