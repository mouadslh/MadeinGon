"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function AdminProfileSettingsPage() {
  const t = useTranslations("admin.settings");
  const tc = useTranslations("common");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => {
        setFullName(r.data.full_name || "");
        setEmail(r.data.email || "");
        setAvatarUrl(r.data.avatar_url || "");
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    await api.patch("/admin/profile", { full_name: fullName, avatar_url: avatarUrl || null });
    setSaved(t("saved"));
  };

  return (
    <div className="max-w-xl w-full space-y-4">
      <h1 className="font-display text-xl sm:text-2xl text-ochre mb-4">{t("profileTitle")}</h1>
      <div className="space-y-3">
        <input
          className="w-full border rounded-card p-3 min-h-tap"
          placeholder={t("fullName")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          aria-label={t("email")}
          className="w-full border rounded-card p-3 bg-dune/40 min-h-tap"
          value={email}
          readOnly
        />
        <input
          className="w-full border rounded-card p-3 min-h-tap"
          placeholder={t("avatarUrl")}
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
        <Button onClick={save} className="w-full sm:w-auto">
          {tc("save")}
        </Button>
        {saved ? <p className="text-sm text-green-700">{saved}</p> : null}
      </div>
    </div>
  );
}
