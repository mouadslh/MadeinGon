"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Stats {
  total_sellers: number;
  products_pending: number;
  orders_today: number;
  revenue_month: number;
  pending_applications: number;
}

interface Application {
  id: string;
  city: string;
  craft_type?: string;
  shop_name?: string;
  submitted_at: string;
}

export default function AdminDashboard() {
  const params = useParams();
  const locale = params.locale as string;
  const [stats, setStats] = useState<Stats | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);

  const load = async () => {
    const [s, a] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/sellers/pending"),
    ]);
    setStats(s.data);
    setApps(a.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const approve = async (id: string) => {
    await api.post(`/admin/sellers/${id}/approve`);
    load();
  };

  const reject = async (id: string) => {
    await api.post(`/admin/sellers/${id}/reject`, { admin_note: rejectNote });
    setRejectId(null);
    setRejectNote("");
    load();
  };

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl text-ochre mb-6">Tableau de bord</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Vendeurs" value={stats.total_sellers} />
          <StatCard label="Produits en attente" value={stats.products_pending} />
          <StatCard label="Commandes du jour" value={stats.orders_today} />
          <StatCard label="CA (MAD)" value={stats.revenue_month} />
        </div>
      )}
      <Card className="mb-8">
        <h2 className="font-medium mb-4">Applications en attente ({apps.length})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dune text-left">
              <th className="py-2">Boutique</th>
              <th>Ville</th>
              <th>Métier</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id} className="border-b border-dune/50">
                <td className="py-3">{app.shop_name || "—"}</td>
                <td>{app.city}</td>
                <td>{app.craft_type || "—"}</td>
                <td className="flex gap-2 py-3">
                  <Button variant="secondary" onClick={() => approve(app.id)}>
                    Approuver
                  </Button>
                  <Button variant="outline" onClick={() => setRejectId(app.id)}>
                    Rejeter
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {rejectId && (
        <Card>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Motif du refus"
            className="w-full border rounded-card p-3 mb-4"
          />
          <Button variant="outline" onClick={() => reject(rejectId)}>
            Confirmer le refus
          </Button>
        </Card>
      )}
      <Card className="mt-8">
        <h2 className="font-medium mb-4">Créer un compte vendeur</h2>
        <CreateSellerForm onDone={load} />
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-surface p-4 text-center">
      <p className="text-2xl font-mono text-ochre">{value}</p>
      <p className="text-sm text-night/70">{label}</p>
    </div>
  );
}

function CreateSellerForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "Guelmim",
    shop_name: "",
    craft_type: "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/admin/sellers/create", form);
    onDone();
  };
  return (
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
      {Object.entries(form).map(([k, v]) => (
        <input
          key={k}
          value={v}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          placeholder={k.replace("_", " ")}
          className="px-4 py-3 rounded-card border min-h-tap"
          required
        />
      ))}
      <Button type="submit" className="md:col-span-2">
        Créer et envoyer les identifiants par SMS
      </Button>
    </form>
  );
}
