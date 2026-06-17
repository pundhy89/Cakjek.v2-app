import React, { useState } from 'react';
import { BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import { getDailyReport, getMonthlyReport, formatIDR } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts';

const SERVICE_LABELS: Record<string, string> = {
  cakride: 'CakRide', cakcar: 'CakCar', cakfood: 'CakFood',
  caksend: 'CakSend', cakmart: 'CakMart', cakpay: 'CakPay',
};

const AdminReports: React.FC = () => {
  const [tab, setTab] = useState<'daily' | 'monthly'>('daily');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [dailyData, setDailyData] = useState<Awaited<ReturnType<typeof getDailyReport>> | null>(null);
  const [monthlyData, setMonthlyData] = useState<Awaited<ReturnType<typeof getMonthlyReport>> | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDaily = async () => {
    setLoading(true);
    try { setDailyData(await getDailyReport(date)); } finally { setLoading(false); }
  };

  const loadMonthly = async () => {
    setLoading(true);
    try { setMonthlyData(await getMonthlyReport(Number(year), Number(month))); } finally { setLoading(false); }
  };

  const dailyChartData = dailyData
    ? Object.entries(dailyData.by_service).map(([s, d]) => ({ service: SERVICE_LABELS[s] ?? s, pesanan: d.count, pendapatan: d.total }))
    : [];

  const monthlyChartData = monthlyData
    ? Object.entries(monthlyData.by_day)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, d]) => ({ day: day.slice(5), pesanan: d.count, pendapatan: d.total }))
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-foreground">Laporan</h2>
        <p className="text-sm text-muted-foreground">Analisis pesanan & pendapatan</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl">
        {[{ key: 'daily', label: 'Harian', icon: BarChart3 }, { key: 'monthly', label: 'Bulanan', icon: TrendingUp }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'daily' | 'monthly')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition ${tab === t.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'daily' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field flex-1" />
            <button onClick={loadDaily} disabled={loading} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm transition hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1.5 shrink-0">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Tampilkan
            </button>
          </div>

          {dailyData && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total Pesanan" value={String(dailyData.count)} />
                <StatCard label="Total Pendapatan" value={formatIDR(dailyData.total)} />
              </div>
              {dailyChartData.length > 0 && (
                <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                  <h3 className="font-bold text-sm mb-4">Per Layanan</h3>
                  <div className="w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dailyChartData} margin={{ left: -20, right: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="service" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                        <Bar dataKey="pesanan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Pesanan" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field flex-1">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="input-field w-28">
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={loadMonthly} disabled={loading} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm transition hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1.5 shrink-0">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Tampilkan
            </button>
          </div>

          {monthlyData && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total Pesanan" value={String(monthlyData.count)} />
                <StatCard label="Total Pendapatan" value={formatIDR(monthlyData.total)} />
              </div>
              {monthlyChartData.length > 0 && (
                <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                  <h3 className="font-bold text-sm mb-4">Trend Per Hari</h3>
                  <div className="w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={monthlyChartData} margin={{ left: -20, right: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                        <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8 }} />
                        <Line type="monotone" dataKey="pesanan" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Pesanan" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-card rounded-2xl p-4 shadow-sm border border-border h-full">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-extrabold text-foreground mt-1 text-balance">{value}</p>
  </div>
);

export default AdminReports;
