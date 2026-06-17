import React, { useEffect, useState } from 'react';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import ImageInput from '@/components/ImageInput';
import { getSettings, updateSettings, formatIDR } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { AppSettings } from '@/types/index';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const { reloadSettings } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AppSettings>({
    id: 'settings', app_name: 'CakJek', logo_url: '',
    whatsapp_number: '6285233962821', service_center_lat: -7.2575,
    service_center_lng: 112.7521, service_radius_km: 20, mart_delivery_fee: 7000,
  });

  useEffect(() => {
    getSettings().then((s) => { setForm(s); setLoading(false); });
  }, []);

  const setF = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.app_name.trim()) { toast.error('Nama aplikasi wajib diisi'); return; }
    setSaving(true);
    try {
      await updateSettings(form);
      await reloadSettings();
      toast.success('Pengaturan disimpan');
    } catch { toast.error('Gagal menyimpan pengaturan'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground text-sm">Memuat pengaturan...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold">Pengaturan Aplikasi</h2>
        <p className="text-sm text-muted-foreground">Konfigurasi umum CakJek</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* App identity */}
        <Section title="Identitas Aplikasi">
          <FF label="Nama Aplikasi">
            <input value={form.app_name} onChange={(e) => setF('app_name', e.target.value)} placeholder="CakJek" className="input-field" required />
          </FF>
          <ImageInput label="Logo Aplikasi" value={form.logo_url} onChange={(url) => setF('logo_url', url)} />
          <p className="text-xs text-muted-foreground">Logo dan nama tampil di header beranda aplikasi</p>
        </Section>

        {/* WhatsApp */}
        <Section title="WhatsApp">
          <FF label="Nomor WhatsApp (tanpa +)">
            <input value={form.whatsapp_number} onChange={(e) => setF('whatsapp_number', e.target.value)} placeholder="6285233962821" type="tel" className="input-field" />
          </FF>
          <p className="text-xs text-muted-foreground">Semua pesanan akan dikirim ke nomor ini</p>
        </Section>

        {/* Service area */}
        <Section title="Area Servis">
          <div className="grid grid-cols-2 gap-3">
            <FF label="Latitude Pusat">
              <input type="number" step="0.0001" value={form.service_center_lat} onChange={(e) => setF('service_center_lat', Number(e.target.value))} className="input-field" />
            </FF>
            <FF label="Longitude Pusat">
              <input type="number" step="0.0001" value={form.service_center_lng} onChange={(e) => setF('service_center_lng', Number(e.target.value))} className="input-field" />
            </FF>
          </div>
          <FF label="Radius Servis (km)">
            <input type="number" value={form.service_radius_km} onChange={(e) => setF('service_radius_km', Number(e.target.value))} className="input-field" />
          </FF>
          <p className="text-xs text-muted-foreground">Pesanan di luar radius akan ditolak. Set 0 untuk nonaktifkan.</p>
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-extrabold py-4 rounded-2xl transition hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Simpan Pengaturan
        </button>
      </form>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-4">
    <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">{title}</h3>
    {children}
  </div>
);

const FF: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div><label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>{children}</div>
);

export default AdminSettings;
