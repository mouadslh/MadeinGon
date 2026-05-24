"use client";

import { formatPrice } from "@/lib/api";

type DayPoint = { date: string; amount: number };

type Props = {
  data: DayPoint[];
  locale: string;
  rtl?: boolean;
  periodDays: number;
};

export function SalesChart({ data, locale, rtl = false, periodDays }: Props) {
  const t = (fr: string, ar: string) => (rtl ? ar : fr);

  // Fill missing days with 0 for a continuous chart
  const filled: DayPoint[] = [];
  const byDate = new Map(data.map((d) => [d.date, d.amount]));
  const today = new Date();
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    filled.push({ date: key, amount: byDate.get(key) ?? 0 });
  }

  const max = Math.max(...filled.map((d) => d.amount), 1);
  const showLabels = periodDays <= 14;

  return (
    <article className="bg-white rounded-xl border border-[var(--goun-mist)] p-6">
      <h2 className="text-sm font-semibold text-[var(--goun-forest)] mb-1 goun-font-ui">
        {t("Évolution des ventes", "تطور المبيعات")}
      </h2>
      <p className="text-xs text-night/50 mb-6">
        {t(`Revenus sur ${periodDays} jours`, `الإيرادات خلال ${periodDays} يوماً`)}
      </p>

      {filled.every((d) => d.amount === 0) ? (
        <div className="h-48 flex items-center justify-center text-sm text-night/40 goun-font-ui">
          {t("Pas encore de ventes sur cette période.", "لا مبيعات في هذه الفترة بعد.")}
        </div>
      ) : (
        <div className="h-48 flex items-end gap-1">
          {filled.map((point) => {
            const h = Math.max((point.amount / max) * 100, point.amount > 0 ? 4 : 0);
            const label = new Date(point.date).toLocaleDateString(locale, {
              day: "numeric",
              month: "short",
            });
            return (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center justify-end group min-w-0"
                title={`${label}: ${formatPrice(point.amount, locale)}`}
              >
                <div
                  className="w-full rounded-t-md bg-[var(--goun-forest)]/80 group-hover:bg-[var(--goun-earth)] transition-colors"
                  style={{ height: `${h}%` }}
                />
                {showLabels && (
                  <span className="text-[9px] text-night/40 mt-1 truncate w-full text-center">
                    {new Date(point.date).getDate()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between mt-4 pt-3 border-t border-[var(--goun-mist)] text-xs text-night/50">
        <span>
          {filled[0] &&
            new Date(filled[0].date).toLocaleDateString(locale, { day: "numeric", month: "short" })}
        </span>
        <span className="font-mono text-[var(--goun-earth)]">
          {t("Max", "الأعلى")}: {formatPrice(max === 1 && filled.every((d) => d.amount === 0) ? 0 : max, locale)}
        </span>
        <span>
          {filled[filled.length - 1] &&
            new Date(filled[filled.length - 1].date).toLocaleDateString(locale, {
              day: "numeric",
              month: "short",
            })}
        </span>
      </div>
    </article>
  );
}
