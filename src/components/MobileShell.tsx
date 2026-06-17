import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Home, Activity, ShoppingBag, MessageCircle, User } from 'lucide-react';
import { unreadCount } from '@/lib/notifications';

interface MobileShellProps {
  children: React.ReactNode;
}

const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const loc = useLocation();
  const hideNav = loc.pathname.startsWith('/admin');
  const [badge, setBadge] = useState(0);

  useEffect(() => {
    setBadge(unreadCount());
    const handler = () => setBadge(unreadCount());
    window.addEventListener('cakjek_notif_update', handler);
    return () => window.removeEventListener('cakjek_notif_update', handler);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-md min-h-dvh relative bg-background shadow-xl">
        <div className={hideNav ? '' : 'pb-24'}>
          {children}
        </div>
        {!hideNav && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-3 py-2 z-50">
            <div className="flex items-center justify-around bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl shadow-lg shadow-black/10 px-1 py-1">
              <NavItem to="/" icon={<Home size={20} />} label="Beranda" badge={badge} />
              <NavItem to="/aktivitas" icon={<Activity size={20} />} label="Aktivitas" />
              {/* FAB */}
              <Link
                to="/cakfood"
                className="-mt-5 w-14 h-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg shadow-primary/40 active:scale-95 transition border-4 border-background"
              >
                <ShoppingBag size={22} />
              </Link>
              <NavItem to="/chat" icon={<MessageCircle size={20} />} label="Chat" />
              <NavItem to="/akun" icon={<User size={20} />} label="Akun" />
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; badge?: number }> = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors min-w-[48px] rounded-xl ${
        isActive ? 'text-primary' : 'text-muted-foreground'
      }`
    }
  >
    <span className="relative">
      {icon}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </span>
    <span>{label}</span>
  </NavLink>
);

export default MobileShell;
