import React, { useEffect, useState } from 'react';
import { Activity, Clock, CheckCircle2, XCircle, RotateCcw, Inbox } from 'lucide-react';
import { formatIDR } from '@/lib/api';

interface LocalOrder {
  id: string;
  service: string;
  total: number;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.FC<{ size: number }> }> = {
  new: { label: 'Baru', color: 'text-blue-500', icon: Clock },
  process: { label: 'Diproses', color: 'text-amber-500', icon: RotateCcw },
  done: { label: 'Selesai', color: 'text-[hsl(var(--success))]', icon: CheckCircle2 },
  cancel: { label: 'Dibatalkan', color: 'text-destructive', icon: XCircle },
};

const SERVICE_LABELS: Record<string, { label: string; emoji: string }> = {
  cakride: { label: 'CakRide', emoji: '🛵' },
  cakcar: { label: 'CakCar', emoji: '🚗' },
  cakfood: { label: 'CakFood', emoji: '🍴' },
  caksend: { label: 'CakSend', emoji: '📦' },
  cakmart: { label: 'CakMart', emoji: '🛒' },
  cakpay: { label: 'CakPay', emoji: '💳' },
};

const Aktivitas: React.FC = () => {
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cakjek_orders');
    if (stored) {
      try { setOrders(JSON.parse(stored)); } catch { setOrders([]); }
    }
  }, []);

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="px-5 pt-10 pb-6" style={{ background: 'linear-gradient(135deg, hsl(320 85% 52%), hsl(280 80% 55%))' }}>
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-2xl bg-white/20 grid place-items-center">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">Aktivitas</h1>
            <p className="text-xs text-white/70">Riwayat pesanan kamu</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-muted grid place-items-center">
              <Inbox size={36} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">Belum ada pesanan</p>
              <p className="text-sm text-muted-foreground mt-1">Pesanan kamu akan muncul di sini</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const svc = SERVICE_LABELS[o.service] ?? { label: o.service, emoji: '📌' };
              const st = STATUS_LABELS[o.status] ?? STATUS_LABELS.new;
              const Icon = st.icon;
              return (
                <div key={o.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-muted grid place-items-center text-xl">
                        {svc.emoji}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{svc.label}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-foreground">{formatIDR(o.total)}</p>
                      <span className={`flex items-center gap-1 text-xs font-semibold mt-1 ${st.color}`}>
                        <Icon size={11} /> {st.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Aktivitas;
