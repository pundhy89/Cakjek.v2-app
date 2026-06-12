import React from "react";
import { Link } from "react-router-dom";
import { Bike, Car, Utensils, Package, ShoppingBag, Wallet, Shield } from "lucide-react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

const services = [
  { key: "cakride", path: "/cakride", icon: Bike, color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
  { key: "cakcar", path: "/cakcar", icon: Car, color: "from-blue-400 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400" },
  { key: "cakfood", path: "/cakfood", icon: Utensils, color: "from-orange-400 to-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400" },
  { key: "caksend", path: "/caksend", icon: Package, color: "from-violet-400 to-violet-600", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400" },
  { key: "cakmart", path: "/cakmart", icon: ShoppingBag, color: "from-pink-400 to-pink-600", bg: "bg-pink-50 dark:bg-pink-950/40", text: "text-pink-600 dark:text-pink-400" },
  { key: "cakpay", path: "/cakpay", icon: Wallet, color: "from-cyan-400 to-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-600 dark:text-cyan-400" },
];

export default function Home() {
  const { lang } = useApp();
  return (
    <div data-testid="home-page" className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white px-6 pt-10 pb-16 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-200">CakApp</p>
            <h1 className="font-heading text-2xl font-bold mt-1">{t(lang, "your_local_super_app")}</h1>
          </div>
          <Link
            to="/admin/login"
            data-testid="admin-link"
            title={t(lang, "admin")}
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition"
          >
            <Shield size={18} />
          </Link>
        </div>
        <p className="text-blue-100 text-sm mt-2">{t(lang, "tagline")}</p>
      </div>

      <div className="px-5 -mt-8">
        <div className="bg-card rounded-3xl shadow-lg border border-black/5 dark:border-white/10 p-5">
          <h2 className="font-heading text-base font-semibold text-foreground mb-4">{t(lang, "services")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  to={s.path}
                  key={s.key}
                  data-testid={`service-${s.key}`}
                  className="service-tile group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
                    <Icon className={s.text} size={24} strokeWidth={2.2} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">{t(lang, s.key)}</p>
                    <p className="text-[10px] text-muted-foreground">{t(lang, s.key + "_desc")}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 p-5 text-white shadow-md">
          <p className="text-xs font-medium uppercase tracking-wider opacity-80">Promo</p>
          <h3 className="font-heading text-lg font-bold mt-1">Diskon hingga 40% untuk semua layanan</h3>
          <p className="text-xs opacity-90 mt-1">Pesan apa saja, semua kena potongan harga spesial.</p>
        </div>
      </div>
    </div>
  );
}
