import React, { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllRead, type AppNotification } from '@/lib/notifications';

const SERVICE_EMOJI: Record<string, string> = {
  cakride: '🛵', cakcar: '🚗', cakfood: '🍔', caksend: '📦',
  cakmart: '🛒', cakpay: '💳', cakkost: '🏠', cakrent: '🚘', caklangganan: '🗓',
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

const Notifications: React.FC = () => {
  const nav = useNavigate();
  const [notifs, setNotifs] = useState<AppNotification[]>([]);

  const load = () => setNotifs(getNotifications());

  useEffect(() => {
    load();
    window.addEventListener('cakjek_notif_update', load);
    return () => window.removeEventListener('cakjek_notif_update', load);
  }, []);

  const handleMarkAll = () => { markAllRead(); load(); };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => nav(-1)} className="w-9 h-9 rounded-2xl bg-muted hover:bg-muted/80 grid place-items-center transition active:scale-90">
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex-1 font-extrabold text-lg text-foreground">Notifikasi</h1>
        {notifs.some((n) => !n.read) && (
          <button onClick={handleMarkAll} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition">
            <CheckCheck size={15} /> Tandai Semua Dibaca
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-muted grid place-items-center mb-4">
            <BellOff size={36} className="text-muted-foreground" />
          </div>
          <p className="font-bold text-foreground mb-1">Belum ada notifikasi</p>
          <p className="text-sm text-muted-foreground">Notifikasi akan muncul setelah kamu berhasil memesan layanan</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {notifs.map((n) => (
            <div key={n.id} className={`px-4 py-4 flex items-start gap-3 transition ${!n.read ? 'bg-primary/5' : ''}`}>
              <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center text-2xl shrink-0">
                {SERVICE_EMOJI[n.service] ?? <Bell size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug line-clamp-3 text-pretty">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.timestamp)}</p>
              </div>
              {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
