import { addNotification } from '@/lib/notifications';
import React, { useEffect, useState } from 'react';
import { Package, Loader2 } from 'lucide-react';
import ServiceHeader from '@/components/ServiceHeader';
import GoogleMapsPicker from '@/components/GoogleMapsPicker';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { getTariff, routeDistanceKm, formatIDR, createOrder } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { Tariff, Coords } from '@/types/index';
import { toast } from 'sonner';

const CakSend: React.FC = () => {
  const { settings } = useApp();
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [name, setName] = useState('');
  const [pickup, setPickup] = useState<(Coords & { address: string }) | undefined>();
  const [dest, setDest] = useState<(Coords & { address: string }) | undefined>();
  const [desc, setDesc] = useState('');
  const [note, setNote] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    getTariff('caksend').then(setTariff);
    const saved = localStorage.getItem('cakjek_user_name');
    if (saved) setName(saved);
  }, []);

  const total = tariff && distance != null ? Math.round(tariff.base_fare + tariff.per_km * distance) : null;

  useEffect(() => {
    if (!pickup || !dest) return;
    let cancelled = false;
    routeDistanceKm(pickup, dest).then((d) => { if (!cancelled) setDistance(Math.round(d * 10) / 10); });
    return () => { cancelled = true; };
  }, [pickup, dest]);

  const handleOrder = async () => {
    if (!name.trim()) { toast.error('Nama pengirim wajib diisi'); return; }
    if (!pickup) { toast.error('Pilih lokasi pickup'); return; }
    if (!dest) { toast.error('Pilih lokasi tujuan'); return; }
    if (!desc.trim()) { toast.error('Deskripsi paket wajib diisi'); return; }
    if (!tariff || total == null) { toast.error('Tarif belum dimuat'); return; }

    const msg = `📦 *Pesanan Kirim Barang*
Nama Pengirim: ${name}
Pickup: ${pickup.address}
📍 Pin Pickup: https://maps.google.com/?q=${pickup.lat},${pickup.lng}
Tujuan: ${dest.address}
📍 Pin Tujuan: https://maps.google.com/?q=${dest.lat},${dest.lng}
Deskripsi Paket: ${desc}
Jarak: ±${distance} km
Total: ${formatIDR(total)}
Catatan: ${note || '-'}

Dikirim via ${settings.app_name}`;

    setLoading(true);
    try {
      const res = await createOrder({
        service: 'caksend', customer_name: name, customer_phone: '',
        details: { pickup_coords: { lat: pickup.lat, lng: pickup.lng }, destination_coords: { lat: dest.lat, lng: dest.lng }, pickup_address: pickup.address, dest_address: dest.address, desc, note, distance },
        total, message: msg, status: 'new',
      });
      if (res) { setWaUrl(res.whatsapp_url); setSuccess(true); addNotification('caksend', 'Pesanan kurir paket berhasil dikirim ke admin'); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <ServiceHeader title="Kirim Barang" subtitle={tariff ? `Mulai ${formatIDR(tariff.base_fare)} + ${formatIDR(tariff.per_km)}/km` : 'Kurir antar barang & paket'} gradientFrom="#f59e0b" gradientTo="#d97706" />
      <div className="-mt-8 mx-4 relative z-10 space-y-3">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nama Pengirim</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu..." className="input-field" />
          </div>
          <GoogleMapsPicker label="Lokasi Pickup" value={pickup} onChange={setPickup} />
          <GoogleMapsPicker label="Lokasi Tujuan" value={dest} onChange={setDest} />
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Deskripsi Paket</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Misal: Dokumen A4, baju, dll" className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Catatan (opsional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Catatan untuk kurir..." className="input-field resize-none" />
          </div>
        </div>
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Jarak</span><span className="font-semibold">{distance != null ? `±${distance} km` : '-'}</span></div>
          <div className="flex justify-between font-extrabold text-lg border-t border-border pt-3 mt-2"><span>Total</span><span className="text-primary">{total != null ? formatIDR(total) : '-'}</span></div>
        </div>
        <button onClick={handleOrder} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-extrabold py-4 rounded-3xl shadow-lg transition active:scale-[0.98] disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Package size={18} />}
          Pesan via WhatsApp
        </button>
      </div>
      <OrderSuccessModal open={success} waUrl={waUrl} onClose={() => { setSuccess(false); setName(''); setPickup(undefined); setDest(undefined); setDesc(''); setNote(''); setDistance(null); }} />
    </div>
  );
};

export default CakSend;
