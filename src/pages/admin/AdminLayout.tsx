import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Utensils, ShoppingCart, Wallet,
  Store, BarChart3, Tag, Image as ImageIcon, Settings, LogOut,
  Menu, ChevronRight, Layers, Building2, Car
} from 'lucide-react';
import { adminLogout, isAdminLoggedIn } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pesanan', label: 'Pesanan', icon: ShoppingBag },
  { to: '/admin/merchant', label: 'Merchant', icon: Store },
  { to: '/admin/menu/food', label: 'Menu Makanan', icon: Utensils },
  { to: '/admin/menu/mart', label: 'Belanja Pasar', icon: ShoppingCart },
  { to: '/admin/menu/cakpay', label: 'Tolong Bayar', icon: Wallet },
  { to: '/admin/kost', label: 'Sewa Kost', icon: Building2 },
  { to: '/admin/kendaraan', label: 'Rental Kendaraan', icon: Car },
  { to: '/admin/tarif', label: 'Tarif', icon: BarChart3 },
  { to: '/admin/banner', label: 'Banner', icon: ImageIcon },
  { to: '/admin/layanan', label: 'Layanan', icon: Layers },
  { to: '/admin/laporan', label: 'Laporan', icon: Tag },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const { settings } = useApp();
  const [open, setOpen] = useState(false);

  if (!isAdminLoggedIn()) {
    nav('/admin/login', { replace: true });
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    nav('/admin/login', { replace: true });
  };

  const currentLabel = NAV_ITEMS.find((n) => n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to))?.label ?? 'Admin';

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground">
        <SidebarContent settings={settings} onLogout={handleLogout} onNav={() => {}} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-sidebar text-sidebar-foreground shadow-2xl">
            <SidebarContent settings={settings} onLogout={handleLogout} onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shadow-sm sticky top-0 z-10">
          <button onClick={() => setOpen(true)} className="md:hidden w-9 h-9 rounded-xl bg-muted grid place-items-center">
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground truncate">{currentLabel}</h1>
          </div>
          <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition">
            <LogOut size={14} /> Keluar
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{ settings: { app_name: string; logo_url: string }; onLogout: () => void; onNav: () => void }> = ({ settings, onLogout, onNav }) => (
  <div className="flex flex-col h-full">
    {/* Brand */}
    <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
      {settings.logo_url ? (
        <img src={settings.logo_url} alt={settings.app_name} className="w-9 h-9 rounded-xl object-cover" />
      ) : (
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 grid place-items-center">
          <span className="text-lg font-black text-sidebar-primary">C</span>
        </div>
      )}
      <div>
        <p className="font-extrabold text-sm text-sidebar-foreground">{settings.app_name}</p>
        <p className="text-[10px] text-sidebar-foreground/50">Admin Panel</p>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNav}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`
          }
        >
          <item.icon size={17} />
          <span className="flex-1">{item.label}</span>
          <ChevronRight size={13} className="opacity-40" />
        </NavLink>
      ))}
    </nav>

    {/* Logout */}
    <div className="p-4 border-t border-sidebar-border">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition"
      >
        <LogOut size={16} /> Keluar
      </button>
    </div>
  </div>
);

export default AdminLayout;
