"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { api } from "@/lib/api";
import { decodeJwt, setStoredTokens, type UserRole } from "@/lib/auth";
import { getPostLoginRedirect } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AuthMode = "email" | "otp";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [mode, setMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const saveTokensAndRedirect = (access: string, refresh: string) => {
    setStoredTokens(access, refresh);
    document.cookie = `access_token=${access}; path=/; max-age=3600; SameSite=Lax`;
    const payload = decodeJwt(access);
    const role = (payload?.role ?? null) as UserRole | null;
    router.push(getPostLoginRedirect(role, locale));
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
      setError("Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSend = async () => {
    setLoading(true);
    try {
      await api.post("/auth/otp/send", { phone });
      setOtpSent(true);
    } catch {
      setError("Impossible d'envoyer le code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify", { phone, code: otp });
      saveTokensAndRedirect(data.access_token, data.refresh_token);
    } catch {
      setError("Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="font-display text-2xl text-ochre mb-6 text-center">{t("login")}</h1>
        <div className="flex gap-2 mb-6">
          {(["email", "otp"] as AuthMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 min-h-tap py-2 rounded-card text-sm ${
                mode === m ? "bg-ochre text-white" : "bg-dune text-night"
              }`}
            >
              {m === "email" ? "Email" : "SMS"}
            </button>
          ))}
        </div>
        {error && <p className="text-[var(--color-danger)] text-sm mb-4">{error}</p>}
        {mode === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <label className="block">
              <span className="text-sm">{t("email")}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-4 py-3 rounded-card border border-dune min-h-tap"
              />
            </label>
            <label className="block">
              <span className="text-sm">{t("password")}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-1 px-4 py-3 rounded-card border border-dune min-h-tap"
              />
            </label>
            <Button type="submit" fullWidth disabled={loading}>
              {t("login")}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <label className="block">
              <span className="text-sm">{t("phone")}</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212..."
                className="w-full mt-1 px-4 py-3 rounded-card border border-dune min-h-tap"
              />
            </label>
            {!otpSent ? (
              <Button type="button" fullWidth onClick={handleOtpSend} disabled={loading}>
                {t("otpSend")}
              </Button>
            ) : (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-card border border-dune min-h-tap text-center font-mono text-xl"
                />
                <Button type="submit" fullWidth disabled={loading}>
                  {t("otpVerify")}
                </Button>
              </>
            )}
          </form>
        )}
        <p className="mt-6 text-center text-sm">
          <Link href={`/${locale}/register`} className="text-atlantic hover:underline">
            {t("register")}
          </Link>
        </p>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          className="mt-4 block text-center text-sm text-night/70 hover:text-ochre"
        >
          Google
        </a>
      </Card>
    </div>
  );
}
