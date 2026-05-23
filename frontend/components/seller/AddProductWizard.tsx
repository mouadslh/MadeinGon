"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mic, Upload, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { uploadProductImageToCloudinary } from "@/lib/cloudinary-upload";
import { getImageUrl } from "@/lib/product-image";
import { getCopy, type GounLang } from "@/lib/goun-copy";
import { GounFonts } from "@/components/goun/GounFonts";

const STEPS = ["Informations", "Photos", "Prix & Stock", "Confirmation"];
const STEPS_AR = ["المعلومات", "الصور", "السعر والمخزون", "التأكيد"];

const DEMO_VOICE = {
  title_fr: "Huile d'argan bio pressée à froid",
  title_ar: "زيت أركان عضوي معصور على البارد",
  price: "180",
  city: "Guelmim",
};

export function AddProductWizard() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const lang: GounLang = locale === "ar" ? "ar" : "fr";
  const rtl = lang === "ar";
  const copy = getCopy(lang);

  const [step, setStep] = useState(0);
  const [listening, setListening] = useState(false);
  const [titleFr, setTitleFr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("Guelmim");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [shipping, setShipping] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name_fr: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const simulateVoice = () => {
    setListening(true);
    setTimeout(() => {
      setTitleFr(DEMO_VOICE.title_fr);
      setTitleAr(DEMO_VOICE.title_ar);
      setPrice(DEMO_VOICE.price);
      setCity(DEMO_VOICE.city);
      if (categories[0]) setCategory(String(categories[0].id));
      setListening(false);
    }, 2200);
  };

  const onFile = (file: File) => {
    setImageFile(file);
    setCloudinaryUrl(null);
    setUploadError("");
    setPreview(URL.createObjectURL(file));
    setEnhanced(false);
    setEnhancing(true);
    setTimeout(() => {
      setEnhancing(false);
      setEnhanced(true);
    }, 1800);
  };

  const publish = async () => {
    setLoading(true);
    setUploadError("");
    try {
      let finalImageUrl = cloudinaryUrl;
      if (imageFile && !finalImageUrl) {
        finalImageUrl = await uploadProductImageToCloudinary(imageFile);
        setCloudinaryUrl(finalImageUrl);
      }
      await api.post("/products", {
        category_id: Number(category) || categories[0]?.id,
        title_fr: titleFr,
        title_ar: titleAr || null,
        price: Number(price),
        stock: Number(stock),
        image_urls: finalImageUrl ? [finalImageUrl] : [],
      });
      router.push(`/${locale}/seller/products`);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setUploadError(
        typeof detail === "string"
          ? detail
          : rtl
            ? "فشل الرفع إلى Cloudinary"
            : "Échec upload Cloudinary — vérifiez backend/.env"
      );
    } finally {
      setLoading(false);
    }
  };

  const stepsLabel = rtl ? STEPS_AR : STEPS;

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"} className="max-w-3xl mx-auto">
        <ol className="flex justify-between mb-10 gap-2 overflow-x-auto">
          {stepsLabel.map((label, i) => (
            <li
              key={label}
              className={`flex-1 text-center text-xs goun-font-ui pb-2 border-b-2 ${
                i <= step ? "border-[var(--goun-forest)] text-[var(--goun-forest)]" : "border-[var(--goun-mist)] text-[var(--goun-charcoal)]/50"
              }`}
            >
              <span className="block font-bold mb-1">{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="space-y-6 bg-white rounded-2xl border border-[var(--goun-mist)] p-6 shadow-sm">
            <div className="flex flex-col items-center py-6">
              <button
                type="button"
                onClick={simulateVoice}
                disabled={listening}
                className={`w-24 h-24 rounded-full bg-[var(--goun-earth)] text-white flex items-center justify-center goun-voice-pulse min-h-tap ${
                  listening ? "opacity-80" : "hover:bg-[var(--goun-forest)]"
                }`}
                aria-label={copy.seller.voice as string}
              >
                <Mic className="w-10 h-10" />
              </button>
              <p className="mt-4 goun-font-ui text-sm text-center text-[var(--goun-charcoal)]">
                {listening ? (copy.seller.listening as string) : (copy.seller.voice as string)}
              </p>
              {listening && (
                <svg className="mt-4 w-48 h-8" viewBox="0 0 200 32" aria-hidden>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <rect
                      key={i}
                      x={i * 28 + 4}
                      y={8}
                      width={8}
                      height={16}
                      fill="var(--goun-earth)"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </svg>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="goun-font-ui text-sm">
                {rtl ? "الاسم (فرنسي)" : "Nom (FR)"}
                <input
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]"
                />
              </label>
              <label className="goun-font-ui text-sm goun-font-ar">
                الاسم (عربي)
                <input
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  dir="rtl"
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]"
                />
              </label>
            </div>
            <label className="goun-font-ui text-sm block">
              {rtl ? "الفئة" : "Catégorie"}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]"
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_fr}
                  </option>
                ))}
              </select>
            </label>
            <label className="goun-font-ui text-sm block">
              {rtl ? "مدينة المنشأ" : "Ville d'origine"}
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]"
              >
                {["Guelmim", "Tan-Tan", "Sidi Ifni", "Assa-Zag"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 rounded-full bg-[var(--goun-forest)] text-white goun-font-ui min-h-tap"
            >
              {rtl ? "التالي" : "Suivant"}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-2xl border border-dashed border-[var(--goun-earth)] p-6 bg-[var(--goun-sand)]">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
            {!preview ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-16 flex flex-col items-center gap-3 text-[var(--goun-earth)] min-h-tap"
              >
                <Upload className="w-10 h-10" />
                <span className="goun-font-ui">{rtl ? "اسحب الصور أو انقر للرفع" : "Glissez ou cliquez pour uploader"}</span>
              </button>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs goun-font-ui mb-2 opacity-70">{rtl ? "أصلية" : "Originale"}</p>
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image src={preview} alt="" fill className="object-cover" unoptimized />
                  </div>
                </div>
                <div>
                  <p className="text-xs goun-font-ui mb-2 text-[var(--goun-earth)]">
                    {enhancing ? `✨ ${copy.seller.enhance}` : rtl ? "محسّنة" : "Améliorée IA"}
                  </p>
                  <div
                    className={`relative aspect-square rounded-lg overflow-hidden ${
                      enhancing ? "goun-shimmer" : ""
                    }`}
                  >
                    {enhanced && (
                      <Image
                        src={preview}
                        alt=""
                        fill
                        className="object-cover"
                        style={{ filter: "contrast(1.05) saturate(1.1) brightness(1.03)" }}
                        unoptimized
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 rounded-full border min-h-tap goun-font-ui">
                {rtl ? "رجوع" : "Retour"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!preview}
                className="flex-1 py-3 rounded-full bg-[var(--goun-forest)] text-white min-h-tap goun-font-ui disabled:opacity-50"
              >
                {rtl ? "التالي" : "Suivant"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 bg-white rounded-2xl border p-6">
            <label className="goun-font-ui text-sm block">
              {rtl ? "السعر (درهم)" : "Prix (MAD)"}
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]"
              />
            </label>
            <label className="goun-font-ui text-sm block">
              {rtl ? "المخزون" : "Stock"}
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-[var(--goun-mist)]"
              />
            </label>
            <label className="flex items-center gap-3 goun-font-ui text-sm cursor-pointer">
              <input type="checkbox" checked={shipping} onChange={(e) => setShipping(e.target.checked)} className="accent-[var(--goun-forest)]" />
              {rtl ? "شحن متاح" : "Options de livraison"}
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-full border min-h-tap">
                {rtl ? "رجوع" : "Retour"}
              </button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 rounded-full bg-[var(--goun-forest)] text-white min-h-tap">
                {rtl ? "التالي" : "Suivant"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--goun-sand)]">
              <Check className="w-6 h-6 text-[var(--goun-forest)] shrink-0" />
              <div className="goun-font-ui text-sm space-y-1">
                <p>
                  <strong>{rtl ? titleAr || titleFr : titleFr || titleAr}</strong>
                </p>
                <p>
                  {city} · {price} MAD · {rtl ? "مخزون" : "Stock"} {stock}
                </p>
              </div>
            </div>
            {uploadError ? (
              <p className="text-sm text-red-600 goun-font-ui">{uploadError}</p>
            ) : null}
            <button
              type="button"
              onClick={publish}
              disabled={loading}
              className="w-full py-4 rounded-full bg-[var(--goun-forest)] text-white font-medium goun-font-ui min-h-tap hover:bg-[var(--goun-earth)] transition-colors"
            >
              {copy.seller.publish as string}
            </button>
          </div>
        )}
      </div>
    </GounFonts>
  );
}
