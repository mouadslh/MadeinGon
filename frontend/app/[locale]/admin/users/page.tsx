"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { ActiveBadge, RoleBadge } from "@/components/admin/AdminBadges";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AdminUser = {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  is_active: boolean;
  seller_status?: string | null;
  created_at: string;
};

type UsersResponse = {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

const ROLES = ["", "USER", "SELLER", "ADMIN"] as const;

export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const tc = useTranslations("common");
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<UsersResponse>("/admin/users", {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
          role: role || undefined,
        },
      });
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const toggleActive = async (user: AdminUser, activate: boolean) => {
    if (user.role === "ADMIN") return;
    try {
      await api.patch(activate ? `/admin/users/${user.id}/activate` : `/admin/users/${user.id}/deactivate`);
      setMessage(activate ? t("activatedMsg") : t("deactivatedMsg"));
      await load();
    } catch {
      setMessage(t("actionError"));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-6xl w-full space-y-4">
      <h1 className="font-display text-xl sm:text-2xl text-ochre">{t("title")}</h1>

      {message ? (
        <p className="text-sm px-3 py-2 rounded-card bg-green-100 text-green-800">{message}</p>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder={t("search")}
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="flex-1 px-4 py-3 rounded-card border border-dune bg-white min-h-tap"
        />
        <select
          aria-label={t("filterRole")}
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
          className="px-4 py-3 rounded-card border border-dune bg-sand min-w-full sm:min-w-[160px] min-h-tap"
        >
          <option value="">{t("allRoles")}</option>
          {ROLES.filter(Boolean).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-dune text-start">
                <th className="py-2 pe-4">{t("name")}</th>
                <th className="py-2 pe-4">{t("email")}</th>
                <th className="py-2 pe-4">{t("role")}</th>
                <th className="py-2 pe-4">{t("status")}</th>
                <th className="py-2 pe-4 hidden md:table-cell">{t("joined")}</th>
                <th className="py-2">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-night/60">
                    {tc("loading")}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-night/60">
                    {t("noUsers")}
                  </td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className="border-b border-dune/50">
                    <td className="py-3 pe-4 font-medium">{u.full_name}</td>
                    <td className="py-3 pe-4 text-night/80 break-all">{u.email || tc("none")}</td>
                    <td className="py-3 pe-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3 pe-4">
                      <ActiveBadge active={u.is_active} />
                    </td>
                    <td className="py-3 pe-4 whitespace-nowrap hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {u.role !== "ADMIN" ? (
                        u.is_active ? (
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs whitespace-nowrap"
                            onClick={() => toggleActive(u, false)}
                          >
                            <Ban size={14} className="inline me-1" />
                            {t("deactivate")}
                          </Button>
                        ) : (
                          <Button variant="secondary" className="text-xs whitespace-nowrap" onClick={() => toggleActive(u, true)}>
                            <CheckCircle size={14} className="inline me-1" />
                            {t("reactivate")}
                          </Button>
                        )
                      ) : (
                        <span className="text-night/40 text-xs">{tc("none")}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <span className="text-night/70">
            {total === 1 ? t("count", { count: total }) : t("countPlural", { count: total })}
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary flex-1 sm:flex-none px-3 py-2 disabled:opacity-50 min-h-tap"
            >
              {tc("previous")}
            </button>
            <span className="px-2 py-2 flex items-center">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary flex-1 sm:flex-none px-3 py-2 disabled:opacity-50 min-h-tap"
            >
              {tc("next")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
