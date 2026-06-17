import { addNotification } from '@/lib/notifications';
import React, { useEffect, useState } from 'react';
import { Building2, Loader2, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import ServiceHeader from '@/components/ServiceHeader';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { getKosts, createOrder } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { Kost } from '@/types/index';
import { toast } from 'sonner';

type Durasi = 'harian' | 'mingguan' | 'bulanan';

const DURASI_LABEL: Record<Durasi, string> = { harian: 'Harian', mingguan: 'Mingguan', bulanan: 'Bulanan' };

const CakKost: React.FC = () => {
  const { settings } = useApp();
  const [kosts, setKosts] = useState<Kost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Kost | null>(null);

  // form
  const [name, setName] = useState('');
  const [durasi, setDurasi] = useState<Durasi>('bulanan');
  const [jumlah, setJumlah] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [note, setNote] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    getKosts().then((data) => setKosts(data.filter((k) => k.active))).finally(() => setLoading(false));
    const saved = localStorage.getItem('cakjek_user_name');
    if (saved) setName(saved);
  }, []);

  const getHarga = (k: Kost, d: Durasi) => d === 'harian' ? k.harga_harian : d === 'mingguan' ? k.harga_mingguan : k.harga_bulanan;
  const total = selected ? getHarga(selected, durasi) * jumlah : 0;

  const handleOrder = async () => {
    if (!name.trim()) { toast.error('Nama penyewa wajib diisi'); return; }
    if (!startDate) { toast.error('Tanggal mulai wajib diisi'); return; }
    if (!selected) return;

    const harga = getHarga(selected, durasi);
    const msg = `🏠 *Pesanan Sewa Kost – ${settings.app_name}*
Nama Penyewa: ${name}
Kost: ${selected.nama}
Alamat: ${selected.alamat}
Durasi: ${jumlah} ${DURASI_LABEL[durasi]}
Tanggal Mulai: ${new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
Harga/Unit: Rp ${harga.toLocaleString('id-ID')}
Total: Rp ${total.toLocaleString('id-ID')}
Catatan: ${note || '-'}`;

    setOrdering(true);
    try {
      const res = await createOrder({
        service: 'cakkost', customer_name: name, customer_phone: '',
        details: { kost_id: selected.id, kost_nama: selected.nama, durasi, jumlah, start_date: startDate, note },
        total, message: msg, status: 'new',
      });
      if (res) { setWaUrl(res.whatsapp_url); setSuccess(true); addNotification('cakkost', 'Booking kost berhasil dikirim ke admin'); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally {
      setOrdering(false);
    }
  };

  const reset = () => { setSuccess(false); setSelected(null); setJumlah(1); setStartDate(''); setNote(''); };

  if (selected) {
    const harga = getHarga(selected, durasi);
    return (
      <div>
        <ServiceHeader title="Sewa Kost" subtitle={selected.nama} gradientFrom="#0d9488" gradientTo="#0f766e" onBack={() => setSelected(null)} />
        <div className="-mt-8 mx-4 relative z-10 space-y-3 pb-6">
          {/* Kost summary */}
          <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50">
            {selected.foto_url && <img src={selected.foto_url} alt={selected.nama} className="w-full h-36 object-cover" />}
            <div className="p-4">
              <h2 className="font-extrabold text-foreground">{selected.nama}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.alamat}</p>
              {selected.fasilitas && <p className="text-xs text-muted-foreground mt-1">🏷 {selected.fasilitas}</p>}
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
                <span className="text-sm text-muted-foreground">× Rp {harga.toLocaleString('id-ID')}</span>
              </div>
            </Field>

            <Field label="Tanggal Mulai">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)} className="input-field" />
            </Field>

            <Field label="Catatan (opsional)">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                placeholder="Kebutuhan tambahan, dll..." className="input-field resize-none" />
            </Field>

            <div className="bg-muted rounded-2xl p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-lg font-extrabold text-primary">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button onClick={handleOrder} disabled={ordering}
            className="w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-extrabold py-4 rounded-3xl shadow-lg transition active:scale-[0.98] disabled:opacity-60">
            {ordering ? <Loader2 size={18} className="animate-spin" /> : <Building2 size={18} />}
            Pesan via WhatsApp
          </button>
        </div>
        <OrderSuccessModal open={success} waUrl={waUrl} onClose={reset} />
      </div>
    );
  }

  return (
    <div>
      <ServiceHeader title="Sewa Kost" subtitle="Pilih kost tersedia" gradientFrom="#0d9488" gradientTo="#0f766e" />
      <div className="-mt-8 mx-4 relative z-10 space-y-3 pb-6">
        {loading && (
          <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>
        )}
        {!loading && kosts.length === 0 && (
          <div className="bg-card rounded-3xl p-8 text-center shadow-sm border border-border/50">
            <Building2 size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground">Belum ada kost tersedia</p>
          </div>
        )}
        {kosts.map((k) => (
          <div key={k.id} className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50">
            {k.foto_url && (
              <div className="relative">
                <img src={k.foto_url} alt={k.nama} className="w-full h-40 object-cover" />
                <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${k.status === 'tersedia' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {k.status === 'tersedia' ? '✓ Tersedia' : 'Penuh'}
                </span>
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-foreground text-balance">{k.nama}</h3>
                  <p className="text-xs text-muted-foreground">{k.alamat}</p>
                </div>
              </div>
              {k.fasilitas && <p className="text-xs text-muted-foreground">🏷 {k.fasilitas}</p>}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {k.harga_harian > 0 && <PriceChip label="Hari" price={k.harga_harian} />}
                {k.harga_mingguan > 0 && <PriceChip label="Minggu" price={k.harga_mingguan} />}
                {k.harga_bulanan > 0 && <PriceChip label="Bulan" price={k.harga_bulanan} />}
              </div>
              <button
                onClick={() => k.status === 'tersedia' && setSelected(k)}
                disabled={k.status !== 'tersedia'}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm transition ${k.status === 'tersedia' ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                {k.status === 'tersedia' ? <><CheckCircle2 size={15} /> Pilih Kost<ChevronRight size={15} /></> : <><Clock size={15} /> Penuh</>}
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

export default CakKost;
