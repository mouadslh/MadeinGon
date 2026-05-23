"use client";

import { useTranslations } from "next-intl";

export function AuthenticityCell({
  score,
  cinVerified,
}: {
  score?: number | null;
  cinVerified?: boolean;
}) {
  const t = useTranslations("admin.sellers");

  return (
    <div className="flex flex-col gap-1 items-start">
      <span className="font-mono text-sm text-ochre" title={t("authenticity")}>
        {score != null ? `${score}%` : "—"}
      </span>
      {cinVerified ? (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 whitespace-nowrap">
          {t("cinVerified")}
        </span>
      ) : null}
    </div>
  );
}
