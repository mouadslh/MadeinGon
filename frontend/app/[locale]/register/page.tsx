"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { api } from "@/lib/api";
import { setStoredTokens } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        full_name: fullName,
        language: locale,
      });
      setStoredTokens(data.access_token, data.refresh_token);
      document.cookie = `access_token=${data.access_token}; path=/; max-age=3600; SameSite=Lax`;
      router.push(`/${locale}`);
    } catch {
      setError("Inscription impossible");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="font-display text-2xl text-ochre mb-6 text-center">{t("register")}</h1>
        {error && <p className="text-[var(--color-danger)] text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-card border border-dune min-h-tap"
          />
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-card border border-dune min-h-tap"
          />
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-card border border-dune min-h-tap"
          />
          <Button type="submit" fullWidth>
            {t("register")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href={`/${locale}/login`} className="text-atlantic">
            {t("login")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
