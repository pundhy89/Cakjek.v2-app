import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bike, Car, Utensils, Package, ShoppingBag, Wallet, Shield, Search, Bell, Percent, Plus, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import BannerCarousel from "../components/BannerCarousel";

const services = [
  { key: "cakride", path: "/cakride", icon: Bike, color: "text-blue-500", badge: "Diskon" },
  { key: "cakcar", path: "/cakcar", icon: Car, color: "text-blue-500" },
  { key: "cakfood", path: "/cakfood", icon: Utensils, color: "text-rose-500" },
  { key: "cakmart", path: "/cakmart", icon: ShoppingBag, color: "text-teal-500" },
  { key: "caksend", path: "/caksend", icon: Package, color: "text-violet-500", badge: "Baru" },
  { key: "cakpay", path: "/cakpay", icon: Wallet, color: "text-orange-500" },
];

export default function Home() {
  const { lang } = useApp();
  return (
    <div data-testid="home-page" className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* search bar */}
      <div className="px-4 pt-5 pb-2 flex items-center gap-2 bg-white dark:bg-zinc-900">
        <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 rounded-full px-4 py-2.5">
          <input data-testid="home-search" placeholder="Cari makanan atau layanan..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          <div className="w-8 h-8 rounded-full bg-blue-500 grid place-items-center"><Search size={16} className="text-white" /></div>
        </div>
        <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 grid place-items-center"><Percent size={18} className="text-blue-500" /></button>
        <Link to="/admin/login" data-testid="admin-link" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 grid place-items-center"><Shield size={18} /></Link>
      </div>

      {/* banner carousel */}
      <div className="px-4">
        <BannerCarousel />
      </div>

      {/* CakPay wallet card */}
      <div className="px-4 mt-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl bg-gradient-to-r from-blue-500 to-blue-700 text-white p-5 shadow-lg shadow-blue-500/30 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm">
                <Wallet size={16} /> <span className="font-semibold">CakPay</span>
              </div>
              <p className="font-heading text-2xl font-extrabold mt-1.5">Rp 5.000</p>
              <p className="text-xs text-blue-100 mt-0.5">Klik untuk riwayat</p>
            </div>
            <div className="flex gap-2">
              <Link to="/cakpay" className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center hover:bg-white/25 transition"><Plus size={20} /></Link>
              <Link to="/cakpay" className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center hover:bg-white/25 transition"><Send size={18} /></Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Service grid (4 cols, white tiles, Mudico style) */}
      <div className="px-4 mt-5">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-3">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="relative">
                  {s.badge && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">{s.badge}</span>
                  )}
                  <Link to={s.path} data-testid={`service-${s.key}`} className="block">
                    <div className="aspect-square rounded-2xl bg-slate-50 dark:bg-zinc-800 grid place-items-center shadow-sm border border-slate-100 dark:border-zinc-700 active:scale-95 transition">
                      <Icon className={s.color} size={28} strokeWidth={2.2} />
                    </div>
                    <p className="text-center text-[11px] font-semibold text-foreground mt-1.5">{t(lang, s.key)}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="px-4 mt-5">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900/30 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 grid place-items-center"><Bell size={18} className="text-white" /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">CakJek hadir untukmu</p>
            <p className="text-xs text-muted-foreground">Ojek, makanan, kurir, belanja & top-up dalam satu app.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
