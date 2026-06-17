import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Bike, Car, Utensils, Package, ShoppingCart, Wallet, Building2, CalendarClock, Loader2, Check, Pencil,
} from 'lucide-react';
import { getServices, updateServiceActive, updateServiceOrder, updateServiceLabel } from '@/lib/api';
import type { ServiceItem } from '@/types/index';

const SERVICE_META: Record<string, { icon: React.FC<{ size: number; className?: string }>, color: string, desc: string }> = {
  cakride: { icon: Bike, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', desc: 'Ojek motor online' },
  cakcar: { icon: Car, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', desc: 'Taxi / taksi online' },
  cakfood: { icon: Utensils, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', desc: 'Pesan makanan restoran' },
  caksend: { icon: Package, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', desc: 'Kurir antar paket' },
  cakmart: { icon: ShoppingCart, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', desc: 'Belanja kebutuhan sehari-hari' },
  cakpay: { icon: Wallet, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', desc: 'Top up & tolong bayar' },
  cakkost: { icon: Building2, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', desc: 'Pencarian sewa kost' },
  cakrent: { icon: Car, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', desc: 'Rental kendaraan harian/bulanan' },
  caklangganan: { icon: CalendarClock, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', desc: 'Antar jemput berlangganan bulanan' },
};

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [orderEdits, setOrderEdits] = useState<Record<string, string>>({});
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  // label editing
  const [labelEdits, setLabelEdits] = useState<Record<string, string>>({});
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [savingLabel, setSavingLabel] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const data = await getServices(); setServices(data); }
    catch { toast.error('Gagal memuat data layanan'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (svc: ServiceItem) => {
    setToggling(svc.id);
    try {
      await updateServiceActive(svc.id, !svc.active);
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, active: !s.active } : s)));
      toast.success(`${svc.label} ${!svc.active ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch { toast.error('Gagal mengubah status layanan'); }
    finally { setToggling(null); }
  };

  const handleSaveOrder = async (svc: ServiceItem) => {
    const val = parseInt(orderEdits[svc.id] ?? String(svc.order_idx), 10);
    if (isNaN(val) || val < 1) { toast.error('Urutan harus angka positif'); return; }
    setSavingOrder(svc.id);
    try {
      await updateServiceOrder(svc.id, val);
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, order_idx: val } : s)).sort((a, b) => a.order_idx - b.order_idx));
      setOrderEdits((prev) => { const n = { ...prev }; delete n[svc.id]; return n; });
      toast.success('Urutan disimpan');
    } catch { toast.error('Gagal menyimpan urutan'); }
    finally { setSavingOrder(null); }
  };

  const startEditLabel = (svc: ServiceItem) => {
    setEditingLabel(svc.id);
    setLabelEdits((p) => ({ ...p, [svc.id]: svc.label }));
  };

  const handleSaveLabel = async (svc: ServiceItem) => {
    const newLabel = (labelEdits[svc.id] ?? svc.label).trim();
    if (!newLabel) { toast.error('Nama layanan tidak boleh kosong'); return; }
    setSavingLabel(svc.id);
    try {
      await updateServiceLabel(svc.id, newLabel);
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, label: newLabel } : s)));
      setEditingLabel(null);
      toast.success('Nama layanan diperbarui');
    } catch { toast.error('Gagal menyimpan nama'); }
    finally { setSavingLabel(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Manajemen Layanan</h1>
          <p className="text-sm text-muted-foreground mt-1">Aktifkan, ubah nama, dan atur urutan layanan di beranda</p>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 text-sm text-foreground/80">
        <strong>Catatan:</strong> Layanan nonaktif tetap muncul di beranda dengan tampilan abu-abu dan badge <span className="font-bold">"Coming Soon"</span>, namun tidak dapat diklik.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => {
            const meta = SERVICE_META[svc.id];
            const Icon = meta?.icon ?? Bike;
            const orderVal = orderEdits[svc.id] ?? String(svc.order_idx);
            const isOrderChanged = orderEdits[svc.id] !== undefined && orderEdits[svc.id] !== String(svc.order_idx);
            const isEditingThisLabel = editingLabel === svc.id;

            return (
              <div key={svc.id} className={`bg-card border rounded-2xl p-4 transition-all ${svc.active ? 'border-border/60' : 'border-border/30 opacity-60'}`}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${meta?.color ?? 'bg-muted text-muted-foreground'}`}>
                    <Icon size={20} />
                  </div>

                  {/* Info + label edit */}
                  <div className="flex-1 min-w-0">
                    {isEditingThisLabel ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          value={labelEdits[svc.id] ?? svc.label}
                          onChange={(e) => setLabelEdits((p) => ({ ...p, [svc.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLabel(svc); if (e.key === 'Escape') setEditingLabel(null); }}
                          autoFocus
                          className="flex-1 min-w-0 text-sm font-bold bg-background border border-primary rounded-lg px-2 py-1 text-foreground outline-none"
                        />
                        <button onClick={() => handleSaveLabel(svc)} disabled={savingLabel === svc.id}
                          className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50">
                          {savingLabel === svc.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        </button>
                        <button onClick={() => setEditingLabel(null)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition text-xs font-bold">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-sm text-foreground truncate">{svc.label}</span>
                        {!svc.active && (
                          <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-border shrink-0">Coming Soon</span>
                        )}
                        <button onClick={() => startEditLabel(svc)} className="ml-1 p-1 rounded-lg hover:bg-muted transition shrink-0" title="Edit nama">
                          <Pencil size={12} className="text-muted-foreground" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{meta?.desc ?? svc.id}</p>
                    <p className="text-[11px] text-muted-foreground/60 font-mono">ID: {svc.id}</p>
                  </div>

                  {/* Order input */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="text-right">
                      <label className="text-[10px] text-muted-foreground block mb-1">Urutan</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min={1} value={orderVal}
                          onChange={(e) => setOrderEdits((prev) => ({ ...prev, [svc.id]: e.target.value }))}
                          className="w-12 text-sm text-center border border-border rounded-lg px-1 py-1 bg-background text-foreground"
                        />
                        {isOrderChanged && (
                          <button onClick={() => handleSaveOrder(svc)} disabled={savingOrder === svc.id}
                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-lg font-semibold disabled:opacity-50">
                            {savingOrder === svc.id ? '...' : 'OK'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button onClick={() => handleToggle(svc)} disabled={toggling === svc.id}
                    className={`relative shrink-0 w-12 h-6 rounded-full transition-all duration-200 ${svc.active ? 'bg-primary' : 'bg-muted'} disabled:opacity-50`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${svc.active ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && (
        <div className="mt-6 bg-card border border-border/50 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total layanan</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{services.filter((s) => s.active).length} aktif</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm font-bold text-muted-foreground">{services.filter((s) => !s.active).length} nonaktif</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
