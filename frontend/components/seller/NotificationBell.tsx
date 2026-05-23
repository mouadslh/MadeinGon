"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  ShoppingCart,
  BadgeCheck,
  Truck,
  PackageCheck,
  PackageX,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  ShieldX,
  MessageSquare,
  X,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { getStoredTokens } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: { order_id?: string; product_id?: string };
  is_read: boolean;
  created_at: string;
};

const notifIcon: Record<string, React.ReactNode> = {
  new_order: <ShoppingCart size={16} className="text-blue-500" />,
  order_paid: <BadgeCheck size={16} className="text-green-500" />,
  order_shipped: <Truck size={16} className="text-indigo-500" />,
  order_delivered: <PackageCheck size={16} className="text-emerald-600" />,
  order_cancelled: <PackageX size={16} className="text-red-500" />,
  low_stock: <AlertTriangle size={16} className="text-orange-500" />,
  out_of_stock: <AlertCircle size={16} className="text-red-600" />,
  product_approved: <ShieldCheck size={16} className="text-green-600" />,
  product_rejected: <ShieldX size={16} className="text-red-500" />,
  new_review: <MessageSquare size={16} className="text-yellow-500" />,
};

function timeAgo(iso: string, locale: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}j`;
}

export function NotificationBell() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    api.get("/seller/notifications", { params: { limit: 15 } }).then((r) => {
      setItems(r.data.notifications || []);
      setUnreadCount(r.data.unread_count ?? 0);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
    const { access } = getStoredTokens();
    if (!access) return;
    const es = new EventSource(`${API_URL}/seller/notifications/stream?token=${encodeURIComponent(access)}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "ping" || data.type === "connected") return;
        setItems((prev) => [{ ...data, is_read: false } as Notif, ...prev].slice(0, 20));
        setUnreadCount((c) => c + 1);
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await api.patch("/seller/notifications/read-all");
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const onClickNotif = async (n: Notif) => {
    if (!n.is_read) {
      await api.patch(`/seller/notifications/${n.id}/read`).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.data?.order_id) {
      router.push(`/${locale}/seller/orders?order=${n.data.order_id}`);
    } else if (n.data?.product_id) {
      router.push(`/${locale}/seller/products`);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-card hover:bg-dune"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-dune rounded-card shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-dune">
            <span className="font-medium text-sm">Notifications</span>
            <button type="button" onClick={markAllRead} className="flex items-center gap-1 text-xs text-ochre hover:underline">
              <Check size={14} />
              Tout lire
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-night/50 p-4 text-center">Aucune notification</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onClickNotif(n)}
                  className={`w-full text-left px-3 py-2 flex gap-2 border-b border-dune/50 hover:bg-sand/50 ${
                    !n.is_read ? "bg-ochre/5" : ""
                  }`}
                >
                  <span className="mt-0.5">{notifIcon[n.type] || <Bell size={16} />}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">{n.title}</span>
                    <span className="block text-xs text-night/60 truncate">{n.body}</span>
                    <span className="text-xs text-night/40">{timeAgo(n.created_at, locale)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-dune text-center">
            <Link href={`/${locale}/seller/notifications`} className="text-xs text-ochre hover:underline" onClick={() => setOpen(false)}>
              Voir toutes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
