export interface AppNotification {
  id: string;
  service: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const KEY = 'cakjek_notifications';

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

export function addNotification(service: string, message: string): void {
  const all = getNotifications();
  const notif: AppNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    service,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };
  localStorage.setItem(KEY, JSON.stringify([notif, ...all].slice(0, 50)));
  window.dispatchEvent(new Event('cakjek_notif_update'));
}

export function markAllRead(): void {
  const all = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('cakjek_notif_update'));
}

export function unreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}
