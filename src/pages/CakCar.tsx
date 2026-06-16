import { addNotification } from '@/lib/notifications';
import React, { useEffect, useState } from 'react';
import { Plus, Car, Loader2 } from 'lucide-react';
import ServiceHeader from '@/components/ServiceHeader';
import GoogleMapsPicker from '@/components/GoogleMapsPicker';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { getTariff, routeDistanceKm, formatIDR, createOrder } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { Tariff, Coords } from '@/types/index';
import { toast } from 'sonner';

interface Stop { coords?: Coords & { address: string }; }

const CakCar: React.FC = () => {
  const { settings } = useApp();
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [name, setName] = useState('');
  const [pickup, setPickup] = useState<(Coords & { address: string }) | undefined>();
  const [stops, setStops] = useState<Stop[]>([{}]);
  const [note, setNote] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    getTariff('cakcar').then(setTariff);
    const saved = localStorage.getItem('cakjek_user_name');
    if (saved) setName(saved);
  }, []);

  const total = tariff && distance != null ? Math.round(tariff.base_fare + tariff.per_km * distance) : null;

  useEffect(() => {
    if (!pickup || !stops[0]?.coords) return;
    let cancelled = false;
    (async () => {
      const waypoints = [pickup, ...stops.map((s) => s.coords).filter(Boolean)] as (Coords & { address: string })[];
      let dist = 0;
      for (let i = 0; i < waypoints.length - 1; i++) dist += await routeDistanceKm(waypoints[i], waypoints[i + 1]);
      if (!cancelled) setDistance(Math.round(dist * 10) / 10);
    })();
    return () => { cancelled = true; };
  }, [pickup, stops]); // eslint-disable-line

  const handleOrder = async () => {
    if (!name.trim()) { toast.error('Nama pelanggan wajib diisi'); return; }
    if (!pickup) { toast.error('Pilih lokasi jemput'); return; }
    if (!stops[0]?.coords) { toast.error('Pilih lokasi tujuan'); return; }
    if (!tariff || total == null) { toast.error('Tarif belum dimuat'); return; }

    const destinations = stops.map((s, i) => `- Tujuan ${i + 1}: ${s.coords?.address} (${s.coords?.lat?.toFixed(5)}, ${s.coords?.lng?.toFixed(5)})`).join('\n');
    const msg = `🚗 *Pesanan Taxi Online*
Nama: ${name}
Jemput: ${pickup.address}
📍 Pin Jemput: https://maps.google.com/?q=${pickup.lat},${pickup.lng}
${destinations}
Jarak: ±${distance} km
Total: ${formatIDR(total)}
Catatan: ${note || '-'}

Dikirim via ${settings.app_name}`;

    setLoading(true);
    try {
      const res = await createOrder({
        service: 'cakcar', customer_name: name, customer_phone: '',
        details: { pickup_coords: { lat: pickup.lat, lng: pickup.lng }, pickup_address: pickup.address, stops: stops.map((s) => ({ address: s.coords?.address, lat: s.coords?.lat, lng: s.coords?.lng })), distance, note },
        total, message: msg, status: 'new',
      });
      if (res) { setWaUrl(res.whatsapp_url); setSuccess(true); addNotification('cakcar', 'Pesanan taxi online berhasil dikirim ke admin'); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <ServiceHeader title="Taxi Online" subtitle={tariff ? `Mulai ${formatIDR(tariff.base_fare)} + ${formatIDR(tariff.per_km)}/km` : 'Taksi nyaman ke mana saja'} gradientFrom="#3b82f6" gradientTo="#1d4ed8" />
      <div className="-mt-8 mx-4 relative z-10 space-y-3">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nama Pelanggan</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu..." className="input-field" />
          </div>
          <GoogleMapsPicker label="Lokasi Jemput" value={pickup} onChange={setPickup} />
          {stops.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Tujuan {stops.length > 1 ? i + 1 : ''}</span>
                {stops.length > 1 && <button type="button" onClick={() => setStops((p) => p.filter((_, j) => j !== i))} className="text-xs text-destructive">Hapus</button>}
              </div>
              <GoogleMapsPicker label={`Lokasi Tujuan ${stops.length > 1 ? i + 1 : ''}`} value={s.coords} onChange={(c) => setStops((p) => p.map((st, j) => j === i ? { coords: c } : st))} />
            </div>
          ))}
          <button type="button" onClick={() => setStops((p) => [...p, {}])} className="flex items-center gap-1.5 text-xs text-primary font-semibold">
            <Plus size={13} /> Tambah Tujuan
          </button>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Catatan (opsional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Pesan untuk driver..." className="input-field resize-none" />
          </div>
        </div>
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Jarak</span><span className="font-semibold">{distance != null ? `±${distance} km` : '-'}</span></div>
          <div className="flex justify-between font-extrabold text-lg border-t border-border pt-3 mt-2"><span>Total</span><span className="text-primary">{total != null ? formatIDR(total) : '-'}</span></div>
        </div>
        <button onClick={handleOrder} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-extrabold py-4 rounded-3xl shadow-lg transition active:scale-[0.98] disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Car size={18} />}
          Pesan via WhatsApp
        </button>
      </div>
      <OrderSuccessModal open={success} waUrl={waUrl} onClose={() => { setSuccess(false); setName(''); setPickup(undefined); setStops([{}]); setNote(''); setDistance(null); }} />
    </div>
  );
};

export default CakCar;
