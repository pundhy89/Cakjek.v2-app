import React from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { Home, Receipt, User, MessageCircle, ShoppingCart, Activity } from "lucide-react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export const MobileShell = ({ children }) => {
  const { lang } = useApp();
  const loc = useLocation();
  const hideNav = loc.pathname.startsWith("/admin");
  return (
    <div className="mobile-shell pb-24" data-testid="mobile-shell">
      {children}
      {!hideNav && (
        <nav data-testid="bottom-nav" className="glass-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 py-2 z-50 flex items-center justify-between">
          <Item to="/" icon={<Home size={20} />} label={t(lang, "home")} tid="nav-home" />
          <Item to="/orders" icon={<Activity size={20} />} label="Aktivitas" tid="nav-activity" />
          <Link to="/cakfood" data-testid="nav-fab" className="-mt-8 w-14 h-14 rounded-full bg-blue-500 text-white grid place-items-center shadow-lg shadow-blue-500/40 active:scale-95 transition border-4 border-white dark:border-zinc-900">
            <ShoppingCart size={22} />
          </Link>
          <Item to="/chat" icon={<MessageCircle size={20} />} label="Chat" tid="nav-chat" />
          <Item to="/account" icon={<User size={20} />} label={t(lang, "account")} tid="nav-account" />
        </nav>
      )}
    </div>
  );
};

const Item = ({ to, icon, label, tid }) => (
  <NavLink to={to} end data-testid={tid} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 text-[10px] font-medium transition-colors ${isActive ? "text-blue-500" : "text-muted-foreground"}`}>
    {icon}<span>{label}</span>
  </NavLink>
);
