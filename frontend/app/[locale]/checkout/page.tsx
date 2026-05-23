"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice, api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CheckoutPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { items, total, clear } = useCartStore();
  const [payment, setPayment] = useState<"COD" | "CARD">("COD");
  const [addressId, setAddressId] = useState("");

  const placeOrder = async () => {
    if (!items.length) return;
    const sellerId = items[0].sellerId || prompt("ID vendeur (démo):") || "";
    const addr = addressId || prompt("ID adresse (démo):") || "";
    if (!sellerId || !addr) return;
    await api.post("/orders", {
      seller_id: sellerId,
      address_id: addr,
      payment_method: payment,
      items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    });
    clear();
    router.push(`/${locale}/orders`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-ochre mb-6">Paiement</h1>
      <Card className="space-y-4">
        <p className="font-mono text-xl">Total: {formatPrice(total(), locale)}</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 min-h-tap">
            <input type="radio" checked={payment === "COD"} onChange={() => setPayment("COD")} />
            Paiement à la livraison (COD)
          </label>
          <label className="flex items-center gap-3 min-h-tap">
            <input type="radio" checked={payment === "CARD"} onChange={() => setPayment("CARD")} />
            Carte CMI (bientôt)
          </label>
        </div>
        <Button fullWidth onClick={placeOrder}>
          Confirmer la commande
        </Button>
      </Card>
    </div>
  );
}
