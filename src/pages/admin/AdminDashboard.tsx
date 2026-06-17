import React, { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Clock, Users, RefreshCw } from 'lucide-react';
import { adminGetOrders, formatIDR } from '@/lib/api';
import type { Order } from '@/types/index';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SERVICE_LABELS: Record<string, string> = {
  cakride: 'CakRide', cakcar: 'CakCar', cakfood: 'CakFood',
  caksend: 'CakSend', cakmart: 'CakMart', cakpay: 'CakPay',
};

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminGetOrders().then(setOrders).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.created_at.slice(0, 10) === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  const byService = Object.entries(
    orders.reduce<Record<string, { count: number; total: number }>>((acc, o) => {
      if (!acc[o.service]) acc[o.service] = { count: 0, total: 0 };
      acc[o.service].count++;
      acc[o.service].total += o.total;
      return acc;
    }, {})
  ).map(([service, data]) => ({ service: SERVICE_LABELS[service] ?? service, ...data }));

  const STATS = [
    { label: 'Pesanan Hari Ini', value: todayOrders.length, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Pendapatan Hari Ini', value: formatIDR(todayRevenue), icon: TrendingUp, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { label: 'Total Pesanan', value: orders.length, icon: Clock, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'Total Pendapatan', value: formatIDR(totalRevenue), icon: Users, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Ringkasan aktivitas hari ini</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-4 shadow-sm border border-border h-full">
            <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5 text-balance">
              {loading ? <span className="h-5 w-16 bg-muted rounded animate-pulse inline-block" /> : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {byService.length > 0 && (
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <h3 className="font-bold text-sm mb-4">Pesanan per Layanan</h3>
          <div className="w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byService} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [val, 'Pesanan']}
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <h3 className="font-bold text-sm mb-4">Pesanan Terbaru</h3>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : orders.slice(0, 5).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesanan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 font-medium whitespace-nowrap">Pelanggan</th>
                  <th className="text-left pb-2 font-medium whitespace-nowrap">Layanan</th>
                  <th className="text-right pb-2 font-medium whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 text-sm font-medium whitespace-nowrap">{o.customer_name}</td>
                    <td className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{SERVICE_LABELS[o.service] ?? o.service}</td>
                    <td className="py-2.5 text-sm font-bold text-right whitespace-nowrap">{formatIDR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
