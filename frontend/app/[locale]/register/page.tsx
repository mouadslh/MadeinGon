"use client";

import { Suspense, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { api } from "@/lib/api";
import { decodeJwt, setStoredTokens, syncAccessTokenCookie, type UserRole } from "@/lib/auth";
import { useCartStore } from "@/lib/cart-store";
import { getPostLoginRedirect } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

function RegisterInner() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const localeFromIntl = useLocale();
  const locale = (params.locale as string) || localeFromIntl;
  const isAr = locale === "ar";
  const redirect = searchParams.get("redirect");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        full_name: fullName,
        language: locale,
      });
      setStoredTokens(data.access_token, data.refresh_token);
      syncAccessTokenCookie();
      const payload = decodeJwt(data.access_token);
      if (payload?.sub) {
        useCartStore.getState().bindUser(payload.sub);
      }
      const role = (payload?.role ?? null) as UserRole | null;
      router.push(getPostLoginRedirect(role, locale, redirect));
      router.refresh();
    } catch {
      setError(t("registerError"));
    } finally {
      setLoading(false);
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <AuthLayout mode="register">
      <h1
        className="text-3xl md:text-4xl font-bold mb-2"
        style={{
          fontFamily: isAr ? "var(--font-arabic)" : "var(--font-display)",
          color: "var(--deep-green)",
        }}
      >
        {t("register")}
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--anthracite)", opacity: 0.7 }}>
        {isAr
          ? "أنشئ حسابك للوصول إلى الكتالوج والمفضلة"
          : "Créez votre compte pour accéder au catalogue et aux favoris"}
      </p>

      {error && (
        <p
          role="alert"
          className="text-sm mb-4 px-3 py-2 rounded-lg bg-red-50"
          style={{ color: "var(--color-danger)" }}
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium" style={{ color: "var(--anthracite)" }}>
            {t("fullName")}
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="w-full mt-1 px-4 py-3 rounded-card border border-[var(--warm-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ocre)] min-h-tap"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium" style={{ color: "var(--anthracite)" }}>
            {t("email")}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full mt-1 px-4 py-3 rounded-card border border-[var(--warm-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ocre)] min-h-tap"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium" style={{ color: "var(--anthracite)" }}>
            {t("password")}
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full mt-1 px-4 py-3 rounded-card border border-[var(--warm-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ocre)] min-h-tap"
          />
        </label>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? t("loading") : t("register")}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="flex-1 h-px bg-[var(--warm-border)]" />
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--anthracite)", opacity: 0.6 }}>
          {t("orWith")}
        </span>
        <span className="flex-1 h-px bg-[var(--warm-border)]" />
      </div>

      <a
        href={`${apiBase}/auth/google`}
        className="w-full inline-flex items-center justify-center gap-3 min-h-tap px-4 py-3 rounded-card bg-white border border-[var(--warm-border)] hover:bg-[var(--sand-dark)] transition-colors font-medium"
        style={{ color: "var(--anthracite)", fontFamily: isAr ? "var(--font-arabic)" : "var(--font-ui)" }}
      >
        <GoogleIcon size={20} />
        <span>{t("continueWithGoogle")}</span>
      </a>

      <p className="mt-8 text-center text-sm" style={{ color: "var(--anthracite)" }}>
        {t("haveAccount")}{" "}
        <Link
          href={`/${locale}/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-semibold hover:underline"
          style={{ color: "var(--ocre)" }}
        >
          {t("loginCta")}
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
