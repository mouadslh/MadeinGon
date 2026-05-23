"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CinUpload } from "@/components/seller/CinUpload";

const CITIES = ["Guelmim", "Tan-Tan", "Sidi Ifni", "Assa-Zag", "Tata", "Autre"];

export default function SellerApplyPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("Guelmim");
  const [shopName, setShopName] = useState("");
  const [craftType, setCraftType] = useState("");
  const [bio, setBio] = useState("");
  const [cinUrl, setCinUrl] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!cinUrl.startsWith("http")) {
      setError(
        locale === "ar"
          ? "يرجى رفع صورة البطاقة الوطنية قبل الإرسال."
          : "Veuillez téléverser votre CIN avant de soumettre."
      );
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/sellers/apply", {
        shop_name: shopName,
        city,
        craft_type: craftType,
        bio,
        cin_image_url: cinUrl,
      });
      setDone(true);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setError(typeof detail === "string" ? detail : locale === "ar" ? "فشل الإرسال" : "Échec de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Card>
          <p className="text-lg text-[var(--color-success)]">
            {locale === "ar"
              ? "تم إرسال طلبك. سيتم إعلامك خلال 24 ساعة."
              : "Votre demande a été soumise. Vous serez notifié sous 24h."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-display text-2xl text-ochre mb-4">
        {locale === "ar" ? "كن بائعاً" : "Devenir vendeur"}
      </h1>
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? "bg-ochre" : "bg-dune"}`} />
        ))}
      </div>
      <Card>
        {step === 1 && (
          <div className="space-y-4">
            <label className="block">
              {locale === "ar" ? "المدينة" : "Ville"}
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-card border min-h-tap"
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <Button fullWidth onClick={() => setStep(2)}>
              {locale === "ar" ? "التالي" : "Suivant"}
            </Button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <input
              placeholder={locale === "ar" ? "اسم المتجر" : "Nom de la boutique"}
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-3 rounded-card border min-h-tap"
              required
            />
            <input
              placeholder={locale === "ar" ? "نوع الحرفة" : "Type d'artisanat"}
              value={craftType}
              onChange={(e) => setCraftType(e.target.value)}
              className="w-full px-4 py-3 rounded-card border min-h-tap"
            />
            <textarea
              placeholder={locale === "ar" ? "قصتك (300 حرف كحد أقصى)" : "Votre histoire (300 car. max)"}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 rounded-card border min-h-24"
            />
            <CinUpload locale={locale} onUploaded={setCinUrl} />
            {cinUrl ? (
              <p className="text-xs text-[var(--color-success)]">
                {locale === "ar" ? "✓ تم رفع البطاقة على Cloudinary" : "✓ CIN téléversée sur Cloudinary"}
              </p>
            ) : null}
            <Button fullWidth onClick={() => setStep(3)} disabled={!shopName.trim() || !cinUrl}>
              {locale === "ar" ? "التالي" : "Suivant"}
            </Button>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-night/80">
              <strong>{shopName}</strong> — {city} — {craftType}
            </p>
            <p className="text-sm">{bio}</p>
            {cinUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cinUrl}
                alt="CIN"
                className="max-h-32 rounded-card border border-dune object-contain"
              />
            ) : null}
            <label className="flex items-center gap-2 min-h-tap">
              <input type="checkbox" required className="w-5 h-5" />
              {locale === "ar"
                ? "أقر بأن معلوماتي صحيحة"
                : "Je certifie que mes informations sont exactes"}
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button fullWidth onClick={submit} disabled={submitting || !cinUrl}>
              {submitting
                ? locale === "ar"
                  ? "جاري الإرسال..."
                  : "Envoi..."
                : locale === "ar"
                  ? "إرسال الطلب"
                  : "Soumettre"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
