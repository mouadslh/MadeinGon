"use client";

import { useTranslations } from "next-intl";

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-night text-white",
  SELLER: "bg-ochre text-white",
  USER: "bg-dune text-night",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] || "bg-dune text-night";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>{role}</span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin.badges");
  const mapped =
    status === "PENDING"
      ? t("pending")
      : status === "APPROVED"
        ? t("approved")
        : status === "REJECTED"
          ? t("rejected")
          : status;
  const style = STATUS_STYLES[status] || "bg-dune text-night";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>{mapped}</span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  const t = useTranslations("admin.badges");
  return active ? (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      {t("active")}
    </span>
  ) : (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      {t("inactive")}
    </span>
  );
}
