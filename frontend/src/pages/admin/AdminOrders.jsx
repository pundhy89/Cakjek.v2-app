import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";

export default function AdminOrders() {
  const { lang } = useApp();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/admin/orders").then((r) => setOrders(r.data));
  }, []);

  return (
    <div data-testid="admin-orders">
      <h1 className="font-heading text-3xl font-bold">{t(lang, "orders")}</h1>
      <p className="text-muted-foreground text-sm mt-1">Semua pesanan terbaru.</p>

      <div className="mt-6 bg-card rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">{t(lang, "time")}</th>
              <th className="px-4 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">{t(lang, "customer")}</th>
              <th className="px-4 py-3 font-semibold">{t(lang, "total")}</th>
              <th className="px-4 py-3 font-semibold">{t(lang, "status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold uppercase text-xs">{o.service}</td>
                <td className="px-4 py-3">
                  <p>{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                </td>
                <td className="px-4 py-3">{formatIDR(o.total)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{o.status}</span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">{t(lang, "no_orders")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
