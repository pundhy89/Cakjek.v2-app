import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Utensils, ShoppingBag, Wallet, Map, BarChart3, Settings, LogOut, Receipt, Image, Store, Building2, KeyRound, Grid3X3 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { api } from "../../lib/api";

export default function AdminLayout() {
  const { adminToken, setAdmin, lang } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (!adminToken) {
      nav("/admin/login");
      return;
    }
    api.get("/admin/me").catch(() => {
      setAdmin("");
      nav("/admin/login");
    });
  }, [adminToken, nav, setAdmin]);

  const links = [
    { to: "/admin", icon: LayoutDashboard, label: t(lang, "dashboard"), end: true },
    { to: "/admin/orders", icon: Receipt, label: t(lang, "orders") },
    { to: "/admin/merchants", icon: Store, label: "Warung Cakfood" },
    { to: "/admin/food", icon: Utensils, label: t(lang, "food_menu") },
    { to: "/admin/mart", icon: ShoppingBag, label: t(lang, "mart_items") },
    { to: "/admin/cakpay", icon: Wallet, label: t(lang, "cakpay_packages") },
    { to: "/admin/kost", icon: Building2, label: "CakKost" },
    { to: "/admin/rent", icon: KeyRound, label: "CakRent" },
    { to: "/admin/tariff", icon: Map, label: t(lang, "tariff") },
    { to: "/admin/banners", icon: Image, label: "Banner Promo" },
    { to: "/admin/services", icon: Grid3X3, label: "Menu Layanan" },
    { to: "/admin/reports", icon: BarChart3, label: t(lang, "reports") },
    { to: "/admin/settings", icon: Settings, label: t(lang, "settings") },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="grid md:grid-cols-[260px_1fr] min-h-screen">
        <aside className="bg-zinc-950 text-white p-5 md:min-h-screen">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-heading font-bold">C</div>
            <div>
              <p className="font-heading font-bold">CakJek</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{t(lang, "admin")}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  data-testid={`adm-nav-${l.to.split("/").pop() || "dashboard"}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${isActive ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`
                  }
                >
                  <Icon size={18} />
                  <span>{l.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <button
            data-testid="admin-logout-btn"
            onClick={() => { setAdmin(""); nav("/admin/login"); }}
            className="mt-6 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <LogOut size={18} /> {t(lang, "logout")}
          </button>
        </aside>
        <main className="p-6 md:p-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
