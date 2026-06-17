import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { adminGetOrders, updateOrderStatus, formatIDR } from '@/lib/api';
import type { Order } from '@/types/index';
import { toast } from 'sonner';

const STATUS_OPTIONS: { value: Order['status']; label: string; color: string }[] = [
  { value: 'new', label: 'Baru', color: 'text-blue-500' },
  { value: 'process', label: 'Diproses', color: 'text-amber-500' },
  { value: 'done', label: 'Selesai', color: 'text-green-600' },
  { value: 'cancel', label: 'Batal', color: 'text-destructive' },
];

const SERVICE_LABELS: Record<string, string> = {
  cakride: 'CakRide', cakcar: 'CakCar', cakfood: 'CakFood',
  caksend: 'CakSend', cakmart: 'CakMart', cakpay: 'CakPay',
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');

  const load = () => {
    setLoading(true);
    adminGetOrders().then(setOrders).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (filterService !== 'all' && o.service !== filterService) return false;
    return true;
  });

  const handleStatusChange = async (id: string, status: Order['status']) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      toast.success('Status pesanan diperbarui');
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  const getStatusIcon = (s: string) => {
    if (s === 'new') return <Clock size={13} className="text-blue-500" />;
    if (s === 'process') return <RotateCcw size={13} className="text-amber-500" />;
    if (s === 'done') return <CheckCircle2 size={13} className="text-green-600" />;
    return <XCircle size={13} className="text-destructive" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Manajemen Pesanan</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} pesanan</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition shrink-0">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field text-sm py-2 w-auto">
          <option value="all">Semua Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="input-field text-sm py-2 w-auto">
          <option value="all">Semua Layanan</option>
          {Object.entries(SERVICE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium whitespace-nowrap">Pelanggan</th>
                <th className="text-left p-3 font-medium whitespace-nowrap">Layanan</th>
                <th className="text-right p-3 font-medium whitespace-nowrap">Total</th>
                <th className="text-left p-3 font-medium whitespace-nowrap">Waktu</th>
                <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[1, 2, 3, 4, 5].map((j) => <td key={j} className="p-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-10 text-sm">Tidak ada pesanan</td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                    <td className="p-3 text-sm font-semibold whitespace-nowrap">{o.customer_name}</td>
                    <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">{SERVICE_LABELS[o.service] ?? o.service}</td>
                    <td className="p-3 text-sm font-bold text-right whitespace-nowrap">{formatIDR(o.total)}</td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(o.status)}
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as Order['status'])}
                          className="text-xs border border-border rounded-lg px-2 py-1 bg-background outline-none focus:ring-1 focus:ring-ring"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
