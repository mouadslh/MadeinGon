import { create } from "zustand";

export interface CartItem {
  productId: string;
  sellerId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  ownerId: string | null;
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  bindUser: (userId: string | null) => void;
}

function storageKey(userId: string | null): string {
  return userId ? `made-in-goun-cart:${userId}` : "made-in-goun-cart:guest";
}

function loadItems(userId: string | null): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { items?: CartItem[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

function saveItems(userId: string | null, items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify({ items }));
}

export const useCartStore = create<CartState>()((set, get) => ({
  ownerId: null,
  items: [],

  bindUser: (userId) => {
    const current = get().ownerId;
    if (current === userId) return;
    saveItems(current, get().items);
    set({ ownerId: userId, items: loadItems(userId) });
  },

  addItem: (item, qty = 1) => {
    const existing = get().items.find((i) => i.productId === item.productId);
    const items = existing
      ? get().items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i
        )
      : [...get().items, { ...item, quantity: qty }];
    set({ items });
    saveItems(get().ownerId, items);
  },

  removeItem: (productId) => {
    const items = get().items.filter((i) => i.productId !== productId);
    set({ items });
    saveItems(get().ownerId, items);
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const items = get().items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    set({ items });
    saveItems(get().ownerId, items);
  },

  clear: () => {
    set({ items: [] });
    saveItems(get().ownerId, []);
  },

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
