"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ActiveBadge, StatusBadge } from "@/components/admin/AdminBadges";
import { CinViewButton } from "@/components/admin/CinViewButton";

type SellerApplication = {
  id: string;
  user_id?: string;
  full_name?: string;
  email?: string | null;
  city: string;
  shop_name?: string | null;
  status: string;
  submitted_at: string;
  cin_image_url?: string | null;
  authenticity_score?: number | null;
};

type SellerAccount = {
  id: string;
  seller_profile_id?: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  seller_status: string | null;
  created_at: string;
  cin_url?: string | null;
  cin_verified?: boolean;
  authenticity_score?: number;
  shop_name?: string | null;
  city?: string | null;
};

type ApplicationStats = { pending: number; approved: number; rejected: number };
type PlatformStats = {
  pending_applications?: number;
  approved_applications?: number;
  rejected_applications?: number;
};

export default function AdminSellersPage() {
  const t = useTranslations("admin.sellers");
  const tc = useTranslations("common");
  const [tab, setTab] = useState<"applications" | "accounts">("applications");
  const [items, setItems] = useState<SellerApplication[]>([]);
  const [accounts, setAccounts] = useState<SellerAccount[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({ pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState<"" | "PENDING" | "APPROVED" | "REJECTED">("");
  const [accountFilter, setAccountFilter] = useState<"" | "active" | "suspended">("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    const listStatus = statusFilter || "all";
    try {
      let apps: SellerApplication[] = [];
      let statsData: ApplicationStats = { pending: 0, approved: 0, rejected: 0 };
      try {
        const [appsRes, statsRes] = await Promise.all([
          api.get<SellerApplication[]>("/admin/sellers/applications", {
            params: statusFilter ? { status: statusFilter } : undefined,
          }),
          api.get<ApplicationStats>("/admin/sellers/applications/stats"),
        ]);
        apps = appsRes.data;
        statsData = statsRes.data;
      } catch {
        const [appsRes, statsRes] = await Promise.all([
          api.get<SellerApplication[]>("/admin/sellers/pending", { params: { status: listStatus } }),
          api.get<PlatformStats>("/admin/stats"),
        ]);
        apps = appsRes.data;
        statsData = {
          pending: statsRes.data.pending_applications ?? 0,
          approved: statsRes.data.approved_applications ?? 0,
          rejected: statsRes.data.rejected_applications ?? 0,
        };
      }
      setItems(apps);
      setStats(statsData);
    } catch {
      setItems([]);
      setStats({ pending: 0, approved: 0, rejected: 0 });
      setError(t("loadApplicationsError"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<{ items: SellerAccount[] }>("/admin/sellers", {
        params: accountFilter ? { status: accountFilter } : undefined,
      });
      setAccounts(data.items || []);
    } catch {
      setAccounts([]);
      setError(t("loadAccountsError"));
    } finally {
      setLoading(false);
    }
  }, [accountFilter]);

  useEffect(() => {
    if (tab === "applications") loadApplications().catch(() => {});
    else loadAccounts().catch(() => {});
  }, [tab, loadApplications, loadAccounts]);

  const approve = async (id: string) => {
    try {
      await api.post(`/admin/sellers/${id}/approve`);
      setMessage(t("approvedMsg"));
      setError("");
      setRejectId(null);
      await loadApplications();
    } catch {
      setMessage("");
      setError(t("approveError"));
    }
  };

  const reject = async (id: string) => {
    if (!rejectNote.trim()) return;
    try {
      await api.post(`/admin/sellers/${id}/reject`, { admin_note: rejectNote });
      setMessage(t("rejectedMsg"));
      setError("");
      setRejectId(null);
      setRejectNote("");
      await loadApplications();
    } catch {
      setMessage("");
      setError(t("rejectError"));
    }
  };

  const deactivateSeller = async (seller: SellerAccount) => {
    try {
      await api.patch(`/admin/users/${seller.id}/deactivate`);
      setMessage(t("deactivatedMsg", { name: seller.full_name }));
      await loadAccounts();
    } catch {
      setError(t("deactivateError"));
    }
  };

  const toggleCinVerified = async (seller: SellerAccount, verified: boolean) => {
    try {
      await api.patch(`/admin/sellers/${seller.id}`, { cin_verified: verified });
      setMessage(t("cinVerified"));
      await loadAccounts();
    } catch {
      setError(t("approveError"));
    }
  };

  const reactivateSeller = async (seller: SellerAccount) => {
    try {
      await api.patch(`/admin/users/${seller.id}/activate`);
      setMessage(t("reactivatedMsg", { name: seller.full_name }));
      await loadAccounts();
    } catch {
      setError(t("reactivateError"));
    }
  };

  const appFilters: { value: "" | "PENDING" | "APPROVED" | "REJECTED"; label: string }[] = [
    { value: "", label: t("filterAll") },
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  return (
    <div className="max-w-6xl w-full space-y-4">
      <h1 className="font-display text-xl sm:text-2xl text-ochre">{t("title")}</h1>

      {message ? <p className="text-sm px-3 py-2 rounded-card bg-green-100 text-green-800">{message}</p> : null}
      {error ? <p className="text-sm px-3 py-2 rounded-card bg-red-100 text-red-800">{error}</p> : null}

      <div className="flex flex-wrap gap-2 border-b border-dune pb-2">
        <button
          type="button"
          onClick={() => setTab("applications")}
          className={`px-3 sm:px-4 py-2 rounded-card text-sm min-h-tap ${
            tab === "applications" ? "bg-ochre text-white" : "bg-dune hover:bg-dune/80"
          }`}
        >
          {t("tabApplications")}
        </button>
        <button
          type="button"
          onClick={() => setTab("accounts")}
          className={`px-3 sm:px-4 py-2 rounded-card text-sm min-h-tap ${
            tab === "accounts" ? "bg-ochre text-white" : "bg-dune hover:bg-dune/80"
          }`}
        >
          {t("tabAccounts")}
        </button>
      </div>

      {tab === "applications" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard label={t("pending")} value={stats.pending} />
            <StatCard label={t("approved")} value={stats.approved} />
            <StatCard label={t("rejected")} value={stats.rejected} />
          </div>
          <div className="flex flex-wrap gap-2">
            {appFilters.map((f) => (
              <button
                key={f.value || "all"}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-2 rounded-card text-sm min-h-tap ${
                  statusFilter === f.value ? "bg-ochre text-white" : "bg-dune hover:bg-dune/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <ApplicationsTable
            loading={loading}
            items={items}
            statusFilter={statusFilter}
            onApprove={approve}
            onRejectClick={setRejectId}
            t={t}
            tc={tc}
          />
          {rejectId ? (
            <Card>
              <h2 className="font-medium mb-3">{t("rejectTitle")}</h2>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder={t("rejectPlaceholder")}
                className="w-full border border-dune rounded-card p-3 mb-4 min-h-[80px]"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => reject(rejectId)}>
                  {tc("confirm")}
                </Button>
                <Button variant="secondary" onClick={() => setRejectId(null)}>
                  {tc("cancel")}
                </Button>
              </div>
            </Card>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["", t("filterAll")],
                ["active", t("filterActive")],
                ["suspended", t("filterSuspended")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value || "all"}
                type="button"
                onClick={() => setAccountFilter(value)}
                className={`px-3 py-2 rounded-card text-sm min-h-tap ${
                  accountFilter === value ? "bg-ochre text-white" : "bg-dune hover:bg-dune/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Card>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-dune text-start">
                    <th className="py-2 pe-3">{t("name")}</th>
                    <th className="py-2 pe-3">{t("shop")}</th>
                    <th className="py-2 pe-3">{t("cin")}</th>
                    <th className="py-2 pe-3">{t("authenticity")}</th>
                    <th className="py-2 pe-3 hidden sm:table-cell">{t("phone")}</th>
                    <th className="py-2 pe-3">{t("shopStatus")}</th>
                    <th className="py-2 pe-3">{t("account")}</th>
                    <th className="py-2">{tc("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-night/60">
                        {tc("loading")}
                      </td>
                    </tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-night/60">
                        {t("noAccounts")}
                      </td>
                    </tr>
                  ) : (
                    accounts.map((s) => (
                      <tr key={s.id} className="border-b border-dune/50">
                        <td className="py-3 pe-3 font-medium">{s.full_name}</td>
                        <td className="py-3 pe-3">{s.shop_name || tc("none")}</td>
                        <td className="py-3 pe-3">
                          <CinViewButton
                            url={s.cin_url}
                            viewLabel={t("cinView")}
                            missingLabel={t("cinMissing")}
                            openInBrowserLabel={t("cinOpenBrowser")}
                            closeLabel={tc("cancel")}
                          />
                        </td>
                        <td className="py-3 pe-3 min-w-[120px]">
                          <AuthenticityBar score={s.authenticity_score ?? 0} />
                          <label className="flex items-center gap-1 mt-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(s.cin_verified)}
                              onChange={(e) => toggleCinVerified(s, e.target.checked)}
                            />
                            {t("cinVerified")}
                          </label>
                        </td>
                        <td className="py-3 pe-3 hidden sm:table-cell">{s.phone || tc("none")}</td>
                        <td className="py-3 pe-3 capitalize">{s.seller_status || tc("none")}</td>
                        <td className="py-3 pe-3">
                          <ActiveBadge active={s.is_active} />
                        </td>
                        <td className="py-3">
                          {s.is_active ? (
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs whitespace-nowrap"
                              onClick={() => deactivateSeller(s)}
                            >
                              <Ban size={14} className="inline me-1" />
                              {t("deactivate")}
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              className="text-xs whitespace-nowrap"
                              onClick={() => reactivateSeller(s)}
                            >
                              <CheckCircle size={14} className="inline me-1" />
                              {t("reactivate")}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function ApplicationsTable({
  loading,
  items,
  statusFilter,
  onApprove,
  onRejectClick,
  t,
  tc,
}: {
  loading: boolean;
  items: SellerApplication[];
  statusFilter: string;
  onApprove: (id: string) => void;
  onRejectClick: (id: string) => void;
  t: (key: string) => string;
  tc: (key: string) => string;
}) {
  return (
    <Card>
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-dune text-start">
              <th className="py-2 pe-3">{t("name")}</th>
              <th className="py-2 pe-3">{t("email")}</th>
              <th className="py-2 pe-3">{t("city")}</th>
              <th className="py-2 pe-3 hidden md:table-cell">{t("shop")}</th>
              <th className="py-2 pe-3">{t("cin")}</th>
              <th className="py-2 pe-3">{t("authenticity")}</th>
              <th className="py-2 pe-3">{t("date")}</th>
              <th className="py-2 pe-3">{t("status")}</th>
              <th className="py-2">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-night/60">
                  {tc("loading")}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-night/60">
                  {t("noApplications")}
                  {statusFilter ? ` (${statusFilter})` : ""}
                </td>
              </tr>
            ) : (
              items.map((app) => (
                <tr key={app.id} className="border-b border-dune/50">
                  <td className="py-3 pe-3 font-medium">{app.full_name || tc("none")}</td>
                  <td className="py-3 pe-3 break-all">{app.email || tc("none")}</td>
                  <td className="py-3 pe-3">{app.city}</td>
                  <td className="py-3 pe-3 hidden md:table-cell">{app.shop_name || tc("none")}</td>
                  <td className="py-3 pe-3">
                    <CinViewButton
                      url={app.cin_image_url}
                      viewLabel={t("cinView")}
                      missingLabel={t("cinMissing")}
                      openInBrowserLabel={t("cinOpenBrowser")}
                      closeLabel={tc("cancel")}
                    />
                  </td>
                  <td className="py-3 pe-3 min-w-[100px]">
                    <AuthenticityBar score={app.authenticity_score ?? 0} />
                  </td>
                  <td className="py-3 pe-3 whitespace-nowrap">{new Date(app.submitted_at).toLocaleDateString()}</td>
                  <td className="py-3 pe-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3">
                    {app.status === "PENDING" ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="secondary" className="text-xs" onClick={() => onApprove(app.id)}>
                          {t("approve")}
                        </Button>
                        <Button variant="outline" className="text-xs" onClick={() => onRejectClick(app.id)}>
                          {t("reject")}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-night/50 text-xs">{tc("none")}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AuthenticityBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-dune overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-night/60">{score}%</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-surface p-3 sm:p-4 text-center">
      <p className="text-xl sm:text-2xl font-mono text-ochre">{value}</p>
      <p className="text-xs sm:text-sm text-night/70">{label}</p>
    </div>
  );
}
