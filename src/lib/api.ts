import { supabase } from '@/db/supabase';
import type { AppSettings, Banner, Merchant, MenuItem, Tariff, Order, ServiceItem } from '@/types/index';

const GMAPS_KEY = 'AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0';

// ---- Formatter ----
export const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ---- Haversine distance (fallback) ----
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---- Google Maps Distance Matrix ----
export async function routeDistanceKm(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number> {
  try {
    const orig = `${origin.lat},${origin.lng}`;
    const dest = `${destination.lat},${destination.lng}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${orig}&destinations=${dest}&key=${GMAPS_KEY}&mode=driving`;
    const res = await fetch(url);
    const data = await res.json();
    const meters = data?.rows?.[0]?.elements?.[0]?.distance?.value;
    if (meters) return Math.round((meters / 1000) * 10) / 10;
  } catch (_) {
    // fallback to haversine
  }
  return Math.round(haversineKm(origin.lat, origin.lng, destination.lat, destination.lng) * 10) / 10;
}

// ---- Google Places Autocomplete via REST ----
export async function searchAddress(query: string): Promise<{ label: string; lat: number; lng: number }[]> {
  if (!query || query.length < 3) return [];
  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GMAPS_KEY}&language=id&components=country:id`;
    const res = await fetch(url);
    const data = await res.json();
    const predictions = data?.predictions ?? [];
    const results: { label: string; lat: number; lng: number }[] = [];
    for (const p of predictions.slice(0, 5)) {
      const details = await getPlaceDetails(p.place_id);
      if (details) results.push({ label: p.description, ...details });
    }
    return results;
  } catch (_) {
    return [];
  }
}

async function getPlaceDetails(placeId: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GMAPS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const loc = data?.result?.geometry?.location;
    if (loc) return { lat: loc.lat, lng: loc.lng };
  } catch (_) { /* empty */ }
  return null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY}&language=id`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.results?.[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch (_) {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export const GMAPS_EMBED_KEY = GMAPS_KEY;

// ---- Settings ----
export async function getSettings(): Promise<AppSettings> {
  const { data } = await supabase.from('settings').select('*').eq('id', 'settings').maybeSingle();
  if (!data) {
    return {
      id: 'settings', app_name: 'CakJek', logo_url: '', whatsapp_number: '6285233962821',
      service_center_lat: -7.2575, service_center_lng: 112.7521, service_radius_km: 20, mart_delivery_fee: 7000,
    };
  }
  return data as AppSettings;
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<void> {
  await supabase.from('settings').upsert({ id: 'settings', ...settings });
}

// ---- Banners ----
export async function getBanners(): Promise<Banner[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('banners').select('*').eq('active', true).order('order_idx').limit(20);
  return (Array.isArray(data) ? data : []).filter((b: Banner) => {
    if (b.start_date && today < b.start_date) return false;
    if (b.end_date && today > b.end_date) return false;
    return true;
  }) as Banner[];
}

export async function adminGetBanners(): Promise<Banner[]> {
  const { data } = await supabase.from('banners').select('*').order('order_idx').limit(50);
  return Array.isArray(data) ? (data as Banner[]) : [];
}

export async function createBanner(banner: Omit<Banner, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('banners').insert(banner);
}

export async function updateBanner(id: string, banner: Partial<Banner>): Promise<void> {
  await supabase.from('banners').update(banner).eq('id', id);
}

export async function deleteBanner(id: string): Promise<void> {
  await supabase.from('banners').delete().eq('id', id);
}

// ---- Merchants ----
export async function getMerchants(): Promise<Merchant[]> {
  const { data } = await supabase.from('merchants').select('*').eq('active', true).order('created_at').limit(100);
  return Array.isArray(data) ? (data as Merchant[]) : [];
}

export async function getMerchant(id: string): Promise<Merchant | null> {
  const { data } = await supabase.from('merchants').select('*').eq('id', id).maybeSingle();
  return data as Merchant | null;
}

export async function adminGetMerchants(): Promise<Merchant[]> {
  const { data } = await supabase.from('merchants').select('*').order('created_at').limit(200);
  return Array.isArray(data) ? (data as Merchant[]) : [];
}

export async function createMerchant(m: Omit<Merchant, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('merchants').insert(m);
}

export async function updateMerchant(id: string, m: Partial<Merchant>): Promise<void> {
  await supabase.from('merchants').update(m).eq('id', id);
}

export async function deleteMerchant(id: string): Promise<void> {
  await supabase.from('merchants').delete().eq('id', id);
}

// ---- Menu Items ----
export async function getMenuItems(category: string, merchantId?: string): Promise<MenuItem[]> {
  let q = supabase.from('menu_items').select('*').eq('category', category).eq('active', true).order('created_at', { ascending: false }).limit(200);
  if (merchantId) q = q.eq('merchant_id', merchantId);
  const { data } = await q;
  return Array.isArray(data) ? (data as MenuItem[]) : [];
}

export async function adminGetMenuItems(category: string): Promise<MenuItem[]> {
  const { data } = await supabase.from('menu_items').select('*').eq('category', category).order('created_at').limit(200);
  return Array.isArray(data) ? (data as MenuItem[]) : [];
}

export async function createMenuItem(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('menu_items').insert(item);
}

export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<void> {
  await supabase.from('menu_items').update(item).eq('id', id);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await supabase.from('menu_items').delete().eq('id', id);
}

// ---- Tariffs ----
export async function getTariffs(): Promise<Tariff[]> {
  const { data } = await supabase.from('tariffs').select('*').limit(10);
  return Array.isArray(data) ? (data as Tariff[]) : [];
}

export async function getTariff(service: string): Promise<Tariff | null> {
  const { data } = await supabase.from('tariffs').select('*').eq('service', service).maybeSingle();
  return data as Tariff | null;
}

export async function upsertTariff(service: string, t: Partial<Tariff>): Promise<void> {
  await supabase.from('tariffs').upsert({ service, ...t }, { onConflict: 'service' });
}

// ---- Orders ----
export async function createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<{ id: string; whatsapp_url: string } | null> {
  const settings = await getSettings();
  // radius check
  const details = order.details as Record<string, { lat?: number; lng?: number }>;
  const coordFields = ['pickup_coords', 'destination_coords', 'address_coords'];
  if (settings.service_radius_km > 0) {
    for (const field of coordFields) {
      const c = details[field];
      if (c?.lat != null && c?.lng != null) {
        const d = haversineKm(settings.service_center_lat, settings.service_center_lng, c.lat, c.lng);
        if (d > settings.service_radius_km) {
          throw new Error(`Lokasi di luar area servis (${d.toFixed(1)} km dari pusat, batas ${settings.service_radius_km} km).`);
        }
      }
    }
  }
  const { data, error } = await supabase.from('orders').insert(order).select('id').maybeSingle();
  if (error) throw new Error(error.message);
  const id = (data as { id: string } | null)?.id ?? '';
  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(order.message)}`;
  return { id, whatsapp_url: waUrl };
}

export async function adminGetOrders(): Promise<Order[]> {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500);
  return Array.isArray(data) ? (data as Order[]) : [];
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  await supabase.from('orders').update({ status }).eq('id', id);
}

// ---- Reports ----
export async function getDailyReport(date: string) {
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;
  const { data } = await supabase
    .from('orders').select('*').gte('created_at', start).lte('created_at', end).limit(2000);
  const orders: Order[] = Array.isArray(data) ? (data as Order[]) : [];
  const byService: Record<string, { count: number; total: number }> = {};
  let total = 0;
  for (const o of orders) {
    if (!byService[o.service]) byService[o.service] = { count: 0, total: 0 };
    byService[o.service].count++;
    byService[o.service].total += o.total;
    total += o.total;
  }
  return { date, count: orders.length, total, by_service: byService, orders };
}

export async function getMonthlyReport(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01T00:00:00`;
  const nextMonth = month === 12 ? `${year + 1}-01-01T00:00:00` : `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00`;
  const { data } = await supabase
    .from('orders').select('*').gte('created_at', start).lt('created_at', nextMonth).limit(5000);
  const orders: Order[] = Array.isArray(data) ? (data as Order[]) : [];
  const byDay: Record<string, { count: number; total: number }> = {};
  const byService: Record<string, { count: number; total: number }> = {};
  let total = 0;
  for (const o of orders) {
    const day = o.created_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = { count: 0, total: 0 };
    byDay[day].count++;
    byDay[day].total += o.total;
    if (!byService[o.service]) byService[o.service] = { count: 0, total: 0 };
    byService[o.service].count++;
    byService[o.service].total += o.total;
    total += o.total;
  }
  return { year, month, count: orders.length, total, by_day: byDay, by_service: byService };
}

// ---- Image Upload ----
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from('cakjek-images').upload(filename, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from('cakjek-images').getPublicUrl(data.path);
  return urlData.publicUrl;
}

// ---- Kosts ----
export async function getKosts(): Promise<import('@/types/index').Kost[]> {
  const { data } = await supabase.from('kosts').select('*').order('id').limit(100);
  return Array.isArray(data) ? data as import('@/types/index').Kost[] : [];
}

export async function createKost(kost: Omit<import('@/types/index').Kost, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('kosts').insert([kost]);
  if (error) throw new Error(error.message);
}

export async function updateKost(id: number, kost: Partial<Omit<import('@/types/index').Kost, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase.from('kosts').update(kost).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteKost(id: number): Promise<void> {
  const { error } = await supabase.from('kosts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ---- Vehicles ----
export async function getVehicles(): Promise<import('@/types/index').Vehicle[]> {
  const { data } = await supabase.from('vehicles').select('*').order('id').limit(100);
  return Array.isArray(data) ? data as import('@/types/index').Vehicle[] : [];
}

export async function createVehicle(v: Omit<import('@/types/index').Vehicle, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('vehicles').insert([v]);
  if (error) throw new Error(error.message);
}

export async function updateVehicle(id: number, v: Partial<Omit<import('@/types/index').Vehicle, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase.from('vehicles').update(v).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteVehicle(id: number): Promise<void> {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
const ADMIN_TOKEN_KEY = 'cakjek_admin_token';
export function adminLogin(username: string, password: string): boolean {
  if (username === 'admin' && password === 'admin') {
    localStorage.setItem(ADMIN_TOKEN_KEY, 'cakjek_admin_authenticated');
    return true;
  }
  return false;
}
export function adminLogout() { localStorage.removeItem(ADMIN_TOKEN_KEY); }
export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_TOKEN_KEY) === 'cakjek_admin_authenticated';
}

// ---- WhatsApp URL builder ----
export function buildWaUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// ---- Services ----
export async function getServices(): Promise<ServiceItem[]> {
  const { data } = await supabase.from('services').select('*').order('order_idx').limit(20);
  if (!Array.isArray(data) || data.length === 0) {
    // fallback defaults if DB empty
    return [
      { id: 'cakride', label: 'Ojek Online', active: true, order_idx: 1 },
      { id: 'cakcar', label: 'Taxi Online', active: true, order_idx: 2 },
      { id: 'cakfood', label: 'Pesan Makan', active: true, order_idx: 3 },
      { id: 'caksend', label: 'Kirim Barang', active: true, order_idx: 4 },
      { id: 'cakmart', label: 'Belanja Pasar', active: true, order_idx: 5 },
      { id: 'cakpay', label: 'Tolong Bayar', active: true, order_idx: 6 },
      { id: 'cakkost', label: 'Sewa Kost', active: true, order_idx: 7 },
      { id: 'cakrent', label: 'Rental Kendaraan', active: true, order_idx: 8 },
    ];
  }
  return data as ServiceItem[];
}

export async function updateServiceActive(id: string, active: boolean): Promise<void> {
  await supabase.from('services').update({ active }).eq('id', id);
}

export async function updateServiceLabel(id: string, label: string): Promise<void> {
  const { error } = await supabase.from('services').update({ label }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateServiceOrder(id: string, order_idx: number): Promise<void> {
  await supabase.from('services').update({ order_idx }).eq('id', id);
}
