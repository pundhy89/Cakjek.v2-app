import React from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { Receipt } from "lucide-react";

export default function Orders() {
  const { lang } = useApp();
  return (
    <div data-testid="orders-page" className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6 pt-10 pb-10 rounded-b-3xl">
        <h1 className="font-heading text-2xl font-bold">{t(lang, "orders")}</h1>
        <p className="text-blue-100 text-sm mt-1">Pesanan kamu dikirim ke WhatsApp admin</p>
      </div>
      <div className="px-5 mt-6">
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-8 text-center shadow-sm">
          <Receipt className="mx-auto mb-3 text-muted-foreground" size={36} />
          <p className="text-sm text-muted-foreground">{t(lang, "no_orders")}</p>
          <p className="text-xs text-muted-foreground mt-2">Cek riwayat pesananmu di WhatsApp.</p>
        </div>
      </div>
    </div>
  );
}
