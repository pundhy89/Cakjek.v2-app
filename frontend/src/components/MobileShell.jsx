import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Receipt, User } from "lucide-react";
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
        <nav
          data-testid="bottom-nav"
          className="glass-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 py-3 z-50 flex items-center justify-around"
        >
          <NavItem to="/" icon={<Home size={22} />} label={t(lang, "home")} testid="nav-home" />
          <NavItem to="/orders" icon={<Receipt size={22} />} label={t(lang, "orders")} testid="nav-orders" />
          <NavItem to="/account" icon={<User size={22} />} label={t(lang, "account")} testid="nav-account" />
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ to, icon, label, testid }) => (
  <NavLink
    to={to}
    end
    data-testid={testid}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);
