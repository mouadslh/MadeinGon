"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

interface SellerPublic {
  id: string;
  shop_name: string;
  city: string;
  region?: string;
  avatar_url?: string | null;
  bio_fr?: string | null;
  bio_ar?: string | null;
  rating?: number;
  total_sales?: number;
  is_verified?: boolean;
}

export default function PublicSellerPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const [seller, setSeller] = useState<SellerPublic | null>(null);

  useEffect(() => {
    api.get(`/sellers/${id}/public`).then((r) => setSeller(r.data)).catch(() => {});
  }, [id]);

  if (!seller) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-night/60">
        {locale === "ar" ? "جاري التحميل..." : "Chargement..."}
      </div>
    );
  }

  const bio = locale === "ar" && seller.bio_ar ? seller.bio_ar : seller.bio_fr;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/${locale}/catalogue`} className="text-atlantic text-sm mb-6 inline-block">
        {locale === "ar" ? "← الكتالوج" : "← Catalogue"}
      </Link>
      <Card className="text-center">
        {seller.avatar_url && (
          <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
            <Image src={seller.avatar_url} alt="" fill className="object-cover" />
          </div>
        )}
        <h1 className="font-display text-2xl text-ochre">{seller.shop_name}</h1>
        <p className="text-night/70 mt-1">
          {seller.city}
          {seller.region ? ` — ${seller.region}` : ""}
        </p>
        {bio && <p className="mt-4 text-sm text-night/80 leading-relaxed">{bio}</p>}
        {seller.is_verified && (
          <div className="mt-3">
            <VerifiedBadge size="sm" />
          </div>
        )}
      </Card>
    </div>
  );
}
