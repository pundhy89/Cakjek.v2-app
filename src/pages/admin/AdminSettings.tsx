import React, { useEffect, useRef, useState } from 'react';
import { Save, Loader2, KeyRound, Database, Upload, Download, Eye, EyeOff } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import JSZip from 'jszip';
import ImageInput from '@/components/ImageInput';
import { getSettings, updateSettings, updateAdminCredentials } from '@/lib/api';
import { supabase } from '@/db/supabase';
import { useApp } from '@/contexts/AppContext';
import type { AppSettings } from '@/types/index';
import { toast } from 'sonner';

// Fix Leaflet default icons
const DefaultIcon = L.icon({
  iconUrl: markerIconUrl, iconRetinaUrl: markerIcon2xUrl, shadowUrl: markerShadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/** Mini map for picking service center lat/lng */
const CenterMapPicker: React.FC<{
  lat: number; lng: number;
  onChange: (lat: number, lng: number) => void;
}> = ({ lat, lng, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const p = marker.getLatLng();
      onChange(parseFloat(p.lat.toFixed(6)), parseFloat(p.lng.toFixed(6)));
    });
    markerRef.current = marker;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: la, lng: ln } = e.latlng;
      marker.setLatLng([la, ln]);
      onChange(parseFloat(la.toFixed(6)), parseFloat(ln.toFixed(6)));
    });

    mapInstRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
  }, []); // eslint-disable-line

  // Keep marker in sync when inputs change externally
  useEffect(() => {
    if (!mapInstRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapInstRef.current.setView([lat, lng], mapInstRef.current.getZoom());
  }, [lat, lng]);

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-48" />
      <p className="text-[10px] text-muted-foreground bg-muted/40 px-3 py-1.5">
        Klik peta atau seret pin untuk mengubah titik pusat area servis. © OpenStreetMap
      </p>
    </div>
  );
};

const AdminSettings: React.FC = () => {
  const { reloadSettings } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AppSettings>({
    id: 'settings', app_name: 'CakJek', logo_url: '',
    whatsapp_number: '6285233962821', service_center_lat: -7.2575,
    service_center_lng: 112.7521, service_radius_km: 20, mart_delivery_fee: 7000,
    admin_username: 'admin', admin_password: 'admin',
  });

  // credentials form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);

  // backup/import state
  const [backingUp, setBackingUp] = useState(false);
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSettings().then((s) => {
      setForm(s);
      setNewUsername(s.admin_username || 'admin');
      setLoading(false);
    });
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

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) { toast.error('Username tidak boleh kosong'); return; }
    if (newPassword && newPassword !== confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return; }
    if (newPassword && newPassword.length < 4) { toast.error('Password minimal 4 karakter'); return; }
    setSavingCreds(true);
    try {
      const pw = newPassword || form.admin_password;
      await updateAdminCredentials(newUsername.trim(), pw);
      setForm((p) => ({ ...p, admin_username: newUsername.trim(), admin_password: pw }));
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Kredensial admin diperbarui');
    } catch { toast.error('Gagal memperbarui kredensial'); }
    finally { setSavingCreds(false); }
  };

  // ---- BACKUP ----
  const BACKUP_TABLES = ['settings', 'banners', 'merchants', 'menu_items', 'tariffs', 'orders', 'services', 'kosts', 'vehicles'];

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const zip = new JSZip();
      for (const table of BACKUP_TABLES) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) { console.warn(`Skip ${table}:`, error.message); continue; }
        zip.file(`${table}.json`, JSON.stringify(data, null, 2));
      }
      zip.file('_meta.json', JSON.stringify({
        version: 1,
        app: 'CakJek',
        exported_at: new Date().toISOString(),
        tables: BACKUP_TABLES,
      }, null, 2));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cakjek-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup berhasil diunduh');
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat backup');
    } finally { setBackingUp(false); }
  };

  // ---- IMPORT ----
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) { toast.error('File harus berformat .zip'); return; }
    setImporting(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const meta = zip.file('_meta.json');
      if (!meta) { toast.error('File backup tidak valid (tidak ada _meta.json)'); setImporting(false); return; }
      const metaJson = JSON.parse(await meta.async('string'));
      if (metaJson.version !== 1) { toast.error('Versi backup tidak didukung'); setImporting(false); return; }

      let restored = 0;
      for (const table of BACKUP_TABLES) {
        const f = zip.file(`${table}.json`);
        if (!f) continue;
        const rows = JSON.parse(await f.async('string'));
        if (!Array.isArray(rows) || rows.length === 0) continue;
        const { error } = await supabase.from(table).upsert(rows);
        if (error) { console.warn(`Import ${table}:`, error.message); }
        else restored++;
      }
      toast.success(`Import selesai — ${restored} tabel dipulihkan`);
      await reloadSettings();
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengimpor backup');
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = '';
    }
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
          <CenterMapPicker
            lat={form.service_center_lat}
            lng={form.service_center_lng}
            onChange={(la, ln) => { setF('service_center_lat', la); setF('service_center_lng', ln); }}
          />
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

      {/* ---- CREDENTIALS ---- */}
      <form onSubmit={handleSaveCredentials}>
        <Section title="Keamanan Admin">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={16} className="text-primary" />
            <p className="text-sm font-semibold">Ganti Username & Password</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Username saat ini: <span className="font-mono font-bold">{form.admin_username}</span>. Kosongkan password jika tidak ingin mengubah.
          </p>
          <FF label="Username Baru">
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="admin"
              className="input-field"
              autoComplete="username"
            />
          </FF>
          <FF label="Password Baru (opsional)">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengganti"
                className="input-field pr-10"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FF>
          {newPassword && (
            <FF label="Konfirmasi Password Baru">
              <input
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="input-field"
                autoComplete="new-password"
              />
            </FF>
          )}
          <button
            type="submit"
            disabled={savingCreds}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
          >
            {savingCreds ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            Simpan Kredensial
          </button>
        </Section>
      </form>

      {/* ---- BACKUP / IMPORT ---- */}
      <Section title="Backup & Pemulihan Database">
        <div className="flex items-center gap-2 mb-1">
          <Database size={16} className="text-primary" />
          <p className="text-sm font-semibold">Ekspor & Impor Data</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Backup semua data (pengaturan, tarif, merchant, menu, banner, pesanan, kost, kendaraan) ke file .zip. Import untuk memulihkan dari backup.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleBackup}
            disabled={backingUp}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
          >
            {backingUp ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {backingUp ? 'Mengekspor...' : 'Download Backup (.zip)'}
          </button>

          <button
            type="button"
            onClick={() => importRef.current?.click()}
            disabled={importing}
            className="flex-1 flex items-center justify-center gap-2 border border-border bg-muted text-foreground px-5 py-3 rounded-xl text-sm font-semibold hover:bg-muted/80 transition disabled:opacity-60"
          >
            {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {importing ? 'Mengimpor...' : 'Import Backup (.zip)'}
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          ⚠️ Import akan menimpa data yang ada. Pastikan backup valid sebelum mengimpor.
        </p>
      </Section>
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
