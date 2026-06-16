import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bike, Car, Utensils, Package, ShoppingCart, Wallet,
  Bell, Search, ChevronRight, Building2, CalendarClock, X,
} from 'lucide-react';
import BannerCarousel from '@/components/BannerCarousel';
import { useApp } from '@/contexts/AppContext';
import { getServices, getMenuItems, getMerchants } from '@/lib/api';
import { unreadCount } from '@/lib/notifications';
import type { ServiceItem, MenuItem } from '@/types/index';

const SERVICE_META: Record<string, { icon: React.FC<{ size: number; className?: string }>, color: string, to: string }> = {
  cakride: { icon: Bike, color: 'from-orange-400 to-orange-600', to: '/cakride' },
  cakcar: { icon: Car, color: 'from-blue-400 to-blue-600', to: '/cakcar' },
  cakfood: { icon: Utensils, color: 'from-rose-400 to-rose-600', to: '/cakfood' },
  caksend: { icon: Package, color: 'from-amber-400 to-amber-600', to: '/caksend' },
  cakmart: { icon: ShoppingCart, color: 'from-emerald-400 to-emerald-600', to: '/cakmart' },
  cakpay: { icon: Wallet, color: 'from-violet-400 to-violet-600', to: '/cakpay' },
  cakkost: { icon: Building2, color: 'from-teal-400 to-teal-600', to: '/cakkost' },
  cakrent: { icon: Car, color: 'from-cyan-400 to-cyan-600', to: '/cakrent' },
  caklangganan: { icon: CalendarClock, color: 'from-purple-400 to-purple-600', to: '/caklangganan' },
};

const CATEGORY_LABEL: Record<string, string> = { food: 'Makanan', mart: 'Pasar', cakpay: 'Bayar' };

type SearchResult = {
  type: 'merchant' | 'food' | 'mart';
  id: string;
  name: string;
  image?: string;
  merchantId?: string;
};

const Home: React.FC = () => {
  const { settings } = useApp();
  const nav = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [latestProducts, setLatestProducts] = useState<MenuItem[]>([]);
  const [topProducts, setTopProducts] = useState<MenuItem[]>([]);
  const [notifBadge, setNotifBadge] = useState(0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Selamat Pagi');
    else if (h < 15) setGreeting('Selamat Siang');
    else if (h < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    getServices().then(setServices);

    Promise.all([getMenuItems('food'), getMenuItems('mart'), getMenuItems('cakpay')])
      .then(([food, mart, pay]) => {
        const all = [...food, ...mart, ...pay];
        // Terbaru: sort by created_at desc
        const latest = [...all]
          .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
          .slice(0, 2);
        setLatestProducts(latest);
        // Terlaris: sort by price desc as proxy, exclude items already in latest
        const latestIds = new Set(latest.map((x) => x.id));
        const top = [...all]
          .filter((x) => !latestIds.has(x.id))
          .sort((a, b) => b.price - a.price)
          .slice(0, 2);
        setTopProducts(top);
      });

    setNotifBadge(unreadCount());
    const handler = () => setNotifBadge(unreadCount());
    window.addEventListener('cakjek_notif_update', handler);
    return () => window.removeEventListener('cakjek_notif_update', handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const [merchants, food, mart] = await Promise.all([
        getMerchants(),
        getMenuItems('food'),
        getMenuItems('mart'),
      ]);
      const ql = q.toLowerCase();
      const results: SearchResult[] = [];
      merchants.filter((m) => m.name.toLowerCase().includes(ql))
        .forEach((m) => results.push({ type: 'merchant', id: m.id, name: m.name, image: m.image_url }));
      food.filter((i) => i.name.toLowerCase().includes(ql))
        .forEach((i) => results.push({ type: 'food', id: i.id, name: i.name, image: i.image_url, merchantId: i.merchant_id ?? undefined }));
      mart.filter((i) => i.name.toLowerCase().includes(ql))
        .forEach((i) => results.push({ type: 'mart', id: i.id, name: i.name, image: i.image_url }));
      setSearchResults(results.slice(0, 12));
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQ), 350);
    return () => clearTimeout(t);
  }, [searchQ, doSearch]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) closeSearch();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 80);
  };
  const closeSearch = () => { setSearchOpen(false); setSearchQ(''); setSearchResults([]); };

  const handleResultClick = (r: SearchResult) => {
    closeSearch();
    if (r.type === 'merchant') nav(`/cakfood/${r.id}`);
    else if (r.type === 'food') nav(r.merchantId ? `/cakfood/${r.merchantId}` : '/cakfood');
    else nav('/cakmart');
  };

  const foodService = services.find((s) => s.id === 'cakfood');

  return (
    <div className="min-h-dvh bg-background">

      {/* HERO: full-bleed banner + floating header card */}
      <div className="relative">
        <BannerCarousel fullBleed />

        {/* Floating header card overlapping banner */}
        <div className="relative z-10 mx-3 -mt-12">
          <div
            className="rounded-3xl px-4 pt-4 pb-4 shadow-xl border border-white/20"
            style={{
              background: 'linear-gradient(135deg, hsl(221 83% 50% / 0.92), hsl(250 83% 58% / 0.92))',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {/* Logo + name + bell */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt={settings.app_name} className="w-10 h-10 rounded-2xl object-cover shadow-md" />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-white/25 grid place-items-center shadow-md">
                    <span className="text-xl font-black text-white">C</span>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-white/70 leading-none">{greeting}</p>
                  <h1 className="text-base font-extrabold text-white drop-shadow leading-tight">{settings.app_name}</h1>
                </div>
              </div>
              <Link
                to="/notifikasi"
                className="relative w-9 h-9 rounded-2xl bg-white/20 grid place-items-center active:scale-90 transition"
              >
                <Bell size={17} className="text-white" />
                {notifBadge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {notifBadge > 9 ? '9+' : notifBadge}
                  </span>
                )}
              </Link>
            </div>

            {/* Search — dropdown outside any overflow-hidden ancestor */}
            <div ref={searchBarRef} className="relative">
              {searchOpen ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      placeholder="Cari merchant, makanan, produk..."
                      className="w-full bg-white text-foreground text-sm rounded-xl pl-8 pr-4 py-2.5 outline-none shadow-sm placeholder-muted-foreground"
                    />
                  </div>
                  <button onClick={closeSearch} className="w-9 h-9 rounded-xl bg-white/20 grid place-items-center shrink-0">
                    <X size={15} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openSearch}
                  className="w-full flex items-center gap-2 bg-white/95 text-muted-foreground text-sm rounded-xl pl-4 pr-4 py-2.5 shadow-sm text-left"
                >
                  <Search size={14} />
                  <span>Mau pesan apa hari ini?</span>
                </button>
              )}

              {/* Results dropdown — placed here so it's NOT inside overflow-hidden */}
              {searchOpen && searchQ.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-card rounded-2xl shadow-2xl border border-border/60 max-h-64 overflow-y-auto">
                  {searching && (
                    <p className="text-sm text-muted-foreground p-4 text-center">Mencari...</p>
                  )}
                  {!searching && searchResults.length === 0 && searchQ.trim().length > 1 && (
                    <p className="text-sm text-muted-foreground p-4 text-center">Tidak ada hasil ditemukan</p>
                  )}
                  {searchResults.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      onMouseDown={(e) => { e.preventDefault(); handleResultClick(r); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition text-left border-b border-border/40 last:border-0"
                    >
                      {r.image
                        ? <img src={r.image} alt={r.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        : <div className="w-9 h-9 rounded-xl bg-muted grid place-items-center shrink-0"><Search size={13} className="text-muted-foreground" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.type === 'merchant' ? 'Restoran' : r.type === 'food' ? 'Menu Makanan' : 'Produk Pasar'}
                        </p>
                      </div>
                      <ChevronRight size={13} className="text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">Layanan Kami</h2>
          <span className="text-xs text-muted-foreground">Pilih layanan</span>
        </div>
        {services.length === 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {services.map((svc) => {
              const meta = SERVICE_META[svc.id];
              if (!meta) return null;
              const Icon = meta.icon;
              if (!svc.active) {
                return (
                  <div key={svc.id} className="relative">
                    <div className="bg-card rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm border border-border/50 opacity-60 grayscale cursor-not-allowed select-none">
                      <div className="w-12 h-12 rounded-2xl bg-muted grid place-items-center">
                        <Icon size={22} className="text-muted-foreground" />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground text-center leading-tight">{svc.label}</span>
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 bg-muted text-muted-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-border whitespace-nowrap shadow-sm">
                      Coming Soon
                    </span>
                  </div>
                );
              }
              return (
                <Link key={svc.id} to={meta.to}>
                  <div className="bg-card rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md active:scale-95 transition border border-border/50">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} grid place-items-center shadow-sm`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground text-center leading-tight">{svc.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick access CakFood */}
      {(!foodService || foodService.active) && (
        <div className="px-5 mt-5 mb-2">
          <Link
            to="/cakfood"
            className="flex items-center gap-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-5 py-4 rounded-2xl shadow-lg shadow-rose-500/30 active:scale-[0.98] transition"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl grid place-items-center">
              <Utensils size={20} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-sm">Lapar? Pesan Makan</p>
              <p className="text-xs text-white/80">Antar cepat ke lokasi kamu</p>
            </div>
            <ChevronRight size={18} />
          </Link>
        </div>
      )}

      {/* Produk Terbaru - 1 baris (2 item) */}
      {latestProducts.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="text-base font-bold text-foreground mb-3">Produk Terbaru</h2>
          <div className="grid grid-cols-2 gap-3">
            {latestProducts.slice(0, 2).map((p) => (
              <div key={p.id} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-28 object-cover" />
                  : <div className="w-full h-28 bg-muted grid place-items-center"><ShoppingCart size={24} className="text-muted-foreground" /></div>
                }
                <div className="p-3">
                  <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-primary font-semibold mt-0.5">Rp {p.price.toLocaleString('id-ID')}</p>
                  <span className="inline-block mt-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {CATEGORY_LABEL[p.category] ?? p.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Produk Terlaris - 1 baris (2 item, sorted by price desc as proxy) */}
      {topProducts.length > 0 && (
        <div className="px-5 mt-5 mb-4">
          <h2 className="text-base font-bold text-foreground mb-3">Produk Terlaris</h2>
          <div className="grid grid-cols-2 gap-3">
            {topProducts.slice(0, 2).map((p) => (
              <div key={p.id} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm relative">
                <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">🔥 Laris</span>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-28 object-cover" />
                  : <div className="w-full h-28 bg-muted grid place-items-center"><ShoppingCart size={24} className="text-muted-foreground" /></div>
                }
                <div className="p-3">
                  <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-primary font-semibold mt-0.5">Rp {p.price.toLocaleString('id-ID')}</p>
                  <span className="inline-block mt-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {CATEGORY_LABEL[p.category] ?? p.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
