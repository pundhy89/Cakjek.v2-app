import React, { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { getTariffs, upsertTariff, formatIDR } from '@/lib/api';
import type { Tariff } from '@/types/index';
import { toast } from 'sonner';

const SERVICES: { key: Tariff['service']; label: string; emoji: string; color: string; flatRate?: boolean }[] = [
  { key: 'cakride', label: 'CakRide (Ojek)', emoji: '🛵', color: 'from-orange-400 to-orange-600' },
  { key: 'cakcar', label: 'CakCar (Taxi)', emoji: '🚗', color: 'from-blue-400 to-blue-600' },
  { key: 'caksend', label: 'CakSend (Kurir)', emoji: '📦', color: 'from-amber-400 to-amber-600' },
  { key: 'cakfood', label: 'CakFood (Pesan Makan)', emoji: '🍴', color: 'from-rose-400 to-rose-600' },
  { key: 'cakmart', label: 'CakMart (Ongkir Belanja)', emoji: '🛒', color: 'from-emerald-400 to-emerald-600', flatRate: true },
  { key: 'caklangganan', label: 'CakLangganan (Paket Bulanan)', emoji: '🗓', color: 'from-purple-400 to-purple-600', flatRate: true },
];

const AdminTariff: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, { base_fare: number; per_km: number; label: string }>>({});

  useEffect(() => {
    getTariffs().then((ts) => {
      setTariffs(ts);
      const f: Record<string, { base_fare: number; per_km: number; label: string }> = {};
      for (const t of ts) f[t.service] = { base_fare: t.base_fare, per_km: t.per_km, label: t.label };
      // defaults
      for (const s of SERVICES) {
        if (!f[s.key]) f[s.key] = { base_fare: 5000, per_km: 2500, label: s.label };
      }
      setForms(f);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (service: string) => {
    const f = forms[service];
    if (!f) return;
    setSaving(service);
    try {
      await upsertTariff(service, f);
      toast.success(`Tarif ${service} disimpan`);
      setTariffs((prev) => {
        const exists = prev.find((t) => t.service === service);
        if (exists) return prev.map((t) => t.service === service ? { ...t, ...f } : t);
        return [...prev, { id: service, service: service as Tariff['service'], ...f }];
      });
    } catch { toast.error('Gagal menyimpan tarif'); }
    finally { setSaving(null); }
  };

  const setField = (service: string, key: string, val: string | number) => {
    setForms((p) => ({ ...p, [service]: { ...p[service], [key]: val } }));
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground text-sm">Memuat tarif...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold">Manajemen Tarif</h2>
        <p className="text-sm text-muted-foreground">Atur tarif layanan, ongkir, dan paket berlangganan</p>
      </div>

      <div className="space-y-4">
        {SERVICES.map((s) => {
          const f = forms[s.key] ?? { base_fare: 0, per_km: 0, label: s.label };
          const preview = s.flatRate ? f.base_fare : f.base_fare + f.per_km * 5;
          return (
            <div key={s.key} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className={`bg-gradient-to-r ${s.color} px-5 py-3 flex items-center gap-3`}>
                <span className="text-2xl">{s.emoji}</span>
                <div className="text-white">
                  <p className="font-extrabold text-sm">{s.label}</p>
                  <p className="text-xs text-white/70">
                    {s.flatRate ? `Tarif: ${formatIDR(preview)}` : `Contoh 5km: ${formatIDR(preview)}`}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {s.flatRate ? (
                  <FF label={s.key === 'cakmart' ? 'Ongkir Flat (Rp)' : 'Harga Paket Bulanan (Rp)'}>
                    <input type="number" value={f.base_fare} onChange={(e) => setField(s.key, 'base_fare', Number(e.target.value))} className="input-field" />
                  </FF>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <FF label="Tarif Dasar (Rp)">
                      <input type="number" value={f.base_fare} onChange={(e) => setField(s.key, 'base_fare', Number(e.target.value))} className="input-field" />
                    </FF>
                    <FF label="Per KM (Rp)">
                      <input type="number" value={f.per_km} onChange={(e) => setField(s.key, 'per_km', Number(e.target.value))} className="input-field" />
                    </FF>
                  </div>
                )}
                <FF label="Label (deskripsi)">
                  <input value={f.label} onChange={(e) => setField(s.key, 'label', e.target.value)} placeholder="Deskripsi tarif..." className="input-field" />
                </FF>
                <button
                  onClick={() => handleSave(s.key)}
                  disabled={saving === s.key}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {saving === s.key ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Simpan Tarif
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FF: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div><label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>{children}</div>
);

export default AdminTariff;
