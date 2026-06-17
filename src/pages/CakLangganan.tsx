import React, { useEffect, useState } from 'react';
import { CalendarClock, Loader2 } from 'lucide-react';
import ServiceHeader from '@/components/ServiceHeader';
import GoogleMapsPicker from '@/components/GoogleMapsPicker';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { getTariff, createOrder, formatIDR } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { addNotification } from '@/lib/notifications';
import type { Coords } from '@/types/index';
import { toast } from 'sonner';

type Paket = 'Sekolah' | 'Kantor' | 'Kustom';
const PAKETS: Paket[] = ['Sekolah', 'Kantor', 'Kustom'];
const PAKET_EMOJI: Record<Paket, string> = { Sekolah: '🏫', Kantor: '🏢', Kustom: '✏️' };

const CakLangganan: React.FC = () => {
  const { settings } = useApp();
  const [hargaBulanan, setHargaBulanan] = useState(0);
  const [name, setName] = useState('');
  const [pickup, setPickup] = useState<(Coords & { address: string }) | undefined>();
  const [tujuan, setTujuan] = useState<(Coords & { address: string }) | undefined>();
  const [paket, setPaket] = useState<Paket>('Kantor');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    getTariff('caklangganan').then((t) => { if (t) setHargaBulanan(t.base_fare); });
    const saved = localStorage.getItem('cakjek_user_name');
    if (saved) setName(saved);
  }, []);

  const handleOrder = async () => {
    if (!name.trim()) { toast.error('Nama pelanggan wajib diisi'); return; }
    if (!pickup) { toast.error('Pilih alamat jemput'); return; }
    if (!tujuan) { toast.error('Pilih alamat tujuan'); return; }

    const msg = `🗓 *Pesanan Antar Jemput Berlangganan – ${settings.app_name}*
Nama: ${name}
Paket: ${PAKET_EMOJI[paket]} ${paket}
Alamat Jemput: ${pickup.address}
📍 Pin Jemput: https://maps.google.com/?q=${pickup.lat},${pickup.lng}
Alamat Tujuan: ${tujuan.address}
📍 Pin Tujuan: https://maps.google.com/?q=${tujuan.lat},${tujuan.lng}
Harga Paket Bulanan: ${formatIDR(hargaBulanan)}
Catatan: ${note || '-'}`;

    setLoading(true);
    try {
      const res = await createOrder({
        service: 'caklangganan',
        customer_name: name,
        customer_phone: '',
        details: { paket, pickup_address: pickup.address, pickup_coords: { lat: pickup.lat, lng: pickup.lng }, tujuan_address: tujuan.address, tujuan_coords: { lat: tujuan.lat, lng: tujuan.lng }, note },
        total: hargaBulanan,
        message: msg,
        status: 'new',
      });
      if (res) {
        setWaUrl(res.whatsapp_url);
        setSuccess(true);
        addNotification('caklangganan', `Pesanan Antar Jemput paket ${paket} berhasil dikirim. Total: ${formatIDR(hargaBulanan)}/bulan`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setSuccess(false); setPickup(undefined); setTujuan(undefined); setNote(''); };

  return (
    <div>
      <ServiceHeader title="Antar Jemput Berlangganan" subtitle="Paket bulanan antar ke sekolah & kantor" gradientFrom="#7c3aed" gradientTo="#6d28d9" />

      <div className="-mt-8 mx-4 relative z-10 space-y-3 pb-6">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-4">
          {/* Nama */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nama Pelanggan</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu..." className="input-field" />
          </div>

          {/* Pilih Paket */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Pilih Paket</label>
            <div className="grid grid-cols-3 gap-2">
              {PAKETS.map((p) => (
                <button key={p} type="button" onClick={() => setPaket(p)}
                  className={`py-3 rounded-2xl text-sm font-bold border transition flex flex-col items-center gap-1 ${paket === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border hover:bg-muted/80'}`}>
                  <span className="text-lg">{PAKET_EMOJI[p]}</span>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Maps */}
          <GoogleMapsPicker label="Alamat Jemput" value={pickup} onChange={setPickup} />
          <GoogleMapsPicker label="Alamat Tujuan" value={tujuan} onChange={setTujuan} />

          {/* Catatan */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Catatan (opsional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="Jam jemput, info tambahan, dll..." className="input-field resize-none" />
          </div>

          {/* Harga */}
          {hargaBulanan > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Harga Paket {paket}</p>
                <p className="text-xs text-muted-foreground">Per bulan, antar jemput rutin</p>
              </div>
              <p className="text-lg font-extrabold text-primary">{formatIDR(hargaBulanan)}</p>
            </div>
          )}
        </div>

        <button onClick={handleOrder} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-extrabold py-4 rounded-3xl shadow-lg transition active:scale-[0.98] disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CalendarClock size={18} />}
          Pesan via WhatsApp
        </button>
      </div>

      <OrderSuccessModal open={success} waUrl={waUrl} onClose={reset} />
    </div>
  );
};

export default CakLangganan;
