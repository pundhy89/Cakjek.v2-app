import React, { useEffect, useState } from 'react';
import { User, Save, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

const Akun: React.FC = () => {
  const { settings } = useApp();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cakjek_user_name');
    if (stored) setName(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('cakjek_user_name', name.trim());
    setSaved(true);
    toast.success('Profil disimpan');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="px-5 pt-10 pb-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(221 83% 53%), hsl(250 83% 60%))' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center gap-4 relative z-10 text-white">
          <div className="w-16 h-16 rounded-3xl bg-white/25 backdrop-blur grid place-items-center shadow-lg text-2xl font-black border-2 border-white/30">
            {name ? name.charAt(0).toUpperCase() : <User size={28} />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold">{name || 'Pengguna CakJek'}</h1>
            <p className="text-xs text-white/70">Pelanggan {settings.app_name}</p>
          </div>
        </div>
      </div>

      <div className="-mt-8 mx-4 relative z-10 space-y-3">
        {/* Profile form */}
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-4">
          <h2 className="font-bold text-sm text-foreground">Profil Saya</h2>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nama Lengkap</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama kamu..."
              className="input-field"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-2xl transition hover:bg-primary/90 active:scale-[0.98]"
          >
            {saved ? '✓ Tersimpan' : <><Save size={16} /> Simpan Profil</>}
          </button>
        </div>

        {/* App info */}
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-3">
          <h2 className="font-bold text-sm text-foreground">Tentang Aplikasi</h2>
          <div className="flex items-center gap-3">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.app_name} className="w-12 h-12 rounded-2xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center">
                <span className="text-xl font-black text-primary">C</span>
              </div>
            )}
            <div>
              <p className="font-bold text-foreground">{settings.app_name}</p>
              <p className="text-xs text-muted-foreground">Super App Ojek Lokal</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Versi 1.0.0</p>
        </div>

        {/* Admin link */}
        <Link
          to="/admin/login"
          className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-sm border border-border/50 text-sm hover:bg-muted/50 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
            <Shield size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Panel Admin</p>
            <p className="text-xs text-muted-foreground">Kelola aplikasi</p>
          </div>
          <span className="text-muted-foreground">›</span>
        </Link>
      </div>
    </div>
  );
};

export default Akun;
