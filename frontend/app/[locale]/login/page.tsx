"use client";

import { Suspense, useEffect, useState } from "react";
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

type AuthMode = "email" | "otp";

function LoginInner() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const localeFromIntl = useLocale();
  const locale = (params.locale as string) || localeFromIntl;
  const isAr = locale === "ar";
  const redirect = searchParams.get("redirect");

  const [mode, setMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OAuth Google : si la callback nous renvoie ici avec des tokens en query
  useEffect(() => {
    const access = searchParams.get("access_token");
    const refresh = searchParams.get("refresh_token");
    if (access && refresh) {
      saveTokensAndRedirect(access, refresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTokensAndRedirect = (access: string, refresh: string) => {
    setStoredTokens(access, refresh);
    syncAccessTokenCookie();
    const payload = decodeJwt(access);
    if (payload?.sub) {
      useCartStore.getState().bindUser(payload.sub);
    }
    const role = (payload?.role ?? null) as UserRole | null;
    router.push(getPostLoginRedirect(role, locale, redirect));
    router.refresh();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveTokensAndRedirect(data.access_token, data.refresh_token);
    } catch {
      setError(t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSend = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/otp/send", { phone });
      setOtpSent(true);
    } catch {
      setError(t("otpSendError"));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/otp/verify", { phone, code: otp });
      saveTokensAndRedirect(data.access_token, data.refresh_token);
    } catch {
      setError(t("otpInvalid"));
    } finally {
      setLoading(false);
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <AuthLayout mode="login">
      <h1
        className="text-3xl md:text-4xl font-bold mb-2"
        style={{
          fontFamily: isAr ? "var(--font-arabic)" : "var(--font-display)",
          color: "var(--deep-green)",
        }}
      >
        {t("login")}
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--anthracite)", opacity: 0.7 }}>
        {isAr
          ? "تسجيل الدخول إلى حسابك Made in GON"
          : "Connectez-vous à votre compte Made in GON"}
      </p>

      <div className="flex gap-2 mb-6 rounded-full bg-[var(--warm-border)] p-1">
        {(["email", "otp"] as AuthMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 min-h-tap py-2 rounded-full text-sm font-medium transition-colors ${
              mode === m
                ? "bg-white shadow-warm text-[var(--deep-green)]"
                : "text-[var(--anthracite)]/70"
            }`}
          >
            {m === "email" ? t("tabEmail") : t("tabSms")}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm mb-4 px-3 py-2 rounded-lg bg-red-50"
          style={{ color: "var(--color-danger)" }}
        >
          {error}
        </p>
      )}

      {mode === "email" ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
              autoComplete="current-password"
              className="w-full mt-1 px-4 py-3 rounded-card border border-[var(--warm-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ocre)] min-h-tap"
            />
          </label>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? t("loading") : t("login")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpVerify} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium" style={{ color: "var(--anthracite)" }}>
              {t("phone")}
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+212..."
              autoComplete="tel"
              dir="ltr"
              className="w-full mt-1 px-4 py-3 rounded-card border border-[var(--warm-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ocre)] min-h-tap"
            />
          </label>
          {!otpSent ? (
            <Button type="button" fullWidth onClick={handleOtpSend} disabled={loading || !phone}>
              {loading ? t("loading") : t("otpSend")}
            </Button>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                autoComplete="one-time-code"
                dir="ltr"
                className="w-full px-4 py-3 rounded-card border border-[var(--warm-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ocre)] min-h-tap text-center font-mono text-xl tracking-widest"
              />
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? t("loading") : t("otpVerify")}
              </Button>
            </>
          )}
        </form>
      )}

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
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-semibold hover:underline"
          style={{ color: "var(--ocre)" }}
        >
          {t("registerCta")}
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
