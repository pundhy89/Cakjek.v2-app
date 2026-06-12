import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const { lang, setAdmin } = useApp();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "admin", password: "admin" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/admin/login", form);
      setAdmin(r.data.token);
      toast.success("Welcome");
      nav("/admin");
    } catch (e) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
            <Shield className="text-white" size={26} />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">CakApp {t(lang, "admin")}</h1>
          <p className="text-zinc-400 text-sm mt-1">{t(lang, "login")}</p>
        </div>
        <form onSubmit={submit} className="bg-zinc-900/60 backdrop-blur border border-white/10 rounded-3xl p-6 space-y-3">
          <label className="block">
            <span className="text-xs text-zinc-400 font-medium">{t(lang, "username")}</span>
            <input data-testid="admin-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-1 w-full bg-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-400 font-medium">{t(lang, "password")}</span>
            <input data-testid="admin-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full bg-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-blue-500" />
          </label>
          <button data-testid="admin-login-btn" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-full transition active:scale-95">{loading ? "..." : t(lang, "login")}</button>
        </form>
      </div>
    </div>
  );
}
