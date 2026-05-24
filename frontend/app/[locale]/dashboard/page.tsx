"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { VoiceInput } from "@/components/ai/VoiceInput";

export default function SellerDashboard() {
  const params = useParams();
  const locale = params.locale as string;
  const [stats, setStats] = useState<Record<string, number | string>>({});

  useEffect(() => {
    api.get("/sellers/dashboard").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-ochre mb-2">{stats.shop_name || "Mon atelier"}</h1>
      <p className="text-night/70 mb-8">Tableau de bord vendeur</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card><p className="font-mono text-2xl text-ochre">{stats.products_count ?? 0}</p><p className="text-sm">Produits</p></Card>
        <Card><p className="font-mono text-2xl text-ochre">{stats.orders_pending ?? 0}</p><p className="text-sm">Commandes</p></Card>
        <Card><p className="font-mono text-2xl text-ochre">{stats.revenue ?? 0}</p><p className="text-sm">Revenus MAD</p></Card>
        <Card><p className="font-mono text-2xl text-ochre">{stats.rating ?? 0}</p><p className="text-sm">Note</p></Card>
      </div>
      <div className="flex flex-wrap gap-4 mb-8">
        <Link href={`/${locale}/seller/products/new`} className="btn-primary">Nouveau produit</Link>
        <Link href={`/${locale}/orders`} className="btn-secondary">Commandes</Link>
        <Link href={`/${locale}/payments`} className="btn-outline border-ochre text-ochre px-6 py-3 rounded-card min-h-tap inline-flex">Paiements</Link>
      </div>
      <Card>
        <h2 className="font-medium mb-4">Assistant vocal — créer un produit</h2>
        <VoiceInput onFill={() => {}} />
      </Card>
    </div>
  );
}
