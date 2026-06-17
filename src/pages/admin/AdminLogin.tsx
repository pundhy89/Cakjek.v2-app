import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { adminLogin } from '@/lib/api';
import { toast } from 'sonner';

const AdminLogin: React.FC = () => {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = adminLogin(username, password);
      setLoading(false);
      if (ok) { nav('/admin', { replace: true }); }
      else { toast.error('Username atau password salah'); }
    }, 600);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[hsl(221_83%_53%)] to-[hsl(250_83%_60%)] p-4">
      {/* Back button */}
      <Link to="/" className="absolute top-5 left-5 w-10 h-10 rounded-2xl bg-white/20 backdrop-blur grid place-items-center text-white hover:bg-white/30 transition active:scale-90">
        <ArrowLeft size={18} />
      </Link>
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary grid place-items-center shadow-lg mb-4">
            <span className="text-3xl font-black text-primary-foreground">C</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground text-balance">Panel Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Masuk ke dashboard CakJek</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="input-field pl-9"
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••"
                className="input-field pl-9 pr-10"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-extrabold py-3.5 rounded-2xl mt-2 transition hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
            Masuk
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          CakJek Admin Panel · Akses Terbatas
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
