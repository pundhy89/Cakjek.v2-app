import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ServiceHeader } from "../components/ServiceHeader";
import { api, formatIDR } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { Star, Bike } from "lucide-react";

export default function CakfoodList() {
  const { lang } = useApp();
  const [merchants, setMerchants] = useState([]);
  useEffect(() => { api.get("/merchants").then((r) => setMerchants(r.data)); }, []);
  return (
    <div data-testid="cakfood-page" className="min-h-screen">
      <ServiceHeader title={t(lang, "cakfood")} color="bg-orange-500">
        <p className="text-white/85 text-sm mt-1">Pilih warung favoritmu</p>
      </ServiceHeader>
      <div className="px-5 -mt-6 space-y-3">
        {merchants.map((m) => (
          <Link
            to={`/cakfood/${m.id}`}
            key={m.id}
            data-testid={`merchant-${m.id}`}
            className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md active:scale-[0.98] transition"
          >
            {m.image && <img src={m.image} alt={m.name} className="w-20 h-20 rounded-xl object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-foreground truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="inline-flex items-center gap-1 text-amber-500"><Star size={12} fill="currentColor" />{m.rating}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Bike size={12} /> {formatIDR(m.delivery_fee)}</span>
              </div>
            </div>
          </Link>
        ))}
        {merchants.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Belum ada warung</p>}
      </div>
    </div>
  );
}
