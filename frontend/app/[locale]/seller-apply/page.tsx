"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const CITIES = ["Guelmim", "Tan-Tan", "Sidi Ifni", "Assa-Zag", "Tata", "Autre"];

export default function SellerApplyPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("Guelmim");
  const [shopName, setShopName] = useState("");
  const [craftType, setCraftType] = useState("");
  const [bio, setBio] = useState("");
  const [cinUrl, setCinUrl] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    await api.post("/sellers/apply", {
      shop_name: shopName,
      city,
      craft_type: craftType,
      bio,
      cin_image_url: cinUrl || "https://placeholder.local/cin.jpg",
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Card>
          <p className="text-lg text-[var(--color-success)]">
            Votre demande a été soumise. Vous serez notifié sous 24h.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-display text-2xl text-ochre mb-4">Devenir vendeur</h1>
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? "bg-ochre" : "bg-dune"}`} />
        ))}
      </div>
      <Card>
        {step === 1 && (
          <div className="space-y-4">
            <label className="block">
              Ville
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
              Suivant
            </Button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <input
              placeholder="Nom de la boutique"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-3 rounded-card border min-h-tap"
            />
            <input
              placeholder="Type d'artisanat"
              value={craftType}
              onChange={(e) => setCraftType(e.target.value)}
              className="w-full px-4 py-3 rounded-card border min-h-tap"
            />
            <textarea
              placeholder="Votre histoire (300 car. max)"
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 rounded-card border min-h-24"
            />
            <input
              type="url"
              placeholder="URL photo CIN (upload S3 en prod)"
              value={cinUrl}
              onChange={(e) => setCinUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-card border min-h-tap"
            />
            <Button fullWidth onClick={() => setStep(3)}>
              Suivant
            </Button>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-night/80">
              <strong>{shopName}</strong> — {city} — {craftType}
            </p>
            <p className="text-sm">{bio}</p>
            <label className="flex items-center gap-2 min-h-tap">
              <input type="checkbox" required className="w-5 h-5" />
              Je certifie que mes informations sont exactes
            </label>
            <Button fullWidth onClick={submit}>
              Soumettre
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
