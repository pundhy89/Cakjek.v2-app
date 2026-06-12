import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";

export default function AdminDashboard() {
  const { lang } = useApp();
  const [report, setReport] = useState(null);
  const [monthly, setMonthly] = useState(null);

  useEffect(() => {
    api.get("/admin/reports/daily").then((r) => setReport(r.data));
    const now = new Date();
    api.get(`/admin/reports/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`).then((r) => setMonthly(r.data));
  }, []);

  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-heading text-3xl font-bold">{t(lang, "dashboard")}</h1>
      <p className="text-muted-foreground text-sm mt-1">Ringkasan performa CakJek hari ini & bulan ini.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Stat label="Pesanan Hari Ini" value={report?.count ?? "-"} accent="from-blue-500 to-blue-600" />
        <Stat label="Pendapatan Hari Ini" value={report ? formatIDR(report.total) : "-"} accent="from-emerald-500 to-emerald-600" />
        <Stat label="Pesanan Bulan Ini" value={monthly?.count ?? "-"} accent="from-orange-500 to-orange-600" />
        <Stat label="Pendapatan Bulan Ini" value={monthly ? formatIDR(monthly.total) : "-"} accent="from-pink-500 to-pink-600" />
      </div>

      {report?.by_service && (
        <div className="mt-8 bg-card rounded-3xl border border-black/5 dark:border-white/10 p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold">{t(lang, "by_service")} ({t(lang, "daily_report")})</h2>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            {Object.entries(report.by_service).map(([k, v]) => (
              <div key={k} className="bg-secondary/50 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{k}</p>
                <p className="font-heading text-lg font-bold mt-1">{v.count} order</p>
                <p className="text-xs text-muted-foreground">{formatIDR(v.total)}</p>
              </div>
            ))}
            {Object.keys(report.by_service).length === 0 && <p className="text-sm text-muted-foreground col-span-3">{t(lang, "no_orders")}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

const Stat = ({ label, value, accent }) => (
  <div className="rounded-2xl bg-card border border-black/5 dark:border-white/10 p-5 shadow-sm">
    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
    <p className="font-heading text-2xl font-bold mt-2">{value}</p>
    <div className={`h-1 mt-3 rounded-full bg-gradient-to-r ${accent}`} />
  </div>
);
