"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function SellerAccountSettingsPage() {
  const [email] = useState("artisan@madeingoun.ma");
  const [language, setLanguage] = useState("fr");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const save = async () => {
    await api.patch("/seller/account", {
      language,
      current_password: currentPassword || null,
      new_password: newPassword || null,
    });
  };

  return (
    <div className="max-w-xl space-y-3">
      <h1 className="font-display text-2xl text-ochre mb-3">Account Settings</h1>
      <input className="w-full border rounded-card p-3 bg-dune/40" value={email} readOnly />
      <select className="w-full border rounded-card p-3" value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="fr">Francais</option>
        <option value="ar">Arabic</option>
        <option value="en">English</option>
      </select>
      <input type="password" className="w-full border rounded-card p-3" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <input type="password" className="w-full border rounded-card p-3" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Button onClick={save}>Save account</Button>
    </div>
  );
}
