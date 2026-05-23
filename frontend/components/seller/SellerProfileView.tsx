"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { SellerTabNav } from "./SellerTabNav";
import { GounFonts } from "@/components/goun/GounFonts";

type Profile = {
  shop_name?: string;
  bio_fr?: string;
  bio_ar?: string;
  city?: string;
  phone?: string;
  cin_verified?: boolean;
};

export function SellerProfileView() {
  const params = useParams();
  const locale = params.locale as string;
  const rtl = locale === "ar";
  const [profile, setProfile] = useState<Profile>({});
  const [name, setName] = useState("");
  const [bioFr, setBioFr] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [city, setCity] = useState("Guelmim");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    api.get("/sellers/profile").then((r) => {
      const d = r.data;
      setProfile(d);
      setName(d.shop_name || "");
      setBioFr(d.bio_fr || "");
      setBioAr(d.bio_ar || "");
      setCity(d.city || "Guelmim");
      setPhone(d.phone || "");
    }).catch(() => {});
  }, []);

  const t = (fr: string, ar: string) => (rtl ? ar : fr);
  const verified = profile.cin_verified;

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"} className="max-w-2xl">
        <SellerTabNav />
        <h1 className={`text-2xl text-[var(--goun-forest)] mb-6 ${rtl ? "goun-font-ar" : "goun-font-display"}`}>
          {t("Mon profil", "ملفي الشخصي")}
        </h1>

        <article className="bg-white rounded-xl border p-6 mb-8 shadow-sm">
          <p className="goun-font-ui text-xs uppercase tracking-widest text-[var(--goun-charcoal)]/50 mb-4">
            {t("Aperçu public", "معاينة للمشترين")}
          </p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--goun-forest)] text-white flex items-center justify-center text-2xl font-bold">
              {(name || "G")[0]}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{name || t("Mon atelier", "ورشتي")}</h2>
              <p className="text-sm text-[var(--goun-charcoal)]/60">{city}</p>
              {verified ? (
                <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-[var(--goun-gold)]/30 text-xs font-medium">
                  ✅ {t("Artisan vérifié GON", "حرفي موثق GON")}
                </span>
              ) : (
                <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-[var(--goun-mist)] text-xs">
                  ⏳ {t("En attente de vérification", "في انتظار التوثيق")}
                </span>
              )}
            </div>
          </div>
        </article>

        <form
          className="space-y-4 bg-white rounded-xl border p-6 goun-font-ui"
          onSubmit={(e) => {
            e.preventDefault();
            api.patch("/sellers/profile", { shop_name: name, bio_fr: bioFr, bio_ar: bioAr, city, phone }).catch(() => {});
          }}
        >
          <label className="block text-sm">
            {t("Nom de la boutique", "اسم المتجر")}
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]" />
          </label>
          <label className="block text-sm">
            Bio (FR)
            <textarea value={bioFr} onChange={(e) => setBioFr(e.target.value)} rows={3} className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]" />
          </label>
          <label className="block text-sm goun-font-ar">
            السيرة (AR)
            <textarea value={bioAr} onChange={(e) => setBioAr(e.target.value)} dir="rtl" rows={3} className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]" />
          </label>
          <label className="block text-sm">
            {t("Ville", "المدينة")}
            <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]" />
          </label>
          <label className="block text-sm">
            {t("Téléphone", "الهاتف")}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]" />
          </label>
          <label className="block text-sm">
            {t("Logo", "الشعار")}
            <input type="file" accept="image/*" className="mt-1 w-full text-sm" />
          </label>
          <button type="submit" className="w-full py-3 rounded-full bg-[var(--goun-forest)] text-white min-h-tap hover:bg-[var(--goun-earth)]">
            {t("Enregistrer", "حفظ")}
          </button>
        </form>
      </div>
    </GounFonts>
  );
}
