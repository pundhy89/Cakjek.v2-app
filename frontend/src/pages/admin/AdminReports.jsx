import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminReports() {
  const { lang } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);

  useEffect(() => {
    api.get(`/admin/reports/daily?date=${date}`).then((r) => setDaily(r.data));
  }, [date]);

  useEffect(() => {
    api.get(`/admin/reports/monthly?year=${year}&month=${month}`).then((r) => setMonthly(r.data));
  }, [year, month]);

  const dailyByService = daily ? Object.entries(daily.by_service).map(([k, v]) => ({ service: k, revenue: v.total, count: v.count })) : [];
  const monthlyByDay = monthly ? Object.entries(monthly.by_day).map(([d, v]) => ({ day: d.slice(8), revenue: v.total })).sort((a, b) => a.day.localeCompare(b.day)) : [];

  return (
    <div data-testid="admin-reports">
      <h1 className="font-heading text-3xl font-bold">{t(lang, "reports")}</h1>
      <p className="text-muted-foreground text-sm mt-1">Laporan harian dan bulanan.</p>

      <div className="mt-6 bg-card rounded-3xl border border-black/5 dark:border-white/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold">{t(lang, "daily_report")}</h2>
          <input data-testid="report-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary px-3 py-1.5 rounded-xl text-sm outline-none" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <Mini label={t(lang, "transactions")} v={daily?.count ?? 0} />
          <Mini label={t(lang, "revenue")} v={formatIDR(daily?.total || 0)} />
          <Mini label={t(lang, "by_service")} v={Object.keys(daily?.by_service || {}).length} />
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyByService}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="service" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-3xl border border-black/5 dark:border-white/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold">{t(lang, "monthly_report")}</h2>
          <div className="flex gap-2">
            <select data-testid="report-month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-secondary px-3 py-1.5 rounded-xl text-sm outline-none">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input data-testid="report-year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-secondary px-3 py-1.5 rounded-xl text-sm outline-none w-24" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <Mini label={t(lang, "transactions")} v={monthly?.count ?? 0} />
          <Mini label={t(lang, "revenue")} v={formatIDR(monthly?.total || 0)} />
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyByDay}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const Mini = ({ label, v }) => (
  <div className="bg-secondary/60 rounded-2xl p-4">
    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
    <p className="font-heading text-xl font-bold mt-1">{v}</p>
  </div>
);
