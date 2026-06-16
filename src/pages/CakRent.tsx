import { addNotification } from '@/lib/notifications';
import React, { useEffect, useState } from 'react';
import { Car, Loader2, ChevronRight, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import ServiceHeader from '@/components/ServiceHeader';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { getVehicles, createOrder, formatIDR } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { Vehicle } from '@/types/index';
import { toast } from 'sonner';

type Durasi = 'harian' | 'mingguan' | 'bulanan';
type Filter = 'semua' | 'motor' | 'mobil';

const DURASI_LABEL: Record<Durasi, string> = { harian: 'Harian', mingguan: 'Mingguan', bulanan: 'Bulanan' };

const CakRent: React.FC = () => {
  const { settings } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('semua');
  const [selected, setSelected] = useState<Vehicle | null>(null);

  // form
  const [name, setName] = useState('');
  const [durasi, setDurasi] = useState<Durasi>('harian');
  const [jumlah, setJumlah] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [note, setNote] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    getVehicles().then((data) => setVehicles(data.filter((v) => v.active))).finally(() => setLoading(false));
    const saved = localStorage.getItem('cakjek_user_name');
    if (saved) setName(saved);
  }, []);

  const filtered = vehicles.filter((v) => filter === 'semua' || v.jenis === filter);

  const getHarga = (v: Vehicle, d: Durasi) => d === 'harian' ? v.harga_harian : d === 'mingguan' ? v.harga_mingguan : v.harga_bulanan;

  const calcTotal = () => {
    if (!selected) return 0;
    const base = getHarga(selected, durasi) * jumlah;
    const sopirBiaya = (withDriver && selected.jenis === 'mobil' && selected.biaya_sopir_harian)
      ? selected.biaya_sopir_harian * jumlah : 0;
    return base + sopirBiaya;
  };
  const total = calcTotal();

  const handleOrder = async () => {
    if (!name.trim()) { toast.error('Nama penyewa wajib diisi'); return; }
    if (!startDate) { toast.error('Tanggal mulai wajib diisi'); return; }
    if (!selected) return;

    const sopirInfo = selected.jenis === 'mobil' ? `\nOpsi: ${withDriver ? `Dengan Sopir (+Rp ${(selected.biaya_sopir_harian ?? 0).toLocaleString('id-ID')}/hari)` : 'Lepas Kunci'}` : '';
    const msg = `🚘 *Pesanan Rental Kendaraan – ${settings.app_name}*
Nama Penyewa: ${name}
Kendaraan: ${selected.nama} (${selected.jenis === 'motor' ? 'Motor' : 'Mobil'})
Durasi: ${jumlah} ${DURASI_LABEL[durasi]}
Tanggal Mulai: ${new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}${sopirInfo}
Total: ${formatIDR(total)}
Catatan: ${note || '-'}`;

    setOrdering(true);
    try {
      const res = await createOrder({
        service: 'cakrent', customer_name: name, customer_phone: '',
        details: { vehicle_id: selected.id, vehicle_nama: selected.nama, jenis: selected.jenis, durasi, jumlah, start_date: startDate, with_driver: withDriver, note },
        total, message: msg, status: 'new',
      });
      if (res) { setWaUrl(res.whatsapp_url); setSuccess(true); addNotification('cakrent', 'Pesanan rental kendaraan berhasil dikirim ke admin'); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally {
      setOrdering(false);
    }
  };

  const reset = () => { setSuccess(false); setSelected(null); setJumlah(1); setStartDate(''); setWithDriver(false); setNote(''); };

  if (selected) {
    const harga = getHarga(selected, durasi);
    const sopirBiaya = withDriver && selected.jenis === 'mobil' ? (selected.biaya_sopir_harian ?? 0) : 0;
    return (
      <div>
        <ServiceHeader title="Rental Kendaraan" subtitle={selected.nama} gradientFrom="#0891b2" gradientTo="#0e7490" onBack={() => setSelected(null)} />
        <div className="-mt-8 mx-4 relative z-10 space-y-3 pb-6">
          <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50">
            {selected.foto_url && <img src={selected.foto_url} alt={selected.nama} className="w-full h-36 object-cover" />}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-foreground">{selected.nama}</h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold capitalize">{selected.jenis}</span>
              </div>
              {selected.deskripsi && <p className="text-xs text-muted-foreground mt-1">{selected.deskripsi}</p>}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-4">
            <Field label="Nama Penyewa">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu..." className="input-field" />
            </Field>

            <Field label="Durasi Sewa">
              <div className="grid grid-cols-3 gap-2">
                {(['harian', 'mingguan', 'bulanan'] as Durasi[]).map((d) => (
                  <button key={d} type="button" onClick={() => setDurasi(d)}
                    className={`py-2 rounded-xl text-sm font-semibold border transition ${durasi === d ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border hover:bg-muted/80'}`}>
                    {DURASI_LABEL[d]}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={`Jumlah ${DURASI_LABEL[durasi]}`}>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setJumlah(Math.max(1, jumlah - 1))}
                  className="w-9 h-9 rounded-xl bg-muted text-foreground font-bold text-lg flex items-center justify-center border border-border hover:bg-muted/80">−</button>
                <span className="text-lg font-extrabold text-foreground w-8 text-center">{jumlah}</span>
                <button type="button" onClick={() => setJumlah(jumlah + 1)}
                  className="w-9 h-9 rounded-xl bg-muted text-foreground font-bold text-lg flex items-center justify-center border border-border hover:bg-muted/80">+</button>
                <span className="text-sm text-muted-foreground">× {formatIDR(harga)}</span>
              </div>
            </Field>

            {selected.jenis === 'mobil' && selected.biaya_sopir_harian != null && (
              <Field label="Opsi Sewa Mobil">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setWithDriver(false)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition ${!withDriver ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border hover:bg-muted/80'}`}>
                    🔑 Lepas Kunci
                  </button>
                  <button type="button" onClick={() => setWithDriver(true)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition ${withDriver ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border hover:bg-muted/80'}`}>
                    <UserCheck size={14} className="inline mr-1" />+Sopir
                  </button>
                </div>
                {withDriver && (
                  <p className="text-xs text-muted-foreground mt-1.5">+{formatIDR(selected.biaya_sopir_harian)} per hari</p>
                )}
              </Field>
            )}

            <Field label="Tanggal Mulai">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)} className="input-field" />
            </Field>

            <Field label="Catatan (opsional)">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                placeholder="Kebutuhan tambahan, tujuan, dll..." className="input-field resize-none" />
            </Field>

            <div className="bg-muted rounded-2xl p-4 space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Sewa {jumlah} {DURASI_LABEL[durasi]}</span>
                <span>{formatIDR(harga * jumlah)}</span>
              </div>
              {sopirBiaya > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Biaya Sopir ({jumlah} hari)</span>
                  <span>{formatIDR(sopirBiaya * jumlah)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-foreground pt-1 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatIDR(total)}</span>
              </div>
            </div>
          </div>

          <button onClick={handleOrder} disabled={ordering}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-extrabold py-4 rounded-3xl shadow-lg transition active:scale-[0.98] disabled:opacity-60">
            {ordering ? <Loader2 size={18} className="animate-spin" /> : <Car size={18} />}
            Pesan via WhatsApp
          </button>
        </div>
        <OrderSuccessModal open={success} waUrl={waUrl} onClose={reset} />
      </div>
    );
  }

  return (
    <div>
      <ServiceHeader title="Rental Kendaraan" subtitle="Pilih kendaraan tersedia" gradientFrom="#0891b2" gradientTo="#0e7490" />
      <div className="-mt-8 mx-4 relative z-10 space-y-3 pb-6">
        {/* Filter */}
        <div className="flex gap-2 pt-1">
          {(['semua', 'motor', 'mobil'] as Filter[]).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition capitalize ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-muted/50'}`}>
              {f === 'semua' ? 'Semua' : f === 'motor' ? '🏍 Motor' : '🚗 Mobil'}
            </button>
          ))}
        </div>

        {loading && <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>}
        {!loading && filtered.length === 0 && (
          <div className="bg-card rounded-3xl p-8 text-center shadow-sm border border-border/50">
            <Car size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground">Tidak ada kendaraan tersedia</p>
          </div>
        )}

        {filtered.map((v) => (
          <div key={v.id} className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50">
            {v.foto_url && (
              <div className="relative">
                <img src={v.foto_url} alt={v.nama} className="w-full h-40 object-cover" />
                <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${v.status === 'tersedia' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {v.status === 'tersedia' ? '✓ Tersedia' : 'Disewa'}
                </span>
                <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full bg-black/50 text-white capitalize">{v.jenis}</span>
              </div>
            )}
            <div className="p-4 space-y-2">
              <h3 className="font-extrabold text-foreground text-balance">{v.nama}</h3>
              {v.deskripsi && <p className="text-xs text-muted-foreground">{v.deskripsi}</p>}
              {v.jenis === 'mobil' && v.biaya_sopir_harian != null && (
                <p className="text-xs text-primary font-semibold">+Sopir tersedia ({formatIDR(v.biaya_sopir_harian)}/hari)</p>
              )}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {v.harga_harian > 0 && <PriceChip label="Hari" price={v.harga_harian} />}
                {v.harga_mingguan > 0 && <PriceChip label="Minggu" price={v.harga_mingguan} />}
                {v.harga_bulanan > 0 && <PriceChip label="Bulan" price={v.harga_bulanan} />}
              </div>
              <button
                onClick={() => v.status === 'tersedia' && setSelected(v)}
                disabled={v.status !== 'tersedia'}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm transition ${v.status === 'tersedia' ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                {v.status === 'tersedia' ? <><CheckCircle2 size={15} /> Pilih Kendaraan<ChevronRight size={15} /></> : <><Clock size={15} /> Sedang Disewa</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PriceChip: React.FC<{ label: string; price: number }> = ({ label, price }) => (
  <div className="bg-muted rounded-xl px-2 py-1.5 text-center">
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className="text-xs font-bold text-foreground leading-tight">Rp {price.toLocaleString('id-ID')}</p>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
    {children}
  </div>
);

export default CakRent;
