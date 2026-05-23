"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function AdminPasswordSettingsPage() {
  const t = useTranslations("admin.settings");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (newPassword.length < 8) return setError(t("passwordMin"));
    if (newPassword !== confirmPassword) return setError(t("passwordMismatch"));
    if (newPassword === currentPassword) return setError(t("passwordSame"));
    await api.patch("/admin/profile/password", { current_password: currentPassword, new_password: newPassword });
  };

  return (
    <div className="max-w-xl w-full space-y-4">
      <h1 className="font-display text-xl sm:text-2xl text-ochre mb-4">{t("passwordTitle")}</h1>
      <div className="space-y-3">
        <input
          type="password"
          className="w-full border rounded-card p-3 min-h-tap"
          placeholder={t("currentPassword")}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          className="w-full border rounded-card p-3 min-h-tap"
          placeholder={t("newPassword")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          className="w-full border rounded-card p-3 min-h-tap"
          placeholder={t("confirmPassword")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button onClick={save} className="w-full sm:w-auto">
          {t("updatePassword")}
        </Button>
      </div>
    </div>
  );
}
